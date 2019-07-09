from appraisal.models.appraisal import Appraisal
from pyramid.authentication import extract_http_basic_credentials, CallbackAuthenticationPolicy
from pyramid.httpexceptions import HTTPInternalServerError,HTTPBadRequest, HTTPRedirection, HTTPNotFound,HTTPUnauthorized,HTTPForbidden
from jwcrypto.jws import JWS, JWSHeaderRegistry, JWK, InvalidJWSSignature, InvalidJWSObject, InvalidJWSOperation
from jwcrypto.jwt import JWT
from jwcrypto.common import base64url_encode, base64url_decode, \
                            json_encode, json_decode
import rapidjson as json
from .models.custom_id_field import regularizeID

class CustomAuthenticationPolicy(CallbackAuthenticationPolicy):

    def __init__(self, settings):

        self.settings = settings

        self.apiUrl = settings.get('api.url')
        self.authDomain = settings.get('auth0.api')
        self.authKey = json.load(open(settings.get('auth0.keyFile'), 'rt'))
        self.viewAll = settings.get('db.enable_view_all') == 'true'


    def unauthenticated_userid(self, request):
        """ The userid parsed from the ``Authorization`` request header."""
        credentials = extract_http_basic_credentials(request)
        if credentials:
            return credentials.username
        elif 'access_token' in request.GET:
            token = request.GET['access_token']
            return self.extractTokenAuthentications(token)[0]


    def remember(self, request, userid, **kw):
        """ A no-op. Basic authentication does not provide a protocol for
        remembering the user. Credentials are sent on every request.

        """
        return []

    def forget(self, request):
        """ Returns challenge headers. This should be attached to a response
        to indicate that credentials are required."""
        return [('WWW-Authenticate', 'Basic realm="swiftly"')]

    def extractTokenAuthentications(self, token):
        try:
            key = JWK(**self.authKey)

            token = JWT(jwt=token, key=key, check_claims={'iss': self.authDomain, 'aud': self.apiUrl.replace("https://", "http://")})

            claims = json_decode(token.claims)

            groups = claims[f'{self.apiUrl.replace("https://", "http://")}groups']

            view_all = []
            if self.viewAll:
                view_all.append('view_all')

            return [claims['sub']] + groups + view_all
        except ValueError as e:
            print(e)
            raise HTTPUnauthorized('The access token is invalid')
        except InvalidJWSSignature as e:
            print(e)
            raise HTTPUnauthorized('The signature on your access token is invalid.')
        except InvalidJWSObject as e:
            print(e)
            raise HTTPUnauthorized('The JWS object on your access token is invalid.')
        except InvalidJWSOperation as e:
            print(e)
            raise HTTPUnauthorized('You have requested an invalid JWS operating')

    def callback(self, username, request):
        # Username arg is ignored. Unfortunately
        # extract_http_basic_credentials winds up getting called twice when
        # authenticated_userid is called. Avoiding that, however,
        # winds up duplicating logic from the superclass.
        credentials = extract_http_basic_credentials(request)
        if credentials:
            username, token = credentials
            ids = self.extractTokenAuthentications(token)

            if ids[0] != username:
                print("Access token id doesn't match basic auth")
                raise HTTPUnauthorized('The ID on the access token does not match the provided ID in Basic Auth.')

            return ids
        elif request.GET['access_token']:
            token = request.GET['access_token']
            return self.extractTokenAuthentications(token)
        else:
            return []



def checkUserOwnsAppraisalId(userId, principalIds, appraisalId):
    if "view_all" in principalIds:
        return True

    query = {
        "_id": regularizeID(appraisalId),
        "owner": userId
    }

    appraisal = Appraisal.objects(**query).only('owner')

    if appraisal is None:
        return False
    else:
        return True

def checkUserOwnsObject(userId, principalIds, appraisal):
    if "view_all" in principalIds:
        return True

    if appraisal.owner != userId:
        return False
    else:
        return True

def getAccessTokenForRequest(request):
    credentials = extract_http_basic_credentials(request)
    if credentials:
        username, token = credentials
        return token
    elif request.GET['access_token']:
        token = request.GET['access_token']
        return token
    else:
        return None