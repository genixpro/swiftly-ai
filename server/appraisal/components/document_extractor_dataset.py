import subprocess
import copy
import tensorflow as tf
from appraisal.components.document_generator import DocumentGenerator
import numpy
import pickle
import random
import concurrent.futures
from pprint import pprint
import copy
import multiprocessing
import requests
import functools
from appraisal.vectorserver import vectorServerSymmetricKey
from appraisal.models.file import File

globalVectorProcess = None

class DocumentExtractorDataset:
    manager = multiprocessing.Manager()

    def __init__(self, vectorServerURL=None):
        self.generator = DocumentGenerator()

        self.vectorServerURL = vectorServerURL

        self.labels = [
            "null",
            "DOCUMENT_NUMBER", "DOCUMENT_DATE", "DOCUMENT_TIME", "DOCUMENT_TIME", "STATEMENT_DATE",
            "BUILDING_ADDRESS", "USER_ID", "STATEMENT_YEAR", "STATEMENT_NEXT_YEAR", "ACC_NUM", "ACC_NAME",
            "FORECAST", "BUDGET", "VARIANCE", "UNIT_NUM", "TENANT_NAME", "RENTABLE_AREA", "TERM_START",
            "TERM_END", "MONTHLY_RENT", "YEARLY_RENT"
        ]

        self.modifiers = [
            "SUM", "NEXT_YEAR", "PERCENTAGE", "INCOME", "EXPENSE", "SUMMARY", "RENT", "ADDITIONAL_INCOME",#  "EXPENSE_RECOVERY",
            #"OPERATING_EXPENSE", "NON_RECOVERABLE_EXPENSE", "TAXES", "MANAGEMENT_EXPENSE", "STRUCTURAL_ALLOWANCE"
        ]

        self.numberLabels = ['FORECAST', 'BUDGET', 'VARIANCE']

        self.lengthMin = 500
        self.lengthMax = 1000
        self.wordVectorSize = 300
        self.wordOmissionRate = 0.05

        self.dataset = DocumentExtractorDataset.manager.list()

        self.augmentationValues = {
            label: [] for label in self.labels
        }

    def getFasttextProcess(self):
        global globalVectorProcess
        if globalVectorProcess is None:
            globalVectorProcess = subprocess.Popen(["fasttext", "print-word-vectors", "crawl-300d-2M-subword.bin"],
                                       stdin=subprocess.PIPE,
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE)
        return globalVectorProcess


    @functools.lru_cache(maxsize=10240)
    def getWordVector(self, word):
        vectorProcess = self.getFasttextProcess()
        try:
            vectorProcess.stdin.write(bytes(word + "\n", 'utf8'))
            vectorProcess.stdin.flush()
        except BrokenPipeError:
            print(vectorProcess.stderr.read())
        line = vectorProcess.stdout.readline()

        vector = [float(v) for v in line.split()[1:]]

        return vector

    def prepareDocument(self, file):
        neededWordVectors = list(set(word['word'] for word in file.words))
        wordVectorMap = {}
        if self.vectorServerURL is None:
            for word in neededWordVectors:
                wordVectorMap[word] = numpy.array(self.getWordVector(word))
        else:
            response = requests.post(self.vectorServerURL, json={"words": neededWordVectors, "key": vectorServerSymmetricKey})
            vectors = response.json()
            for wordIndex, word in enumerate(neededWordVectors):
                wordVectorMap[word] = numpy.array(vectors[wordIndex])

        wordVectors = []
        for word in file.words:
            wordVectors.append(wordVectorMap[word['word']])

        lineSortedWordIndexes = [word['index'] for word in sorted(file.words, key=lambda word: (word['page'], word['lineNumber'], word['left']))]
        columnSortedWordIndexes = [word['index'] for word in sorted(file.words, key=lambda word: (word['page'], word['column'], word['lineNumber'], word['left']))]

        lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(word['index']) for word in file.words]
        columnReverseWordIndexes = [columnSortedWordIndexes.index(word['index']) for word in file.words]

        classificationOutputs = []
        modifierOutputs = []

        for word in file.words:
            oneHotCodeClassification = [0] * len(self.labels)
            oneHotCodeModifiers = [0] * len(self.modifiers)

            if 'classification' in word:
                oneHotCodeClassification[self.labels.index(word['classification'])] = 1
            else:
                oneHotCodeClassification[self.labels.index('null')] = 1
            classificationOutputs.append(oneHotCodeClassification)

            if 'modifiers' in word:
                for modifier in word['modifiers']:
                    oneHotCodeModifiers[self.modifiers.index(modifier)] = 1
            modifierOutputs.append(oneHotCodeModifiers)


        return (
            wordVectors,
            lineSortedWordIndexes,
            lineSortedReverseWordIndexes,
            columnSortedWordIndexes,
            columnReverseWordIndexes,
            classificationOutputs,
            modifierOutputs)

    def loadDataset(self, db):
        files = File.objects(type="financials")

        for file in files:
            for token in file.breakIntoTokens():
                self.augmentationValues[token['classification']].append(token['text'])

            self.dataset.append(file)

    def augmentToken(self, token):
        if token['classification'] in self.numberLabels:
            magnitude = random.choice([10, 100, 1000, 10000, 100000, 1000000])
            number = random.uniform(0, magnitude)

            format = random.choice([
                "{:,.2f}",
                "{:.2f}",
                "{:,.0f}",
                "{:.0f}"
            ])

            text = format.format(number)

            if random.uniform(0,1) < 0.5:
                if random.uniform(0,1) < 0.5:
                    text = "-" + text
                else:
                    text = "(" + text + ")"
            newText = text
        else:
            newText = random.choice(self.augmentationValues[token['classification']])

        if len(set([word['page'] for word in token['words']])) > 1:
            raise NotImplemented("Support for augmenting tokens that cross multiple pages not yet implemented")

        # Break the words on the token down into lines
        wordsByLine = {}
        for word in token['words']:
            if word['lineNumber'] in wordsByLine:
                wordsByLine[word['lineNumber']].append(word)
            else:
                wordsByLine[word['lineNumber']] = [word]

        # Set the start line and finish line
        startLine = min(wordsByLine.keys())
        endLine = max(wordsByLine.keys())
        lineDelta = endLine - startLine

        # Create the words for the new token
        newWords = [
            {
                "word": word,
                "classification": token['classification'],
                "modifiers": token['modifiers'],
                "page": token['words'][0]['page'],
                "lineNumber": startLine + int(round((wordIndex / len(token['words'])) * lineDelta))
            } for wordIndex, word in enumerate(newText.split())
        ]

        newWordsByLine = {}
        for word in newWords:
            if word['lineNumber'] in newWordsByLine:
                newWordsByLine[word['lineNumber']].append(word)
            else:
                newWordsByLine[word['lineNumber']] = [word]

        for lineNumber in newWordsByLine:
            for wordIndex, word in enumerate(newWordsByLine[lineNumber]):
                lineOriginalWords = wordsByLine[lineNumber]

                lineLeft = min([word['left'] for word in lineOriginalWords])
                lineRight = max([word['right'] for word in lineOriginalWords])
                lineWordSize = (lineRight - lineLeft) / len(newWordsByLine[lineNumber])

                columnStart = min([word['column'] for word in lineOriginalWords])
                columnEnd = max([word['column'] for word in lineOriginalWords])
                columnSize = (columnEnd - columnStart) / len(newWordsByLine[lineNumber])

                word['top'] = min([word['top'] for word in lineOriginalWords])
                word['bottom'] = max([word['bottom'] for word in lineOriginalWords])
                word['left'] = lineLeft + lineWordSize * wordIndex
                word['right'] = lineLeft + lineWordSize * (wordIndex+1)

                word['column'] = int(round(columnStart + columnSize * wordIndex))


        return {
            "text": newText,
            "words": newWords
        }



    def augmentDocument(self, file):
        file = copy.copy(file)

        # Select a random page within the document
        pages = set(word.page for word in file.words)
        chosenPage = random.choice(list(pages))
        file.words = [word for word in file.words if word.page == chosenPage]

        tokens = file.breakIntoTokens()

        indexAdjustment = 0
        for token in tokens:
            if random.uniform(0, 1) < self.wordOmissionRate:
                start = token['startIndex'] + indexAdjustment
                end = token['endIndex'] + indexAdjustment

                file.words[start:end] = []

                indexAdjustment -= len(token['words'])
            else:
                newToken = self.augmentToken(token)

                start = token['startIndex'] + indexAdjustment
                end = token['endIndex'] + indexAdjustment

                file.words[start:end] = newToken['words']

                indexAdjustment += (len(newToken['words']) - len(token['words']))

            # print("token")
            # pprint(token)
            # print("newToken")
            # pprint(newToken)

        for wordIndex, word in enumerate(file.words):
            word['index'] = wordIndex

        return file

    # def generateAndSaveDocument(self, n):
    #     data = self.generator.generateDocument("financial_statement_1.docx", "financial_statement")
    #     data = self.prepareDocument(data)
    #
    #     with open(f'data/data-{n}.bin', 'wb') as document:
    #         pickle.dump(data, document)
    #
    # def generateAndSaveDataset(self):
    #     with concurrent.futures.ProcessPoolExecutor(max_workers=3) as executor:
    #         for n in range(1000):
    #             executor.submit(self.generateAndSaveDocument, n)
    #         executor.shutdown(wait=True)

    # def loadDataset(self):
    #     dataset = []
    #     for index in range(1000):
    #         with open(f"data/data-{index}.bin", 'rb') as document:
    #             result = pickle.load(document)
    #
    #             dataset.append(result)
    #     return dataset

    def createBatch(self, batchSize):
        batchWordVectors = []
        batchLineSortedWordIndexes = []
        batchLineSortedReverseWordIndexes = []
        batchColumnSortedWordIndexes = []
        batchColumnReverseWordIndexes = []
        batchClassificationOutputs = []
        batchModifierOutputs = []

        results = []
        for n in range(batchSize):
            randomIndex = random.randint(0, len(self.dataset)-1)
            result = self.prepareDocument(self.augmentDocument(self.dataset[randomIndex]))
            results.append(result)

        maxLength = min(random.randint(self.lengthMin, self.lengthMax), max([len(result[0]) for result in results]))

        for n in range(batchSize):
            result = results[n]

            wordVectors = result[0]
            lineSortedWordIndexes = result[1]
            lineSortedReverseWordIndexes = result[2]
            columnSortedWordIndexes = result[3]
            columnReverseWordIndexes = result[4]
            classificationOutputs = result[5]
            modifierOutputs = result[6]

            while len(wordVectors) < maxLength:
                index = len(wordVectors)
                lineSortedWordIndexes.append(index)
                lineSortedReverseWordIndexes.append(index)
                columnSortedWordIndexes.append(index)
                columnReverseWordIndexes.append(index)
                wordVectors.append([0] * self.wordVectorSize)

                oneHotCodeClassification = [0] * len(self.labels)
                oneHotCodeModifiers = [0] * len(self.modifiers)
                oneHotCodeClassification[self.labels.index("null")] = 1

                classificationOutputs.append(oneHotCodeClassification)
                modifierOutputs.append(oneHotCodeModifiers)

            if len(wordVectors) > maxLength:
                start = random.randint(0, len(wordVectors) - maxLength - 1)

                wordVectors = wordVectors[start:start + maxLength]
                lineSortedWordIndexes = [index-start for index in lineSortedWordIndexes if index >= start and index < (start + maxLength)]
                lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(index) for index in range(0, maxLength)]
                columnSortedWordIndexes = [index-start for index in columnSortedWordIndexes if index >= start and index < (start + maxLength)]
                columnReverseWordIndexes = [columnSortedWordIndexes.index(index) for index in range(0, maxLength)]

                classificationOutputs = classificationOutputs[start:start + maxLength]
                modifierOutputs = modifierOutputs[start:start + maxLength]

            batchWordVectors.append(wordVectors)
            batchLineSortedWordIndexes.append(lineSortedWordIndexes)
            batchLineSortedReverseWordIndexes.append(lineSortedReverseWordIndexes)
            batchColumnSortedWordIndexes.append(columnSortedWordIndexes)
            batchColumnReverseWordIndexes.append(columnReverseWordIndexes)
            batchClassificationOutputs.append(classificationOutputs)
            batchModifierOutputs.append(modifierOutputs)

        # print(batchWordVectors[0][0])
        # print(batchLineSortedWordIndexes)

        return (
            numpy.array(batchWordVectors),
            numpy.array(batchLineSortedWordIndexes),
            numpy.array(batchLineSortedReverseWordIndexes),
            numpy.array(batchColumnSortedWordIndexes),
            numpy.array(batchColumnReverseWordIndexes),
            numpy.array(batchClassificationOutputs),
            numpy.array(batchModifierOutputs)
        )
