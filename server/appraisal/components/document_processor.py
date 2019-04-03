from .document_classifier import DocumentClassifier
from .document_parser import DocumentParser
from .document_extractor import DocumentExtractor
from .page_classifier import PageClassifier
from ..models.file import File, Word
import filetype
import re
from pprint import pprint
from .tenancy_data_extractor import TenancyDataExtractor
from .income_statement_data_extractor import IncomeStatementDataExtractor
from .discounted_cash_flow_model import DiscountedCashFlowModel
from .appraisal_validator import AppraisalValidator
from .stabilized_statement_model import StabilizedStatementModel

class DocumentProcessor:
    """
        This system manages the end-to-end process of parsing and interpreting a document that is uploaded to this system.
    """

    def __init__(self, db, azureBlobStorage):
        self.classifier = DocumentClassifier()
        self.parser = DocumentParser()
        self.pageClassifier = PageClassifier()
        self.azureBlobStorage = azureBlobStorage
        self.db = db
        self.tenancyDataExtractor = TenancyDataExtractor()
        self.incomeStatementExtractor = IncomeStatementDataExtractor()
        self.discountedCashFlow = DiscountedCashFlowModel()
        self.appraisalValidator = AppraisalValidator()
        self.stabilizedStatement = StabilizedStatementModel()


    def processFileUpload(self, fileName, fileData, appraisal):
        """
        This method is used to process a file upload to a given appraisal.

        :param fileName: The file name
        :param fileData: The binary file data from the upload
        :param appraisal: The appraisal object that this file is being uploaded to
        :return:
        """

        # Create an initial file object
        file = File()
        file.fileName = fileName
        file.appraisalId = str(appraisal.id)
        file.save()
        fileId = str(file.id)

        result = self.azureBlobStorage.create_blob_from_bytes('files', fileId, fileData)


        existingFile = File.objects(fileName=file.fileName).first()
        hasExistingData = existingFile and len(existingFile.words) > 0

        self.renderImagesAndExtractWords(file, fileData, extractWords=(not hasExistingData))

        if hasExistingData:
            file.words = existingFile.words
            file.pageTypes = existingFile.pageTypes
            file.fileType = existingFile.fileType
        else:
            self.classifyAndProcessDocument(file)

        # Save
        file.save()

        self.extractAndMergeAppraisalData(file, appraisal)
        self.processAppraisalResults(appraisal)

        appraisal.save()

        return file

    def renderImagesAndExtractWords(self, file, fileData, extractWords=False):
        mimeType = filetype.guess(fileData).mime

        if mimeType == 'application/pdf':
            images, words = self.parser.processPDF(fileData, extractWords=extractWords, local=True)

            imageFileNames = []
            for page, imageData in enumerate(images):
                fileName = str(file.id) + "-image-" + str(page) + ".png"
                result = self.azureBlobStorage.create_blob_from_bytes('files', fileName, imageData)
                imageFileNames.append(fileName)

            file.images = imageFileNames
        elif mimeType == 'image/png':
            words = self.parser.processImage(fileData, file.id, extractWords=extractWords)

            fileName = str(file.id) + "-image-0.png"
            result = self.azureBlobStorage.create_blob_from_bytes('files', fileName, fileData)
            images = [fileName]

            file.images = [fileName]
        else:
            raise ValueError(f"Unsupported file type provided: {mimeType}")

        file.words = words
        file.pages = len(images)



    def classifyAndProcessDocument(self, file):
        file.fileType = self.classifier.classifyFile(file)
        file.pageTypes = self.pageClassifier.classifyFile(file)

        extractor = DocumentExtractor(self.db)
        extractor.predictDocument(file)


    def extractAndMergeAppraisalData(self, file, appraisal):
        extractedUnits = self.tenancyDataExtractor.extractUnits(file)

        # Now we merge together the existing units from the appraisal
        # with unit info pulled out from the document
        for extractedUnit in extractedUnits:
            foundExisting = False
            for existingUnit in appraisal.units:
                if extractedUnit.unitNumber == existingUnit.unitNumber:
                    existingUnit.mergeOtherUnitInfo(extractedUnit)
                    foundExisting = True
                    break
            if not foundExisting:
                appraisal.units.append(extractedUnit)

        incomeStatement = self.incomeStatementExtractor.extractIncomeStatement(file)

        if appraisal.incomeStatement is None:
            appraisal.incomeStatement = incomeStatement
        else:
            appraisal.incomeStatement.mergeWithIncomeStatement(incomeStatement)



    def processAppraisalResults(self, appraisal):
        discountedCashFlow = self.discountedCashFlow.createDiscountedCashFlow(appraisal)
        appraisal.discountedCashFlow = discountedCashFlow

        stabilizedStatement = self.stabilizedStatement.createStabilizedStatement(appraisal)
        appraisal.stabilizedStatement = stabilizedStatement

        validationResult = self.appraisalValidator.validateAppraisal(appraisal)
        appraisal.validationResult = validationResult

