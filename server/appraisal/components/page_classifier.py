import subprocess
import copy


class PageClassifier:
    def __init__(self):
        pass

    def prepareTextForFile(self, file):
        text = " ".join([word['word'] for word in file['words']])

        return text

    def prepareData(self, db):
        self.filesCollection = db['files']

        files = self.filesCollection.find()


        with open("data.txt", "wt") as dataFile:
            for file in files:
                if 'words' in file:
                    wordsByPage = {page: [] for page in range(file['pages'])}
                    for word in file['words']:
                        wordsByPage[word['page']].append(word)

                    for page in wordsByPage:
                        pageClassification = file['pageTypes'][page]
                        text = " ".join([word['word'] for word in wordsByPage[page]])

                        dataFile.write(f"__label__{pageClassification} {text}\n")

    def trainAlgorithm(self, db):
        self.prepareData(db)

        trainLine = ["fasttext", "supervised", "-input", "data.txt", "-output", "page_type_model"]

        fastparams = {
            "epoch": 1000,
            "lr": 0.1,
            "thread": 8
        }

        for key in fastparams:
            trainLine.append("-" + key)
            trainLine.append(str(fastparams[key]))

        subprocess.run(trainLine)


    def classifyFile(self, file):
        wordsByPage = {page: [] for page in range(file['pages'])}
        for word in file['words']:
            wordsByPage[word['page']].append(word)


        testLine = ["fasttext", "predict-prob", "page_type_model.bin", "-", "1000"]
        predictionProcess = subprocess.Popen(testLine, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)

        pageTypes = {}
        for page in wordsByPage:
            text = " ".join([word['word'] for word in wordsByPage[page]])

            predictionProcess.stdin.write(bytes(text + "\n", 'utf8'))

            try:
                predictionProcess.stdin.flush()
            except BrokenPipeError:
                print(predictionProcess.stderr.read())
            line = str(predictionProcess.stdout.readline(), 'utf8')

            result = line.split()

            probabilities = {}
            for labelIndex in range(int(len(result) / 2)):
                label = result[labelIndex * 2]
                probability = result[labelIndex * 2 + 1]
                probabilities[label] = probability


            bestLabel = None

            if len(probabilities) > 0:
                bestLabel = max(probabilities.items(), key=lambda k: float(k[1]))[0]

            pageTypes[page] = bestLabel.replace("__label__", "")

        predictionProcess.terminate()

        return [pageTypes[page] for page in range(file['pages'])]


