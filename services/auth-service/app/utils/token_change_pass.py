import secrets
import hashlib

def gen_token():
    token = secrets.token_urlsafe(32)

    token_hash = hash_token(token)

    return token, token_hash

def hash_token(token):
    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    return token_hash


    

