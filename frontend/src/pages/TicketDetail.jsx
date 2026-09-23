import {
  useEffect,
  useRef,
  useState
} from "react"

import { useParams } from "react-router-dom"

import api from "../services/api"
import socket from "../services/socket"
import useAuth from "../hooks/useAuth"
import "../styles/TicketDetail.css"


function IconPDF() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="9" y2="17"/>
      <line x1="12" y1="11" x2="12" y2="17"/>
      <line x1="15" y1="14" x2="15" y2="17"/>
    </svg>
  )
}


function IconImage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}


function IconSpreadsheet() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
      <line x1="12" y1="13" x2="12" y2="17"/>
    </svg>
  )
}


function IconDoc() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )
}


function IconZip() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="11" x2="12" y2="11"/>
      <line x1="12" y1="14" x2="12" y2="14"/>
      <line x1="12" y1="17" x2="12" y2="17"/>
    </svg>
  )
}


function IconFile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}


function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}


function IconClip() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  )
}


function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}


const FILE_ICON_MAP = {
  pdf: <IconPDF />,
  jpg: <IconImage />,
  jpeg: <IconImage />,
  png: <IconImage />,
  gif: <IconImage />,
  webp: <IconImage />,
  xls: <IconSpreadsheet />,
  xlsx: <IconSpreadsheet />,
  csv: <IconSpreadsheet />,
  doc: <IconDoc />,
  docx: <IconDoc />,
  txt: <IconDoc />,
  zip: <IconZip />,
  gz: <IconZip />,
  rar: <IconZip />,
}


function getFileIcon(extension) {

  if (!extension) {
    return <IconFile />
  }

  return (
    FILE_ICON_MAP[
      extension.toLowerCase()
    ] || <IconFile />
  )
}


async function downloadArchivo(
  archivoId,
  nomArchivo
) {

  const response = await api.get(
    `/ticket/archivo/${archivoId}`,
    {
      responseType: "blob"
    }
  )

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  )

  const link =
    document.createElement("a")

  link.href = url

  link.setAttribute(
    "download",
    nomArchivo
  )

  document.body.appendChild(link)

  link.click()

  link.remove()

  window.URL.revokeObjectURL(url)
}


function MessageArchivo({
  archivo
}) {

  if (!archivo?.archivoId) {
    return null
  }

  return (
    <div className="message-archivo">
      <span className="archivo-icon">
        {getFileIcon(
          archivo.extension
        )}
      </span>

      <span className="archivo-nombre">
        {archivo.nomArchivo}
      </span>

      <button
        className="archivo-download-btn"
        onClick={() =>
          downloadArchivo(
            archivo.archivoId,
            archivo.nomArchivo
          )
        }
      >
        <IconDownload />
      </button>

    </div>
  )
}


export default function TicketDetail() {

  const { id } = useParams()

  const { user } = useAuth()


  const [ticket, setTicket] =
    useState(null)

  const [estados, setEstados] =
    useState(null)

  const [mensajes, setMensajes] =
    useState([])

  const [nuevoMensaje, setNuevoMensaje] =
    useState("")

  const [archivoAdjunto, setArchivoAdjunto] =
    useState(null)


  const [modalGestion, setModalGestion] =
    useState(false)

  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState(null)

  const [resolucion, setResolucion] =
    useState("")

  const [empresaId, setEmpresaId] =
    useState("")

  const [nroTicket, setNroTicket] =
    useState("")

  const [archivoResolucion, setArchivoResolucion] =
    useState(null)

  const [tecnicos, setTecnicos] =
    useState([])

  const [tecnicoSeleccionado, setTecnicoSeleccionado] =
    useState("")

  const [modalAsignar, setModalAsignar] =
    useState(false)

  const [procesando, setProcesando] =
    useState(false)

  const [errorGestion, setErrorGestion] =
    useState("")

  const [errorAsignacion, setErrorAsignacion] =
    useState("")

  const messagesEndRef =
    useRef(null)

  const fileInputRef =
    useRef(null)

  const resolucionFileInputRef =
    useRef(null)

  async function loadTicket() {

    const response =
      await api.get(
        `/ticket/detalle/${id}`
      )

    setTicket(
      response.data.Ticket
    )

    setEstados(
      response.data.estados || null
    )
  }


  async function loadMessages() {

    const response =
      await api.get(
        `/message/${id}`
      )

    setMensajes(
      response.data.mensajes || []
    )
  }


  function tieneProximoEstado(
    estadoId
  ) {

    if (
      !estados?.ProximosEstados
    ) {
      return false
    }

    return estados.ProximosEstados.some(
      estado =>
        Number(estado.estadoId) ===
        Number(estadoId)
    )
  }


  function abrirGestion(
    estadoId
  ) {

    setEstadoSeleccionado(
      estadoId
    )

    setErrorGestion("")

    setResolucion("")

    setEmpresaId("")

    setNroTicket(
      ticket?.NroTicket || ""
    )

    setArchivoResolucion(null)

    if (
      resolucionFileInputRef.current
    ) {
      resolucionFileInputRef.current.value =
        ""
    }

    setModalGestion(true)
  }


  function cerrarModalGestion() {

    if (procesando) {
      return
    }

    setModalGestion(false)

    setEstadoSeleccionado(null)

    setErrorGestion("")

    setResolucion("")

    setEmpresaId("")

    setNroTicket("")

    setArchivoResolucion(null)
  }


  function obtenerMensajeError(
    error
  ) {

    const data =
      error?.response?.data

    if (Array.isArray(data?.Error)) {
      return data.Error.join(" ")
    }

    if (typeof data?.Error === "string") {
      return data.Error
    }

    if (data?.Mensaje) {
      return data.Mensaje
    }

    return "No fue posible realizar la operación."
  }


  async function confirmarGestion() {

    if (!estadoSeleccionado) {
      return
    }

    setErrorGestion("")


    /*
     * DERIVAR
     */

    if (
      Number(estadoSeleccionado) === 5
    ) {

      if (!empresaId) {
        setErrorGestion(
          "Debes seleccionar una empresa."
        )

        return
      }

      if (!nroTicket.trim()) {
        setErrorGestion(
          "Debes ingresar el número de ticket."
        )

        return
      }
    }


    /*
     * RESOLVER
     */

    if (
      Number(estadoSeleccionado) === 6
    ) {

      if (!resolucion.trim()) {
        setErrorGestion(
          "Debes ingresar la resolución."
        )

        return
      }
    }


    setProcesando(true)


    try {

      const formData =
        new FormData()


      formData.append(
        "nuevoEstado",
        estadoSeleccionado
      )

      if (
        Number(estadoSeleccionado) === 5
      ) {

        formData.append(
          "empresaId",
          empresaId
        )

        formData.append(
          "nroTicket",
          nroTicket.trim()
        )
      }


      if (
        Number(estadoSeleccionado) === 6
      ) {

        formData.append(
          "resolucion",
          resolucion.trim()
        )

        if (archivoResolucion) {

          formData.append(
            "Files",
            archivoResolucion
          )
        }
      }

      await api.post(
        `/ticket/gestionar/${id}`,
        formData
      )

      setModalGestion(false)

      setEstadoSeleccionado(null)

      setResolucion("")

      setEmpresaId("")

      setNroTicket("")

      setArchivoResolucion(null)


      if (
        resolucionFileInputRef.current
      ) {
        resolucionFileInputRef.current.value =
          ""
      }


      await loadTicket()

    } catch (error) {

      setErrorGestion(
        obtenerMensajeError(error)
      )

    } finally {

      setProcesando(false)
    }
  }


  async function cargarTecnicos() {

    setErrorAsignacion("")

    try {

      const response =
        await api.get(
          "/ticket/tecnico"
        )

      setTecnicos(
        response.data.Tecnicos || []
      )

    } catch (error) {

      setErrorAsignacion(
        obtenerMensajeError(error)
      )
    }
  }


  async function abrirAsignacion() {

    await cargarTecnicos()

    setTecnicoSeleccionado("")

    setModalAsignar(true)
  }


  function cerrarModalAsignar() {

    if (procesando) {
      return
    }

    setModalAsignar(false)

    setTecnicoSeleccionado("")

    setErrorAsignacion("")
  }


  async function confirmarAsignacion() {

    if (!tecnicoSeleccionado) {

      setErrorAsignacion(
        "Debes seleccionar un técnico."
      )

      return
    }


    setErrorAsignacion("")

    setProcesando(true)


    try {

      await api.post(
        `/ticket/asignar/${id}`,
        {
          accion: "Asignar",
          tecnico: Number(
            tecnicoSeleccionado
          )
        }
      )


      setModalAsignar(false)

      setTecnicoSeleccionado("")

      await loadTicket()

    } catch (error) {

      setErrorAsignacion(
        obtenerMensajeError(error)
      )

    } finally {

      setProcesando(false)
    }
  }


  async function tomarTicket() {

    setProcesando(true)

    try {

      await api.post(
        `/ticket/asignar/${id}`,
        {
          accion: "Tomar"
        }
      )

      await loadTicket()

    } catch (error) {

      setErrorGestion(
        obtenerMensajeError(error)
      )

    } finally {

      setProcesando(false)
    }
  }


  async function sendMessage() {

    if (
      !nuevoMensaje.trim() &&
      !archivoAdjunto
    ) {
      return
    }


    const formData =
      new FormData()


    formData.append(
      "ticketId",
      id
    )

    formData.append(
      "mensaje",
      nuevoMensaje
    )


    if (archivoAdjunto) {

      formData.append(
        "files",
        archivoAdjunto
      )
    }


    await api.post(
      "/message",
      formData
    )


    setNuevoMensaje("")

    setArchivoAdjunto(null)


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        ""
    }


    await loadMessages()
  }


  function handleFileChange(e) {

    const file =
      e.target.files[0]

    setArchivoAdjunto(
      file || null
    )
  }


  function handleResolucionFileChange(e) {

    const file =
      e.target.files[0]

    setArchivoResolucion(
      file || null
    )
  }


  function removeAdjunto() {

    setArchivoAdjunto(null)

    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        ""
    }
  }


  function scrollToBottom() {

    setTimeout(() => {

      messagesEndRef
        ?.current
        ?.scrollIntoView({
          behavior: "smooth"
        })

    }, 100)
  }


  useEffect(() => {

    async function init() {

      await loadTicket()

      await loadMessages()


      if (!socket.connected) {
        socket.connect()
      }


      socket.emit(
        "join_ticket",
        {
          ticketId: id
        }
      )


      socket.on(
        "new_message",
        data => {

          if (
            String(data.ticketId) !==
            String(id)
          ) {
            return
          }


          setMensajes(
            prev => [
              ...prev,
              {
                ...data,
                mine:
                  data.usuario.userId ===
                  user.userId
              }
            ]
          )
        }
      )
    }


    init()


    return () => {

      socket.off(
        "new_message"
      )
    }

  }, [id])


  useEffect(() => {

    scrollToBottom()

  }, [mensajes])


  if (!ticket) {

    return (
      <h2>
        Cargando ticket...
      </h2>
    )
  }


  return (

    <div className="ticket-detail-page">


      {/* =================================================
          INFORMACIÓN DEL TICKET
      ================================================= */}

      <div className="ticket-info-card">

        <div>

          <h1>
            {ticket.NroTicket}
          </h1>

          <h2>
            {ticket.tituloTicket}
          </h2>


          <div className="ticket-badges">

            <span className="badge priority">
              {ticket.prioridadTicket}
            </span>

            <span className="badge status">
              {ticket.estadoTicket}
            </span>

            <span className="badge category">
              {ticket.subCat}
            </span>

          </div>

        </div>


        {/* =================================================
            ACCIONES
        ================================================= */}

        <div className="ticket-actions">


          {/* ANULAR */}

          {tieneProximoEstado(2) && (

            <button
              onClick={() =>
                abrirGestion(2)
              }
              disabled={procesando}
            >
              Anular
            </button>

          )}


          {/* ASIGNAR */}

          {tieneProximoEstado(3) && (

            <button
              onClick={
                abrirAsignacion
              }
              disabled={procesando}
            >
              Asignar
            </button>

          )}


          {/* TOMAR */}

          {tieneProximoEstado(3) && (

            <button
              onClick={tomarTicket}
              disabled={procesando}
            >
              Tomar
            </button>

          )}


          {/* EN GESTIÓN */}

          {tieneProximoEstado(4) && (

            <button
              onClick={() =>
                abrirGestion(4)
              }
              disabled={procesando}
            >
              Gestionar Ticket
            </button>

          )}


          {/* DERIVAR */}

          {tieneProximoEstado(5) && (

            <button
              onClick={() =>
                abrirGestion(5)
              }
              disabled={procesando}
            >
              Derivar
            </button>

          )}


          {/* RESUELTO */}

          {tieneProximoEstado(6) && (

            <button
              onClick={() =>
                abrirGestion(6)
              }
              disabled={procesando}
            >
              Resolver Ticket
            </button>

          )}


          {/* REABRIR */}

          {tieneProximoEstado(7) && (

            <button
              onClick={() =>
                abrirGestion(7)
              }
              disabled={procesando}
            >
              Reabrir Ticket
            </button>

          )}


          {/* CERRAR */}

          {tieneProximoEstado(8) && (

            <button
              onClick={() =>
                abrirGestion(8)
              }
              disabled={procesando}
            >
              Cerrar Ticket
            </button>

          )}


          {/* MODIFICAR */}

          <button
            disabled={procesando}
          >
            Modificar
          </button>


          {/* HISTORIAL */}

          <button
            disabled={procesando}
          >
            Historial
          </button>

        </div>

      </div>


      {/* =================================================
          CHAT
      ================================================= */}

      <div className="chat-box">

        {mensajes.map(
          msg => (

            <div
              key={
                msg.mensajeId
              }
              className={
                msg.mine
                  ? "message mine"
                  : "message"
              }
            >

              <small>
                {msg.usuario.nombre}
              </small>

              <p>
                {msg.mensaje}
              </p>

              <MessageArchivo
                archivo={
                  msg.archivo
                }
              />

            </div>

          )
        )}


        <div
          ref={
            messagesEndRef
          }
        />

      </div>


      {/* =================================================
          INPUT DEL CHAT
      ================================================= */}

      <div className="chat-input">


        {archivoAdjunto && (

          <div className="adjunto-preview">

            <span className="archivo-icon">

              {getFileIcon(
                archivoAdjunto.name
                  .split(".")
                  .pop()
              )}

            </span>


            <span className="archivo-nombre">

              {archivoAdjunto.name}

            </span>


            <button
              className="adjunto-remove-btn"
              onClick={
                removeAdjunto
              }
            >
              <IconX />
            </button>

          </div>

        )}


        <div className="chat-input-row">


          <input
            value={
              nuevoMensaje
            }
            onChange={
              e =>
                setNuevoMensaje(
                  e.target.value
                )
            }
            placeholder="Escribe un mensaje..."
            onKeyDown={
              e => {

                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {

                  e.preventDefault()

                  sendMessage()
                }

              }
            }
          />


          <input
            type="file"
            ref={
              fileInputRef
            }
            onChange={
              handleFileChange
            }
            style={{
              display: "none"
            }}
          />


          <button
            className="clip-btn"
            onClick={() =>
              fileInputRef
                .current
                ?.click()
            }
          >
            <IconClip />
          </button>


          <button
            onClick={
              sendMessage
            }
          >
            Enviar
          </button>


        </div>

      </div>


      {/* =================================================
          MODAL GESTIONAR TICKET
      ================================================= */}

      {modalGestion && (

        <div className="ticket-modal-overlay">

          <div className="ticket-modal">

            <div className="ticket-modal-header">

              <div>

                <h2>
                  {estadoSeleccionado === 2 &&
                    "Anular ticket"}

                  {estadoSeleccionado === 4 &&
                    "Gestionar ticket"}

                  {estadoSeleccionado === 5 &&
                    "Derivar ticket"}

                  {estadoSeleccionado === 6 &&
                    "Resolver ticket"}

                  {estadoSeleccionado === 7 &&
                    "Reabrir ticket"}

                  {estadoSeleccionado === 8 &&
                    "Cerrar ticket"}
                </h2>

                <p>
                  Esta acción modificará el estado
                  del ticket.
                </p>

              </div>


              <button
                className="ticket-modal-close"
                onClick={
                  cerrarModalGestion
                }
                disabled={
                  procesando
                }
              >
                <IconX />
              </button>

            </div>


            <div className="ticket-modal-body">


              <div className="ticket-confirmation">

                <strong>
                  ¿Confirmar gestión?
                </strong>

                <span>
                  Esta acción no podrá deshacerse
                  desde esta pantalla.
                </span>

              </div>


              {/* ================================
                  DERIVAR
              ================================= */}

              {Number(
                estadoSeleccionado
              ) === 5 && (

                <>

                  <div className="ticket-form-group">

                    <label>
                      Empresa
                    </label>

                    <input
                      type="text"
                      value={empresaId}
                      onChange={
                        e =>
                          setEmpresaId(
                            e.target.value
                          )
                      }
                      placeholder="ID de empresa"
                    />

                  </div>


                  <div className="ticket-form-group">

                    <label>
                      Número de ticket
                    </label>

                    <input
                      type="text"
                      value={nroTicket}
                      onChange={
                        e =>
                          setNroTicket(
                            e.target.value
                          )
                      }
                      placeholder="Número de ticket"
                    />

                  </div>

                </>

              )}


              {/* ================================
                  RESOLVER
              ================================= */}

              {Number(
                estadoSeleccionado
              ) === 6 && (

                <>

                  <div className="ticket-form-group">

                    <label>
                      Resolución
                    </label>

                    <textarea
                      value={resolucion}
                      onChange={
                        e =>
                          setResolucion(
                            e.target.value
                          )
                      }
                      placeholder="Describe la resolución del ticket..."
                      rows="5"
                    />

                  </div>


                  <div className="ticket-form-group">

                    <label>
                      Archivo
                    </label>

                    <input
                      type="file"
                      ref={
                        resolucionFileInputRef
                      }
                      onChange={
                        handleResolucionFileChange
                      }
                    />

                    {archivoResolucion && (

                      <span className="ticket-file-selected">
                        {archivoResolucion.name}
                      </span>

                    )}

                  </div>

                </>

              )}


              {errorGestion && (

                <div className="ticket-modal-error">

                  {errorGestion}

                </div>

              )}

            </div>


            <div className="ticket-modal-footer">

              <button
                className="ticket-modal-cancel"
                onClick={
                  cerrarModalGestion
                }
                disabled={
                  procesando
                }
              >
                Cancelar
              </button>


              <button
                className="ticket-modal-confirm"
                onClick={
                  confirmarGestion
                }
                disabled={
                  procesando
                }
              >

                {procesando
                  ? "Procesando..."
                  : "Confirmar"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          MODAL ASIGNAR
      ================================================= */}

      {modalAsignar && (

        <div className="ticket-modal-overlay">

          <div className="ticket-modal">

            <div className="ticket-modal-header">

              <div>

                <h2>
                  Asignar ticket
                </h2>

                <p>
                  Selecciona el técnico al que
                  deseas asignar el ticket.
                </p>

              </div>


              <button
                className="ticket-modal-close"
                onClick={
                  cerrarModalAsignar
                }
                disabled={
                  procesando
                }
              >
                <IconX />
              </button>

            </div>


            <div className="ticket-modal-body">

              <div className="ticket-form-group">

                <label>
                  Técnico
                </label>

                <select
                  value={
                    tecnicoSeleccionado
                  }
                  onChange={
                    e =>
                      setTecnicoSeleccionado(
                        e.target.value
                      )
                  }
                >

                  <option value="">
                    Seleccionar técnico
                  </option>

                  {tecnicos.map(
                    tecnico => (

                      <option
                        key={
                          tecnico.userId
                        }
                        value={
                          tecnico.userId
                        }
                      >
                        {tecnico.Nombre}
                      </option>

                    )
                  )}

                </select>

              </div>


              {errorAsignacion && (

                <div className="ticket-modal-error">

                  {errorAsignacion}

                </div>

              )}

            </div>


            <div className="ticket-modal-footer">

              <button
                className="ticket-modal-cancel"
                onClick={
                  cerrarModalAsignar
                }
                disabled={
                  procesando
                }
              >
                Cancelar
              </button>


              <button
                className="ticket-modal-confirm"
                onClick={
                  confirmarAsignacion
                }
                disabled={
                  procesando
                }
              >

                {procesando
                  ? "Asignando..."
                  : "Asignar"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}