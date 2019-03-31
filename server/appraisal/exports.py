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
import bson
from PIL import Image
import hashlib
from pprint import pprint
import concurrent.futures
import filetype
from .components.document_processor import DocumentProcessor
from .models.comparable_sale import ComparableSale
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


@resource(path='/appraisal/{appraisalId}/comparable_sales/excel', cors_enabled=True, cors_origins="*")
class ComparableExcelFile(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        comparables = ComparableSale.objects(id__in=appraisal.comparableSales)

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




@resource(path='/appraisal/{appraisalId}/comparable_sales/word', cors_enabled=True, cors_origins="*")
class ComparableWordFile(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def addBackground(self, cell, color):
        shading_elm_1 = parse_xml((r'<w:shd {} w:fill="{}" w:textColor="ffffff"/>').format(nsdecls('w'), color))
        cell._tc.get_or_add_tcPr().append(shading_elm_1)

    def addFontColor(self, cell, r, g, b):
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.bold = True
                run.font.color.rgb = docx.shared.RGBColor(r, g, b)



    def addHeaderFormatting(self, cell):
        self.addBackground(cell, "33339A")
        self.addFontColor(cell, 255, 255, 255)

    def formatAmount(self, number):
        number = "{:.2f}".format(number)
        regex = re.compile(r"\B(?=(\d{3})+(?!\d))")
        return regex.sub(", ", number)


    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        comparables = ComparableSale.objects(id__in=appraisal.comparableSales)

        document = Document()

        document.add_heading('Comparable Sales', 0)

        table = document.add_table(rows=1, cols=5)
        table.style = 'TableGrid'

        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'Date'
        hdr_cells[1].text = 'Address'
        hdr_cells[2].text = 'Consideration'
        hdr_cells[3].text = 'Description'
        hdr_cells[4].text = 'Cap Rate'
        for cell in hdr_cells:
            self.addHeaderFormatting(cell)

        document.add_page_break()

        document.save('demo.docx')

        for comp in comparables:
            row_cells = table.add_row().cells
            row_cells[0].text = comp.saleDate.strftime("%m/%y")
            row_cells[1].text = comp.address
            row_cells[2].text = "$" + self.formatAmount(comp.salePrice)
            row_cells[3].text = comp.description
            row_cells[4].text = self.formatAmount(comp.capitalizationRate) + "%"

            for cell in row_cells:
                self.addBackground(cell, "FFFDF3")

        table.columns[0].width = Inches(0.75)
        table.columns[1].width = Inches(1.5)
        table.columns[2].width = Inches(1)
        table.columns[3].width = Inches(2.0)
        table.columns[4].width = Inches(0.75)

        buffer = io.BytesIO()
        document.save(buffer)
        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        response.content_disposition = "attachment; filename=\"ComparableSales.docx\""
        return response




