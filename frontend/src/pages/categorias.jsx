import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Categorias.css"

export default function Categorias() {

    const [categorias, setCategorias] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [expanded, setExpanded] = useState({})

    const [subcategorias, setSubcategorias] = useState({})

    const [loadingSubcategorias, setLoadingSubcategorias] = useState({})

    const [editing, setEditing] = useState(null)

    const [editingSubcategoria, setEditingSubcategoria] = useState(null)

    const [newSubcategoria, setNewSubcategoria] = useState(null)

    const [newCategoria, setNewCategoria] = useState(false)

    const [saving, setSaving] = useState(false)


    useEffect(() => {
        cargarCategorias()
    }, [])

    async function cargarCategorias() {

        try {

            setLoading(true)
            setError("")

            const response = await api.get("/categoria")

            setCategorias(
                response.data.Categorias || []
            )

        } catch (error) {

            console.error(error)

            setError(
                error.response?.data?.Mensaje ||
                "No fue posible obtener las categorías"
            )

        } finally {

            setLoading(false)

        }

    }

    async function toggleCategoria(categoriaId) {

        const estaAbierta =
            expanded[categoriaId]

        setExpanded(prev => ({
            ...prev,
            [categoriaId]: !estaAbierta
        }))


        if (
            !estaAbierta &&
            subcategorias[categoriaId] === undefined
        ) {

            await cargarSubcategorias(categoriaId)

        }

    }

    async function cargarSubcategorias(categoriaId) {

        try {

            setLoadingSubcategorias(prev => ({
                ...prev,
                [categoriaId]: true
            }))


            const response =
                await api.get(
                    `/categoria/subcategoria/${categoriaId}`
                )


            setSubcategorias(prev => ({
                ...prev,

                [categoriaId]:
                    response.data.Subcategorias || []

            }))


        } catch (error) {

            console.error(error)

            alert(
                error.response?.data?.Mensaje ||
                "No fue posible obtener las subcategorías"
            )

        } finally {

            setLoadingSubcategorias(prev => ({
                ...prev,
                [categoriaId]: false
            }))

        }

    }

    function abrirEdicion(categoria) {

        setEditing({

            categoriaId:
                categoria.categoriaId,

            categoria:
                categoria.categoria,

            color:
                categoria.color,

            activo:
                categoria.activo,

            adminflg:
                categoria.adminflg

        })

    }


    function cerrarEdicion() {

        if (saving)
            return

        setEditing(null)

    }


    function handleEditChange(e) {

        const {
            name,
            value,
            type,
            checked
        } = e.target


        setEditing(prev => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }))

    }

    async function guardarCategoria() {

        if (!editing)
            return


        if (!editing.categoria.trim()) {

            alert(
                "El nombre de la categoría es obligatorio"
            )

            return

        }


        if (!editing.color) {

            alert(
                "El color de la categoría es obligatorio"
            )

            return

        }


        try {

            setSaving(true)


            const data = {

                categoria:
                    editing.categoria.trim(),

                color:
                    editing.color,

                activo:
                    editing.activo
                        ? 1
                        : 0,

                adminflg:
                    editing.adminflg
                        ? 1
                        : 0

            }


            await api.put(
                `/categoria/${editing.categoriaId}`,
                data
            )


            setCategorias(prev =>
                prev.map(categoria =>

                    categoria.categoriaId ===
                    editing.categoriaId

                        ? {

                            ...categoria,

                            categoria:
                                data.categoria,

                            color:
                                data.color,

                            activo:
                                data.activo === 1,

                            adminflg:
                                data.adminflg === 1

                        }

                        : categoria

                )
            )


            setEditing(null)


        } catch (error) {

            console.error(error)

            const mensaje =
                error.response?.data?.Mensaje ||
                error.response?.data?.Error?.join(", ") ||
                "No fue posible actualizar la categoría"


            alert(mensaje)

        } finally {

            setSaving(false)

        }

    }

    async function crearCategoria() {

        if (!newCategoria)
            return


        if (!newCategoria.categoria.trim()) {

            alert(
                "El nombre de la categoría es obligatorio"
            )

            return

        }


        if (!newCategoria.color) {

            alert(
                "El color de la categoría es obligatorio"
            )

            return

        }


        try {

            setSaving(true)


            const data = {

                categoria:
                    newCategoria.categoria.trim(),

                color:
                    newCategoria.color,

                adminflg:
                    newCategoria.adminflg
                        ? 1
                        : 0

            }


            const response =
                await api.post(
                    "/categoria",
                    data
                )


            const categoriaId =
                response.data?.CategoriaId

            setCategorias(prev => [

                ...prev,

                {

                    categoriaId,

                    categoria:
                        data.categoria,

                    color:
                        data.color,

                    activo:
                        true,

                    adminflg:
                        data.adminflg === 1

                }

            ])


            setNewCategoria(false)


        } catch (error) {

            console.error(error)

            alert(
                error.response?.data?.Mensaje ||
                "No fue posible crear la categoría"
            )

        } finally {

            setSaving(false)

        }

    }


    // =========================================================
    // ABRIR CREAR SUBCATEGORIA
    // =========================================================

    function abrirNuevaSubcategoria(categoriaId) {

        setNewSubcategoria({

            categoriaId,

            subcategoria: "",

            adminflg: false

        })

    }


    // =========================================================
    // CREAR SUBCATEGORIA
    // =========================================================

    async function crearSubcategoria() {

        if (!newSubcategoria)
            return


        if (!newSubcategoria.subcategoria.trim()) {

            alert(
                "El nombre de la subcategoría es obligatorio"
            )

            return

        }


        try {

            setSaving(true)


            const data = {

                subcategoria:
                    newSubcategoria.subcategoria.trim(),

                adminflg:
                    newSubcategoria.adminflg
                        ? 1
                        : 0

            }


            const response =
                await api.post(
                    `/categoria/subcategoria/${newSubcategoria.categoriaId}`,
                    data
                )


            const subCatId =
                response.data?.Subcategoria ||
                response.data?.subCatId ||
                response.data?.id


            const nueva = {

                subCatId,

                categoriaId:
                    newSubcategoria.categoriaId,

                subCat:
                    data.subcategoria,

                activo:
                    true,

                adminflg:
                    data.adminflg === 1

            }


            setSubcategorias(prev => ({

                ...prev,

                [newSubcategoria.categoriaId]: [

                    ...(prev[
                        newSubcategoria.categoriaId
                    ] || []),

                    nueva

                ]

            }))


            setNewSubcategoria(null)


        } catch (error) {

            console.error(error)

            alert(
                error.response?.data?.Mensaje ||
                "No fue posible crear la subcategoría"
            )

        } finally {

            setSaving(false)

        }

    }


    // =========================================================
    // ABRIR EDICION SUBCATEGORIA
    // =========================================================

    function abrirEdicionSubcategoria(subcategoria) {

        setEditingSubcategoria({

            subCatId:
                subcategoria.subCatId,

            subCat:
                subcategoria.subCat,

            categoriaId:
                subcategoria.categoriaId,

            categoriaIdOriginal:
                subcategoria.categoriaId,

            activo:
                subcategoria.activo,

            adminflg:
                subcategoria.adminflg

        })

    }


    // =========================================================
    // GUARDAR SUBCATEGORIA
    // =========================================================

    async function guardarSubcategoria() {

        if (!editingSubcategoria)
            return


        if (!editingSubcategoria.subCat.trim()) {

            alert(
                "El nombre de la subcategoría es obligatorio"
            )

            return

        }


        try {

            setSaving(true)


            const categoriaOriginal =
                Number(
                    editingSubcategoria.categoriaIdOriginal
                )


            const nuevaCategoria =
                Number(
                    editingSubcategoria.categoriaId
                )


            const data = {

                subCat:
                    editingSubcategoria.subCat.trim(),

                categoriaId:
                    nuevaCategoria,

                activo:
                    editingSubcategoria.activo
                        ? 1
                        : 0,

                adminflg:
                    editingSubcategoria.adminflg
                        ? 1
                        : 0

            }


            // =================================================
            // ACTUALIZAR EN BACKEND
            // =================================================

            await api.put(
                `/categoria/subcategoria/${editingSubcategoria.subCatId}`,
                data
            )


            // =================================================
            // INVALIDAR CACHE DE AMBAS CATEGORIAS
            // =================================================

            setSubcategorias(prev => {

                const nuevoEstado = {
                    ...prev
                }


                delete nuevoEstado[
                    categoriaOriginal
                ]

                delete nuevoEstado[
                    nuevaCategoria
                ]


                return nuevoEstado

            })


            // =================================================
            // RECARGAR CATEGORIA ORIGINAL
            // =================================================

            if (
                expanded[categoriaOriginal]
            ) {

                await cargarSubcategorias(
                    categoriaOriginal
                )

            }


            // =================================================
            // RECARGAR CATEGORIA DESTINO
            // =================================================

            if (
                nuevaCategoria !== categoriaOriginal &&
                expanded[nuevaCategoria]
            ) {

                await cargarSubcategorias(
                    nuevaCategoria
                )

            }


            setEditingSubcategoria(null)


        } catch (error) {

            console.error(error)

            alert(
                error.response?.data?.Mensaje ||
                "No fue posible actualizar la subcategoría"
            )

        } finally {

            setSaving(false)

        }

    }


    // =========================================================
    // LOADING PRINCIPAL
    // =========================================================

    if (loading) {

        return (

            <div className="categorias-page">

                <div className="categorias-loading">

                    <div className="loading-spinner"></div>

                    <span>
                        Cargando categorías...
                    </span>

                </div>

            </div>

        )

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="categorias-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="categorias-header">

                <div>

                    <h1>
                        Categorías
                    </h1>

                </div>


                <button
                    className="action-button primary"
                    onClick={() =>
                        setNewCategoria({

                            categoria: "",

                            color: "#2563eb",

                            adminflg: false

                        })
                    }
                >

                    + Nueva categoría

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="categorias-error">

                    {error}

                </div>

            )}


            {/* =================================================
                TABLA
            ================================================= */}

            <div className="categorias-card">

                <div className="categorias-table-wrapper">

                    <table className="categorias-table">

                        <thead>

                            <tr>

                                <th>
                                    Categoría
                                </th>

                                <th>
                                    Color
                                </th>

                                <th>
                                    Estado
                                </th>

                                <th>
                                    Administración
                                </th>

                                <th>
                                    Acciones
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {categorias.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="empty-state"
                                    >

                                        No existen categorías
                                        configuradas.

                                    </td>

                                </tr>

                            ) : (

                                categorias.map(categoria => {

                                    const abierta =
                                        expanded[
                                            categoria.categoriaId
                                        ]


                                    const subs =
                                        subcategorias[
                                            categoria.categoriaId
                                        ] || []


                                    return (

                                        <>

                                            {/* =================================
                                                CATEGORIA
                                            ================================= */}

                                            <tr
                                                key={
                                                    categoria.categoriaId
                                                }
                                                className={
                                                    abierta
                                                        ? "categoria-row expanded"
                                                        : "categoria-row"
                                                }
                                            >

                                                <td>

                                                    <button
                                                        className="categoria-expand-button"
                                                        onClick={() =>
                                                            toggleCategoria(
                                                                categoria.categoriaId
                                                            )
                                                        }
                                                    >

                                                        <span
                                                            className={
                                                                abierta
                                                                    ? "expand-icon open"
                                                                    : "expand-icon"
                                                            }
                                                        >
                                                            ›
                                                        </span>


                                                        <div className="categoria-name">

                                                            <span
                                                                className="categoria-color-dot"
                                                                style={{
                                                                    backgroundColor:
                                                                        categoria.color
                                                                }}
                                                            />

                                                            <span>
                                                                {
                                                                    categoria.categoria
                                                                }
                                                            </span>

                                                        </div>

                                                    </button>

                                                </td>


                                                <td>

                                                    <div className="color-preview">

                                                        <span
                                                            className="color-box"
                                                            style={{
                                                                backgroundColor:
                                                                    categoria.color
                                                            }}
                                                        />

                                                        <span>
                                                            {
                                                                categoria.color
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            categoria.activo
                                                                ? "status-badge active"
                                                                : "status-badge inactive"
                                                        }
                                                    >

                                                        {
                                                            categoria.activo
                                                                ? "Activa"
                                                                : "Inactiva"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            categoria.adminflg
                                                                ? "admin-badge yes"
                                                                : "admin-badge no"
                                                        }
                                                    >

                                                        {
                                                            categoria.adminflg
                                                                ? "Sí"
                                                                : "No"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="categoria-actions">

                                                        <button
                                                            className="action-button primary"
                                                            onClick={() =>
                                                                abrirEdicion(
                                                                    categoria
                                                                )
                                                            }
                                                        >

                                                            Editar

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>


                                            {/* =================================
                                                SUBCATEGORIAS
                                            ================================= */}

                                            {abierta && (

                                                <tr
                                                    key={`sub-${categoria.categoriaId}`}
                                                    className="subcategorias-row"
                                                >

                                                    <td
                                                        colSpan="5"
                                                    >

                                                        <div className="subcategorias-container">

                                                            <div className="subcategorias-header">

                                                                <div>

                                                                    <strong>
                                                                        Subcategorías
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            subs.length
                                                                        }
                                                                    </span>

                                                                </div>


                                                                <button
                                                                    className="action-button secondary"
                                                                    onClick={() =>
                                                                        abrirNuevaSubcategoria(
                                                                            categoria.categoriaId
                                                                        )
                                                                    }
                                                                >

                                                                    + Nueva subcategoría

                                                                </button>

                                                            </div>


                                                            {loadingSubcategorias[
                                                                categoria.categoriaId
                                                            ] ? (

                                                                <div className="subcategorias-loading">

                                                                    <div className="loading-spinner"></div>

                                                                    Cargando
                                                                    subcategorías...

                                                                </div>

                                                            ) : subs.length === 0 ? (

                                                                <div className="subcategorias-empty">

                                                                    Esta categoría
                                                                    todavía no tiene
                                                                    subcategorías.

                                                                </div>

                                                            ) : (

                                                                <div className="subcategorias-list">

                                                                    {subs.map(sub => (

                                                                        <div
                                                                            className="subcategoria-item"
                                                                            key={
                                                                                sub.subCatId
                                                                            }
                                                                        >

                                                                            <div className="subcategoria-info">

                                                                                <span className="subcategoria-bullet">
                                                                                    •
                                                                                </span>

                                                                                <span>
                                                                                    {
                                                                                        sub.subCat
                                                                                    }
                                                                                </span>

                                                                            </div>


                                                                            <div className="subcategoria-meta">

                                                                                <span
                                                                                    className={
                                                                                        sub.activo
                                                                                            ? "status-badge active"
                                                                                            : "status-badge inactive"
                                                                                    }
                                                                                >

                                                                                    {
                                                                                        sub.activo
                                                                                            ? "Activa"
                                                                                            : "Inactiva"
                                                                                    }

                                                                                </span>


                                                                                {sub.adminflg && (

                                                                                    <span className="admin-badge yes">

                                                                                        Admin

                                                                                    </span>

                                                                                )}


                                                                                <button
                                                                                    className="subcategoria-edit"
                                                                                    onClick={() =>
                                                                                        abrirEdicionSubcategoria(
                                                                                            sub
                                                                                        )
                                                                                    }
                                                                                >

                                                                                    Editar

                                                                                </button>

                                                                            </div>

                                                                        </div>

                                                                    ))}

                                                                </div>

                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            )}

                                        </>

                                    )

                                })

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                MODAL EDITAR CATEGORIA
            ================================================= */}

            {editing && (

                <div
                    className="modal-overlay"
                    onMouseDown={cerrarEdicion}
                >

                    <div
                        className="categoria-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Editar categoría
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={cerrarEdicion}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <div className="modal-body">

                            <div className="modal-form-group">

                                <label>
                                    Nombre de la categoría
                                </label>

                                <input
                                    type="text"
                                    name="categoria"
                                    value={
                                        editing.categoria
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                />

                            </div>


                            <div className="modal-form-group">

                                <label>
                                    Color
                                </label>

                                <div className="color-input-wrapper">

                                    <input
                                        type="color"
                                        name="color"
                                        value={
                                            editing.color ||
                                            "#2563eb"
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                    <input
                                        type="text"
                                        name="color"
                                        value={
                                            editing.color
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                </div>

                            </div>


                            <div className="modal-options">

                                <label className="switch-option">

                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={
                                            editing.activo
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                    <span className="switch"></span>

                                    <span>

                                        <strong>
                                            Activo
                                        </strong>

                                    </span>

                                </label>


                                <label className="switch-option">

                                    <input
                                        type="checkbox"
                                        name="adminflg"
                                        checked={
                                            editing.adminflg
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                    <span className="switch"></span>

                                    <span>

                                        <strong>
                                            Solo administración
                                        </strong>

                                    </span>

                                </label>

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                className="modal-cancel"
                                onClick={cerrarEdicion}
                                disabled={saving}
                            >
                                Cancelar
                            </button>


                            <button
                                className="modal-save"
                                onClick={
                                    guardarCategoria
                                }
                                disabled={saving}
                            >

                                {
                                    saving
                                        ? "Guardando..."
                                        : "Guardar cambios"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                MODAL NUEVA CATEGORIA
            ================================================= */}

            {newCategoria && (

                <div
                    className="modal-overlay"
                    onMouseDown={() =>
                        !saving &&
                        setNewCategoria(false)
                    }
                >

                    <div
                        className="categoria-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nueva categoría
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setNewCategoria(false)
                                }
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <div className="modal-body">

                            <div className="modal-form-group">

                                <label>
                                    Nombre de la categoría
                                </label>

                                <input
                                    type="text"
                                    value={
                                        newCategoria.categoria
                                    }
                                    onChange={e =>
                                        setNewCategoria(prev => ({
                                            ...prev,
                                            categoria:
                                                e.target.value
                                        }))
                                    }
                                />

                            </div>


                            <div className="modal-form-group">

                                <label>
                                    Color
                                </label>

                                <div className="color-input-wrapper">

                                    <input
                                        type="color"
                                        value={
                                            newCategoria.color
                                        }
                                        onChange={e =>
                                            setNewCategoria(prev => ({
                                                ...prev,
                                                color:
                                                    e.target.value
                                            }))
                                        }
                                    />

                                    <input
                                        type="text"
                                        value={
                                            newCategoria.color
                                        }
                                        onChange={e =>
                                            setNewCategoria(prev => ({
                                                ...prev,
                                                color:
                                                    e.target.value
                                            }))
                                        }
                                    />

                                </div>

                            </div>


                            <div className="modal-options">

                                <label className="switch-option">

                                    <input
                                        type="checkbox"
                                        checked={
                                            newCategoria.adminflg
                                        }
                                        onChange={e =>
                                            setNewCategoria(prev => ({
                                                ...prev,
                                                adminflg:
                                                    e.target.checked
                                            }))
                                        }
                                    />

                                    <span className="switch"></span>

                                    <span>

                                        <strong>
                                            Solo administración
                                        </strong>

                                    </span>

                                </label>

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                className="modal-cancel"
                                onClick={() =>
                                    setNewCategoria(false)
                                }
                                disabled={saving}
                            >
                                Cancelar
                            </button>


                            <button
                                className="modal-save"
                                onClick={
                                    crearCategoria
                                }
                                disabled={saving}
                            >

                                {
                                    saving
                                        ? "Creando..."
                                        : "Crear categoría"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                MODAL NUEVA SUBCATEGORIA
            ================================================= */}

            {newSubcategoria && (

                <div
                    className="modal-overlay"
                    onMouseDown={() =>
                        !saving &&
                        setNewSubcategoria(null)
                    }
                >

                    <div
                        className="categoria-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nueva subcategoría
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setNewSubcategoria(null)
                                }
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <div className="modal-body">

                            <div className="modal-form-group">

                                <label>
                                    Nombre de la subcategoría
                                </label>

                                <input
                                    type="text"
                                    value={
                                        newSubcategoria.subcategoria
                                    }
                                    onChange={e =>
                                        setNewSubcategoria(prev => ({
                                            ...prev,
                                            subcategoria:
                                                e.target.value
                                        }))
                                    }
                                />

                            </div>


                            <div className="modal-options">

                                <label className="switch-option">

                                    <input
                                        type="checkbox"
                                        checked={
                                            newSubcategoria.adminflg
                                        }
                                        onChange={e =>
                                            setNewSubcategoria(prev => ({
                                                ...prev,
                                                adminflg:
                                                    e.target.checked
                                            }))
                                        }
                                        maxLength="40"
                                    />

                                    <span className="switch"></span>

                                    <span>

                                        <strong>
                                            Solo administración
                                        </strong>

                                    </span>

                                </label>

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                className="modal-cancel"
                                onClick={() =>
                                    setNewSubcategoria(null)
                                }
                                disabled={saving}
                            >
                                Cancelar
                            </button>


                            <button
                                className="modal-save"
                                onClick={
                                    crearSubcategoria
                                }
                                disabled={saving}
                            >

                                {
                                    saving
                                        ? "Creando..."
                                        : "Crear subcategoría"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {editingSubcategoria && (

                <div
                    className="modal-overlay"
                    onMouseDown={() =>
                        !saving &&
                        setEditingSubcategoria(null)
                    }
                >

                    <div
                        className="categoria-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Editar subcategoría
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setEditingSubcategoria(null)
                                }
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <div className="modal-body">

                            <div className="modal-form-group">

                                <label>
                                    Nombre de la subcategoría
                                </label>

                                <input
                                type="text"
                                value={editingSubcategoria.subCat}
                                onChange={e =>
                                    setEditingSubcategoria(prev => ({
                                    ...prev,
                                    subCat: e.target.value.slice(0, 5)
                                    }))
                                }
                                maxLength={5}
                                />

                            </div>


                            {/* CATEGORIA */}

                            <div className="modal-form-group">

                                <label>
                                    Categoría
                                </label>

                                <select
                                    value={
                                        editingSubcategoria.categoriaId
                                    }
                                    onChange={e =>
                                        setEditingSubcategoria(prev => ({
                                            ...prev,
                                            categoriaId:
                                                Number(
                                                    e.target.value
                                                )
                                        }))
                                    }
                                >

                                    <option value="">
                                        Seleccionar categoría
                                    </option>


                                    {categorias.map(categoria => (

                                        <option
                                            key={
                                                categoria.categoriaId
                                            }
                                            value={
                                                categoria.categoriaId
                                            }
                                        >

                                            {
                                                categoria.categoria
                                            }

                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* OPCIONES */}

                            <div className="modal-options">

                                <label className="switch-option">

                                    <input
                                        type="checkbox"
                                        checked={
                                            editingSubcategoria.activo
                                        }
                                        onChange={e =>
                                            setEditingSubcategoria(prev => ({
                                                ...prev,
                                                activo:
                                                    e.target.checked
                                            }))
                                        }
                                    />

                                    <span className="switch"></span>

                                    <span>

                                        <strong>
                                            Activa
                                        </strong>

                                    </span>

                                </label>


                                <label className="switch-option">

                                    <input
                                        type="checkbox"
                                        checked={
                                            editingSubcategoria.adminflg
                                        }
                                        onChange={e =>
                                            setEditingSubcategoria(prev => ({
                                                ...prev,
                                                adminflg:
                                                    e.target.checked
                                            }))
                                        }
                                    />

                                    <span className="switch"></span>

                                    <span>

                                        <strong>
                                            Solo administración
                                        </strong>

                                    </span>

                                </label>

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                className="modal-cancel"
                                onClick={() =>
                                    setEditingSubcategoria(null)
                                }
                                disabled={saving}
                            >
                                Cancelar
                            </button>


                            <button
                                className="modal-save"
                                onClick={
                                    guardarSubcategoria
                                }
                                disabled={saving}
                            >

                                {
                                    saving
                                        ? "Guardando..."
                                        : "Guardar cambios"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}