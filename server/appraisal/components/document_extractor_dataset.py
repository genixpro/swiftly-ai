import subprocess
import copy
import tensorflow as tf
from .document_generator import DocumentGenerator
import numpy
import pickle
import random
import concurrent.futures
import multiprocessing


class DocumentExtractorDataset:
    manager = multiprocessing.Manager()
    fasttextLock = manager.Lock()
    vectors = subprocess.Popen(["fasttext", "print-word-vectors", "crawl-300d-2M-subword.bin"],
                               stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)

    def __init__(self):
        self.generator = DocumentGenerator()

        self.labels = [
            "null",
            "DOCUMENT_NUMBER", "DOCUMENT_DATE", "DOCUMENT_TIME", "DOCUMENT_TIME", "STATEMENT_DATE",
            "BUILDING_ADDRESS", "USER_ID", "STATEMENT_YEAR", "STATEMENT_NEXT_YEAR", "ACC_NUM", "ACC_NAME",
            "ACC_SUM_NAME", "FORECAST", "FORECAST_S", "BUDGET", "BUDGET_S", "BUDGET_N", "BUDGET_SN",
            "VARIANCE", "VARIANCE_S", "VARIANCE_N", "VARIANCE_SN", "VARIANCE_P", "VARIANCE_SP", "VARIANCE_NP",
            "VARIANCE_SPN"
        ]

        self.maxLength = 250
        self.wordVectorSize = 300

    def prepareDocument(self, file):
        with self.fasttextLock:
            # load

            wordVectors = []
            for word in file['words']:
                try:
                    self.vectors.stdin.write(bytes(word['word'] + "\n", 'utf8'))
                    self.vectors.stdin.flush()
                except BrokenPipeError:
                    print(self.vectors.stderr.read())
                line = self.vectors.stdout.readline()

                vector = [float(v) for v in line.split()[1:]]
                wordVectors.append(numpy.array(vector))

        lineSortedWordIndexes = [word['index'] for word in sorted(file['words'], key=lambda word: (word['page'], word['lineNumber'], word['left']))]
        columnLeftSortedWordIndexes = [word['index'] for word in sorted(file['words'], key=lambda word: (word['columnLeft'], word['lineNumber'], word['left']))]
        columnRightSortedWordIndexes = [word['index'] for word in sorted(file['words'], key=lambda word: (word['columnRight'], word['lineNumber'], word['left']))]

        lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(word['index']) for word in file['words']]
        columnLeftReverseWordIndexes = [columnLeftSortedWordIndexes.index(word['index']) for word in file['words']]
        columnRightReverseWordIndexes = [columnRightSortedWordIndexes.index(word['index']) for word in file['words']]

        outputs = []

        for word in file['words']:
            oneHotCode = [0] * len(self.labels)

            if 'classification' in word:
                oneHotCode[self.labels.index(word['classification'])] = 1
            else:
                oneHotCode[self.labels.index('null')] = 1
            outputs.append(oneHotCode)
        return (
            wordVectors,
            lineSortedWordIndexes,
            lineSortedReverseWordIndexes,
            columnLeftSortedWordIndexes,
            columnLeftReverseWordIndexes,
            columnRightSortedWordIndexes,
            columnRightReverseWordIndexes,
            outputs)

    def generateAndSaveDocument(self, n):
        data = self.generator.generateDocument("financial_statement_1.docx", "financial_statement")
        data = self.prepareDocument(data)

        with open(f'data/data-{n}.bin', 'wb') as file:
            pickle.dump(data, file)

    def generateAndSaveDataset(self):
        with concurrent.futures.ProcessPoolExecutor(max_workers=3) as executor:
            for n in range(1000):
                executor.submit(self.generateAndSaveDocument, n)
            executor.shutdown(wait=True)

    def loadDataset(self):
        dataset = []
        for index in range(1000):
            with open(f"data/data-{index}.bin", 'rb') as file:
                result = pickle.load(file)

                dataset.append(result)
        return dataset

    def createBatch(self, batchSize):
        batchWordVectors = []
        batchLineSortedWordIndexes = []
        batchLineSortedReverseWordIndexes = []
        batchColumnLeftSortedWordIndexes = []
        batchColumnLeftReverseWordIndexes = []
        batchColumnRightSortedWordIndexes = []
        batchColumnRightReverseWordIndexes = []
        batchOutputs = []

        for n in range(batchSize):
            randomIndex = random.randint(0, 999)

            with open(f"data/data-{randomIndex}.bin", 'rb') as file:
                result = pickle.load(file)

            wordVectors = result[0]
            lineSortedWordIndexes = result[1]
            lineSortedReverseWordIndexes = result[2]
            columnLeftSortedWordIndexes = result[3]
            columnLeftReverseWordIndexes = result[4]
            columnRightSortedWordIndexes = result[5]
            columnRightReverseWordIndexes = result[6]
            outputs = result[7]

            while len(wordVectors) < self.maxLength:
                index = len(wordVectors)
                lineSortedWordIndexes.append(index)
                lineSortedReverseWordIndexes.append(index)
                columnLeftSortedWordIndexes.append(index)
                columnLeftReverseWordIndexes.append(index)
                columnRightSortedWordIndexes.append(index)
                columnRightReverseWordIndexes.append(index)
                wordVectors.append([0] * self.wordVectorSize)
                outputs.append(self.labels.index("null"))

            if len(wordVectors) > self.maxLength:
                start = random.randint(0, len(wordVectors) - self.maxLength - 1)

                wordVectors = wordVectors[start:start + self.maxLength]
                lineSortedWordIndexes = [index-start for index in lineSortedWordIndexes if index >= start and index < (start + self.maxLength)]
                lineSortedReverseWordIndexes = [lineSortedWordIndexes.index(index) for index in range(0, self.maxLength)]
                columnLeftSortedWordIndexes = [index-start for index in columnLeftSortedWordIndexes if index >= start and index < (start + self.maxLength)]
                columnLeftReverseWordIndexes = [columnLeftSortedWordIndexes.index(index) for index in range(0, self.maxLength)]
                columnRightSortedWordIndexes = [index-start for index in columnRightSortedWordIndexes if index >= start and index < (start + self.maxLength)]
                columnRightReverseWordIndexes = [columnRightSortedWordIndexes.index(index) for index in range(0, self.maxLength)]

                outputs = outputs[start:start + self.maxLength]

            batchWordVectors.append(wordVectors)
            batchLineSortedWordIndexes.append(lineSortedWordIndexes)
            batchLineSortedReverseWordIndexes.append(lineSortedReverseWordIndexes)
            batchColumnLeftSortedWordIndexes.append(columnLeftSortedWordIndexes)
            batchColumnLeftReverseWordIndexes.append(columnLeftReverseWordIndexes)
            batchColumnRightSortedWordIndexes.append(columnRightSortedWordIndexes)
            batchColumnRightReverseWordIndexes.append(columnRightReverseWordIndexes)
            batchOutputs.append(outputs)

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
            numpy.array(batchOutputs))
