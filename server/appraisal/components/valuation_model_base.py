from dateutil.relativedelta import relativedelta
import datetime
import math
import copy
import dateutil
from ..models.leasing_cost_structure import LeasingCostStructure


class ValuationModelBase:
    """ Base class for valuation models, with some common functionality. """

    def getEffectiveDate(self, appraisal):
        effectiveDate = appraisal.effectiveDate if appraisal.effectiveDate else datetime.datetime.now()

        return effectiveDate

    def getLatestAmount(self, incomeStatementItem):
        years = sorted(incomeStatementItem.yearlyAmounts.keys(), key=lambda x: float(x))
        if len(years) == 0:
            return 0
        return incomeStatementItem.yearlyAmounts[years[-1]]

    def getMarketRent(self, appraisal, name):
        for marketRent in appraisal.marketRents:
            if marketRent.name == name:
                return marketRent.amountPSF

    def getLeasingCosts(self, appraisal, name):
        for leasingCost in appraisal.leasingCosts:
            if leasingCost.name == name:
                return leasingCost

        for leasingCost in appraisal.leasingCosts:
            if leasingCost.name.lower() == "default":
                return leasingCost

        return LeasingCostStructure()

    def computeMarketRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                presentDifferentialPSF = (unit.currentTenancy.yearlyRent / unit.squareFootage) - self.getMarketRent(appraisal, unit.marketRent)

                monthlyDifferentialCashflow = (presentDifferentialPSF * unit.squareFootage) / 12.0

                startDate = self.getEffectiveDate(appraisal)
                endDate = unit.currentTenancy.endDate

                currentDate = copy.copy(startDate)

                monthlyDiscount = math.pow(1.0 + (appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0)

                month = 0

                while currentDate < endDate:
                    totalDiscount = monthlyDiscount ** month

                    totalDifferential += monthlyDifferentialCashflow / totalDiscount

                    currentDate = currentDate + relativedelta(months=1)
                    month += 1

        return float(totalDifferential)


    def computeFreeRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.currentTenancy.freeRentMonths:
                monthsFromStart = relativedelta(self.getEffectiveDate(appraisal), unit.currentTenancy.startDate).months
                freeRentMonthsRemaining = int(max(unit.currentTenancy.freeRentMonths - monthsFromStart, 0))

                differential = freeRentMonthsRemaining * unit.currentTenancy.yearlyRent / 12.0

                totalDifferential += differential

        return -float(totalDifferential)


    def computeVacantUnitDifferential(self, appraisal):
        total = 0

        for unit in appraisal.units:
            if unit.isVacantInFirstYear and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                leasingCosts = self.getLeasingCosts(appraisal, unit.leasingCostStructure)

                total += leasingCosts.tenantInducementsPSF * unit.squareFootage + leasingCosts.leasingCommission + self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage

        return -total


    def computeAmortizationDifferential(self, appraisal):
        total = 0

        for item in appraisal.amortizationSchedule.items:
            if item.startDate and item.periodMonths and item.amount and item.interest and item.discountRate:
                monthsFromStart = relativedelta(self.getEffectiveDate(appraisal), item.startDate).months
                monthsRemaining = item.periodMonths - monthsFromStart

                monthlyInterest = math.pow(1.0 + (item.interest / 100), 1 / 12.0)
                monthlyDiscount = math.pow(1.0 + (item.discountRate / 100), 1 / 12.0)
                monthlyAmount = item.amount / item.periodMonths

                for month in range(int(monthsRemaining)):
                    currentInterest = math.pow(monthlyInterest, month)
                    currentDiscount = math.pow(monthlyDiscount, month)
                    currentAmount = currentInterest / currentDiscount * monthlyAmount

                    total += currentAmount

        return total



