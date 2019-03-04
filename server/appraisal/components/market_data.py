




class MarketData:
    """ This class represents the MarketData that is needed to process an appraisal."""

    def __init__(self, data):
        self.inflation = data['inflation']






    @staticmethod
    def getTestingMarketData():
        return MarketData({
            "inflation": 2.0
        })
