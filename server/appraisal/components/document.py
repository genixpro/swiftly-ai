


class Document:
    """ This class represents a document being processed by our system."""

    def __init__(self, file):
        """ Create a Document object out of the given file record in the database."""
        self.words = file['words']


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

        return tokens