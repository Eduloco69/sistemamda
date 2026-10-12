import { useEffect, useState } from "react"
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
  Interruptor,
  ListaInterruptores,
  Marca,
  Modal,
  obtenerMensajeError,
  SiNo,
  Tarjeta,
  Vacio
} from "../components/AdminUI"

export default function TiposTicket() {
  const [tiposTicket, setTiposTicket] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [modal, setModal] = useState(null)
  const [errorForm, setErrorForm] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarTiposTicket()
  }, [])

  async function cargarTiposTicket() {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/ticket/tipoticket")

      setTiposTicket(response.data.TipoTicket || [])
    } catch (error) {
      console.error(error)

      setError(
        obtenerMensajeError(
          error,
          "No fue posible obtener los tipos de ticket."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  function abrirCrear() {
    setErrorForm("")

    setModal({
      modo: "crear",
      tipoTicketId: null,
      tipoTicket: "",
      color: COLOR_INICIAL,
      adminflg: false,
      activo: true
    })
  }

  function abrirEditar(tipo) {
    setErrorForm("")

    setModal({
      modo: "editar",
      tipoTicketId: tipo.tipoTicketId,
      tipoTicket: tipo.tipoTicket,
      color: tipo.color || COLOR_INICIAL,
      adminflg: Boolean(tipo.adminflg),
      activo: Boolean(tipo.activo)
    })
  }

  function cerrarModal() {
    if (saving) return

    setModal(null)
    setErrorForm("")
  }

  function cambiar(campo, valor) {
    setModal(prev => ({
      ...prev,
      [campo]: valor
    }))
  }


  // =========================================================
  // CREAR / MODIFICAR TIPO DE TICKET
  // =========================================================

  async function guardarTipoTicket() {
    if (!modal) return

    const tipoTicket = modal.tipoTicket.trim()

    if (!tipoTicket) {
      setErrorForm("Ingresa el nombre del tipo de ticket.")
      return
    }

    if (!esColorValido(modal.color)) {
      setErrorForm("Ingresa un color válido con el formato #RRGGBB.")
      return
    }

    try {
      setSaving(true)
      setErrorForm("")

      const adminflg = modal.adminflg ? 1 : 0

      if (modal.modo === "crear") {
        const response = await api.post("/ticket/tipoticket", {
          tipoTicket,
          color: modal.color,
          adminflg
        })

        setTiposTicket(prev => [
          ...prev,
          {
            tipoTicketId: response.data?.TipoTicketId,
            tipoTicket,
            color: modal.color,
            adminflg: adminflg === 1,
            activo: true
          }
        ])
      } else {
        const activo = modal.activo ? 1 : 0

        await api.put(`/ticket/tipoticket/${modal.tipoTicketId}`, {
          tipoTicket,
          color: modal.color,
          activo,
          adminflg
        })

        setTiposTicket(prev =>
          prev.map(tipo =>
            tipo.tipoTicketId === modal.tipoTicketId
              ? {
                  ...tipo,
                  tipoTicket,
                  color: modal.color,
                  activo: activo === 1,
                  adminflg: adminflg === 1
                }
              : tipo
          )
        )
      }

      setModal(null)
    } catch (error) {
      console.error(error)

      setErrorForm(
        obtenerMensajeError(
          error,
          modal.modo === "crear"
            ? "No fue posible crear el tipo de ticket."
            : "No fue posible actualizar el tipo de ticket."
        )
      )
    } finally {
      setSaving(false)
    }
  }


  // =========================================================
  // RENDER
  // =========================================================

  const esCrear = modal?.modo === "crear"

  return (
    <div className="adm-page">

      <EncabezadoPagina
        titulo="Tipos de ticket"
        descripcion="Administra los tipos de ticket disponibles en el sistema."
        accion="Nuevo tipo de ticket"
        onAccion={abrirCrear}
      />

      <Tarjeta
        titulo="Tipos de ticket registrados"
        resumen={
          loading || error
            ? null
            : contar(
                tiposTicket.length,
                "tipo de ticket",
                "tipos de ticket"
              )
        }
      >

        {loading ? (

          <Cargando texto="Cargando tipos de ticket..." />

        ) : error && tiposTicket.length === 0 ? (

          <Vacio
            icono="alerta"
            titulo="No fue posible cargar los tipos de ticket"
            texto={error}
            accion="Reintentar"
            onAccion={cargarTiposTicket}
          />

        ) : tiposTicket.length === 0 ? (

          <Vacio
            icono="lista"
            titulo="No hay tipos de ticket registrados"
            texto="Crea el primer tipo de ticket para comenzar a utilizar esta sección."
            accion="Crear tipo de ticket"
            onAccion={abrirCrear}
          />

        ) : (

          <div className="adm-table-wrap">
            <table className="adm-table">

              <thead>
                <tr>
                  <th>Tipo de ticket</th>
                  <th>Color</th>
                  <th>Administración</th>
                  <th>Estado</th>
                  <th className="adm-col-action">Acción</th>
                </tr>
              </thead>

              <tbody>
                {tiposTicket.map(tipo => (
                  <tr
                    key={tipo.tipoTicketId}
                    className="adm-row"
                  >
                    <td>
                      <div className="adm-name">
                        <Marca color={tipo.color} />
                        <span>{tipo.tipoTicket}</span>
                      </div>
                    </td>

                    <td>
                      <span className="adm-hex">{tipo.color}</span>
                    </td>

                    <td>
                      <SiNo valor={tipo.adminflg} />
                    </td>

                    <td>
                      <Estado activo={tipo.activo} />
                    </td>

                    <td className="adm-col-action">
                      <BotonEditar
                        titulo={`Editar ${tipo.tipoTicket}`}
                        onClick={() => abrirEditar(tipo)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        )}

      </Tarjeta>

      {modal && (
        <Modal
          titulo={
            esCrear
              ? "Nuevo tipo de ticket"
              : "Editar tipo de ticket"
          }
          descripcion={
            esCrear
              ? "Ingresa la información del nuevo tipo de ticket."
              : "Modifica la información del tipo de ticket."
          }
          onCerrar={cerrarModal}
          onEnviar={guardarTipoTicket}
          guardando={saving}
          error={errorForm}
          textoEnviar={
            esCrear
              ? "Crear tipo de ticket"
              : "Guardar cambios"
          }
        >

          <Campo
            etiqueta="Nombre del tipo de ticket"
            id="tipo-ticket-nombre"
          >
            <input
              id="tipo-ticket-nombre"
              type="text"
              value={modal.tipoTicket}
              onChange={e => cambiar("tipoTicket", e.target.value)}
              placeholder="Ej: Incidencia"
              maxLength={40}
              disabled={saving}
              autoFocus
            />
          </Campo>

          <Campo etiqueta="Color" id="tipo-ticket-color">
            <CampoColor
              id="tipo-ticket-color"
              valor={modal.color}
              onChange={valor => cambiar("color", valor)}
              deshabilitado={saving}
            />
          </Campo>

          <ListaInterruptores>
            <Interruptor
              titulo="Tipo administrativo"
              descripcion="Indica si el tipo de ticket corresponde a administración."
              checked={modal.adminflg}
              onChange={valor => cambiar("adminflg", valor)}
              deshabilitado={saving}
            />

            {!esCrear && (
              <Interruptor
                titulo="Tipo de ticket activo"
                descripcion="Define si el tipo de ticket estará disponible para ser utilizado."
                checked={modal.activo}
                onChange={valor => cambiar("activo", valor)}
                deshabilitado={saving}
              />
            )}
          </ListaInterruptores>

        </Modal>
      )}

    </div>
  )
}
