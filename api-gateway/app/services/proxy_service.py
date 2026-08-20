from flask import request, Response
import requests

def proxy_request(url):
    headers = {
        key: value
        for key, value in request.headers
        if key.lower() not in [
            "host",
            "content-length"
        ]
    }
    response = requests.request(
        method=request.method,
        url=url,
        headers=headers,
        params=request.args,
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False
    )
    excluded_headers = [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection"
    ]
    response_headers = [
        (name, value)
        for (name, value) in response.raw.headers.items()
        if name.lower() not in excluded_headers
    ]
    return Response(
        response.content,
        response.status_code,
        response_headers
    )