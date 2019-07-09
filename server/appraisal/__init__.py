from pyramid.config import Configurator
import pymongo
from appraisal.authorization import CustomAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
import collections
from mongoengine import connect
import os
import rapidjson as json
import pkg_resources
from google.cloud import storage


def conditional_http_tween_factory(handler, registry):
    def conditional_http_tween(request):
        response = handler(request)

        if request.method == 'GET':
            # If the Last-Modified header has been set, we want to enable the
            # conditional response processing.
            if response.last_modified is not None:
                response.conditional_response = True

            # We want to only enable the conditional machinery if either we
            # were given an explicit ETag header by the view or we have a
            # buffered response and can generate the ETag header ourself.
            if response.etag is not None:
                response.conditional_response = True
            elif (isinstance(response.app_iter, collections.abc.Sequence) and
                    len(response.app_iter) == 1):
                response.conditional_response = True
                response.md5_etag()

        return response
    return conditional_http_tween


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.scan(package="appraisal.endpoints", ignore="appraisal.libs")

        config.add_renderer('bson', 'appraisal.bson_renderer.BSONRenderer')

        config.add_tween("appraisal.conditional_http_tween_factory")

        auth_policy = CustomAuthenticationPolicy(settings)
        config.set_authentication_policy(auth_policy)

        acl_policy = ACLAuthorizationPolicy()
        config.set_authorization_policy(acl_policy)

        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = pkg_resources.resource_filename("appraisal", "gcloud-storage-key.json")

        storage_client = storage.Client()
        config.registry.storageBucket = storage_client.get_bucket(settings['storage.bucket'])

        registry = config.registry
        db = pymongo.MongoClient(settings.get('db.uri'))[settings.get('db.name')]
        registry.db = db

        registry.apiUrl = settings.get('api.url')

        registry.vectorServerURL = settings.get('vectorServerURL')
        registry.modelConfig = json.load(pkg_resources.resource_stream("appraisal", f"model_configuration/{settings.get('modelConfig')}"))

        connect(settings.get('db.name'), host=settings.get('db.uri'))

    return config.make_wsgi_app()