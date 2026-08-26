from app.database.connection import get_connection
from app.utils.is_color import is_color

def ver_empresas_service():
    sql = "SELECT * FROM [MesaDeAyuda].[dbo].[empresas]"

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        empresas = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
        return {
            'Mensaje':'Empresas obtenidas correctamente',
            'Empresas':empresas
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo datos',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()

def crear_empresas_service(data):    
    sql =   """
            INSERT INTO [MesaDeAyuda].[dbo].[empresas] 
            (nomEmpresa, color, activo)
            OUTPUT INSERTED.empresaId
            VALUES (?, ?, 1)
            """

    try:
        nomEmpresa = data['nomEmpresa']
        color = data['color']

        if not is_color(str(color)):
            return {
                'Mensaje':'Color ingresado no valido'
            }, 406

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql, (nomEmpresa, color))

        row = cursor.fetchone()

        conn.commit()

        return {
            'Mensaje':'Empresa creada con exito',
            'EmpresaId':row[0]
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error creando empresa',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()

def editar_empresa_service(data, empresaId):
    sql =   """
            UPDATE [MesaDeAyuda].[dbo].[empresas] 
            SET [nomEmpresa] = ?, [color] = ?, [activo] = ?
            WHERE [empresaId] = ?
            """

    try:
        conn = get_connection()
        cursor = conn.cursor()

        nomEmpresa = data['nomEmpresa']
        color = data['color']
        activo = data['activo']

        if not is_color(str(color)):
            return {
                'Mensaje':'Color ingresado no valido'
            }, 406

        cursor.execute(sql, (nomEmpresa, color, activo, empresaId))

        conn.commit()

        return {
            'Mensaje':'Registro actualizado con exito'
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error actualizando registro',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()