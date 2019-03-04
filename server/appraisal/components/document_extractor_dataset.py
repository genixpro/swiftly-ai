import subprocess
import copy
import tensorflow as tf
from .document_generator import DocumentGenerator
import numpy
import pickle
import random
import concurrent.futures
from pprint import pprint
import copy
import multiprocessing
import functools
from .document import Document

globalVectorProcess = None

class DocumentExtractorDataset:
    manager = multiprocessing.Manager()

    def __init__(self):
        self.generator = DocumentGenerator()

        self.labels = [
            "null",
            "DOCUMENT_NUMBER", "DOCUMENT_DATE", "DOCUMENT_TIME", "DOCUMENT_TIME", "STATEMENT_DATE",
            "BUILDING_ADDRESS", "USER_ID", "STATEMENT_YEAR", "STATEMENT_NEXT_YEAR", "ACC_NUM", "ACC_NAME",
            "FORECAST", "BUDGET", "VARIANCE"
        ]

        self.modifiers = [
            "SUM", "NEXT_YEAR", "PERCENTAGE", "INCOME", "EXPENSE", # "RENT", "RECOVERY",
        ]

        self.numberLabels = ['FORECAST', 'BUDGET', 'VARIANCE']

        self.lengthMin = 100
        self.lengthMax = 1500
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

    def prepareDocument(self, document):
        wordVectors = []
        for word in document.words:
            wordVectors.append(numpy.array(self.getWordVector(word['word'])))

        lineSortedWordIndexes = [word['index'] for word in sorted(document.words, key=lambda word: (word['page'], word['lineNumber'], word['left']))]
        columnLeftSortedWordIndexes = [word['index'] for word in sorted(document.words, key=lambda word: (word['page'], word['columnLeft'], word['lineNumber'], word['left']))]
        columnRightSortedWordIndexes = [word['index'] for word in sorted(document.words, key=lambda word: (word['page'], word['columnRight'], word['lineNumber'], word['left']))]

        lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(word['index']) for word in document.words]
        columnLeftReverseWordIndexes = [columnLeftSortedWordIndexes.index(word['index']) for word in document.words]
        columnRightReverseWordIndexes = [columnRightSortedWordIndexes.index(word['index']) for word in document.words]

        classificationOutputs = []
        modifierOutputs = []

        for word in document.words:
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
            columnLeftSortedWordIndexes,
            columnLeftReverseWordIndexes,
            columnRightSortedWordIndexes,
            columnRightReverseWordIndexes,
            classificationOutputs,
            modifierOutputs)

    def loadDataset(self, db):
        filesCollection = db['files']
        files = filesCollection.find({"type": "financials"})

        for file in files:
            document = Document(file)
            for token in document.breakIntoTokens():
                self.augmentationValues[token['classification']].append(token['text'])

            self.dataset.append(document)

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

                columnLeftStart = min([word['columnLeft'] for word in lineOriginalWords])
                columnLeftEnd = max([word['columnLeft'] for word in lineOriginalWords])
                columnLeftSize = (columnLeftEnd - columnLeftStart) / len(newWordsByLine[lineNumber])

                columnRightStart = min([word['columnRight'] for word in lineOriginalWords])
                columnRightEnd = max([word['columnRight'] for word in lineOriginalWords])
                columnRightSize = (columnRightEnd - columnRightStart) / len(newWordsByLine[lineNumber])

                word['top'] = min([word['top'] for word in lineOriginalWords])
                word['bottom'] = max([word['bottom'] for word in lineOriginalWords])
                word['left'] = lineLeft + lineWordSize * wordIndex
                word['right'] = lineLeft + lineWordSize * (wordIndex+1)

                word['columnLeft'] = int(round(columnLeftStart + columnLeftSize * wordIndex))
                word['columnRight'] = int(round(columnRightStart + columnRightSize * wordIndex))


        return {
            "text": newText,
            "words": newWords
        }



    def augmentDocument(self, document):
        tokens = document.breakIntoTokens(document)

        indexAdjustment = 0
        for token in tokens:
            if random.uniform(0, 1) < self.wordOmissionRate:
                start = token['startIndex'] + indexAdjustment
                end = token['endIndex'] + indexAdjustment

                document.words[start:end] = []

                indexAdjustment -= len(token['words'])
            else:
                newToken = self.augmentToken(token)

                start = token['startIndex'] + indexAdjustment
                end = token['endIndex'] + indexAdjustment

                document.words[start:end] = newToken['words']

                indexAdjustment += (len(newToken['words']) - len(token['words']))

            # print("token")
            # pprint(token)
            # print("newToken")
            # pprint(newToken)

        for wordIndex, word in enumerate(document.words):
            word['index'] = wordIndex

        return document

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
        batchColumnLeftSortedWordIndexes = []
        batchColumnLeftReverseWordIndexes = []
        batchColumnRightSortedWordIndexes = []
        batchColumnRightReverseWordIndexes = []
        batchClassificationOutputs = []
        batchModifierOutputs = []

        maxLength = random.randint(self.lengthMin, self.lengthMax)

        for n in range(batchSize):
            randomIndex = random.randint(0, len(self.dataset)-1)
            result = self.prepareDocument(self.augmentDocument(self.dataset[randomIndex]))

            wordVectors = result[0]
            lineSortedWordIndexes = result[1]
            lineSortedReverseWordIndexes = result[2]
            columnLeftSortedWordIndexes = result[3]
            columnLeftReverseWordIndexes = result[4]
            columnRightSortedWordIndexes = result[5]
            columnRightReverseWordIndexes = result[6]
            classificationOutputs = result[7]
            modifierOutputs = result[8]

            while len(wordVectors) < maxLength:
                index = len(wordVectors)
                lineSortedWordIndexes.append(index)
                lineSortedReverseWordIndexes.append(index)
                columnLeftSortedWordIndexes.append(index)
                columnLeftReverseWordIndexes.append(index)
                columnRightSortedWordIndexes.append(index)
                columnRightReverseWordIndexes.append(index)
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
                columnLeftSortedWordIndexes = [index-start for index in columnLeftSortedWordIndexes if index >= start and index < (start + maxLength)]
                columnLeftReverseWordIndexes = [columnLeftSortedWordIndexes.index(index) for index in range(0, maxLength)]
                columnRightSortedWordIndexes = [index-start for index in columnRightSortedWordIndexes if index >= start and index < (start + maxLength)]
                columnRightReverseWordIndexes = [columnRightSortedWordIndexes.index(index) for index in range(0, maxLength)]

                classificationOutputs = classificationOutputs[start:start + maxLength]
                modifierOutputs = modifierOutputs[start:start + maxLength]

            batchWordVectors.append(wordVectors)
            batchLineSortedWordIndexes.append(lineSortedWordIndexes)
            batchLineSortedReverseWordIndexes.append(lineSortedReverseWordIndexes)
            batchColumnLeftSortedWordIndexes.append(columnLeftSortedWordIndexes)
            batchColumnLeftReverseWordIndexes.append(columnLeftReverseWordIndexes)
            batchColumnRightSortedWordIndexes.append(columnRightSortedWordIndexes)
            batchColumnRightReverseWordIndexes.append(columnRightReverseWordIndexes)
            batchClassificationOutputs.append(classificationOutputs)
            batchModifierOutputs.append(modifierOutputs)

        # print(batchWordVectors[0][0])
        # print(batchLineSortedWordIndexes)

        return (
            numpy.array(batchWordVectors),
            numpy.array(batchLineSortedWordIndexes),
            numpy.array(batchLineSortedReverseWordIndexes),
            numpy.array(batchColumnLeftSortedWordIndexes),
            numpy.array(batchColumnLeftReverseWordIndexes),
            numpy.array(batchColumnRightSortedWordIndexes),
            numpy.array(batchColumnRightReverseWordIndexes),
            numpy.array(batchClassificationOutputs),
            numpy.array(batchModifierOutputs)
        )
