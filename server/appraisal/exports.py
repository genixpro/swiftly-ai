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

@resource(path='/appraisal/{appraisalId}/comparable_sales/excel', cors_enabled=True, cors_origins="*")
class ComparableExcelFile(object):

    def __init__(self, request, context=None):
        self.request = request
        self.processor = DocumentProcessor(request.registry.db, request.registry.azureBlobStorage)

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




