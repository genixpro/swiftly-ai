import re


class DataExtractor:
    """ This is the base class for various sections of code which are used for extracting various types of data from documents into
        standardized formats. """

    def __init__(self):
        pass


    def cleanAmount(self, amount):
        try:
            amount = str(amount)

            negative = False
            if "-" in amount or "(" in amount or ")" in amount:
                negative = True

            amount = re.sub("[^0-9\\.]", "", amount)

            if amount == '':
                return 0

            number = float(amount)

            if negative:
                return -number
            else:
                return number
        except ValueError:
            return 0