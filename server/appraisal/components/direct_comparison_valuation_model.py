from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
import numpy
import copy
import math
from pprint import pprint
from appraisal.models.direct_comparison_valuation import DirectComparisonValuation
from appraisal.components.valuation_model_base import ValuationModelBase

class DirectComparisonValuationModel(ValuationModelBase):
    """ This class encapsulates the code required for producing a stabilized statement"""


    def createDirectComparisonValuation(self, appraisal):
        dca = DirectComparisonValuation()

        if not appraisal.sizeOfBuilding:
            dca.comparativeValue = 0
            dca.valuation = 0
            dca.valuationRounded = 0
            return dca


        dca.comparativeValue = appraisal.sizeOfBuilding * appraisal.directComparisonInputs.pricePerSquareFoot

        dca.marketRentDifferential = self.computeMarketRentDifferentials(appraisal)
        dca.freeRentRentLoss = self.computeFreeRentRentLoss(appraisal)
        dca.vacantUnitRentLoss = self.computeVacantUnitRentLoss(appraisal)
        dca.vacantUnitLeasupCosts = self.computeVacantUnitLeasupCosts(appraisal)
        dca.amortizedCapitalInvestment = self.computeAmortizedCapitalInvestment(appraisal)

        dca.valuation = dca.comparativeValue + dca.marketRentDifferential + dca.freeRentRentLoss + dca.vacantUnitRentLoss + dca.vacantUnitLeasupCosts + dca.amortizedCapitalInvestment

        for modifier in appraisal.directComparisonInputs.modifiers:
            if modifier.amount:
                dca.valuation += modifier.amount

        if dca.valuation == 0:
            dca.valuationRounded = 0
        else:
            dca.valuationRounded = round(dca.valuation, -int(math.floor(math.log10(abs(dca.valuation)))) + 2) # Round to 3 significant figures

        return dca




