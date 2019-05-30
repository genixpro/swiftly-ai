import subprocess
import copy
import tensorflow as tf
import numpy
import pickle
import random
import concurrent.futures
from pprint import pprint
import json
import copy
import multiprocessing
from .document_parser import DocumentParser
import requests
import functools
from appraisal.vectorserver import vectorServerSymmetricKey
from appraisal.models.file import File, Word
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

globalVectorProcess = None

class FastWord:
    """ This class is used to bypass overheard introduced by MongoEngine"""
    def __init__(self, word=None):
        if word is not None:
            self.word = word.word
            if hasattr(word, "classification"):
                self.classification = word.classification
            else:
                self.classification = "null"

            if hasattr(word, "modifiers"):
                self.modifiers = word.modifiers
            else:
                self.modifiers = []

            self.page = word.page
            self.groups = word.groups
            self.groupNumbers = word.groupNumbers
            self.textType = word.textType
            self.lineNumber = word.lineNumber
            self.documentLineNumber = word.documentLineNumber
            self.column = word.column
            self.left = word.left
            self.right = word.right
            self.top = word.top
            self.bottom = word.bottom
            self.index = word.index
            self.lineNumberWithinGroup = word.lineNumberWithinGroup
            self.reverseLineNumberWithinGroup = word.reverseLineNumberWithinGroup
        else:
            self.word = ""
            self.classification = "null"
            self.modifiers = []
            self.page = None
            self.groups = {}
            self.groupNumbers = {}
            self.textType = None
            self.lineNumber = None
            self.documentLineNumber = None
            self.column = None
            self.left = None
            self.right = None
            self.top = None
            self.bottom = None
            self.index = None
            self.lineNumberWithinGroup = {}
            self.reverseLineNumberWithinGroup = {}

class FastFile:
    """ This class is used to bypass overheard introduced by MongoEngine"""
    def __init__(self, file=None, words=None, pages=None):
        if file is not None:
            self.words = [FastWord(word) for word in file.words]
            self.tokens = file.breakIntoTokens()
            self.pages = file.pages
        else:
            self.words = words
            self.tokens = None
            self.pages = pages

    def updateDescriptiveWordFeatures(self):
        File.updateDescriptiveWordFeatures(self)

class DocumentExtractorDataset:
    def __init__(self, vectorServerURL=None, manager=None):
        self.vectorServerURL = vectorServerURL
        self.parser = DocumentParser()

        self.numberLabels = ['FORECAST', 'BUDGET', 'VARIANCE', "YEAR_TO_DATE"]

        self.lengthMin = 500
        self.lengthMax = 1000
        self.wordVectorSize = 307
        self.wordOmissionRate = 0.05

        self.dataset = manager.list()

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

    def requests_retry_session(
            retries=5,
            backoff_factor=0.3,
            status_forcelist=(500, 502, 504),
            session=None,
    ):
        session = session or requests.Session()
        retry = Retry(
            total=retries,
            read=retries,
            connect=retries,
            backoff_factor=backoff_factor,
            status_forcelist=status_forcelist,
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        return session

    def prepareDocument(self, file, allowColumnProcessing=True):
        # Just do this as a precaution
        # file.words = self.parser.assignLineNumbersToWords(file.words)
        file.words = self.parser.assignColumnNumbersToWords(file.words)
        file.words = sorted(file.words, key=lambda word: (word.page, word.lineNumber, word.left))
        file.updateDescriptiveWordFeatures()

        neededWordVectors = list(set(word.word for word in file.words))
        wordVectorMap = {}
        if self.vectorServerURL is None:
            for word in neededWordVectors:
                wordVectorMap[word] = numpy.array(self.getWordVector(word))
        else:
            response = self.requests_retry_session().post(self.vectorServerURL, json={"words": neededWordVectors, "key": vectorServerSymmetricKey})
            vectors = response.json()
            for wordIndex, word in enumerate(neededWordVectors):
                wordVectorMap[word] = numpy.array(vectors[wordIndex])

        wordVectors = []
        for word in file.words:
            baseVector = wordVectorMap[word.word]

            positionVector = [
                word.left,
                word.right,
                word.top,
                word.bottom,
                word.right-word.left,
                word.bottom-word.top,
                (word.right - word.left) / len(word.word)
            ]

            wordVectors.append(numpy.concatenate([numpy.array(positionVector), baseVector]))

        lineSortedWordIndexes = [word.index for word in sorted(file.words, key=lambda word: (word.page, word.lineNumber, word.left))]

        if allowColumnProcessing:
            columnSortedWordIndexes = [word.index for word in sorted(file.words, key=lambda word: (word.page, word.column, word.lineNumber, word.left))]
        else:
            columnSortedWordIndexes = [word.index for word in sorted(file.words, key=lambda word: (word.page, word.lineNumber, word.left))]

        lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(word.index) for word in file.words]
        columnReverseWordIndexes = [columnSortedWordIndexes.index(word.index) for word in file.words]

        classificationOutputs = []
        modifierOutputs = []
        groupOutputs = []
        textTypeOutputs = []

        for word in file.words:
            oneHotCodeClassification = [0] * len(self.labels)
            modifiersVector = [0] * len(self.modifiers)

            oneHotCodeClassification[self.labels.index(word.classification)] = 1
            classificationOutputs.append(oneHotCodeClassification)

            for modifier in word.modifiers:
                modifiersVector[self.modifiers.index(modifier)] = 1
            modifierOutputs.append(modifiersVector)

            groupsVector = []
            for groupSet in self.groupSets:
                groupSetLabels = self.groups[groupSet]
                for label in groupSetLabels:
                    if word.groups.get(groupSet, 'null') == label:
                        if label == 'null':
                            groupsVector.append(0)
                            groupsVector.append(1)
                            groupsVector.append(0)
                        elif word.lineNumberWithinGroup[groupSet] == 0:
                            groupsVector.append(1)
                            groupsVector.append(0)
                            groupsVector.append(0)
                        elif word.reverseLineNumberWithinGroup[groupSet] == 0:
                            groupsVector.append(0)
                            groupsVector.append(0)
                            groupsVector.append(1)
                        else:
                            groupsVector.append(0)
                            groupsVector.append(1)
                            groupsVector.append(0)
                    else:
                        groupsVector.append(0)
                        groupsVector.append(0)
                        groupsVector.append(0)

            groupOutputs.append(groupsVector)

            textTypeVector = [0] * len(self.textTypes)
            textTypeVector[self.textTypes.index(word.textType)] = 1
            textTypeOutputs.append(textTypeVector)


        return (
            wordVectors,
            lineSortedWordIndexes,
            lineSortedReverseWordIndexes,
            columnSortedWordIndexes,
            columnReverseWordIndexes,
            classificationOutputs,
            modifierOutputs,
            groupOutputs,
            textTypeOutputs)

    def loadDataset(self, db):
        files = File.objects(reviewStatus__in=["verifed","verified"])

        labels = {'null'}
        modifiers = set()
        groups = {}
        groupSets = set()
        textTypes = set()

        self.augmentationValues = {}

        for file in files:
            for word in file.words:
                labels.add(word.classification)
                for modifier in word.modifiers:
                    modifiers.add(modifier)
                for groupSet, group in word.groups.items():
                    groupSets.add(groupSet)
                    if groupSet not in groups:
                        groups[groupSet] = {'null', group}
                    else:
                        groups[groupSet].add(group)

                textTypes.add(word.textType)

            for token in file.breakIntoTokens():
                augmentationKey = token['classification'] + "-".join(token['modifiers'])

                if augmentationKey in self.augmentationValues:
                    self.augmentationValues[augmentationKey].append(token['text'])
                else:
                    self.augmentationValues[augmentationKey] = [token['text']]

            self.dataset.append(FastFile(file))

        random.shuffle(self.dataset)

        self.trainingCount = int(len(self.dataset) * 0.8)
        self.testingCount = len(self.dataset) - self.trainingCount

        self.trainingDataset = self.dataset[:self.trainingCount]
        self.testingDataset = self.dataset[self.trainingCount:]

        print(f"Loaded {len(self.dataset)} files.")

        self.labels = sorted(list(labels))
        self.modifiers = sorted(list(modifiers))
        self.groups = {groupSet: sorted(list(groups)) for groupSet, groups in groups.items()}
        self.groupSets = sorted(list(groupSets))

        self.totalGroupLabels = 0
        for groupSet in self.groupSets:
            self.totalGroupLabels += len(self.groups[groupSet])

        self.textTypes = sorted(list(textTypes))

    def loadLabels(self, labelsFile):
        # Also restore the labels
        data = json.load(open(labelsFile, 'rt'))
        self.labels = data['labels']
        self.modifiers = data['modifiers']
        self.groups = data['groups']
        self.groupSets = sorted(list(self.groups.keys()))
        self.textTypes = data['textTypes']

        self.totalGroupLabels = 0
        for groupSet in self.groupSets:
            self.totalGroupLabels += len(self.groups[groupSet])

        self.augmentationValues = {
            label: [] for label in self.labels
        }

    def saveLabels(self, labelsFile):
        data = {
            "labels": self.labels,
            "modifiers": self.modifiers,
            "groups": self.groups,
            "textTypes": self.textTypes
        }

        # Also restore the labels
        json.dump(data, open(labelsFile, 'wt'))


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
            augmentationKey = token['classification'] + "-".join(token['modifiers'])

            newText = random.choice(self.augmentationValues[augmentationKey])

        if len(set([word.page for word in token['words']])) > 1:
            raise NotImplemented("Support for augmenting tokens that cross multiple pages not yet implemented")

        # Break the words on the token down into lines
        wordsByLine = {}
        for word in token['words']:
            if word.lineNumber in wordsByLine:
                wordsByLine[word.lineNumber].append(word)
            else:
                wordsByLine[word.lineNumber] = [word]

        # Set the start line and finish line
        startLine = min(wordsByLine.keys())
        endLine = max(wordsByLine.keys())
        lineDelta = endLine - startLine

        newTextSplit = newText.split()

        # Create the words for the new token
        newWords = []
        for wordIndex, word in enumerate(newTextSplit):
            newWord = FastWord()
            newWord.word = word
            newWord.classification = token['classification']
            newWord.modifiers = token['modifiers']
            newWord.page = token['words'][0]['page']
            newWord.groups = token['groups']
            newWord.groupNumbers = token['groupNumbers']
            newWord.textType = token['textType']
            newWord.lineNumber = startLine + int(round((wordIndex / len(newTextSplit)) * lineDelta))
            newWords.append(newWord)

        newWordsByLine = {}
        for word in newWords:
            if word.lineNumber in newWordsByLine:
                newWordsByLine[word.lineNumber].append(word)
            else:
                newWordsByLine[word.lineNumber] = [word]

        # print(startLine)
        # print(endLine)
        # print(lineDelta)
        # print(len(token['words']))
        # print(wordsByLine)
        # print(newWordsByLine)

        for lineNumber in newWordsByLine:
            for wordIndex, word in enumerate(newWordsByLine[lineNumber]):
                # print(lineNumber)
                lineOriginalWords = wordsByLine[lineNumber]

                lineLeft = min([word.left for word in lineOriginalWords])
                lineRight = max([word.right for word in lineOriginalWords])
                lineWordSize = (lineRight - lineLeft) / len(newWordsByLine[lineNumber])

                columnStart = min([word.column for word in lineOriginalWords])
                columnEnd = max([word.column for word in lineOriginalWords])
                columnSize = (columnEnd - columnStart) / len(newWordsByLine[lineNumber])

                word.top = min([word.top for word in lineOriginalWords])
                word.bottom = max([word.bottom for word in lineOriginalWords])
                word.left = lineLeft + lineWordSize * wordIndex
                word.right = lineLeft + lineWordSize * (wordIndex+1)

                word.column = int(round(columnStart + columnSize * wordIndex))


        return {
            "text": newText,
            "words": newWords
        }



    def augmentDocument(self, file):
        # Select a random page within the document
        pages = set(word.page for word in file.words)
        chosenPage = random.choice(list(pages))
        words = [copy.copy(word) for word in file.words if word.page == chosenPage]

        tokens = file.tokens

        indexAdjustment = 0
        for token in tokens:
            if random.uniform(0, 1) < self.wordOmissionRate:
                start = token['startIndex'] + indexAdjustment
                end = token['endIndex'] + indexAdjustment

                words[start:end] = []

                indexAdjustment -= len(token['words'])
            else:
                newToken = self.augmentToken(token)

                start = token['startIndex'] + indexAdjustment
                end = token['endIndex'] + indexAdjustment

                words[start:end] = newToken['words']

                indexAdjustment += (len(newToken['words']) - len(token['words']))

        newFile = FastFile(words=words, pages=file.pages)
        for wordIndex, word in enumerate(newFile.words):
            word.index = wordIndex

        return newFile

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

    def createBatch(self, batchSize, testing=False, allowColumnProcessing=False):
        batchWordVectors = []
        batchLineSortedWordIndexes = []
        batchLineSortedReverseWordIndexes = []
        batchColumnSortedWordIndexes = []
        batchColumnReverseWordIndexes = []
        batchClassificationOutputs = []
        batchModifierOutputs = []
        batchGroupOutputs = []
        batchTextTypeOutputs = []

        results = []
        for n in range(batchSize):
            if testing:
                randomIndex = random.randint(0, len(self.testingDataset) - 1)
                result = self.prepareDocument(self.augmentDocument(self.testingDataset[randomIndex]), allowColumnProcessing)
            else:
                randomIndex = random.randint(0, len(self.trainingDataset)-1)
                result = self.prepareDocument(self.augmentDocument(self.trainingDataset[randomIndex]), allowColumnProcessing)
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
            groupOutputs = result[7]
            textTypeOutputs = result[8]

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

                groupsVector = []
                for groupSet in self.groupSets:
                    groupSetLabels = self.groups[groupSet]
                    for label in groupSetLabels:
                        if label == 'null':
                            groupsVector.append(0)
                            groupsVector.append(1)
                            groupsVector.append(0)
                        else:
                            groupsVector.append(0)
                            groupsVector.append(0)
                            groupsVector.append(0)

                groupOutputs.append(groupsVector)
                textTypeOutputs.append([1, 0])

            if len(wordVectors) > maxLength:
                start = random.randint(0, len(wordVectors) - maxLength - 1)

                wordVectors = wordVectors[start:start + maxLength]
                lineSortedWordIndexes = [index-start for index in lineSortedWordIndexes if index >= start and index < (start + maxLength)]
                lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(index) for index in range(0, maxLength)]
                columnSortedWordIndexes = [index-start for index in columnSortedWordIndexes if index >= start and index < (start + maxLength)]
                columnReverseWordIndexes = [columnSortedWordIndexes.index(index) for index in range(0, maxLength)]

                classificationOutputs = classificationOutputs[start:start + maxLength]
                modifierOutputs = modifierOutputs[start:start + maxLength]
                groupOutputs = groupOutputs[start:start + maxLength]
                textTypeOutputs = textTypeOutputs[start:start + maxLength]

            batchWordVectors.append(wordVectors)
            batchLineSortedWordIndexes.append(lineSortedWordIndexes)
            batchLineSortedReverseWordIndexes.append(lineSortedReverseWordIndexes)
            batchColumnSortedWordIndexes.append(columnSortedWordIndexes)
            batchColumnReverseWordIndexes.append(columnReverseWordIndexes)
            batchClassificationOutputs.append(classificationOutputs)
            batchModifierOutputs.append(modifierOutputs)
            batchGroupOutputs.append(groupOutputs)
            batchTextTypeOutputs.append(textTypeOutputs)

        # print(batchWordVectors[0][0])
        # print(batchLineSortedWordIndexes)

        return (
            numpy.array(batchWordVectors),
            numpy.array(batchLineSortedWordIndexes),
            numpy.array(batchLineSortedReverseWordIndexes),
            numpy.array(batchColumnSortedWordIndexes),
            numpy.array(batchColumnReverseWordIndexes),
            numpy.array(batchClassificationOutputs),
            numpy.array(batchModifierOutputs),
            numpy.array(batchGroupOutputs),
            numpy.array(batchTextTypeOutputs)
        )
