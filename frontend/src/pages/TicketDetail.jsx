import {
  useEffect,
  useRef,
  useState
} from "react"

import {useParams} from "react-router-dom"

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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
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
  pdf:  <IconPDF />,
  jpg:  <IconImage />,
  jpeg: <IconImage />,
  png:  <IconImage />,
  gif:  <IconImage />,
  webp: <IconImage />,
  xls:  <IconSpreadsheet />,
  xlsx: <IconSpreadsheet />,
  csv:  <IconSpreadsheet />,
  doc:  <IconDoc />,
  docx: <IconDoc />,
  txt:  <IconDoc />,
  zip:  <IconZip />,
  gz:   <IconZip />,
  rar:  <IconZip />,
}

function getFileIcon(extension) {
  if (!extension) return <IconFile />
  return FILE_ICON_MAP[extension.toLowerCase()] || <IconFile />
}

async function downloadArchivo(archivoId, nomArchivo) {

  const response = await api.get(
    `/ticket/archivo/${archivoId}`,
    { responseType: "blob" }
  )

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  )

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", nomArchivo)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}


function MessageArchivo({ archivo }) {

  if (!archivo?.archivoId) return null

  return (
    <div className="message-archivo">

      <span className="archivo-icon">
        {getFileIcon(archivo.extension)}
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

  const [mensajes, setMensajes] =
    useState([])

  const [nuevoMensaje, setNuevoMensaje] =
    useState("")

  const [archivoAdjunto, setArchivoAdjunto] =
    useState(null)

  const messagesEndRef =
    useRef(null)

  const fileInputRef =
    useRef(null)

  const permisos =
    user?.permisos || []

  const canAssign =
    permisos.includes("ASIGNAR_TICKETS") ||
    permisos.includes("ASIGNAR_TICKETS_ADMIN")

  const canEdit =
    permisos.includes("MODIFICAR_TICKET")

  const canManage =
    permisos.includes("GESTIONAR_TICKET") ||
    permisos.includes("GESTIONAR_TICKET_ADMIN")


  async function loadTicket() {
    const response = await api.get(`/ticket/detalle/${id}`)
    setTicket(response.data.Ticket)
  }

  async function loadMessages() {
    const response = await api.get(`/message/${id}`)
    setMensajes(response.data.mensajes || [])
  }

  async function sendMessage() {

    if (!nuevoMensaje.trim() && !archivoAdjunto) return

    const formData = new FormData()
    formData.append("ticketId", id)
    formData.append("mensaje", nuevoMensaje)

    if (archivoAdjunto) {
      formData.append("files", archivoAdjunto)
    }

    await api.post("/message", formData)

    setNuevoMensaje("")
    setArchivoAdjunto(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    setArchivoAdjunto(file || null)
  }

  function removeAdjunto() {
    setArchivoAdjunto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  useEffect(() => {

    async function init() {

      await loadTicket()
      await loadMessages()

      if (!socket.connected) {
        socket.connect()
      }

      socket.emit("join_ticket", { ticketId: id })

      socket.on("new_message", data => {

        if (String(data.ticketId) !== String(id)) return

        setMensajes(prev => [
          ...prev,
          {
            ...data,
            mine: data.usuario.userId === user.userId
          }
        ])
      })
    }

    init()

    return () => {
      socket.off("new_message")
    }

  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])


  if (!ticket) {
    return <h2>Cargando ticket...</h2>
  }

  return (

    <div className="ticket-detail-page">

      {/* HEADER */}
      <div className="ticket-info-card">

        <div>
          <h1>{ticket.NroTicket}</h1>
          <h2>{ticket.tituloTicket}</h2>

          <div className="ticket-badges">
            <span className="badge priority">{ticket.prioridadTicket}</span>
            <span className="badge status">{ticket.estadoTicket}</span>
            <span className="badge category">{ticket.subCat}</span>
          </div>
        </div>

        <div className="ticket-actions">
          {canAssign && <button>Asignar</button>}
          {canEdit   && <button>Modificar</button>}
          {canManage && <button>Gestionar</button>}
          <button>Historial</button>
        </div>

      </div>

      <div className="chat-box">
        {mensajes.map(msg => (
          <div key={msg.mensajeId} className={msg.mine ? "message mine" : "message"}>

            <small>{msg.usuario.nombre}</small>
            <p>{msg.mensaje}</p>
            <MessageArchivo archivo={msg.archivo} />

          </div>
        ))}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}
      <div className="chat-input">

        {archivoAdjunto && (
          <div className="adjunto-preview">

            <span className="archivo-icon">
              {getFileIcon(
                archivoAdjunto.name.split(".").pop()
              )}
            </span>

            <span className="archivo-nombre">
              {archivoAdjunto.name}
            </span>

            <button
              className="adjunto-remove-btn"
              onClick={removeAdjunto}
            >
              <IconX />
            </button>

          </div>
        )}

        <div className="chat-input-row">

          <input
            value={nuevoMensaje}
            onChange={e => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button
            className="clip-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconClip />
          </button>

          <button onClick={sendMessage}>
            Enviar
          </button>

        </div>

      </div>

    </div>
  )
}