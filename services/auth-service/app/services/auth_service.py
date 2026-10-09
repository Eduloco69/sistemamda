import logging
import os
import re
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager

import bcrypt
import pyodbc
import requests

from app.database.connection import get_connection
from app.utils.password_gen import password_generator
from app.utils.password_val import password_check
from app.utils.token_change_pass import gen_token, hash_token
from shared.app.auth.jwt_handler import generate_token

logger = logging.getLogger(__name__)

MAIL_SERVICE = f"{os.environ['NOTIFICATION_SERVICE']}/mail"

T_USUARIO = "[MesaDeAyuda].[dbo].[usuario]"
T_TOKEN = "[MesaDeAyuda].[dbo].[TokenChangePass]"
T_ROL_PERMISO = "[MesaDeAyuda].[dbo].[rolPermiso]"
T_PERMISOS = "[MesaDeAyuda].[dbo].[permisos]"

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_PASSWORD_ATTEMPTS = 20
BCRYPT_MAX_BYTES = 72

_DUMMY_HASH = bcrypt.hashpw(b"dummy-password", bcrypt.gensalt()).decode()

_mail_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="mail")

class ServiceError(Exception):
    """Error controlado: aborta la transacción (rollback) y devuelve body/status."""

    def __init__(self, body: dict, status: int):
        super().__init__(body.get("Mensaje") or body.get("Error"))
        self.body = body
        self.status = status

@contextmanager
def db_cursor():
    """Cursor transaccional: commit al salir bien, rollback ante cualquier excepción,
    y siempre cierra cursor y conexión."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
    finally:
        conn.close()


def _send_mail(endpoint: str, body: dict, descripcion: str) -> None:
    """Se ejecuta en un hilo aparte. Nunca propaga excepciones ni loguea el body
    (contiene contraseñas / tokens)."""
    try:
        resp = requests.post(f"{MAIL_SERVICE}/{endpoint}", json=body, timeout=10)
        resp.raise_for_status()
        logger.info("Correo '%s' enviado (status %s)", descripcion, resp.status_code)
    except requests.RequestException:
        logger.exception("Falló el envío del correo '%s'", descripcion)


def _send_mail_async(endpoint: str, body: dict, descripcion: str) -> None:
    _mail_executor.submit(_send_mail, endpoint, body, descripcion)


def _generate_valid_password() -> str:
    """Genera una contraseña válida con límite de intentos (evita loop infinito)."""
    for _ in range(MAX_PASSWORD_ATTEMPTS):
        password = password_generator()
        if password_check(password):
            return password
    raise RuntimeError("No se pudo generar una contraseña válida")


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _create_reset_token(cursor, user_id) -> str:
    """Invalida los tokens vigentes del usuario y crea uno nuevo (30 min).
    Debe llamarse dentro de una transacción."""
    cursor.execute(
        f"""
        UPDATE {T_TOKEN}
        SET fechaExpiracion = GETDATE()
        WHERE usuarioId = ? AND usado = 0 AND fechaExpiracion > GETDATE()
        """,
        (user_id,),
    )
    token, token_hash = gen_token()
    cursor.execute(
        f"""
        INSERT INTO {T_TOKEN} (usuarioId, tokenHash, fechaCreacion, fechaExpiracion)
        VALUES (?, ?, GETDATE(), DATEADD(MI, 30, GETDATE()))
        """,
        (user_id, token_hash),
    )
    if cursor.rowcount != 1:
        raise ServiceError({"Mensaje": "No se logró crear token"}, 400)
    return token


def _fetch_token(cursor, token_hash):
    """La comparación de expiración se hace en SQL (misma hora que la BD)."""
    cursor.execute(
        f"""
        SELECT usuarioId, usado, fechaUso,
               CASE WHEN fechaExpiracion <= GETDATE() THEN 1 ELSE 0 END AS expirado
        FROM {T_TOKEN}
        WHERE tokenHash = ?
        """,
        (token_hash,),
    )
    return cursor.fetchone()


def _token_error(row):
    """Devuelve (body, status) si el token no es utilizable, o None si es válido."""
    if row is None:
        return {"Mensaje": "Token no valido"}, 404
    if row.expirado:
        return {"Mensaje": "Token expirado"}, 406
    if row.usado or row.fechaUso is not None:
        return {"Mensaje": "Token usado"}, 406
    return None

def _validate_registro(data: dict) -> list[str]:
    errors = []
    for f in ("userNom", "userApPat", "userMail", "rut"):
        v = data.get(f)
        if not isinstance(v, str) or not v.strip():
            errors.append(f"Falta el campo '{f}'")
    for f in ("departamento", "rol"):
        if data.get(f) in (None, ""):
            errors.append(f"Falta el campo '{f}'")
    mail = data.get("userMail")
    if isinstance(mail, str) and mail.strip() and not EMAIL_RE.match(mail.strip()):
        errors.append("El correo no tiene un formato válido")
    return errors

def register_user(data):
    data = data or {}
    errors = _validate_registro(data)
    if errors:
        return {"Mensaje": "Datos inválidos", "errores": errors}, 400

    nombre = data["userNom"].strip()
    rut = data["rut"].strip().upper()
    correo = data["userMail"].strip().lower()
    ap_mat = data.get("userApMat")
    ap_mat = ap_mat.strip() or None if isinstance(ap_mat, str) else None

    try:
        password = _generate_valid_password()
        hashed_pw = _hash_password(password)
    except Exception:
        logger.exception("Error generando credenciales")
        return {"Mensaje": "Error con la creación del usuario"}, 500

    try:
        with db_cursor() as cursor:
            cursor.execute(
                f"""
                INSERT INTO {T_USUARIO}
                    ([userNom], [userRut], [userApPat], [userApMat], [userMail],
                     [userTelMovil], [userTelFijo], [departamentoId],
                     [password], [rolId], [changePassFlg], [ActiveFlg])
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
                """,
                (
                    nombre,
                    rut,
                    data["userApPat"].strip(),
                    ap_mat,
                    correo,
                    data.get("userTelMovil"),
                    data.get("userTelFijo"),
                    data["departamento"],
                    hashed_pw,
                    data["rol"],
                ),
            )
    except pyodbc.IntegrityError:
        logger.warning("Violación de integridad al crear usuario %s", correo)
        return {
            "Mensaje": "El usuario ya existe o los datos referenciados no son válidos"
        }, 409
    except Exception:
        logger.exception("Error al crear usuario %s", correo)
        return {"Mensaje": "Error con la creación del usuario"}, 500

    _send_mail_async(
        "registro",
        {"nombre_usuario": nombre, "correo": correo, "password": password},
        "registro",
    )

    return {"message": "Usuario creado", "responseMail": {"status": "en cola"}}, 200

def login_user(data):
    data = data or {}
    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
        return {"Error": "Credenciales inválidas"}, 400

    try:
        with db_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT userId, userMail, password, rolId, ActiveFlg, changePassFlg
                FROM {T_USUARIO}
                WHERE userMail = ?
                """,
                (email.strip(),),
            )
            user = cursor.fetchone()

        stored_hash = user.password if user else _DUMMY_HASH
        password_ok = bcrypt.checkpw(password.encode(), stored_hash.encode())

        if not user or not password_ok:
            return {"Error": "Credenciales inválidas"}, 401

        if not bool(user.ActiveFlg):
            return {"Error": "Usuario no vigente en sistema"}, 401

        with db_cursor() as cursor:
            if bool(user.changePassFlg):
                token = _create_reset_token(cursor, user.userId)
                return {
                    "Error": "usuario debe cambiar clave",
                    "tokenChangePass": token,
                }, 422

            cursor.execute(
                f"""
                SELECT b.nomPermiso
                FROM {T_ROL_PERMISO} a
                LEFT JOIN {T_PERMISOS} b ON a.permisoId = b.permisoId
                WHERE a.rolId = ?
                """,
                (user.rolId,),
            )
            permisos = [row[0] for row in cursor.fetchall() if row[0]]

        token = generate_token(
            {"userId": user.userId, "userMail": user.userMail, "permisos": permisos}
        )
        return {"token": token}, 200

    except ServiceError as e:
        return e.body, e.status
    except Exception:
        logger.exception("Error en login")
        return {"Error": "Error interno"}, 500

def perfil_user(user_id):
    try:
        with db_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT userId, userNom, userApPat, userApMat, userMail,
                       userTelMovil, userTelFijo, departamentoId, rolId, ActiveFlg,
                       fechaCreacion, fechaTerminoVig, changePassFlg
                FROM {T_USUARIO}
                WHERE userId = ?
                """,
                (user_id,),
            )
            row = cursor.fetchone()
            if not row:
                return {"Mensaje": "Usuario no encontrado"}, 404
            columns = [c[0] for c in cursor.description]
            return dict(zip(columns, row)), 200
    except Exception:
        logger.exception("Error obteniendo perfil del usuario %s", user_id)
        return {"Mensaje": "Error obteniendo perfil"}, 500

def buscar_usuario(data, permisos):
    if 'GESTIONAR_USUARIOS' not in permisos:
        return {'Mensaje':'Usuario sin privilegios'}, 401

    mail = data.get('mail')
    rut = data.get('rut')

def val_change_pass_service(token):
    try:
        with db_cursor() as cursor:
            row = _fetch_token(cursor, hash_token(token))

        error = _token_error(row)
        if error:
            return error

        return {"Mensaje": "Token Valido", "userId": row.usuarioId}, 200
    except Exception:
        logger.exception("Error validando token")
        return {"Mensaje": "Error validando token"}, 500


def cambiar_contraseña_service(token, data):
    password = (data or {}).get("password")

    if not isinstance(password, str) or not password:
        return {"Mensaje": "Contraseña obligatoria"}, 400
    if len(password.encode()) > BCRYPT_MAX_BYTES or not password_check(password):
        return {"Mensaje": "Contraseña no cumple con politicas de seguridad"}, 422

    token_hash = hash_token(token)
    hashed_pw = _hash_password(password)

    try:
        with db_cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE {T_TOKEN}
                SET usado = 1, fechaUso = GETDATE()
                WHERE tokenHash = ? AND usado = 0 AND fechaUso IS NULL
                  AND fechaExpiracion > GETDATE()
                """,
                (token_hash,),
            )
            if cursor.rowcount != 1:
                error = _token_error(_fetch_token(cursor, token_hash))
                raise ServiceError(*(error or ({"Mensaje": "No se pudo validar Token"}, 400)))

            cursor.execute(
                f"SELECT usuarioId FROM {T_TOKEN} WHERE tokenHash = ?", (token_hash,)
            )
            user_id = cursor.fetchone()[0]

            cursor.execute(
                f"UPDATE {T_USUARIO} SET [password] = ?, [changePassFlg] = 0 WHERE userId = ?",
                (hashed_pw, user_id),
            )
            if cursor.rowcount != 1:
                raise ServiceError({"Mensaje": "No se encontró usuario"}, 404)

            cursor.execute(
                f"""
                UPDATE {T_TOKEN}
                SET fechaExpiracion = GETDATE()
                WHERE usuarioId = ? AND usado = 0 AND fechaExpiracion > GETDATE()
                """,
                (user_id,),
            )

        return {"Mensaje": "Contraseña cambiada con exito"}, 200

    except ServiceError as e:
        return e.body, e.status
    except Exception:
        logger.exception("Error cambiando contraseña")
        return {"Mensaje": "Error cambiando contraseña"}, 500


def recuperar_contraseña_service(mail):
    respuesta_generica = {"Mensaje": "Solicitud procesada"}, 200

    if not isinstance(mail, str) or not EMAIL_RE.match(mail.strip()):
        return {"Mensaje": "Correo inválido"}, 400
    mail = mail.strip()

    try:
        with db_cursor() as cursor:
            cursor.execute(
                f"SELECT userId, userMail, activeFlg, userNom FROM {T_USUARIO} WHERE userMail = ?",
                (mail,),
            )
            user = cursor.fetchone()

            if not user or not bool(user.activeFlg):
                logger.info("Recuperación solicitada para usuario inexistente o inactivo")
                return respuesta_generica

            token = _create_reset_token(cursor, user.userId)

        _send_mail_async(
            "cambio-contraseña",
            {"nombre_usuario": user.userNom, "token": token, "correo": user.userMail},
            "cambio-contraseña",
        )
        return respuesta_generica

    except ServiceError as e:
        return e.body, e.status
    except Exception:
        logger.exception("Error solicitando cambio de contraseña")
        return {"Mensaje": "Error solicitando cambio de contraseña"}, 500