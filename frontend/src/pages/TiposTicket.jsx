import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/TiposTicket.css"

export default function TiposTicket() {
  const [tiposTicket, setTiposTicket] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarTiposTicket()
  }, [])

  // =========================================================
  // OBTENER TIPOS DE TICKET
  // =========================================================

  async function cargarTiposTicket() {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/ticket/tipoticket")

      setTiposTicket(response.data.TipoTicket || [])
    } catch (error) {
      console.error(error)

      setError(
        error.response?.data?.Mensaje ||
        "No fue posible obtener los tipos de ticket"
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // ABRIR MODAL CREAR
  // =========================================================

  function abrirCrear() {
    setModal({
      modo: "crear",
      tipoTicketId: null,
      tipoTicket: "",
      color: "#2563eb",
      adminflg: false,
      activo: true
    })
  }

  // =========================================================
  // ABRIR MODAL EDITAR
  // =========================================================

  function abrirEditar(tipo) {
    setModal({
      modo: "editar",
      tipoTicketId: tipo.tipoTicketId,
      tipoTicket: tipo.tipoTicket,
      color: tipo.color || "#2563eb",
      adminflg: Boolean(tipo.adminflg),
      activo: Boolean(tipo.activo)
    })
  }

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  function cerrarModal() {
    if (saving)
      return

    setModal(null)
  }

  // =========================================================
  // CAMBIAR CAMPOS
  // =========================================================

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked
    } = e.target

    setModal(prev => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }))
  }

  // =========================================================
  // CREAR TIPO DE TICKET
  // =========================================================

  async function crearTipoTicket() {
    if (!modal)
      return

    if (!modal.tipoTicket.trim()) {
      alert("El nombre del tipo de ticket es obligatorio")
      return
    }

    if (!modal.color) {
      alert("El color del tipo de ticket es obligatorio")
      return
    }

    try {
      setSaving(true)

      const data = {
        tipoTicket: modal.tipoTicket.trim(),
        color: modal.color,
        adminflg: modal.adminflg ? 1 : 0
      }

      const response = await api.post(
        "/ticket/tipoticket",
        data
      )

      const tipoTicketId =
        response.data?.TipoTicketId

      const nuevoTipo = {
        tipoTicketId,
        tipoTicket: data.tipoTicket,
        color: data.color,
        adminflg: data.adminflg === 1,
        activo: true
      }

      setTiposTicket(prev => [
        ...prev,
        nuevoTipo
      ])

      setModal(null)
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.Mensaje ||
        error.response?.data?.Error ||
        "No fue posible crear el tipo de ticket"
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // MODIFICAR TIPO DE TICKET
  // =========================================================

  async function guardarTipoTicket() {
    if (!modal)
      return

    if (!modal.tipoTicket.trim()) {
      alert("El nombre del tipo de ticket es obligatorio")
      return
    }

    if (!modal.color) {
      alert("El color del tipo de ticket es obligatorio")
      return
    }

    try {
      setSaving(true)

      const data = {
        tipoTicket: modal.tipoTicket.trim(),
        color: modal.color,
        activo: modal.activo ? 1 : 0,
        adminflg: modal.adminflg ? 1 : 0
      }

      await api.put(
        `/ticket/tipoticket/${modal.tipoTicketId}`,
        data
      )

      setTiposTicket(prev =>
        prev.map(tipo =>
          tipo.tipoTicketId === modal.tipoTicketId
            ? {
                ...tipo,
                tipoTicket: data.tipoTicket,
                color: data.color,
                activo: data.activo === 1,
                adminflg: data.adminflg === 1
              }
            : tipo
        )
      )

      setModal(null)
    } catch (error) {
      console.error(error)

      alert(
        error.response?.data?.Mensaje ||
        error.response?.data?.Error ||
        "No fue posible actualizar el tipo de ticket"
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="tipos-ticket-page">
        <div className="tipos-ticket-loading">
          <div className="loading-spinner"></div>

          <span>
            Cargando tipos de ticket...
          </span>
        </div>
      </div>
    )
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="tipos-ticket-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="tipos-ticket-header">

        <div>

          <h1>
            Tipos de ticket
          </h1>

        </div>

        <button
          className="action-button primary"
          onClick={abrirCrear}
        >
          + Nuevo tipo de ticket
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="tipos-ticket-error">
          {error}
        </div>
      )}

      {/* =====================================================
          TABLA
      ===================================================== */}

      <div className="tipos-ticket-card">

        <div className="tipos-ticket-table-wrapper">

          <table className="tipos-ticket-table">

            <thead>

              <tr>

                <th>
                  Tipo de ticket
                </th>

                <th>
                  Color
                </th>

                <th>
                  Administración
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {tiposTicket.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="empty-state"
                  >
                    No existen tipos de ticket configurados.
                  </td>

                </tr>

              ) : (

                tiposTicket.map(tipo => (

                  <tr
                    key={tipo.tipoTicketId}
                    className="tipo-ticket-row"
                  >

                    {/* TIPO DE TICKET */}

                    <td>

                      <div className="tipo-ticket-name">

                        <span
                          className="tipo-ticket-color-dot"
                          style={{
                            backgroundColor:
                              tipo.color
                          }}
                        />

                        <span>
                          {tipo.tipoTicket}
                        </span>

                      </div>

                    </td>

                    {/* COLOR */}

                    <td>

                      <div className="color-preview">

                        <span
                          className="color-box"
                          style={{
                            backgroundColor:
                              tipo.color
                          }}
                        />

                        <span>
                          {tipo.color}
                        </span>

                      </div>

                    </td>

                    {/* ADMIN */}

                    <td>

                      <span
                        className={
                          tipo.adminflg
                            ? "admin-badge yes"
                            : "admin-badge no"
                        }
                      >
                        {tipo.adminflg
                          ? "Sí"
                          : "No"}
                      </span>

                    </td>

                    {/* ESTADO */}

                    <td>

                      <span
                        className={
                          tipo.activo
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {tipo.activo
                          ? "Activo"
                          : "Inactivo"}
                      </span>

                    </td>

                    {/* ACCIONES */}

                    <td>

                      <div className="tipo-ticket-actions">

                        <button
                          className="action-button primary"
                          onClick={() =>
                            abrirEditar(tipo)
                          }
                        >
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

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modal && (

        <div
          className="modal-overlay"
          onMouseDown={cerrarModal}
        >

          <div
            className="tipo-ticket-modal"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {modal.modo === "crear"
                    ? "Nuevo tipo de ticket"
                    : "Editar tipo de ticket"}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={cerrarModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="modal-body">

              {/* NOMBRE */}

              <div className="modal-form-group">

                <label>
                  Nombre del tipo de ticket
                </label>

                <input
                  type="text"
                  name="tipoTicket"
                  value={
                    modal.tipoTicket
                  }
                  onChange={handleChange}
                  placeholder="Ej: Incidencia"
                  maxLength={100}
                />

              </div>

              {/* COLOR */}

              <div className="modal-form-group">

                <label>
                  Color
                </label>

                <div className="color-input-wrapper">

                  <input
                    type="color"
                    name="color"
                    value={
                      modal.color ||
                      "#2563eb"
                    }
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="color"
                    value={
                      modal.color
                    }
                    onChange={handleChange}
                    placeholder="#2563eb"
                  />

                </div>

              </div>

              {/* ADMIN */}

              <div className="modal-options">

                <label className="switch-option">

                  <input
                    type="checkbox"
                    name="adminflg"
                    checked={
                      modal.adminflg
                    }
                    onChange={handleChange}
                  />

                  <span className="switch"></span>

                  <span>

                    <strong>
                      Tipo administrativo
                    </strong>

                    <small>
                      Indica si el tipo de ticket
                      corresponde a administración.
                    </small>

                  </span>

                </label>

              </div>

              {/* ESTADO */}

              {modal.modo === "editar" && (

                <div className="modal-options">

                  <label className="switch-option">

                    <input
                      type="checkbox"
                      name="activo"
                      checked={
                        modal.activo
                      }
                      onChange={handleChange}
                    />

                    <span className="switch"></span>

                    <span>

                      <strong>
                        Tipo de ticket activo
                      </strong>

                    </span>

                  </label>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="modal-footer">

              <button
                className="modal-cancel"
                onClick={cerrarModal}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                className="modal-save"
                onClick={
                  modal.modo === "crear"
                    ? crearTipoTicket
                    : guardarTipoTicket
                }
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : modal.modo === "crear"
                    ? "Crear tipo de ticket"
                    : "Guardar cambios"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}