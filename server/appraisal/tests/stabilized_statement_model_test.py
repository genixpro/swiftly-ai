import unittest
import json
import pkg_resources
from appraisal.models.appraisal import Appraisal

from appraisal.tests.base import GenericStabilizedStatementTest

class StabilizedStatementTestCase1(GenericStabilizedStatementTest, unittest.TestCase):
    @classmethod
    def loadAppraisal(cls):
        fileStream = pkg_resources.resource_stream('appraisal', 'tests/data/appraisal_industrial_1.json')

        appraisal = Appraisal(**json.load(fileStream))

        return appraisal

