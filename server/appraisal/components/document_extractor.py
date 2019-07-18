import os.path
import zipfile
import shutil
import json as json
import multiprocessing
from appraisal.components.document_extractor_network import DocumentExtractorNetwork
from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.components.document_parser import DocumentParser
from google.cloud import storage



class DocumentExtractor:
    def __init__(self, db, configuration, vectorServerURL=None):
        self.manager = multiprocessing.Manager()

        self.parser = DocumentParser()

        self.vectorServerURL = vectorServerURL

        self.db = db

        self.configuration = configuration

    def createDatasets(self):
        self.textTypeDataset = DocumentExtractorDataset(self.configuration['textType'], self.vectorServerURL, self.manager)
        self.classificationDataset = DocumentExtractorDataset(self.configuration['classification'], self.vectorServerURL, self.manager)

    def loadAlgorithm(self):
        if os.path.exists("models/configuration.json"):
            self.configuration = json.load(open("models/configuration.json", "rt"))

        self.createDatasets()

        self.textTypeDataset.loadLabels("models/labels.json")
        self.classificationDataset.loadLabels("models/labels.json")

        self.textTypeNetwork = DocumentExtractorNetwork(['textType'], self.textTypeDataset, self.configuration['textType'], allowColumnProcessing=False)

        self.classificationNetwork = DocumentExtractorNetwork(['groups', 'classification', 'modifiers'], self.classificationDataset, self.configuration['classification'], allowColumnProcessing=True)

    def trainAlgorithm(self):
        directory = "models"

        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.mkdir(directory)

        self.createDatasets()
        self.classificationDataset.loadDataset(self.db, self.manager)

        self.classificationDataset.saveLabels("models/labels.json")

        self.classificationNetwork = DocumentExtractorNetwork(['groups', 'classification', 'modifiers'], self.classificationDataset, self.configuration['classification'], allowColumnProcessing=True)

        self.classificationNetwork.trainAlgorithm()

        del self.classificationNetwork
        del self.classificationDataset

        self.textTypeDataset.loadDataset(self.db, self.manager)

        self.textTypeDataset.saveLabels("models/labels.json")

        json.dump(self.configuration, open("models/configuration.json", "wt"))

        self.textTypeNetwork = DocumentExtractorNetwork(['textType'], self.textTypeDataset, self.configuration['textType'], allowColumnProcessing=False)

        self.textTypeNetwork.trainAlgorithm()

        del self.textTypeNetwork
        del self.textTypeDataset


    def uploadAlgorithm(self):
        directory = "models"
        modelsZipFile = 'models.zip'
        with open(modelsZipFile, 'wb') as file:
            zip = zipfile.ZipFile(file, 'w', zipfile.ZIP_DEFLATED)
            for root, dirs, files in os.walk(directory):
                for file in files:
                    zip.write(filename=str(os.path.join(root, file)), arcname=str(os.path.join(root.replace(directory, ""), file)))
            zip.close()

        storage_client = storage.Client()
        modelStorageBucket = storage_client.get_bucket("swiftly-deployment")

        blob = modelStorageBucket.blob("models.zip")
        blob.upload_from_filename("models.zip")

    def predictDocument(self, file):
        self.textTypeNetwork.predictDocument(file)

        self.parser.assignColumnNumbersToWords(file.words)

        self.classificationNetwork.predictDocument(file)
