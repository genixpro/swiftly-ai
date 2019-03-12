
import dateparser
import datetime


class Document:
    """ This class represents a document being processed by our system."""

    def __init__(self, file):
        """ Create a Document object out of the given file record in the database."""
        self.words = file['words']
        self.pageTypes = file['pageTypes']


    def breakIntoTokens(self):
        tokens = []
        currentToken = None
        for word in self.words:
            if word['classification'] != "null":
                if currentToken is None:
                    currentToken = {
                        "classification": word['classification'],
                        "modifiers": word.get('modifiers', []),
                        "words": [word],
                        "startIndex": word['index']
                    }
                elif currentToken['classification'] == word['classification'] and set(currentToken['modifiers']) == set(word.get('modifiers', [])):
                    currentToken['words'].append(word)
                else:
                    currentToken['endIndex'] = word['index']
                    tokens.append(currentToken)
                    currentToken = {
                        "classification": word['classification'],
                        "modifiers": word.get('modifiers', []),
                        "words": [word],
                        "startIndex": word['index']
                    }
            else:
                if currentToken is not None:
                    currentToken['endIndex'] = word['index']
                    tokens.append(currentToken)
                    currentToken = None

        for token in tokens:
            text = ""
            for word in token['words']:
                text += word['word'] + " "
            text = text.strip()
            token['text'] = text
            token['pageType'] = self.pageTypes[token['words'][0]['page']]


        return tokens

    def getDocumentYear(self):
        tokens = self.breakIntoTokens()

        date = ""
        for token in tokens:
            if token['classification'] == 'STATEMENT_YEAR':
                return token['text']
            elif token['classification'] == 'STATEMENT_DATE':
                date = token['text']

        if date == '':
            return datetime.datetime.now().year

        parsed = dateparser.parse(date)

        return parsed.year

    def getLineItems(self, pageType):
        tokens = self.breakIntoTokens()

        tokens = [token for token in tokens if token['pageType'] == pageType]

        year = self.getDocumentYear()

        tokensByLineNumberAndPage = {}
        for token in tokens:
            if token['classification'] != "null":
                lineNumberPage = (token['words'][0]['page'], token['words'][0]['lineNumber'])
                if lineNumberPage in tokensByLineNumberAndPage:
                    tokensByLineNumberAndPage[lineNumberPage].append(token)
                else:
                    tokensByLineNumberAndPage[lineNumberPage] = [token]

        lineItems = []

        for lineNumberPage in tokensByLineNumberAndPage:
            groupedByClassification = {}
            for token in tokensByLineNumberAndPage[lineNumberPage]:
                if token['classification'] in groupedByClassification:
                    groupedByClassification[token['classification']].append(token)
                else:
                    groupedByClassification[token['classification']] = [token]

            maxSize = max([len(groupedByClassification[classification]) for classification in groupedByClassification])

            items = [{
                'modifiers': set()
            } for n in range(maxSize)]
            for classification in groupedByClassification:
                for tokenIndex, token in enumerate(groupedByClassification[classification]):
                    if len(groupedByClassification[classification]) == 1:
                        itemsForGroup = items
                    else:
                        itemsForGroup = [items[tokenIndex]]

                    for item in itemsForGroup:
                        item[token['classification']] = token['text']
                        for modifier in token['modifiers']:
                            item['modifiers'].add(modifier)

            for item in items:
                if 'NEXT_YEAR' in item['modifiers']:
                    item['year'] = year + 1
                else:
                    item['year'] = year

            lineItems.extend(items)

        return lineItems