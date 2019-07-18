from appraisal.components.document_parser import DocumentParser
from appraisal.components.document_extractor import DocumentExtractor
from appraisal.models.file import File, Word
from appraisal.models.custom_id_field import generateNewUUID
from mongoengine.queryset.visitor import Q
from appraisal.models.extraction_reference import ExtractionReference
import filetype
import re
import json as json
import hashlib
from pprint import pprint
from appraisal.components.tenancy_data_extractor import TenancyDataExtractor
from appraisal.components.income_statement_data_extractor import IncomeStatementDataExtractor
from appraisal.components.comparable_sale_data_extractor import ComparableSaleDataExtractor
from appraisal.components.discounted_cash_flow_model import DiscountedCashFlowModel
from appraisal.components.appraisal_validator import AppraisalValidator
from appraisal.components.stabilized_statement_model import StabilizedStatementModel
from appraisal.components.direct_comparison_valuation_model import DirectComparisonValuationModel
from pprint import pprint

class DocumentProcessor:
    """
        This system manages the end-to-end process of parsing and interpreting a document that is uploaded to this system.
    """

    def __init__(self, db, storageBucket, modelConfig, vectorServerURL=None):
        self.parser = DocumentParser()
        self.storageBucket = storageBucket
        self.db = db
        self.modelConfig = modelConfig
        self.vectorServerURL = vectorServerURL
        self.tenancyDataExtractor = TenancyDataExtractor()
        self.incomeStatementExtractor = IncomeStatementDataExtractor()
        self.discountedCashFlow = DiscountedCashFlowModel()
        self.appraisalValidator = AppraisalValidator()
        self.stabilizedStatement = StabilizedStatementModel()
        self.dcaModel = DirectComparisonValuationModel()
        self.comparableSaleDataExtractor = ComparableSaleDataExtractor()


    def processFileUpload(self, fileName, fileData, appraisal, owner=None, extract=True):
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
        if appraisal is not None:
            file.owner = appraisal.owner
            file.appraisalId = str(appraisal.id)
        else:
            file.owner = owner
            file.appraisalId = None
        file.id = generateNewUUID(File)

        m = hashlib.sha256()
        m.update(fileData)
        hash = m.hexdigest()
        file.hash = hash

        file.save()

        # fileId = str(file.id)

        file.uploadFileData(self.storageBucket, fileData)
        self.renderImagesAndExtractWords(file, fileData, extractWords=True)
        self.classifyAndProcessDocument(file)

        # Save
        file.save()

        if extract:
            self.extractAndMergeAppraisalData(file, appraisal)
            self.processAppraisalResults(appraisal)

        if appraisal is not None:
            appraisal.save()

        return file

    def renderImagesAndExtractWords(self, file, fileData, extractWords=False):
        mimeType = filetype.guess(fileData).mime

        if mimeType == 'application/pdf':
            images, words = self.parser.processPDF(fileData, extractWords=extractWords)

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
        existingFile = File.objects(Q(hash=file.hash) & (Q(reviewStatus="verifed") | Q(reviewStatus="verified") ) ).first()
        hasExistingData = existingFile and len(existingFile.words) > 0

        if hasExistingData:
            file.words = existingFile.words
            file.pageTypes = existingFile.pageTypes
            file.fileType = existingFile.fileType
        else:
            extractor = DocumentExtractor(self.db, self.modelConfig, self.vectorServerURL)
            extractor.loadAlgorithm()
            extractor.predictDocument(file)
            # for word in file.words:
            #     word.classification = "null"
            #     word.modifiers = []
            #     word.textType = "block"
            #     word.groups = {}


    def extractAndMergeAppraisalData(self, file, appraisal):
        groups = file.extractGroups()

        for group in groups:
            dataType = group[0].groups.get("DATA_TYPE")

            if dataType == 'RENT_ROLL':
                extractedUnits = self.tenancyDataExtractor.extractUnits(group)

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
            elif dataType == 'INCOME_STATEMENT' or dataType == 'EXPENSE_STATEMENT':
                # TODO: Change to only extract data within a comp.
                incomeStatement = self.incomeStatementExtractor.extractIncomeStatement(file)

                if appraisal.incomeStatement is None:
                    appraisal.incomeStatement = incomeStatement
                else:
                    appraisal.incomeStatement.mergeWithIncomeStatement(incomeStatement)
            elif dataType == 'COMPARABLE_SALE':
                comparableSale = self.comparableSaleDataExtractor.extractComparable(group)
                comparableSale.save()

                appraisal.comparableSalesDCA.append(str(comparableSale.id))
                appraisal.comparableSalesCapRate.append(str(comparableSale.id))

            reference = ExtractionReference()
            reference.appraisalId = str(appraisal.id)
            reference.fileId = str(file.id)
            reference.wordIndexes = [word.index for word in group]
            reference.pageNumbers = list(set([word.page for word in group]))

            if dataType in appraisal.dataTypeReferences:
                appraisal.dataTypeReferences[dataType].append(reference)
            else:
                appraisal.dataTypeReferences[dataType] = [reference]



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

