import os
import requests
import datetime
import bcrypt
from app.database.connection import get_connection
from shared.app.auth.jwt_handler import generate_token
from app.utils.password_val import password_check
from app.utils.password_gen import password_generator
from app.utils.token_change_pass import *

MAIL_SERVICE = f"{os.getenv('NOTIFICATION_SERVICE')}/mail"

def register_user(data):
    conn = get_connection()
    cursor = conn.cursor()
    
    while True:
        password = password_generator()
        if password_check(password):
            break
    
    hashed_pw = bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()

    try:
        cursor.execute("""
            INSERT INTO     [MesaDeAyuda].[dbo].[usuario] 
                            ([userNom], [userApPat], [userApMat], 
                            [userMail], [userTelMovil], [userTelFijo], 
                            [departamentoId], [password], [rolId], [changePassFlg], [ActiveFlg]) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (data['userNom'], data['userApPat'], data['userApMat'], 
            data['userMail'], data["userTelMovil"], data["userTelFijo"], data['departamento'], 
            hashed_pw, data['rol'], 1, 1))

        conn.commit()

        url = f"{MAIL_SERVICE}/registro"
        body = {
            'nombre_usuario':data['userNom'],
            'correo':data['userMail'],
            'password':password
        }

        mail = requests.post(
            url,
            json=body,
            timeout=10
        )

        try:
            mail_response = mail.json()
        except ValueError:
            mail_response = None

        return {
            "message": "Usuario creado",
            "password":password,
            "responseMail":{
                "statusCode":mail.status_code,
                "response":mail_response
                }
            }, 200
    except Exception as e:
        conn.rollback()
        return {
            'Mensaje':'Error con la creación del usuario',
            "error": str(e)
            }, 400

def login_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    sql_login = """
                SELECT userId, userMail, password, rolId, ActiveFlg, changePassFlg 
                FROM usuario 
                WHERE userMail = ?
                """

    sql_permisos =  """
                    SELECT	a.id,
                            a.permisoId,
                            b.nomPermiso
                    FROM [MesaDeAyuda].[dbo].[rolPermiso] a
                    LEFT JOIN [MesaDeAyuda].[dbo].[permisos] b
                        ON (a.permisoId= b.permisoId)
                    WHERE rolId = ?
                    """

    save_token =    """
                    INSERT INTO [MesaDeAyuda].[dbo].[TokenChangePass] 
                    (usuarioId, tokenHash, fechaCreacion, fechaExpiracion)
                    VALUES (?, ?, GETDATE(), DATEADD(MI, 30, GETDATE()))
                    """

    cursor.execute(sql_login, data["email"])
    user_data = cursor.fetchone()

    if not user_data:
        return {"Error": "Usuario no existe"}, 404

    if not bcrypt.checkpw(data["password"].encode(), user_data[2].encode()):
        return {"Error": "Credenciales inválidas"}, 401

    if not bool(user_data[4]):
        return {'Error': 'Usuario no vigente en sistema'}, 401

    if bool(user_data[5]):
        token, token_hash = gen_token()
        cursor.execute(save_token, (user_data[0], token_hash))
        conn.commit()
        return {
            'Error': 'usuario debe cambiar clave',
            'tokenChangePass': token
                }, 422

    cursor.execute(sql_permisos, (user_data[3]))

    permisos = [res[2] for res in cursor.fetchall()]

    user = {
        "userId": user_data[0],
        "userMail": user_data[1],
        "permisos": permisos
    }

    token = generate_token(user)

    return {
        "token": token
        }, 200

def perfil_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
        SELECT
            userId,
            username,
            userNom,
            userApPat,
            userApMat,
            userMail,
            userTelMovil,
            userTelFijo,
            departamentoId,
            rolId,
            ActiveFlg,
            fechaCreacion,
            fechaTerminoVig,
            changePassFlg
        FROM usuario
        WHERE userId = ?
    """

    cursor.execute(sql, (user_id,))

    usuario = cursor.fetchone()

    if not usuario:
        return None

    columns = [column[0] for column in cursor.description]

    response = dict(zip(columns, usuario))

    return response, 200

def val_change_pass_service(token):
    val_token = """
            SELECT [tokenId]
                ,[usuarioId]
                ,[tokenHash]
                ,[fechaCreacion]
                ,[fechaExpiracion]
                ,[usado]
                ,[fechaUso]
                ,CAST(GETDATE() as datetime) as 'FechaActual'
            FROM [MesaDeAyuda].[dbo].[TokenChangePass]
            WHERE [tokenHash] = ?
            """

    hashed_token = hash_token(token)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(val_token, hashed_token)

        row = cursor.fetchone()

        cursor.close()
        conn.close()

        if row == None:
            return {
                'Mensaje':'Token no valido'
            }, 404
        if row[4] <= row[7]:
            return {
                'Mensaje':'Token expirado'
            }, 406
        if bool(row[5]) or row[6] is not None:
            return {
                'Mensaje':'Token usado'
            }, 406
        
        return {
            'Mensaje':'Token Valido',
            'userId':row[1],
            'hashed':hashed_token
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error validando token',
            'Error':str(e)
        }, 400

def cambiar_contraseña_service(token, data):
    password = data['password']
    if password == None:
        return {
            'Mensaje':'Contraseña obligatoria'
        }
    if not password_check(password):
        return {
            'Mensaje':'Contraseña no cumple con politicas de seguridad'
        }, 422

    cambiar_pass =  """
                    UPDATE [MesaDeAyuda].[dbo].[usuario] 
                    SET [password] = ?, [changePassFlg] = 0
                    WHERE userId = ?
                    """

    token_upd = """
                UPDATE [MesaDeAyuda].[dbo].[TokenChangePass] 
                SET usado = 1, fechaUso = getdate()
                WHERE tokenHash = ?
                """

    try:
        response, status = val_change_pass_service(token)
        if status != 200 or not response['userId']:
            return response, status

        user_id = response['userId']
        hashed_token = response['hashed']

        hashed_pw = bcrypt.hashpw(
                password.encode(),
                bcrypt.gensalt()
            ).decode()

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(cambiar_pass, (hashed_pw, user_id))

        if cursor.rowcount != 1:
            conn.rollback()
            return {
                'Mensaje':'No se encontró usuario'
            }, 404

        cursor.execute(token_upd, (hashed_token,))

        if cursor.rowcount != 1:
            conn.rollback()
            return {
                'Mensaje':'No se pudo validar Token'
            }, 400

        conn.commit()

        return {
            'Mensaje':'Contraseña cambiada con exito'
        }, 200
    except Exception as e:
        conn.rollback()
        return {
            'Mensaje':'Error cambiando contraseña',
            'Error':str(e)
        }, 400

def recuperar_contraseña_service(mail):
    select_user =   """
                    SELECT	[userId],
                            [userMail],
                            [activeFlg],
                            [userNom]
                    FROM [MesaDeAyuda].[dbo].[usuario]
                    WHERE userMail = ?
                    """ 

    upd_user =  """
                UPDATE [MesaDeAyuda].[dbo].[usuario] 
                SET changePassFlg = 1
                WHERE userId = ?
                """

    save_token =    """
                    INSERT INTO [MesaDeAyuda].[dbo].[TokenChangePass] 
                    (usuarioId, tokenHash, fechaCreacion, fechaExpiracion)
                    VALUES (?, ?, GETDATE(), DATEADD(MI, 30, GETDATE()))
                    """

    url = f'{MAIL_SERVICE}/cambio-contraseña'

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(select_user, (mail,))
        user = cursor.fetchone()

        if user == None:
            return {
                'Mensaje':'Usuario no encontrado'
            }, 404
        if not bool(user[2]):
            return {
                'Mensaje':'Usuario no vigente en sistema'
            }, 401
        
        token, token_hash = gen_token()

        cursor.execute(upd_user, (user[0],))

        if cursor.rowcount != 1:
            conn.rollback()
            return {
                'Mensaje':'No se encontró usuario'
            }, 404

        cursor.execute(save_token, (user[0], token_hash))

        if cursor.rowcount != 1:
            conn.rollback()
            return {
                'Mensaje':'no se logró crear token'
            }, 400

        conn.commit()

        body = {
            'nombre_usuario':user[3],
            'token':token,
            'correo':user[1]
        }

        mail = requests.post(
            url, 
            json=body,
            timeout=10
        )

        try:
            mail_response = mail.json()
        except ValueError:
            mail_response = None

        return {
            'Mensaje':'Solicitud procesada',
            'responseMail':{
                'statusCode':mail.status_code,
                'responseMail':mail_response
            }
        }, 200

    except Exception as e:
        return {
            'Mensaje':'Error solicitando cambio de contraseña',
            'Error':str(e)
        }, 400



    