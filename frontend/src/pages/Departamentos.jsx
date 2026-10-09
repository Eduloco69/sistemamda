import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Departamentos.css"

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null)

  const [nombre, setNombre] = useState("")
  const [tipoDepartamento, setTipoDepartamento] = useState("")
  const [activo, setActivo] = useState(true)

  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarDepartamentos()
  }, [])

  async function cargarDepartamentos() {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/departamento")

      setDepartamentos(response.data.Departamentos || [])
    } catch (error) {
      console.error("Error obteniendo departamentos:", error)

      setError(
        error.response?.data?.Error ||
        error.response?.data?.Mensaje ||
        "No fue posible obtener los departamentos."
      )
    } finally {
      setLoading(false)
    }
  }

  function abrirCrear() {
    setModoEdicion(false)
    setDepartamentoSeleccionado(null)

    setNombre("")
    setTipoDepartamento("")
    setActivo(true)

    setError("")
    setModalOpen(true)
  }

  function abrirEditar(departamento) {
    setModoEdicion(true)
    setDepartamentoSeleccionado(departamento)

    setNombre(departamento.nombre || "")
    setTipoDepartamento(departamento.tipoDepartamento || "")
    setActivo(departamento.activo)

    setError("")
    setModalOpen(true)
  }

  function cerrarModal() {
    if (guardando) return

    setModalOpen(false)
    setDepartamentoSeleccionado(null)
    setError("")
  }

  async function guardarDepartamento(e) {
    e.preventDefault()

    if (!nombre.trim()) {
      setError("Debes ingresar el nombre del departamento.")
      return
    }

    if (!tipoDepartamento.trim()) {
      setError("Debes ingresar el tipo de departamento.")
      return
    }

    try {
      setGuardando(true)
      setError("")

      if (modoEdicion) {
        const response = await api.put(
          `/departamento/${departamentoSeleccionado.departamentoId}`,
          {
            nombre: nombre.trim(),
            tipoDepartamento: tipoDepartamento.trim(),
            activo: activo ? true : false
          }
        )

        console.log(response.data.Mensaje)

      } else {
        const response = await api.post("/departamento", {
          nombre: nombre.trim(),
          tipoDepartamento: tipoDepartamento.trim()
        })

        console.log(response.data.Mensaje)
      }

      await cargarDepartamentos()

      setModalOpen(false)
      setDepartamentoSeleccionado(null)

    } catch (error) {
      console.error("Error guardando departamento:", error)

      const apiError = error.response?.data?.Error

      if (Array.isArray(apiError)) {
        setError(apiError.join(", "))
      } else {
        setError(
          apiError ||
          error.response?.data?.Mensaje ||
          "No fue posible guardar el departamento."
        )
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="departamentos-page">

      <div className="departamentos-header">

        <div>
          <h1>Departamentos</h1>
          <p>
            Administra los departamentos disponibles en el sistema.
          </p>
        </div>

        <button
          className="departamentos-primary-button"
          onClick={abrirCrear}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Nuevo departamento
        </button>

      </div>

      <div className="departamentos-card">

        <div className="departamentos-card-header">
          <div>
            <h2>Departamentos registrados</h2>
            <span>
              {departamentos.length} departamento
              {departamentos.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {loading ? (

          <div className="departamentos-loading">
            <div className="departamentos-spinner"></div>
            <span>Cargando departamentos...</span>
          </div>

        ) : error && departamentos.length === 0 ? (

          <div className="departamentos-empty">
            <div className="departamentos-empty-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <h3>No fue posible cargar los departamentos</h3>

            <p>{error}</p>

            <button
              className="departamentos-secondary-button"
              onClick={cargarDepartamentos}
            >
              Reintentar
            </button>
          </div>

        ) : departamentos.length === 0 ? (

          <div className="departamentos-empty">

            <div className="departamentos-empty-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </div>

            <h3>No hay departamentos registrados</h3>

            <p>
              Crea el primer departamento para comenzar a utilizar esta sección.
            </p>

            <button
              className="departamentos-secondary-button"
              onClick={abrirCrear}
            >
              Crear departamento
            </button>

          </div>

        ) : (

          <div className="departamentos-table-wrapper">

            <table className="departamentos-table">

              <thead>
                <tr>
                  <th>Departamento</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th className="departamentos-action-column">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>

                {departamentos.map((departamento) => (

                  <tr
                    key={departamento.departamentoId}
                    className="departamento-row"
                  >

                    <td>
                      <div className="departamento-name">

                        <div className="departamento-icon">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect
                              x="4"
                              y="3"
                              width="16"
                              height="18"
                              rx="1.5"
                            />
                            <path d="M8 7h8" />
                            <path d="M8 11h8" />
                            <path d="M8 15h4" />
                          </svg>
                        </div>

                        <span>
                          {departamento.nombre}
                        </span>

                      </div>
                    </td>

                    <td>
                      <span className="departamento-type">
                        {departamento.tipoDepartamento || "Sin tipo"}
                      </span>
                    </td>

                    <td>

                      <span
                        className={
                          departamento.activo
                            ? "status-badge status-active"
                            : "status-badge status-inactive"
                        }
                      >
                        <span className="status-dot"></span>

                        {departamento.activo
                          ? "Activo"
                          : "Inactivo"}
                      </span>

                    </td>

                    <td className="departamentos-action-column">

                      <button
                        className="action-button"
                        onClick={() => abrirEditar(departamento)}
                        title="Editar departamento"
                        >
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                        </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {modalOpen && (

        <div
          className="departamentos-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModal()
            }
          }}
        >

          <div className="departamentos-modal">

            <div className="departamentos-modal-header">

              <div>
                <h2>
                  {modoEdicion
                    ? "Editar departamento"
                    : "Nuevo departamento"}
                </h2>

                <p>
                  {modoEdicion
                    ? "Modifica la información del departamento."
                    : "Ingresa la información del nuevo departamento."}
                </p>
              </div>

              <button
                className="departamentos-modal-close"
                onClick={cerrarModal}
                disabled={guardando}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

            </div>

            <form onSubmit={guardarDepartamento}>

              <div className="departamentos-modal-body">

                {error && (

                  <div className="departamentos-form-error">

                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </svg>

                    <span>{error}</span>

                  </div>

                )}

                <div className="departamentos-form-group">

                  <label htmlFor="nombre">
                    Nombre del departamento
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Contabilidad"
                    disabled={guardando}
                  />

                </div>

                <div className="departamentos-form-group">

                  <label htmlFor="tipoDepartamento">
                    Tipo de departamento
                  </label>

                  <input
                    id="tipoDepartamento"
                    type="text"
                    value={tipoDepartamento}
                    onChange={(e) =>
                      setTipoDepartamento(e.target.value)
                    }
                    placeholder="Ej: Administrativo"
                    disabled={guardando}
                  />

                </div>

                {modoEdicion && (

                  <div className="departamentos-active-field">

                    <div>
                      <strong>Estado del departamento</strong>

                      <span>
                        Define si el departamento estará disponible
                        para ser utilizado.
                      </span>
                    </div>

                    <label className="departamentos-switch">

                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={(e) =>
                          setActivo(e.target.checked)
                        }
                        disabled={guardando}
                      />

                      <span className="departamentos-switch-slider"></span>

                    </label>

                  </div>

                )}

              </div>

              <div className="departamentos-modal-footer">

                <button
                  type="button"
                  className="departamentos-cancel-button"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="departamentos-save-button"
                  disabled={guardando}
                >

                  {guardando ? (
                    <>
                      <span className="departamentos-button-spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      {modoEdicion
                        ? "Guardar cambios"
                        : "Crear departamento"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}