from app.database.connection import get_connection

def ver_departamentos_service():
    sql = 'SELECT * FROM [MesaDeAyuda].[dbo].[departamento]'

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        departamentos = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
        return {
            'Mensaje':'Departamentos obtenidad correctamente',
            'Departamentos':departamentos
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo datos',
            'Error':str(e)
        }
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def crear_departamento_service(data):
    sql = """INSERT INTO [MesaDeAyuda].[dbo].[departamento] 
            ([nombre], [tipoDepartamento])
            OUTPUT INSERTED.departamentoId
            VALUES (?,?)
            """

    nombre = data.get('nombre')
    tipo_departamento = data.get('tipoDepartamento')

    if not nombre or not tipo_departamento:
        return {
            'Mensaje':'Faltan datos obligatorios'
        }, 406
    
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql, (nombre, tipo_departamento))
        row = cursor.fetchone()

        conn.commit()

        return {
            'Mensaje':'Departamento creado con exito',
            'departamentoId':row[0]
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error creando departamento',
            'Error':str(e)
        }, 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def editar_departamento_service(departamento_id, data):
    sql = """UPDATE [MesaDeAyuda].[dbo].[departamento] SET 
            nombre = ?,
            tipoDepartamento = ?,
            activo = ?
            WHERE departamentoId = ?"""

    nombre = data.get('nombre')
    tipo_departamento = data.get('tipoDepartamento')
    activo = bool(data.get('activo'))

    if not nombre or not tipo_departamento or activo is None:
        return {
            'Mensaje':'Faltan datos obligatorios'
        }, 406

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql, (nombre, tipo_departamento, activo, departamento_id))

        conn.commit()
        
        return {
            'Mensaje':'Registro modificado con exito'
        }, 200

    except Exception as e:
        return {
            'Mensaje':'Error modificando registro',
            'Error':str(e)
        }, 200