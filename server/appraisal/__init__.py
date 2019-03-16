from pyramid.config import Configurator
import pymongo
from mongoengine import connect
from azure.storage.blob import BlockBlobService, PublicAccess


# You can connect to a real mongo server instance by your own.


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.add_route("graphql", "/graphql")
        config.scan()

        config.add_renderer('bson', 'appraisal.bson_renderer.BSONRenderer')

        # Create the BlockBlockService that is used to call the Blob service for the storage account
        config.registry.azureBlobStorage =BlockBlobService(account_name=settings['storage.bucket'], account_key=settings['storage.accountKey'])
        config.registry.storageUrl = settings['storage.url']

        registry = config.registry
        db = pymongo.MongoClient(settings.get('db.uri'))[settings.get('db.name')]
        registry.db = db

        connect('appraisal', host=settings.get('db.uri'))


    return config.make_wsgi_app()
