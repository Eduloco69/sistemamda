from app.database.connection import get_connection
import bcrypt
from shared.app.auth.jwt_handler import generate_token
from app.utils.password_val import password_check

def register_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    if not password_check(data["password"]):
        return {"mensaje":"Contraseña no cumple con las politicas de seguridad"}, 406
    
    hashed_pw = bcrypt.hashpw(
        data["password"].encode(),
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

        return {"message": "Usuario creado"}
    
    except Exception as e:
        return {"error": str(e)}, 400

def login_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    sql_login = "SELECT userId, userMail, password, rolId FROM usuario WHERE userMail = ?"

    sql_permisos = """
                    SELECT	a.id,
                            a.permisoId,
                            b.nomPermiso
                    FROM [MesaDeAyuda].[dbo].[rolPermiso] a
                    LEFT JOIN [MesaDeAyuda].[dbo].[permisos] b
                        ON (a.permisoId= b.permisoId)
                    WHERE rolId = ?
                    """

    cursor.execute(sql_login, data["email"])
    user_data = cursor.fetchone()

    if not user_data:
        return {"error": "Usuario no existe"}, 404

    if not bcrypt.checkpw(data["password"].encode(), user_data[2].encode()):
        return {"error": "Credenciales inválidas"}, 401

    cursor.execute(sql_permisos, (user_data[3]))

    permisos = [res[2] for res in cursor.fetchall()]

    user = {
        "userId": user_data[0],
        "userMail": user_data[1],
        "permisos": permisos
    }

    token = generate_token(user)

    return {"token": token}

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

    return dict(zip(columns, usuario))