from .document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
import numpy
import copy
import math
from pprint import pprint
from ..models.discounted_cash_flow import MonthlyCashFlowItem, YearlyCashFlowItem, DiscountedCashFlow, DiscountedCashFlowSummary, DiscountedCashFlowSummaryItem

class DiscountedCashFlowModel:
    """ This class encapsulated the information for a discounted cash flow model of an appraisal. """

    def __init__(self):
        """Constructs a discounted cash flow model based on the given documents"""
        pass


    def createDiscountedCashFlow(self, appraisal):
        dcf = DiscountedCashFlow()

        dcf.yearlyCashFlows = self.getYearlyCashFlowItems(appraisal)
        dcf.cashFlowSummary = self.computeCashFlowSummary(appraisal)

        return dcf


    def projectRentalCashFlows(self, unitInfo, startYear, endYear, discountCashFlowInputs):
        startDate = datetime.datetime(year=startYear, month=1, day=1)
        endDate = datetime.datetime(year=endYear, month=12, day=1)

        currentDate = copy.copy(startDate)

        monthlyInflation = math.pow(1.0 + (discountCashFlowInputs.inflation / 100), 1 / 12.0)

        cashFlows = []

        month = 0
        mode = ''
        vacancyMonths = 0

        while currentDate < endDate:
            tenancy = unitInfo.findTenancyAtDate(currentDate)

            totalInflation = monthlyInflation ** month

            rentAmount = None
            inducementAmount = None
            leasingCommissionAmount = None

            if tenancy:
                rentAmount = tenancy.monthlyRent
                inducementAmount = 0
                leasingCommissionAmount = 0
            elif mode == '' or (mode == 'vacancy' and vacancyMonths < discountCashFlowInputs.renewalPeriod):
                mode = 'vacancy'
                vacancyMonths += 1

                rentAmount = 0
                inducementAmount = 0
                leasingCommissionAmount = 0
            elif mode == 'vacancy' and vacancyMonths == discountCashFlowInputs.renewalPeriod:
                mode = "market_rents"

                rentAmount = discountCashFlowInputs.marketRentPSF * unitInfo.squareFootage * totalInflation
                inducementAmount = discountCashFlowInputs.leasingCommission * totalInflation
                leasingCommissionAmount = discountCashFlowInputs.tenantInducementsPSF * unitInfo.squareFootage * totalInflation

            elif mode == 'market_rents':
                mode = "market_rents"

                rentAmount = discountCashFlowInputs.marketRentPSF * unitInfo.squareFootage * totalInflation
                inducementAmount = 0
                leasingCommissionAmount = 0

            incomeItem = MonthlyCashFlowItem(
                name="Rent",
                amount=rentAmount,
                cashFlowType="income",
                year=currentDate.year,
                month=currentDate.month,
                relativeMonth=month
            )
            cashFlows.append(incomeItem)

            leasingCommissionItem = MonthlyCashFlowItem(
                name="Lease Commission",
                amount=leasingCommissionAmount,
                cashFlowType="expense",
                year=currentDate.year,
                month=currentDate.month,
                relativeMonth=month
            )
            cashFlows.append(leasingCommissionItem)

            tenantInducementsItem = MonthlyCashFlowItem(
                name="Tenant Inducements",
                amount=inducementAmount,
                cashFlowType="expense",
                year=currentDate.year,
                month=currentDate.month,
                relativeMonth=month
            )
            cashFlows.append(tenantInducementsItem)

            currentDate = currentDate + relativedelta(months=1)
            month += 1

        return cashFlows


    def projectCashFlows(self, incomeStatementItem, startYear, endYear, discountCashFlowInputs):
        startDate = datetime.datetime(year=startYear, month=1, day=1, hour=0, minute=0, second=0)
        endDate = datetime.datetime(year=endYear, month=12, day=1, hour=0, minute=0, second=0)

        currentDate = copy.copy(startDate)

        monthlyInflation = math.pow(1.0 + (discountCashFlowInputs.inflation / 100), 1 / 12.0)

        cashFlows = []

        month = 0
        while currentDate < endDate:
            totalInflation = monthlyInflation ** month

            item = MonthlyCashFlowItem(
                name=incomeStatementItem.name,
                amount=incomeStatementItem.yearlyAmounts.get(str(startYear), 0) * totalInflation,
                cashFlowType=incomeStatementItem.cashFlowType,
                year=currentDate.year,
                month=currentDate.month,
                relativeMonth=month
            )

            cashFlows.append(item)

            currentDate = currentDate + relativedelta(months=1)
            month += 1

        return cashFlows


    def projectAllRentalCashFlows(self, appraisal):
        cashFlows = []

        for unit in appraisal.units:
            cashFlows.extend(self.projectRentalCashFlows(unit, startYear=datetime.datetime.now().year, endYear=datetime.datetime.now().year + 10, discountCashFlowInputs=appraisal.discountedCashFlowInputs))

        # Group by month, year, and name
        grouped = {}

        for cashFlow in cashFlows:
            key = (cashFlow.year, cashFlow.month, cashFlow.name)

            if key in grouped:
                grouped[key].append(cashFlow)
            else:
                grouped[key] = [cashFlow]

        # Now merge together all the cash flows for each key
        mergedCashFlows = []
        for key in grouped:
            mergedCashFlows.append(MonthlyCashFlowItem(
                name=key[2],
                amount=float(numpy.sum([cashFlow.amount for cashFlow in grouped[key]])),
                cashFlowType=grouped[key][0].cashFlowType,
                year=key[0],
                month=key[1],
                relativeMonth=grouped[key][0].relativeMonth
            ))

        return mergedCashFlows



    def getMonthlyCashFlowItems(self, appraisal):
        cashFlows = []
        for item in appraisal.incomeStatement.incomes:
            cashFlows.extend(self.projectCashFlows(incomeStatementItem=item, startYear=datetime.datetime.now().year, endYear=datetime.datetime.now().year + 10, discountCashFlowInputs=appraisal.discountedCashFlowInputs))
        for item in appraisal.incomeStatement.expenses:
            cashFlows.extend(self.projectCashFlows(incomeStatementItem=item, startYear=datetime.datetime.now().year, endYear=datetime.datetime.now().year + 10, discountCashFlowInputs=appraisal.discountedCashFlowInputs))

        return cashFlows

    def getYearlyCashFlowItems(self, appraisal):
        cashFlows = self.getMonthlyCashFlowItems(appraisal)
        cashFlows.extend(self.projectAllRentalCashFlows(appraisal))

        if len(cashFlows) == 0:
            return []

        cashFlowGroups = {}
        for cashFlow in cashFlows:
            groupId = (cashFlow.name, cashFlow.year)
            if groupId in cashFlowGroups:
                cashFlowGroups[groupId].append(cashFlow)
            else:
                cashFlowGroups[groupId] = [cashFlow]

        minYear = min([cashFlow.year for cashFlow in cashFlows])

        yearlyCashFlowItems = []
        for monthCashFlows in cashFlowGroups.values():
            yearlyCashFlow = YearlyCashFlowItem(
                name=monthCashFlows[0].name,
                year=monthCashFlows[0].year,
                relativeYear=monthCashFlows[0].year - minYear,
                cashFlowType=monthCashFlows[0].cashFlowType,
                amount=float(numpy.sum([cashFlow.amount for cashFlow in monthCashFlows]))
            )
            yearlyCashFlowItems.append(yearlyCashFlow)

        return yearlyCashFlowItems



    def computeCashFlowSummary(self, appraisal):
        yearlyCashFlowItems = self.getYearlyCashFlowItems(appraisal)

        years = sorted(set(cashFlow.year for cashFlow in yearlyCashFlowItems))

        if len(yearlyCashFlowItems) == 0:
            return DiscountedCashFlowSummary(
                years=[],
                incomes=[],
                expenses=[],
                netOperatingIncome=None,
                presentValue=None
            )

        # Group incomes and expenses by name
        incomeGrouped = {}
        expenseGrouped = {}
        for cashFlow in yearlyCashFlowItems:
            if cashFlow.cashFlowType == 'income':
                grouped = incomeGrouped
            elif cashFlow.cashFlowType == 'expense':
                grouped = expenseGrouped
            else:
                continue

            if cashFlow.name in grouped:
                grouped[cashFlow.name].append(cashFlow)
            else:
                grouped[cashFlow.name] = [cashFlow]

        incomes = []
        for name, cashFlows in incomeGrouped.items():
            incomes.append(DiscountedCashFlowSummaryItem(
                name=name,
                amounts={str(cashFlow.year):cashFlow.amount for cashFlow in sorted(cashFlows, key=lambda cashFlow: cashFlow.year)}
            ))

        expenses = []
        for name, cashFlows in expenseGrouped.items():
            expenses.append(DiscountedCashFlowSummaryItem(
                name=name,
                amounts={str(cashFlow.year): cashFlow.amount for cashFlow in sorted(cashFlows, key=lambda cashFlow: cashFlow.year)}
            ))

        incomeTotalsByYear = {}
        expenseTotalsByYear = {}

        for cashFlows in incomeGrouped.values():
            for cashFlow in cashFlows:
                year = cashFlow.year
                if str(year) in incomeTotalsByYear:
                    incomeTotalsByYear[str(year)] += cashFlow.amount
                else:
                    incomeTotalsByYear[str(year)] = cashFlow.amount

        for cashFlows in expenseGrouped.values():
            for cashFlow in cashFlows:
                year = cashFlow.year
                if str(year) in expenseTotalsByYear:
                    expenseTotalsByYear[str(year)] += cashFlow.amount
                else:
                    expenseTotalsByYear[str(year)] = cashFlow.amount

        incomeTotal = DiscountedCashFlowSummaryItem(
            name="Net Revenues",
            amounts=incomeTotalsByYear
        )

        expenseTotal = DiscountedCashFlowSummaryItem(
            name="Operating Expenses",
            amounts=expenseTotalsByYear
        )

        # Compute net operating income
        operatingIncomeByYear = {}
        for year in years:
            operatingIncomeByYear[str(year)] = incomeTotalsByYear.get(str(year), 0) - expenseTotalsByYear.get(str(year), 0)

        netOperatingIncome = DiscountedCashFlowSummaryItem(
            name="Net Operating Income",
            amounts=operatingIncomeByYear
        )


        # Compute present value by year
        yearlyDiscount = 1.0 + (appraisal.discountedCashFlowInputs.discountRate) / 100.0
        presentValueByYear = {}
        startYear = years[0]
        for year in years:
            discountRate = yearlyDiscount ** (year - startYear)
            presentValueByYear[str(year)] = operatingIncomeByYear[str(year)] / discountRate

        presentValue = DiscountedCashFlowSummaryItem(
            name="Present Value",
            amounts=presentValueByYear
        )

        return DiscountedCashFlowSummary(
            years=years,
            incomes=incomes,
            expenses=expenses,
            incomeTotal=incomeTotal,
            expenseTotal=expenseTotal,
            netOperatingIncome=netOperatingIncome,
            presentValue=presentValue
        )





