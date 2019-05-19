from appraisal.components.document_parser import DocumentParser
from appraisal.components.document_extractor import DocumentExtractor
from appraisal.models.file import File, Word
import filetype
import re
from pprint import pprint
from appraisal.components.tenancy_data_extractor import TenancyDataExtractor
from appraisal.components.income_statement_data_extractor import IncomeStatementDataExtractor
from appraisal.components.discounted_cash_flow_model import DiscountedCashFlowModel
from appraisal.components.appraisal_validator import AppraisalValidator
from appraisal.components.stabilized_statement_model import StabilizedStatementModel
from appraisal.components.direct_comparison_valuation_model import DirectComparisonValuationModel

class DocumentProcessor:
    """
        This system manages the end-to-end process of parsing and interpreting a document that is uploaded to this system.
    """

    def __init__(self, db, storageBucket, vectorServerURL=None):
        self.parser = DocumentParser()
        self.storageBucket = storageBucket
        self.db = db
        self.vectorServerURL = vectorServerURL
        self.tenancyDataExtractor = TenancyDataExtractor()
        self.incomeStatementExtractor = IncomeStatementDataExtractor()
        self.discountedCashFlow = DiscountedCashFlowModel()
        self.appraisalValidator = AppraisalValidator()
        self.stabilizedStatement = StabilizedStatementModel()
        self.dcaModel = DirectComparisonValuationModel()


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
        file.owner = appraisal.owner
        file.appraisalId = str(appraisal.id)
        file.save()
        fileId = str(file.id)

        file.uploadFileData(self.storageBucket, fileId)
        self.renderImagesAndExtractWords(file, fileData, extractWords=True)
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
                fileName = file.uploadRenderedImage(page, self.storageBucket, imageData)
                imageFileNames.append(fileName)

            file.images = imageFileNames
        elif mimeType == 'image/png':
            words = self.parser.processImage(fileData, file.id, extractWords=extractWords)

            fileName = file.uploadRenderedImage(0, self.storageBucket, fileData)

            images = [fileName]

            file.images = [fileName]
        else:
            raise ValueError(f"Unsupported file type provided: {mimeType}")

        file.words = words
        file.pages = len(images)



    def classifyAndProcessDocument(self, file):
        # extractor = DocumentExtractor(self.db, self.vectorServerURL)
        # extractor.predictDocument(file)
        for word in file.words:
            word.classification = "null"
            word.modifiers = []
            word.textType = "block"
            word.groups = {}


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
        # discountedCashFlow = self.discountedCashFlow.createDiscountedCashFlow(appraisal)
        # appraisal.discountedCashFlow = discountedCashFlow
        appraisal.discountedCashFlow = None

        stabilizedStatement = self.stabilizedStatement.createStabilizedStatement(appraisal)
        appraisal.stabilizedStatement = stabilizedStatement

        directComparisonValuation = self.dcaModel.createDirectComparisonValuation(appraisal)
        appraisal.directComparisonValuation = directComparisonValuation

        validationResult = self.appraisalValidator.validateAppraisal(appraisal)
        appraisal.validationResult = validationResult

