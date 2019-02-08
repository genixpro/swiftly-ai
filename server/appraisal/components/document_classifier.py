import subprocess
import copy


class DocumentClassifier:
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
                    text = " ".join([word['word'] for word in file['words']])

                    dataFile.write(f"__label__{file['type']} {text}\n")

    def trainAlgorithm(self, db):
        self.prepareData(db)

        trainLine = ["fasttext", "supervised", "-input", "data.txt", "-output", "file_type_model"]

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
        text = self.prepareTextForFile(file)

        testLine = ["fasttext", "predict-prob", "file_type_model.bin", "-", "1000"]
        predictionProcess = subprocess.Popen(testLine, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)

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

        predictionProcess.terminate()

        return bestLabel.replace("__label__", "")


