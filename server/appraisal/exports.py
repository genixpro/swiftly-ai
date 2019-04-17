from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
from pyramid.response import Response
import tempfile
import subprocess
import os
import io
import json
from base64 import b64encode
import re
import requests
import base64
import bson
from PIL import Image
import hashlib
from pprint import pprint
import concurrent.futures
import filetype
from .components.document_processor import DocumentProcessor
from .models.comparable_sale import ComparableSale
from .models.comparable_lease import ComparableLease
from .models.appraisal import Appraisal
from openpyxl import Workbook
from openpyxl.utils import get_column_letter
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_COLOR_INDEX
from docx.enum.dml import MSO_THEME_COLOR
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml
import docx
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from .authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden


class ExportAPI(object):
    def addBackground(self, cell, color):
        shading_elm_1 = parse_xml((r'<w:shd {} w:fill="{}" w:textColor="ffffff"/>').format(nsdecls('w'), color))
        cell._tc.get_or_add_tcPr().append(shading_elm_1)

    def addFontColor(self, cell, r, g, b):
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.bold = True
                run.font.color.rgb = docx.shared.RGBColor(r, g, b)

    def formatAmount(self, number):
        number = "{:.2f}".format(number)
        regex = re.compile(r"\B(?=(\d{3})+(?!\d))")
        return regex.sub(", ", number)


    def renderTemplate(self, templateName, data):
        wordDocFolder = os.path.join(os.getcwd(), "appraisal", "word_documents")

        with tempfile.TemporaryDirectory() as tempDir:
            with tempfile.NamedTemporaryFile(suffix=".html", dir=tempDir) as temp:
                data["fileName"] = temp.name

                renderHtml = subprocess.run(args=["npm",  "run-script", templateName], cwd=wordDocFolder, input=bytes(json.dumps(data), 'utf8'), stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                stdout = str(renderHtml.stdout, 'utf8')
                stderr = str(renderHtml.stderr, 'utf8')

                if renderHtml.returncode != 0 or stderr != "":
                    raise Exception(stderr)

                with open("data.html", "wt") as testFile:
                    testFile.write(open(temp.name, "rt").read())

                odtFileName = temp.name.replace(".html", ".odt")
                docxFileName = temp.name.replace(".html", ".docx")

                convertOdt = subprocess.run(args=["libreoffice", "--norestore", "--headless", "--convert-to", "odt", temp.name], cwd=tempDir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                stdout = str(convertOdt.stdout, 'utf8')
                stderr = str(convertOdt.stderr, 'utf8')

                if convertOdt.returncode != 0:
                    raise Exception(stderr)


                convertDocx = subprocess.run(args=["libreoffice", "--norestore", "--headless", "--convert-to", "docx", odtFileName], cwd=tempDir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                stdout = str(convertDocx.stdout, 'utf8')
                stderr = str(convertDocx.stderr, 'utf8')

                if convertDocx.returncode != 0:
                    raise Exception(stderr)

                file = open(docxFileName, 'rb')

                buffer = io.BytesIO()
                buffer.write(file.read())
                buffer.seek(0)

                file.close()

                os.unlink(odtFileName)
                os.unlink(docxFileName)

                return buffer

@resource(path='/appraisal/{appraisalId}/comparable_sales/excel', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableSalesExcelFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        query = {"id__in": appraisal.comparableSales}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparables = ComparableSale.objects(**query)

        wb = Workbook()

        ws1 = wb.active
        ws1.title = "Comparable Sales"

        ws1.append([
            "Name",
            "Address",
            "Sale Date",
            "Net Operating Income",
            "Sale Price",
            "Capitalization Rate",
            "Size (sf)",
            "TMI (psf)",
            "Vacancy Rate",
            "Description"
        ])

        for comp in comparables:
            ws1.append([
                comp.name,
                comp.address,
                comp.saleDate,
                comp.netOperatingIncome,
                comp.salePrice,
                comp.capitalizationRate,
                comp.sizeSquareFootage,
                comp.taxesMaintenanceInsurancePSF,
                comp.vacancyRate,
                comp.description,
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        response.content_disposition = "attachment; filename=\"ComparableSales.xlsx\""
        return response




@resource(path='/appraisal/{appraisalId}/comparable_sales/word', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableSalesWordFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        query = {"id__in": appraisal.comparableSales}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparables = ComparableSale.objects(**query)

        data = {
            "appraisal": json.loads(appraisal.to_json()),
            "comparableSales": [json.loads(comp.to_json()) for comp in comparables]
        }

        buffer = self.renderTemplate("comparable_sales_summary_word", data)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        response.content_disposition = "attachment; filename=\"ComparableSales.docx\""
        return response



@resource(path='/appraisal/{appraisalId}/comparable_sales/detailed_word', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableSalesDetailedWordFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]


    def addHeaderFormatting(self, cell):
        self.addFontColor(cell, 0, 0, 0)

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        query = {"id__in": appraisal.comparableSales}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparables = ComparableSale.objects(**query)

        comparables = [comp for comp in comparables]


        for comp in comparables:
            if comp.imageUrl == "" or comp.imageUrl is None:
                image = requests.get(f"https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location={comp.address}").content
            else:
                image = requests.get(comp.imageUrl).content

            data64 = u''.join(str(base64.encodebytes(image), 'utf8'))
            comp.imageUrl = u'data:%s;base64,%s' % ("image/jpeg", data64)

        data = {
            "appraisal": json.loads(appraisal.to_json()),
            "comparableSales": [json.loads(comp.to_json()) for comp in comparables]
        }

        buffer = self.renderTemplate("comparable_sales_detailed_word", data)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        response.content_disposition = "attachment; filename=\"ComparableSales.docx\""
        return response




@resource(path='/appraisal/{appraisalId}/comparable_leases/excel', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableLeasesExcelFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        query = {"id__in": appraisal.comparableLeases}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparables = ComparableLease.objects(**query)

        wb = Workbook()

        ws1 = wb.active
        ws1.title = "Comparable Leases"

        ws1.append([
            "Name",
            "Address",
            "Lease Date",
            "Type",
            "Size (sf)",
            "Rent",
            "Description"
        ])

        for comp in comparables:
            ws1.append([
                comp.name,
                comp.address,
                comp.leaseDate,
                comp.propertyType,
                comp.sizeOfUnit,
                comp.yearlyRent,
                comp.description
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        response.content_disposition = "attachment; filename=\"ComparableLeases.xlsx\""
        return response





@resource(path='/appraisal/{appraisalId}/comparable_leases/word', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableLeasesWordFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def addHeaderFormatting(self, cell):
        self.addBackground(cell, "33339A")
        self.addFontColor(cell, 255, 255, 255)

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        query = {"id__in": appraisal.comparableLeases}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparables = ComparableLease.objects(**query)

        document = Document()

        document.add_heading('Comparable Leases', 0)

        table = document.add_table(rows=1, cols=5)
        table.style = 'TableGrid'

        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Date'
        hdr_cells[1].text = 'Address'
        hdr_cells[2].text = 'Area'
        hdr_cells[3].text = 'Rent'
        hdr_cells[4].text = 'Remarks'
        for cell in hdr_cells:
            self.addHeaderFormatting(cell)

        document.add_page_break()

        document.save('demo.docx')

        for comp in comparables:
            row_cells = table.add_row().cells
            if comp.leaseDate is not None:
                row_cells[0].text = comp.leaseDate.strftime("%m/%y")
            if comp.address is not None:
                row_cells[1].text = comp.address
            if comp.sizeOfUnit is not None:
                row_cells[2].text = self.formatAmount(comp.sizeOfUnit) + " sf"
            if comp.yearlyRent is not None and comp.sizeOfUnit is not None:
                row_cells[3].text = "$" + self.formatAmount(comp.yearlyRent / comp.sizeOfUnit)
            if comp.description is not None:
                row_cells[4].text = comp.description

            for cell in row_cells:
                self.addBackground(cell, "FFFDF3")

        table.columns[0].width = Inches(0.75)
        table.columns[1].width = Inches(1.5)
        table.columns[2].width = Inches(1)
        table.columns[3].width = Inches(0.75)
        table.columns[4].width = Inches(2.0)

        buffer = io.BytesIO()
        document.save(buffer)
        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        response.content_disposition = "attachment; filename=\"ComparableLeases.docx\""
        return response



@resource(path='/appraisal/{appraisalId}/rent_roll/word', cors_enabled=True, cors_origins="*", permission="everything")
class RentRollWordFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]


    def addHeaderFormatting(self, cell):
        self.addBackground(cell, "33339A")
        self.addFontColor(cell, 255, 255, 255)

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        data = {
            "appraisal": json.loads(appraisal.to_json())
        }

        buffer = self.renderTemplate("rent_roll_summary_word", data)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        response.content_disposition = "attachment; filename=\"RentRoll.docx\""
        return response



@resource(path='/appraisal/{appraisalId}/rent_roll/excel', cors_enabled=True, cors_origins="*", permission="everything")
class RentRollExcelFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        wb = Workbook()

        ws1 = wb.active
        ws1.title = "Rent Roll"

        ws1.append([
            "Unit Number",
            "Size (sqft)",
            "Tenant Name",
            "Yearly Rent ($)",
            "Remarks"
        ])

        for unit in appraisal.units:
            name = ""
            if unit.currentTenancy is not None:
                name = unit.currentTenancy.name

            yearlyRent = ""
            if unit.currentTenancy is not None:
                yearlyRent = unit.currentTenancy.yearlyRent

            ws1.append([
                unit.unitNumber,
                unit.squareFootage,
                name,
                yearlyRent,
                unit.remarks
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        response.content_disposition = "attachment; filename=\"RentRoll.xlsx\""
        return response



@resource(path='/appraisal/{appraisalId}/expenses/word', cors_enabled=True, cors_origins="*", permission="everything")
class ExpensesWordFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        data = {
            "appraisal": json.loads(appraisal.to_json())
        }

        buffer = self.renderTemplate("expenses_summary_word", data)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        response.content_disposition = "attachment; filename=\"Expenses.docx\""
        return response


@resource(path='/appraisal/{appraisalId}/expenses/excel', cors_enabled=True, cors_origins="*", permission="everything")
class ExpensesExcelFile(ExportAPI):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]
    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        wb = Workbook()

        ws1 = wb.active
        ws1.title = "Expenses"

        headers = [""]

        for year in appraisal.incomeStatement.years:
            headers.append(str(year))

        headers[0] = "Operating Expenses"
        ws1.append(headers)

        operatingExpenses = [expense for expense in appraisal.incomeStatement.expenses if expense.incomeStatementItemType == 'operating_expense']
        managementExpenses = [expense for expense in appraisal.incomeStatement.expenses if expense.incomeStatementItemType == 'management_expense']
        taxExpenses = [expense for expense in appraisal.incomeStatement.expenses if expense.incomeStatementItemType == 'taxes']

        for expense in operatingExpenses:
            row = [expense.name]

            for year in appraisal.incomeStatement.years:
                row.append(expense.yearlyAmounts.get(str(year)))

            ws1.append(row)

        ws1.append([""] * len(headers))
        ws1.append([""] * len(headers))
        headers[0] = "Management Expenses"
        ws1.append(headers)

        for expense in managementExpenses:
            row = [expense.name]

            for year in appraisal.incomeStatement.years:
                row.append(expense.yearlyAmounts.get(str(year)))

            ws1.append(row)

        ws1.append([""] * len(headers))
        ws1.append([""] * len(headers))
        headers[0] = "Tax Expenses"
        ws1.append(headers)

        for expense in taxExpenses:
            row = [expense.name]

            for year in appraisal.incomeStatement.years:
                row.append(expense.yearlyAmounts.get(str(year)))

            ws1.append(row)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        response.content_disposition = "attachment; filename=\"Expenses.xlsx\""
        return response

