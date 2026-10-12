import { Fragment, useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Admin.css"
import {
  BotonEditar,
  Campo,
  CampoColor,
  Cargando,
  COLOR_INICIAL,
  contar,
  EncabezadoPagina,
  esColorValido,
  Estado,
  Icono,
  Interruptor,
  ListaInterruptores,
  Marca,
  Modal,
  obtenerMensajeError,
  SiNo,
  Tarjeta,
  Vacio
} from "../components/AdminUI"

const MAX_CATEGORIA = 40
const MAX_SUBCATEGORIA = 40

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [expanded, setExpanded] = useState({})
  const [subcategorias, setSubcategorias] = useState({})
  const [loadingSubcategorias, setLoadingSubcategorias] = useState({})
  const [erroresSubcategorias, setErroresSubcategorias] = useState({})

  const [modalCategoria, setModalCategoria] = useState(null)
  const [modalSub, setModalSub] = useState(null)
  const [errorForm, setErrorForm] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarCategorias()
  }, [])

  async function cargarCategorias() {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/categoria")

      setCategorias(response.data.Categorias || [])
    } catch (error) {
      console.error(error)

      setError(
        obtenerMensajeError(
          error,
          "No fue posible obtener las categorías."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  async function toggleCategoria(categoriaId) {
    const estaAbierta = expanded[categoriaId]

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

      setErroresSubcategorias(prev => ({
        ...prev,
        [categoriaId]: ""
      }))

      const response = await api.get(
        `/categoria/subcategoria/${categoriaId}`
      )

      setSubcategorias(prev => ({
        ...prev,
        [categoriaId]: response.data.Subcategorias || []
      }))
    } catch (error) {
      console.error(error)

      setErroresSubcategorias(prev => ({
        ...prev,
        [categoriaId]: obtenerMensajeError(
          error,
          "No fue posible obtener las subcategorías."
        )
      }))
    } finally {
      setLoadingSubcategorias(prev => ({
        ...prev,
        [categoriaId]: false
      }))
    }
  }

  function abrirNuevaCategoria() {
    setErrorForm("")

    setModalCategoria({
      modo: "crear",
      categoriaId: null,
      categoria: "",
      color: COLOR_INICIAL,
      activo: true,
      adminflg: false
    })
  }

  function abrirEdicion(categoria) {
    setErrorForm("")

    setModalCategoria({
      modo: "editar",
      categoriaId: categoria.categoriaId,
      categoria: categoria.categoria,
      color: categoria.color || COLOR_INICIAL,
      activo: Boolean(categoria.activo),
      adminflg: Boolean(categoria.adminflg)
    })
  }

  function cerrarModalCategoria() {
    if (saving) return

    setModalCategoria(null)
    setErrorForm("")
  }

  function cambiarCategoria(campo, valor) {
    setModalCategoria(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  async function guardarCategoria() {
    if (!modalCategoria) return

    const nombre = modalCategoria.categoria.trim()

    if (!nombre) {
      setErrorForm("Ingresa el nombre de la categoría.")
      return
    }

    if (!esColorValido(modalCategoria.color)) {
      setErrorForm("Ingresa un color válido con el formato #RRGGBB.")
      return
    }

    try {
      setSaving(true)
      setErrorForm("")

      const adminflg = modalCategoria.adminflg ? 1 : 0

      if (modalCategoria.modo === "crear") {
        const response = await api.post("/categoria", {
          categoria: nombre,
          color: modalCategoria.color,
          adminflg
        })

        setCategorias(prev => [
          ...prev,
          {
            categoriaId: response.data?.CategoriaId,
            categoria: nombre,
            color: modalCategoria.color,
            activo: true,
            adminflg: adminflg === 1
          }
        ])
      } else {
        const activo = modalCategoria.activo ? 1 : 0

        await api.put(`/categoria/${modalCategoria.categoriaId}`, {
          categoria: nombre,
          color: modalCategoria.color,
          activo,
          adminflg
        })

        setCategorias(prev =>
          prev.map(categoria =>
            categoria.categoriaId === modalCategoria.categoriaId
              ? {
                  ...categoria,
                  categoria: nombre,
                  color: modalCategoria.color,
                  activo: activo === 1,
                  adminflg: adminflg === 1
                }
              : categoria
          )
        )
      }

      setModalCategoria(null)
    } catch (error) {
      console.error(error)

      setErrorForm(
        obtenerMensajeError(
          error,
          modalCategoria.modo === "crear"
            ? "No fue posible crear la categoría."
            : "No fue posible actualizar la categoría."
        )
      )
    } finally {
      setSaving(false)
    }
  }

  function abrirNuevaSubcategoria(categoriaId) {
    setErrorForm("")

    setModalSub({
      modo: "crear",
      categoriaId,
      subCat: "",
      adminflg: false
    })
  }

  function abrirEdicionSubcategoria(sub) {
    setErrorForm("")

    setModalSub({
      modo: "editar",
      subCatId: sub.subCatId,
      categoriaId: sub.categoriaId,
      categoriaIdOriginal: sub.categoriaId,
      subCat: sub.subCat,
      activo: Boolean(sub.activo),
      adminflg: Boolean(sub.adminflg)
    })
  }

  function cerrarModalSub() {
    if (saving) return

    setModalSub(null)
    setErrorForm("")
  }

  function cambiarSub(campo, valor) {
    setModalSub(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  async function guardarSubcategoria() {
    if (!modalSub) return

    const nombre = modalSub.subCat.trim()

    if (!nombre) {
      setErrorForm("Ingresa el nombre de la subcategoría.")
      return
    }

    if (modalSub.modo === "editar" && !modalSub.categoriaId) {
      setErrorForm("Selecciona la categoría de la subcategoría.")
      return
    }

    try {
      setSaving(true)
      setErrorForm("")

      const adminflg = modalSub.adminflg ? 1 : 0

      if (modalSub.modo === "crear") {
        const categoriaId = modalSub.categoriaId

        const response = await api.post(
          `/categoria/subcategoria/${categoriaId}`,
          {
            subcategoria: nombre,
            adminflg
          }
        )

        const subCatId =
          response.data?.Subcategoria ||
          response.data?.subCatId ||
          response.data?.id

        setSubcategorias(prev => ({
          ...prev,
          [categoriaId]: [
            ...(prev[categoriaId] || []),
            {
              subCatId,
              categoriaId,
              subCat: nombre,
              activo: true,
              adminflg: adminflg === 1
            }
          ]
        }))
      } else {
        const categoriaOriginal = Number(modalSub.categoriaIdOriginal)
        const nuevaCategoria = Number(modalSub.categoriaId)

        await api.put(
          `/categoria/subcategoria/${modalSub.subCatId}`,
          {
            subCat: nombre,
            categoriaId: nuevaCategoria,
            activo: modalSub.activo ? 1 : 0,
            adminflg
          }
        )

        setSubcategorias(prev => {
          const nuevoEstado = { ...prev }

          delete nuevoEstado[categoriaOriginal]
          delete nuevoEstado[nuevaCategoria]

          return nuevoEstado
        })

        if (expanded[categoriaOriginal]) {
          await cargarSubcategorias(categoriaOriginal)
        }

        if (
          nuevaCategoria !== categoriaOriginal &&
          expanded[nuevaCategoria]
        ) {
          await cargarSubcategorias(nuevaCategoria)
        }
      }

      setModalSub(null)
    } catch (error) {
      console.error(error)

      setErrorForm(
        obtenerMensajeError(
          error,
          modalSub.modo === "crear"
            ? "No fue posible crear la subcategoría."
            : "No fue posible actualizar la subcategoría."
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const categoriaEsNueva = modalCategoria?.modo === "crear"
  const subEsNueva = modalSub?.modo === "crear"

  return (
    <div className="adm-page">

      <EncabezadoPagina
        titulo="Categorías"
        descripcion="Administra las categorías y subcategorías disponibles en el sistema."
        accion="Nueva categoría"
        onAccion={abrirNuevaCategoria}
      />

      <Tarjeta
        titulo="Categorías registradas"
        resumen={
          loading || error
            ? null
            : contar(categorias.length, "categoría", "categorías")
        }
      >

        {loading ? (

          <Cargando texto="Cargando categorías..." />

        ) : error && categorias.length === 0 ? (

          <Vacio
            icono="alerta"
            titulo="No fue posible cargar las categorías"
            texto={error}
            accion="Reintentar"
            onAccion={cargarCategorias}
          />

        ) : categorias.length === 0 ? (

          <Vacio
            icono="lista"
            titulo="No hay categorías registradas"
            texto="Crea la primera categoría para comenzar a utilizar esta sección."
            accion="Crear categoría"
            onAccion={abrirNuevaCategoria}
          />

        ) : (

          <div className="adm-table-wrap">
            <table className="adm-table">

              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Color</th>
                  <th>Estado</th>
                  <th>Administración</th>
                  <th className="adm-col-action">Acción</th>
                </tr>
              </thead>

              <tbody>
                {categorias.map(categoria => {
                  const id = categoria.categoriaId
                  const abierta = Boolean(expanded[id])
                  const subs = subcategorias[id] || []
                  const cargandoSubs = Boolean(loadingSubcategorias[id])
                  const errorSubs = erroresSubcategorias[id]

                  return (
                    <Fragment key={id}>

                      <tr
                        className={
                          abierta
                            ? "adm-row is-open"
                            : "adm-row"
                        }
                      >
                        <td>
                          <button
                            type="button"
                            className="adm-expand"
                            onClick={() => toggleCategoria(id)}
                            aria-expanded={abierta}
                            title={
                              abierta
                                ? "Ocultar subcategorías"
                                : "Ver subcategorías"
                            }
                          >
                            <span
                              className={
                                abierta
                                  ? "adm-chevron is-open"
                                  : "adm-chevron"
                              }
                            >
                              <Icono nombre="chevron" size={18} />
                            </span>

                            <span className="adm-name">
                              <Marca color={categoria.color} />
                              <span>{categoria.categoria}</span>
                            </span>
                          </button>
                        </td>

                        <td>
                          <span className="adm-hex">
                            {categoria.color}
                          </span>
                        </td>

                        <td>
                          <Estado
                            activo={categoria.activo}
                            activoTexto="Activa"
                            inactivoTexto="Inactiva"
                          />
                        </td>

                        <td>
                          <SiNo valor={categoria.adminflg} />
                        </td>

                        <td className="adm-col-action">
                          <BotonEditar
                            titulo={`Editar ${categoria.categoria}`}
                            onClick={() => abrirEdicion(categoria)}
                          />
                        </td>
                      </tr>

                      {abierta && (
                        <tr>
                          <td colSpan={5} className="adm-sub-cell">
                            <div
                              className="adm-sub"
                              style={{ "--sub-color": categoria.color }}
                            >

                              <div className="adm-sub-header">
                                <h3>
                                  Subcategorías

                                  {!cargandoSubs && !errorSubs && (
                                    <span className="adm-count">
                                      {subs.length}
                                    </span>
                                  )}
                                </h3>

                                <button
                                  type="button"
                                  className="adm-btn adm-btn--secondary adm-btn--sm"
                                  onClick={() => abrirNuevaSubcategoria(id)}
                                  disabled={cargandoSubs || Boolean(errorSubs)}
                                >
                                  <Icono nombre="plus" size={14} />
                                  Nueva subcategoría
                                </button>
                              </div>

                              {cargandoSubs ? (

                                <Cargando
                                  compacto
                                  texto="Cargando subcategorías..."
                                />

                              ) : errorSubs ? (

                                <p className="adm-sub-error">
                                  {errorSubs}

                                  <button
                                    type="button"
                                    className="adm-btn adm-btn--secondary adm-btn--sm"
                                    onClick={() => cargarSubcategorias(id)}
                                  >
                                    Reintentar
                                  </button>
                                </p>

                              ) : subs.length === 0 ? (

                                <p className="adm-sub-empty">
                                  Esta categoría todavía no tiene subcategorías.
                                </p>

                              ) : (

                                <ul className="adm-sublist">
                                  {subs.map(sub => (
                                    <li key={sub.subCatId}>

                                      <span className="adm-sub-name">
                                        {sub.subCat}
                                      </span>

                                      <span className="adm-sub-meta">
                                        {sub.adminflg && (
                                          <span className="adm-tag">
                                            Solo administración
                                          </span>
                                        )}

                                        <Estado
                                          activo={sub.activo}
                                          activoTexto="Activa"
                                          inactivoTexto="Inactiva"
                                        />

                                        <BotonEditar
                                          pequeno
                                          titulo={`Editar ${sub.subCat}`}
                                          onClick={() =>
                                            abrirEdicionSubcategoria(sub)
                                          }
                                        />
                                      </span>

                                    </li>
                                  ))}
                                </ul>

                              )}

                            </div>
                          </td>
                        </tr>
                      )}

                    </Fragment>
                  )
                })}
              </tbody>

            </table>
          </div>

        )}

      </Tarjeta>

      {modalCategoria && (
        <Modal
          titulo={
            categoriaEsNueva
              ? "Nueva categoría"
              : "Editar categoría"
          }
          descripcion={
            categoriaEsNueva
              ? "Ingresa la información de la nueva categoría."
              : "Modifica la información de la categoría."
          }
          onCerrar={cerrarModalCategoria}
          onEnviar={guardarCategoria}
          guardando={saving}
          error={errorForm}
          textoEnviar={
            categoriaEsNueva
              ? "Crear categoría"
              : "Guardar cambios"
          }
        >

          <Campo
            etiqueta="Nombre de la categoría"
            id="categoria-nombre"
          >
            <input
              id="categoria-nombre"
              type="text"
              value={modalCategoria.categoria}
              onChange={e =>
                cambiarCategoria("categoria", e.target.value)
              }
              placeholder="Ej: Soporte técnico"
              maxLength={MAX_CATEGORIA}
              disabled={saving}
              autoFocus
            />
          </Campo>

          <Campo etiqueta="Color" id="categoria-color">
            <CampoColor
              id="categoria-color"
              valor={modalCategoria.color}
              onChange={valor => cambiarCategoria("color", valor)}
              deshabilitado={saving}
            />
          </Campo>

          <ListaInterruptores>
            {!categoriaEsNueva && (
              <Interruptor
                titulo="Categoría activa"
                descripcion="Define si la categoría estará disponible para ser utilizada."
                checked={modalCategoria.activo}
                onChange={valor => cambiarCategoria("activo", valor)}
                deshabilitado={saving}
              />
            )}

            <Interruptor
              titulo="Solo administración"
              descripcion="Restringe la categoría al área de administración."
              checked={modalCategoria.adminflg}
              onChange={valor => cambiarCategoria("adminflg", valor)}
              deshabilitado={saving}
            />
          </ListaInterruptores>

        </Modal>
      )}

      {modalSub && (
        <Modal
          titulo={
            subEsNueva
              ? "Nueva subcategoría"
              : "Editar subcategoría"
          }
          descripcion={
            subEsNueva
              ? "Ingresa la información de la nueva subcategoría."
              : "Modifica la información de la subcategoría."
          }
          onCerrar={cerrarModalSub}
          onEnviar={guardarSubcategoria}
          guardando={saving}
          error={errorForm}
          textoEnviar={
            subEsNueva
              ? "Crear subcategoría"
              : "Guardar cambios"
          }
        >

          <Campo
            etiqueta="Nombre de la subcategoría"
            id="subcategoria-nombre"
          >
            <input
              id="subcategoria-nombre"
              type="text"
              value={modalSub.subCat}
              onChange={e => cambiarSub("subCat", e.target.value)}
              maxLength={MAX_SUBCATEGORIA}
              disabled={saving}
              autoFocus
            />
          </Campo>

          {!subEsNueva && (
            <Campo etiqueta="Categoría" id="subcategoria-categoria">
              <select
                id="subcategoria-categoria"
                value={modalSub.categoriaId ?? ""}
                onChange={e =>
                  cambiarSub("categoriaId", Number(e.target.value))
                }
                disabled={saving}
              >
                <option value="">Seleccionar categoría</option>

                {categorias.map(categoria => (
                  <option
                    key={categoria.categoriaId}
                    value={categoria.categoriaId}
                  >
                    {categoria.categoria}
                  </option>
                ))}
              </select>
            </Campo>
          )}

          <ListaInterruptores>
            {!subEsNueva && (
              <Interruptor
                titulo="Subcategoría activa"
                descripcion="Define si la subcategoría estará disponible para ser utilizada."
                checked={modalSub.activo}
                onChange={valor => cambiarSub("activo", valor)}
                deshabilitado={saving}
              />
            )}

            <Interruptor
              titulo="Solo administración"
              descripcion="Restringe la subcategoría al área de administración."
              checked={modalSub.adminflg}
              onChange={valor => cambiarSub("adminflg", valor)}
              deshabilitado={saving}
            />
          </ListaInterruptores>

        </Modal>
      )}

    </div>
  )
}