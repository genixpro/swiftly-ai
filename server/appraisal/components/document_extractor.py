import os.path
import zipfile
import shutil
import multiprocessing
from appraisal.components.document_extractor_network import DocumentExtractorNetwork
from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.components.document_parser import DocumentParser
from google.cloud import storage



class DocumentExtractor:
    def __init__(self, db, vectorServerURL=None):
        manager = multiprocessing.Manager()

        self.dataset = DocumentExtractorDataset(vectorServerURL, manager)

        self.parser = DocumentParser()

        self.db = db


    def loadAlgorithm(self):
        self.dataset.loadLabels("models/labels.json")

        self.textTypeNetwork = DocumentExtractorNetwork(['textType'], self.dataset, allowColumnProcessing=False)

        self.classificationNetwork = DocumentExtractorNetwork(['groups', 'classification', 'modifiers'], self.dataset, allowColumnProcessing=True)

    def trainAlgorithm(self):
        directory = "models"

        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.mkdir(directory)

        self.dataset.loadDataset(self.db)

        self.dataset.saveLabels("models/labels.json")

        self.classificationNetwork = DocumentExtractorNetwork(['groups', 'classification', 'modifiers'], self.dataset, allowColumnProcessing=True)

        del self.classificationNetwork

        self.textTypeNetwork = DocumentExtractorNetwork(['textType'], self.dataset, allowColumnProcessing=False)

        self.classificationNetwork.trainAlgorithm()

        self.textTypeNetwork.trainAlgorithm()

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