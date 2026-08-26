import secrets
import string

def password_generator():
    longitud = 12
    mayusculas = string.ascii_uppercase
    minusculas = string.ascii_lowercase
    numeros = string.digits
    especiales = "!@#$%&*()?"

    password = [
            secrets.choice(mayusculas),
            secrets.choice(minusculas),
            secrets.choice(numeros),
            secrets.choice(especiales)
            ]

    caracteres = mayusculas + minusculas + numeros + especiales

    for _ in range(longitud - 4):
        password.append(secrets.choice(caracteres))

    secrets.SystemRandom().shuffle(password)

    password = ''.join(password)

    return password