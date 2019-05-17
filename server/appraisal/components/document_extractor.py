import subprocess
import copy
import tensorflow as tf
from appraisal.components.document_generator import DocumentGenerator
import numpy
import pickle
import random
import json
import io
from pprint import pprint
import concurrent.futures
import csv
import multiprocessing
from appraisal.components.document_extractor_network import DocumentExtractorNetwork
from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.components.document_parser import DocumentParser



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
        self.dataset.loadDataset(self.db)

        self.textTypeNetwork = DocumentExtractorNetwork(['textType'], self.dataset, allowColumnProcessing=False)

        self.classificationNetwork = DocumentExtractorNetwork(['groups', 'classification', 'modifiers'], self.dataset, allowColumnProcessing=True)

        self.classificationNetwork.trainAlgorithm()

        self.textTypeNetwork.trainAlgorithm()

    def predictDocument(self, file):
        self.textTypeNetwork.predictDocument(file)

        self.parser.assignColumnNumbersToWords(file.words)

        self.classificationNetwork.predictDocument(file)