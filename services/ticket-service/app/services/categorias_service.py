from app.database.connection import get_connection
from app.utils.is_color import is_color

def ver_categorias_service():
    sql = 'SELECT * FROM [MesaDeAyuda].[dbo].[categoria]'

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql)
        columns = [col[0] for col in cursor.description]
        categorias = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
        return {
            'Mensaje':'Categorias obtenidas correctamente',
            'Categorias': categorias
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo datos',
            'Error':str(e)
        }, 400

def crear_categoria_service(data):
    sql = """
        INSERT INTO [MesaDeAyuda].[dbo].[categoria] 
        (categoria, color, activo, adminflg) 
        OUTPUT INSERTED.categoriaId
        VALUES (?,?,1,?)
        """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        categoria = data['categoria']
        color = data['color']
        adminflg = bool(data['adminflg'])

        if not is_color(color):
            return {
                'Mensaje':'Color ingresado no valido'
            }, 406

        cursor.execute(sql, (categoria, color, adminflg))

        row = cursor.fetchone()

        return {
            'Mensaje':'Categoría creada con exito',
            'CategoriaId':row[0]
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error creando categoría',
            'Error':str(e)
        }, 400
    finally:
        cursor.commit()
        cursor.close()
        conn.close()

def editar_categoria_service(id, data):
    sql = """
            UPDATE [MesaDeAyuda].[dbo].[categoria] SET 
                categoria = ?,
                color = ?,
                activo = ?,
                adminflg = ? 
            WHERE categoriaId = ?
            """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        categoria = data['categoria']
        color = data['color']
        activo = bool(data['activo'])
        adminflg = bool(data['adminflg'])

        if not is_color(color):
            return {
                'Mensaje':'Color ingresado no valido'
            }, 406

        cursor.execute(sql, (categoria, color, activo, adminflg, id))

        conn.commit()

        return {
            'Mensaje':'Cambio realizado'
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error modificando registro',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()

def ver_subcategorias_service(categoria_id):
    sql = 'SELECT * FROM [MesaDeAyuda].[dbo].[subCategoriaTicket] WHERE categoriaId = ?'

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql, categoria_id)
        columns = [col[0] for col in cursor.description]
        Subcategorias = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        return {
            'Mensaje':'Subcategorias obtenidas correctamente',
            'Subcategorias': Subcategorias
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error obteniendo datos',
            'Error':str(e)
        }, 400

def crear_subcategorias_service(data, categoria):
    sql =   """
            INSERT INTO [MesaDeAyuda].[dbo].[subCategoriaTicket] 
            (subCat, categoriaId, activo, adminflg) 
            OUTPUT INSERTED.subCatId
            VALUES (?,?,1,?)
            """

    try: 
        conn = get_connection()
        cursor = conn.cursor()

        subcategoria = data['subcategoria']
        adminflg = data['adminflg']

        cursor.execute(sql, (subcategoria, categoria, adminflg))
        row = cursor.fetchone()

        conn.commit()

        return {
            'Mensaje':'Subcategoria creada con exito',
            'Subcategoria':row[0]
        }, 200

    except Exception as e:
        return {
            'Mensaje':'Error creando subcategoria',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()

def editar_subcategorias_service(data, subcategoria):
    subCat = data['subCat']
    categoriaId = data['categoriaId']
    activo = data['activo']
    adminflg = data['adminflg']

    sql =   """
            UPDATE [MesaDeAyuda].[dbo].[subCategoriaTicket] 
            SET subCat = ?, categoriaId = ?, activo = ?, adminflg = ?
            WHERE subCatId = ?
            """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(sql, (subCat, categoriaId, activo, adminflg, subcategoria))

        conn.commit()

        return {
            'Mensaje':'Cambio realizado con exito'
        }, 200
    except Exception as e:
        return {
            'Mensaje':'Error modificando registro',
            'Error':str(e)
        }, 400
    finally:
        cursor.close()
        conn.close()