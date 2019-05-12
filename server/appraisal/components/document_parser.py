import tempfile
import subprocess
import os
import io
import json
from base64 import b64encode
import re
import requests
import bson
from PIL import Image
import hashlib
from pprint import pprint
import concurrent.futures
import filetype
import time
import matplotlib.pyplot as plt
import numpy
import math
import scipy.signal
from sklearn.neighbors.kde import KernelDensity
from appraisal.models.file import Word

class DocumentParser:

    def __init__(self):
        pass


    def getPDFInfo(self, pdfFileName):
        process = subprocess.run(['pdfinfo', pdfFileName], stdout=subprocess.PIPE)
        result = str(process.stdout, 'utf8')
        lines = result.split("\n")

        data = {}
        for line in lines:
            if line.startswith("Pages:"):
                data['pages'] = int(line.split()[1])
        return data


    def renderPDFPage(self, pdfFileName, page):
        with tempfile.TemporaryDirectory() as dir:
            process = subprocess.run(['pdftoppm', pdfFileName, "-png", "-r", "300", "image", "-f", str(page+1), "-l", str(page+1)], cwd=dir)
            fileName = os.listdir(dir)[0]

            with open(os.path.join(dir, fileName), 'rb') as pngImage:
                imageData = pngImage.read()

                return imageData


    def extractWordsFromPDFLocal(self, fileData):
        with tempfile.TemporaryDirectory() as dir:
            with tempfile.NamedTemporaryFile('wb', dir=dir, suffix="pdf") as tempFile:
                tempFile.write(fileData)

                result = subprocess.run(['pdftotext', "-bbox", tempFile.name, "-"], cwd=dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                resultText = str(result.stdout, 'utf8')

                lines = resultText.split("\n")
                lines = [line.strip() for line in lines]

                pagePattern = "<page width=\"([\d\.]+)\" height=\"([\d\.]+)\">"
                pageRegex = re.compile(pagePattern)
                wordPattern = "<word xMin=\"([\d\.]+)\" yMin=\"([\d\.]+)\" xMax=\"([\d\.]+)\" yMax=\"([\d\.]+)\">(.*)</word>"
                wordRegex = re.compile(wordPattern)

                words = []

                page = -1
                width = 0
                height = 0
                for line in lines:
                    if line.startswith("<page"):
                        width = float(pageRegex.fullmatch(line).group(1))
                        height = float(pageRegex.fullmatch(line).group(2))
                        page += 1
                    elif line.startswith("<word"):
                        word = Word(
                            word=wordRegex.fullmatch(line).group(5),
                            page=page,
                            left=float(wordRegex.fullmatch(line).group(1)) / width,
                            right=float(wordRegex.fullmatch(line).group(3)) / width,
                            top=float(wordRegex.fullmatch(line).group(2)) / height,
                            bottom=float(wordRegex.fullmatch(line).group(4)) / height
                        )

                        words.append(word)
                words = self.assignLineNumbersToWords(words)
                words = self.mergeWords(words)
                words = self.assignColumnNumbersToWords(words)
                words = sorted(words, key=lambda word: (word.page, word.lineNumber, word.left))
        return words


    def extractWordsFromPDFGoogle(self, imageData, page):
        response = requests.post('https://vision.googleapis.com/v1/images:annotate',
                                 json={
                                     "requests": [{
                                         "image": {"content": b64encode(imageData).decode()},
                                         "features": [{
                                             'type': 'DOCUMENT_TEXT_DETECTION',
                                             'maxResults': 1
                                         }]
                                     }]
                                 },
                                 params={'key': "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I"},
                                 headers={'Content-Type': 'application/json'})

        memFile = io.BytesIO()
        memFile.write(imageData)
        memFile.seek(0)
        im = Image.open(memFile)

        words = []

        for annotation in response.json()['responses'][0]['textAnnotations'][1:]:
            word = Word(
                word=annotation['description'],
                page=page,
                left=min([vertex.get('x', 0) - 3 for vertex in annotation['boundingPoly']['vertices']]) / im.width,
                right=max([vertex.get('x', 0) + 3 for vertex in annotation['boundingPoly']['vertices']]) / im.width,
                top=min([vertex.get('y', 0) - 1 for vertex in annotation['boundingPoly']['vertices']]) / im.height,
                bottom=max([vertex.get('y', 0) + 1 for vertex in annotation['boundingPoly']['vertices']]) / im.height,
                classification='null'
            )

            words.append(word)
        words = self.assignLineNumbersToWords(words)
        words = self.mergeWords(words)
        words = self.assignColumnNumbersToWords(words)
        words = sorted(words, key=lambda word: (word.lineNumber, word.left))
        return words

    def verticalIntersectionOverUnion(self, line1, line2):
        if line1['top'] > line2['bottom']:
            return 0
        elif line2['top'] > line1['bottom']:
            return 0
        else:
            unionTop = min(line1['top'], line2['top'])
            unionBottom = max(line1['bottom'], line2['bottom'])
            union = unionBottom - unionTop

            intersectionTop = max(line1['top'], line2['top'])
            intersectionBottom = min(line1['bottom'], line2['bottom'])
            intersection = intersectionBottom - intersectionTop

            return intersection / union

    def assignLineNumbersToWords(self, words):
        wordsByPage = {}
        for word in words:
            if word.page not in wordsByPage:
                wordsByPage[word.page] = []
            wordsByPage[word.page].append(word)

        globalLineNumber = 0
        for page in sorted(wordsByPage.keys()):
            lines = []

            sortedWords = sorted(wordsByPage[page], key=lambda word: word.left)
            for word in sortedWords:
                # Find the maximum IoU between this word and any existing lines
                bestIoU = None
                bestLine = None
                for line in lines:
                    iou = self.verticalIntersectionOverUnion(word, line)
                    if bestIoU is None or iou > bestIoU:
                        bestIoU = iou
                        bestLine = line

                # If intersection over union > 0.5, take on the same line
                if bestLine is not None and bestIoU > 0.5:
                    word.line = bestLine
                    bestLine['top'] = min(bestLine['top'], word.top)
                    bestLine['bottom'] = max(bestLine['bottom'], word.bottom)
                else:
                    newLine = {
                        'top': word.top,
                        'bottom': word.bottom
                    }
                    lines.append(newLine)
                    word.line = newLine

            # Now sort the lines by their top point
            lines = sorted(lines, key=lambda line: line['top'])

            # Assign the line numbers to all the lines
            for lineNumber, line in enumerate(lines):
                line['lineNumber'] = lineNumber
                line['documentLineNumber'] = globalLineNumber + lineNumber

            for word in sortedWords:
                word.lineNumber = word.line['lineNumber']
                word.documentLineNumber = word.line['documentLineNumber']
                del word.line

            globalLineNumber = len(lines)
        return words

    def assignColumnNumbersToWords(self, words):
        wordsByPage = {}
        for word in words:
            if word.page not in wordsByPage:
                wordsByPage[word.page] = []
            wordsByPage[word.page].append(word)

        for page in wordsByPage:
            pageWords = wordsByPage[page]

            tables = []

            currentTable = None
            for word in pageWords:
                if word.textType == 'table':
                    if currentTable is None:
                        currentTable = [word]
                    else:
                        currentTable.append(word)
                else:
                    if currentTable is not None:
                        tables.append(currentTable)
                        currentTable = None

                    word.column = 0


            if currentTable is not None:
                tables.append(currentTable)

            for tableWords in tables:
                averageWordWidth = numpy.mean([word.right - word.left for word in tableWords])

                positions = []
                for word in tableWords:
                    width = word.right - word.left
                    for n in range(10):
                        positions.append([word.left + (width/9) * n])

                columnKDE = KernelDensity(kernel='gaussian', bandwidth=averageWordWidth).fit(positions)
                grid = numpy.reshape(numpy.linspace(0, 1, 1000), newshape=[1000, 1])
                columnProbs = columnKDE.score_samples(grid)
                columnPeaks = scipy.signal.find_peaks(columnProbs)[0] / 1000

                for word in tableWords:
                    # Find the column closest to this word
                    bestDist = None
                    for column, peak in enumerate(columnPeaks):
                        dist = abs((word.left/2 + word.right/2) - peak)
                        if bestDist is None or (dist < bestDist):
                            word.column = column + 1
                            bestDist = dist

        return words

    def mergeWords(self, words):
        # words = sorted(words, key=lambda word: (word.page, word.lineNumber, word.left))
        #
        # lastWord = None
        # wordsToRemove = []
        # mergeRatio = 0.050
        # for word in words:
        #     if lastWord is not None:
        #         horizontalGap = word.left - lastWord.right
        #         maxCharSize = max((word.right - word.left) / len(word.word), (lastWord.right - lastWord.left) / len(lastWord.word))
        #
        #         if word.lineNumber == lastWord.lineNumber and horizontalGap < (maxCharSize * mergeRatio):
        #             lastWord.word += word.word
        #             lastWord.right = word.right
        #             lastWord.top = min(lastWord.top, word.top)
        #             lastWord.bottom = max(lastWord.bottom, word.bottom)
        #             wordsToRemove.append(word)
        #         else:
        #             lastWord = word
        #     else:
        #         lastWord = word
        #
        # for word in wordsToRemove:
        #     del words[words.index(word)]

        return words

    def assignWordIndexesToWords(self, words):
        for index, word in enumerate(words):
            word.index = index

    def processImage(self, imageData, fileId, extractWords=True):
        if extractWords:
            words = self.extractWordsFromPDFGoogle(imageData, 0)
            self.assignWordIndexesToWords(words)
        else:
            words = []

        return words


    def processPDF(self, input_file, extractWords=True, local=False):
        with tempfile.TemporaryDirectory() as dir:
            with tempfile.NamedTemporaryFile('wb', dir=dir, suffix="pdf") as tempFile:
                tempFile.write(input_file)

                pdfInfo = self.getPDFInfo(os.path.join(dir, tempFile.name))

                imageFutures = []
                with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                    for page in range(pdfInfo['pages']):
                        future = pool.submit(self.renderPDFPage, tempFile.name, page)
                        imageFutures.append(future)

                words = []
                if extractWords:
                    if local:
                        words = self.extractWordsFromPDFLocal(input_file)
                    else:
                        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                            pageFutures = []
                            for page in range(pdfInfo['pages']):
                                future = executor.submit(self.extractWordsFromPDFGoogle, imageFutures[page].result(), page)
                                pageFutures.append(future)

                            for future in pageFutures:
                                words = words + future.result()

                self.assignWordIndexesToWords(words)

        return [future.result() for future in imageFutures], words


    def processDocx(self, input_file, extractWords=True):
        with tempfile.TemporaryDirectory() as dir:
            with tempfile.NamedTemporaryFile('wb', dir=dir, suffix="docx") as tempFile:
                tempFile.write(input_file)

                # We first try to use Libreoffice to convert the document into a pdf
                # Libreoffice is buggy and unreliable. We need to retry conversion a few times.
                convertedFileName = ""
                convertted = False
                maxTries = 3
                tries = maxTries

                while not convertted and tries > 0:
                    if tries < maxTries:
                        time.sleep(0.5)

                    process = subprocess.Popen(['libreoffice', '--headless', '--convert-to', 'pdf', '--outdir', dir, tempFile.name])
                    try:
                        process.wait(timeout=6)
                    except subprocess.TimeoutExpired:
                        process.kill()
                    convertedFileName = tempFile.name + '.pdf'
                    if os.path.exists(convertedFileName):
                        convertted = True
                    else:
                        tries -= 1


                with open(convertedFileName, 'rb') as convertedFile:
                    convertedFileData = convertedFile.read()

                os.unlink(convertedFileName)

        return self.processPDF(convertedFileData, local=True)
