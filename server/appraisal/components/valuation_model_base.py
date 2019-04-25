from dateutil.relativedelta import relativedelta
import datetime
import math
import copy
import dateutil
from appraisal.models.leasing_cost_structure import LeasingCostStructure


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


    def getStabilizedRent(self, appraisal, unit):
        if unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent) and unit.shouldUseMarketRent:
            return self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage
        elif unit.currentTenancy and unit.currentTenancy.yearlyRent:
            return unit.currentTenancy.yearlyRent
        else:
            return 0

    def getLeasingCostStructure(self, appraisal, name):
        for leasingCost in appraisal.leasingCosts:
            if leasingCost.name == name:
                return leasingCost

        for leasingCost in appraisal.leasingCosts:
            if leasingCost.name.lower() == "standard":
                return leasingCost

        return LeasingCostStructure()

    def computeMarketRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            unit.calculatedMarketRentDifferential = 0

            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent) and unit.shouldApplyMarketRentDifferential:
                presentDifferentialPSF = (unit.currentTenancy.yearlyRent / unit.squareFootage) - self.getMarketRent(appraisal, unit.marketRent)

                monthlyDifferentialCashflow = (presentDifferentialPSF * unit.squareFootage) / 12.0

                startDate = self.getEffectiveDate(appraisal)
                endDate = unit.currentTenancy.endDate

                currentDate = copy.copy(startDate)

                monthlyDiscount = math.pow(1.0 + (appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0)

                month = 0

                while currentDate < endDate:
                    totalDiscount = monthlyDiscount ** month

                    currentDifferential = monthlyDifferentialCashflow / totalDiscount

                    totalDifferential += currentDifferential

                    unit.calculatedMarketRentDifferential += currentDifferential

                    currentDate = currentDate + relativedelta(months=1)
                    month += 1

        return float(totalDifferential)


    def computeFreeRentRentLoss(self, appraisal):
        totalRentLoss = 0

        for unit in appraisal.units:
            unit.calculatedFreeRentLoss = 0

            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.currentTenancy.freeRentMonths:
                monthsFromStart = relativedelta(self.getEffectiveDate(appraisal), unit.currentTenancy.startDate).months
                freeRentMonthsRemaining = int(max(unit.currentTenancy.freeRentMonths - monthsFromStart, 0))

                currentRentLoss = freeRentMonthsRemaining * self.getStabilizedRent(appraisal, unit) / 12.0

                totalRentLoss += currentRentLoss

                unit.calculatedFreeRentLoss += currentRentLoss

        return -float(totalRentLoss)


    def computeVacantUnitRentLoss(self, appraisal):
        total = 0

        for unit in appraisal.units:
            unit.calculatedVacantUnitRentLoss = 0

            if unit.isVacantForStabilizedStatement and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                leasingCosts = self.getLeasingCostStructure(appraisal, unit.leasingCostStructure)

                currentRentLoss = (self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage) / 12.0 * leasingCosts.renewalPeriod

                unit.calculatedVacantUnitRentLoss += currentRentLoss
                total += currentRentLoss

        return -total


    def computeVacantUnitLeasupCosts(self, appraisal):
        total = 0

        for unit in appraisal.units:
            unit.calculatedVacantUnitLeasupCosts = 0

            if unit.isVacantForStabilizedStatement and unit.squareFootage:
                leasingCosts = self.getLeasingCostStructure(appraisal, unit.leasingCostStructure)

                currentLeaseUpCosts = leasingCosts.tenantInducementsPSF * unit.squareFootage

                if leasingCosts.leasingCommissionMode == 'psf':
                    currentLeaseUpCosts += leasingCosts.leasingCommissionPSF * unit.squareFootage
                elif leasingCosts.leasingCommissionMode == "percent_of_rent" and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                    currentLeaseUpCosts += (leasingCosts.leasingCommissionPercent / 100.0) * self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage

                unit.calculatedVacantUnitLeasupCosts += currentLeaseUpCosts

                total += currentLeaseUpCosts

        return -total


    def computeAmortizedCapitalInvestment(self, appraisal):
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



