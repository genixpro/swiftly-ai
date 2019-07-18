import unittest
import json as json

import pkg_resources

from appraisal.models.appraisal import Appraisal
from appraisal.components.document_processor import DocumentProcessor


class GenericStabilizedStatementTest:
    @classmethod
    def loadAppraisal(cls):
        pass

    @classmethod
    def setUpClass(cls):
        processedAppraisal = cls.loadAppraisal()
        originalAppraisal = cls.loadAppraisal()

        originalAppraisal.validate()

        processor = DocumentProcessor(None, None, None, None)

        processor.processAppraisalResults(processedAppraisal)

        processedAppraisal.validate()

        cls.processedAppraisal = processedAppraisal

        cls.originalAppraisal = originalAppraisal

    @classmethod
    def tearDownClass(cls):
        pass

    def assertWithinDollar(self, expected, actual):
        if expected is None and actual is None:
            return
        elif expected is None and actual is not None:
            self.assertEqual(expected, actual)
        elif actual is None and expected is not None:
            self.assertEqual(expected, actual)
        elif abs(expected - actual) > 1.00:
            self.assertEqual(expected, actual)


    def test_rentalIncome(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.rentalIncome, type(self).processedAppraisal.stabilizedStatement.rentalIncome)

    def test_additionalIncome(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.additionalIncome, type(self).processedAppraisal.stabilizedStatement.additionalIncome)

    def test_managementRecovery(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.managementRecovery, type(self).processedAppraisal.stabilizedStatement.managementRecovery)

    def test_operatingExpenseRecovery(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.operatingExpenseRecovery, type(self).processedAppraisal.stabilizedStatement.operatingExpenseRecovery)

    def test_recoverableIncome(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.recoverableIncome, type(self).processedAppraisal.stabilizedStatement.recoverableIncome)

    def test_potentialGrossIncome(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.potentialGrossIncome, type(self).processedAppraisal.stabilizedStatement.potentialGrossIncome)

    def test_vacancyDeduction(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.vacancyDeduction, type(self).processedAppraisal.stabilizedStatement.vacancyDeduction)

    def test_effectiveGrossIncome(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.effectiveGrossIncome, type(self).processedAppraisal.stabilizedStatement.effectiveGrossIncome)

    def test_operatingExpenses(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.operatingExpenses, type(self).processedAppraisal.stabilizedStatement.operatingExpenses)

    def test_tmiTotal(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.tmiTotal, type(self).processedAppraisal.stabilizedStatement.tmiTotal)

    def test_taxes(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.taxes, type(self).processedAppraisal.stabilizedStatement.taxes)

    def test_managementExpenses(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.managementExpenses, type(self).processedAppraisal.stabilizedStatement.managementExpenses)

    def test_totalExpenses(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.totalExpenses, type(self).processedAppraisal.stabilizedStatement.totalExpenses)

    def test_netOperatingIncome(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.netOperatingIncome, type(self).processedAppraisal.stabilizedStatement.netOperatingIncome)

    def test_marketRentDifferential(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.marketRentDifferential, type(self).processedAppraisal.stabilizedStatement.marketRentDifferential)

    def test_freeRentRentLoss(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.freeRentRentLoss, type(self).processedAppraisal.stabilizedStatement.freeRentRentLoss)

    def test_vacantUnitDifferential(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.vacantUnitDifferential, type(self).processedAppraisal.stabilizedStatement.vacantUnitDifferential)

    def test_amortizedCapitalInvestment(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.amortizedCapitalInvestment, type(self).processedAppraisal.stabilizedStatement.amortizedCapitalInvestment)

    def test_structuralAllowance(self):
        self.assertWithinDollar(type(self).originalAppraisal.stabilizedStatement.structuralAllowance, type(self).processedAppraisal.stabilizedStatement.structuralAllowance)
