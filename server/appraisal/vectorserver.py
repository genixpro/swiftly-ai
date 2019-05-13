from pyramid.config import Configurator
from pyramid.view import view_config
from pyramid.response import Response
import os
import pkg_resources
import subprocess
import functools

vectorServerSymmetricKey = "WW7av8oEg1zk6hn1v0KJH710KhT46d"

@functools.lru_cache(maxsize=10240)
def getWordVector(word, vectorProcess):
    try:
        vectorProcess.stdin.write(bytes(word + "\n", 'utf8'))
        vectorProcess.stdin.flush()
    except BrokenPipeError:
        print(vectorProcess.stderr.read())
    line = vectorProcess.stdout.readline()

    vector = [float(v) for v in line.split()[1:]]

    return vector


def vectors(request):
    """ Add blog entry code goes here """
    if request.json_body['key'] != vectorServerSymmetricKey:
        return Response(status=403)

    words = request.json_body['words']

    vectors = []
    for word in words:
        vectors.append(getWordVector(word, request.registry.vectorProcess))

    return vectors



def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.add_route("vectors", "/vectors")
        config.add_view(vectors, route_name='vectors', request_method="POST", renderer="json")

        vectorProcess = subprocess.Popen(["fasttext", "print-word-vectors", "crawl-300d-2M-subword.bin"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        config.registry.vectorProcess = vectorProcess


    return config.make_wsgi_app()


