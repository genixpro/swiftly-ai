from .document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
import numpy
import copy
import math
from pprint import pprint
from ..models.direct_comparison_valuation import DirectComparisonValuation
from .valuation_model_base import ValuationModelBase

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
        dca.freeRentDifferential = self.computeFreeRentDifferentials(appraisal)
        dca.vacantUnitDifferential = self.computeVacantUnitDifferential(appraisal)
        dca.amortizationDifferential = self.computeAmortizationDifferential(appraisal)

        dca.valuation = dca.comparativeValue + dca.marketRentDifferential + dca.freeRentDifferential + dca.vacantUnitDifferential + dca.amortizationDifferential

        for modifier in appraisal.directComparisonInputs.modifiers:
            if modifier.amount:
                dca.valuation += modifier.amount

        if dca.valuation == 0:
            dca.valuationRounded = 0
        else:
            dca.valuationRounded = round(dca.valuation, -int(math.floor(math.log10(abs(dca.valuation)))) + 2) # Round to 3 significant figures

        return dca




