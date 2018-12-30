from pyramid.view import view_config

from webob_graphql import serve_graphql_request
from .schema import schema


@view_config(
    route_name='graphql',
    # The serve_graphql_request method will detect what's the best renderer
    # to use, so it will do the json render automatically.
    # In summary, don't use the renderer='json' here :)
    request_method=["OPTIONS", "GET", "POST"]
)
def graphql_view(request):
    context = {'session': None}

    if request.method == 'OPTIONS':
        response = serve_graphql_request(request, schema, batch_enabled=True, context_value=context, graphiql_enabled=True)
        response.headers['Access-Control-Allow-Origin'] = "*"
        response.headers['Access-Control-Allow-Methods'] = "GET,POST,HEADERS,OPTIONS"
        response.headers['Access-Control-Allow-Headers'] = request.headers.get('Access-Control-Request-Headers', "")
        response.status_code = 200
        return response
    else:
        response = serve_graphql_request(request, schema, batch_enabled=True, context_value=context, graphiql_enabled=True)
        response.headers['Access-Control-Allow-Origin'] = "*"
        response.headers['Access-Control-Allow-Methods'] = "GET,POST,HEADERS,OPTIONS"
        return response

    # Optional, for adding batch query support (used in Apollo-Client)
    # return serve_graphql_request(request, schema, batch_enabled=True, context_value=context)


