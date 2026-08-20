import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "../services/api"
import "../styles/Categorias.css"

export default function Categorias() {

  const navigate = useNavigate()

  const [categorias, setCategorias] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [editing, setEditing] = useState(null)

  const [saving, setSaving] = useState(false)


  useEffect(() => {

    cargarCategorias()

  }, [])


  async function cargarCategorias() {

    try {

      setLoading(true)
      setError("")

      const response =
        await api.get("/ticket/categoria")

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

        `/ticket/categoria/${editing.categoriaId}`,

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


  function irASubcategorias(categoria) {

    navigate(
      `/configuracion/categorias/${categoria.categoriaId}/subcategorias`
    )

  }


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


  return (

    <div className="categorias-page">

      <div className="categorias-header">

        <div>

          <h1>
            Categorías
          </h1>

        </div>

      </div>


      {error && (

        <div className="categorias-error">

          {error}

        </div>

      )}


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

                categorias.map(categoria => (

                  <tr
                    key={
                      categoria.categoriaId
                    }
                  >

                    <td>

                      <div className="categoria-name">

                        <span
                          className="categoria-color-dot"
                          style={{
                            backgroundColor:
                              categoria.color
                          }}
                        />

                        <span>
                          {categoria.categoria}
                        </span>

                      </div>

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
                          {categoria.color}
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

                        {categoria.activo
                          ? "Activa"
                          : "Inactiva"}

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

                        {categoria.adminflg
                          ? "Sí"
                          : "No"}

                      </span>

                    </td>


                    <td>

                      <div className="categoria-actions">

                        <button
                          className="action-button secondary"
                          onClick={() =>
                            irASubcategorias(
                              categoria
                            )
                          }
                        >

                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >

                            <path d="M3 7h5l2 2h11v10H3z" />

                            <path d="M3 7V5h6l2 2" />

                          </svg>

                          Subcategorías

                        </button>


                        <button
                          className="action-button primary"
                          onClick={() =>
                            abrirEdicion(
                              categoria
                            )
                          }
                        >

                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >

                            <path
                              d="M12 20h9"
                            />

                            <path
                              d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                            />

                          </svg>

                          Editar

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


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

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                  />

                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                  />

                </svg>

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
                onClick={guardarCategoria}
                disabled={saving}
              >

                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )
}