from pyramid.config import Configurator
import pymongo

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.scan()

        config.add_renderer('bson', 'appraisal.bson_renderer.BSONRenderer')

        registry = config.registry
        db = pymongo.MongoClient(settings.get('db.uri'))[settings.get('db.name')]
        registry.db = db


    return config.make_wsgi_app()
