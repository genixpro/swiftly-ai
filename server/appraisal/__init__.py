from pyramid.config import Configurator
import pymongo
from pyramid.authentication import BasicAuthAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from mongoengine import connect
from azure.storage.blob import BlockBlobService, PublicAccess
import json
from pyramid.httpexceptions import HTTPInternalServerError,HTTPBadRequest, HTTPRedirection, HTTPNotFound,HTTPUnauthorized,HTTPForbidden
from jwcrypto.jws import JWS, JWSHeaderRegistry, JWK, InvalidJWSSignature, InvalidJWSObject, InvalidJWSOperation
from jwcrypto.jwt import JWT
from jwcrypto.common import base64url_encode, base64url_decode, \
                            json_encode, json_decode

# You can connect to a real mongo server instance by your own.


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.add_route("graphql", "/graphql")
        config.scan()

        config.add_renderer('bson', 'appraisal.bson_renderer.BSONRenderer')

        apiUrl = settings.get('api.url')
        authDomain = settings.get('auth0.api')
        auth0Client = settings.get('auth0.clientID')
        auth0Secret = settings.get('auth0.secret')
        manageUrl = settings.get('auth0.manageApi')
        authKey = json.load(open(settings.get('auth0.keyFile'), 'rt'))

        def checkAuthentication(username, password, request):
            try:
                token = password
                key = JWK(**authKey)

                token = JWT(jwt=token, key=key, check_claims={'iss': authDomain, 'aud': apiUrl.replace("https://", "http://")})

                claims = json_decode(token.claims)
                if claims['sub'] != username:
                    print("Access token id doesn't match basic auth")
                    raise HTTPUnauthorized('The ID on the access token does not match the provided ID in Basic Auth.')

                groups = claims[f'{apiUrl.replace("https://", "http://")}groups']

                return [claims['sub']] + groups
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

        auth_policy = BasicAuthAuthenticationPolicy(check=checkAuthentication, debug=False)
        config.set_authentication_policy(auth_policy)

        acl_policy = ACLAuthorizationPolicy()
        config.set_authorization_policy(acl_policy)

        # Create the BlockBlockService that is used to call the Blob service for the storage account
        config.registry.azureBlobStorage =BlockBlobService(account_name=settings['storage.bucket'], account_key=settings['storage.accountKey'])
        config.registry.storageUrl = settings['storage.url']

        registry = config.registry
        db = pymongo.MongoClient(settings.get('db.uri'))[settings.get('db.name')]
        registry.db = db

        connect('appraisal', host=settings.get('db.uri'))


    return config.make_wsgi_app()
