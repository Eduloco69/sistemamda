import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"

import api from "../services/api"
import socket from "../services/socket"
import useAuth from "../hooks/useAuth"
import "../styles/TicketDetail.css"


/* =====================================================
   ICONOS
===================================================== */

const FILE = (
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </>
)

const ICONS = {
  file: FILE,
  pdf: <>{FILE}<path d="M9 13v4M12 11v6M15 14v3" /></>,
  sheet: <>{FILE}<path d="M8 13h8M8 17h8M12 13v4" /></>,
  doc: <>{FILE}<path d="M8 13h8M8 17h8" /></>,
  zip: <>{FILE}<path d="M12 11h.01M12 14h.01M12 17h.01" /></>,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M12 15V3" />
    </>
  ),
  clip: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
}

function Icon({ name, size = 20, sw = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  )
}

const EXT_ICON = {
  pdf: "pdf",
  jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image",
  xls: "sheet", xlsx: "sheet", csv: "sheet",
  doc: "doc", docx: "doc", txt: "doc",
  zip: "zip", gz: "zip", rar: "zip",
}

const FileIcon = ({ ext }) => (
  <Icon name={EXT_ICON[ext?.toLowerCase()] || "file"} />
)


/* =====================================================
   UTILIDADES
===================================================== */

async function downloadArchivo(archivoId, nomArchivo) {

  const { data } = await api.get(
    `/ticket/archivo/${archivoId}`,
    { responseType: "blob" }
  )

  const url = URL.createObjectURL(new Blob([data]))
  const link = document.createElement("a")

  link.href = url
  link.download = nomArchivo
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}


function formatearFecha(valor) {

  if (!valor) return null

  const fecha = new Date(valor)

  return Number.isNaN(fecha.getTime())
    ? valor
    : fecha.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
}


function errMsg(error) {

  const data = error?.response?.data

  if (Array.isArray(data?.Error)) return data.Error.join(" ")
  if (typeof data?.Error === "string") return data.Error

  return data?.Mensaje || "No fue posible realizar la operación."
}


/*
 * AJUSTAR según cómo entregue los permisos tu useAuth().
 * Soporta user.permisos / user.permissions (strings u objetos).
 */
function tienePermiso(user, ...permisos) {

  const lista = user?.permisos || user?.permissions || user?.Permisos

  return (
    Array.isArray(lista) &&
    lista.some(p =>
      permisos.includes(
        typeof p === "string"
          ? p
          : p?.permiso || p?.nombre || p?.Permiso || p?.codigo
      )
    )
  )
}


const ACCIONES = [
  { label: "Anular", estado: 2 },
  { label: "Asignar", estado: 3, fn: "asignar" },
  { label: "Tomar", estado: 3, fn: "tomar" },
  { label: "Gestionar Ticket", estado: 4 },
  { label: "Derivar", estado: 5 },
  { label: "Resolver Ticket", estado: 6 },
  { label: "Reabrir Ticket", estado: 7 },
  { label: "Cerrar Ticket", estado: 8 },
]

const TITULOS = {
  2: "Anular",
  4: "Gestionar",
  5: "Derivar",
  6: "Resolver",
  7: "Reabrir",
  8: "Cerrar",
}

const FORM_VACIO = {
  empresaId: "",
  nroTicket: "",
  resolucion: "",
  archivo: null
}


/* =====================================================
   COMPONENTES PEQUEÑOS
===================================================== */

function Modal({ title, subtitle, onClose, busy, wide, top, footer, children }) {
  return (
    <div className={`ticket-modal-overlay${top ? " ticket-modal-overlay-top" : ""}`}>
      <div className={`ticket-modal${wide ? " ticket-modal-wide" : ""}`}>

        <div className="ticket-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>

          {onClose && (
            <button
              className="ticket-modal-close"
              onClick={onClose}
              disabled={busy}
            >
              <Icon name="x" size={14} sw={2} />
            </button>
          )}
        </div>

        <div className="ticket-modal-body">{children}</div>

        {footer && <div className="ticket-modal-footer">{footer}</div>}

      </div>
    </div>
  )
}


function Footer({ onCancel, onOk, busy, okText, busyText }) {
  return (
    <>
      <button className="ticket-modal-cancel" onClick={onCancel} disabled={busy}>
        Cancelar
      </button>

      <button className="ticket-modal-confirm" onClick={onOk} disabled={busy}>
        {busy ? busyText : okText}
      </button>
    </>
  )
}


const Field = ({ label, children }) => (
  <div className="ticket-form-group">
    <label>{label}</label>
    {children}
  </div>
)


const Err = ({ msg }) =>
  msg ? <div className="ticket-modal-error">{msg}</div> : null


const EmpresaSelect = ({ value, onChange, empresas }) => (
  <select value={value} onChange={e => onChange(e.target.value)}>
    <option value="">Seleccionar empresa</option>

    {empresas.map(e => (
      <option key={e.empresaId} value={e.empresaId}>
        {e.nomEmpresa}
      </option>
    ))}
  </select>
)


function MessageArchivo({ archivo }) {

  if (!archivo?.archivoId) return null

  return (
    <div className="message-archivo">

      <span className="archivo-icon">
        <FileIcon ext={archivo.extension} />
      </span>

      <span className="archivo-nombre">{archivo.nomArchivo}</span>

      <button
        className="archivo-download-btn"
        onClick={() => downloadArchivo(archivo.archivoId, archivo.nomArchivo)}
      >
        <Icon name="download" size={16} />
      </button>

    </div>
  )
}


/* Nombre de usuario con tarjeta de datos al pasar el mouse */
function UsuarioHover({ nombre, datos }) {

  if (!datos) return <span>{nombre}</span>

  const filas = [
    ["Departamento", datos.NombreDepartamento],
    ["Correo", datos.userMail],
    ["Teléfono fijo", datos.userTelFijo],
    ["Teléfono móvil", datos.userTelMovil],
  ]

  return (
    <span className="usuario-hover" tabIndex={0}>

      <span className="usuario-hover-nombre">{nombre}</span>

      <span className="usuario-hover-card" role="tooltip">

        <strong>{nombre}</strong>

        {filas.map(([etiqueta, valor]) => (
          <span key={etiqueta} className="usuario-hover-fila">
            <span className="usuario-hover-etiqueta">{etiqueta}</span>
            <span>{valor ?? "No registrado"}</span>
          </span>
        ))}

      </span>

    </span>
  )
}


const IconButton = ({ label, variant = "", icon, ...props }) => (
  <button
    type="button"
    className={`icon-btn ${variant}`}
    data-tooltip={label}
    aria-label={label}
    {...props}
  >
    <Icon name={icon} size={16} />
  </button>
)


/* =====================================================
   PÁGINA
===================================================== */

export default function TicketDetail() {

  const { id } = useParams()
  const { user } = useAuth()

  const [data, setData] = useState(null)

  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [archivoAdjunto, setArchivoAdjunto] = useState(null)

  const [modal, setModal] = useState(null)      // gestion | asignar | derivaciones
  const [estado, setEstado] = useState(null)    // estado destino de la gestión
  const [form, setForm] = useState(FORM_VACIO)
  const [empresas, setEmpresas] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [tecnico, setTecnico] = useState("")

  const [editando, setEditando] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [confirm, setConfirm] = useState(null)

  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)


  const ticket = data?.Ticket
  const puedeGestionar = tienePermiso(user, "GESTIONAR_TICKET", "GESTIONAR_TICKET_ADMIN")
  const derivaciones = (data?.derivaciones || []).filter(d => d.activo !== false)

  const patchForm = patch => setForm(f => ({ ...f, ...patch }))


  /* -------------------------------------------------
     HELPERS
  ------------------------------------------------- */

  /* Ejecuta una operación con estado "procesando" y manejo de error */
  async function run(fn) {

    setError("")
    setBusy(true)

    try {
      await fn()
      return true
    } catch (e) {
      setError(errMsg(e))
      return false
    } finally {
      setBusy(false)
    }
  }


  async function loadTicket() {

    const res = await api.get(`/ticket/detalle/${id}`)

    setData(res.data)
  }


  async function loadMessages() {

    const res = await api.get(`/message/${id}`)

    setMensajes(res.data.mensajes || [])
  }


  async function cargarEmpresas() {

    try {

      const res = await api.get("/empresa")

      setEmpresas((res.data.Empresas || []).filter(e => e.activo))

    } catch (e) {

      setEmpresas([])
      setError(errMsg(e))
    }
  }


  const tieneProximoEstado = estadoId =>
    !!data?.estados?.ProximosEstados?.some(
      e => Number(e.estadoId) === Number(estadoId)
    )


  const close = () => {
    setModal(null)
    setEstado(null)
    setError("")
    setForm(FORM_VACIO)
    setTecnico("")
    setEditando(null)
    setConfirm(null)
  }

  const tryClose = () => busy || close()


  /* -------------------------------------------------
     GESTIÓN DEL TICKET
  ------------------------------------------------- */

  async function abrirGestion(estadoId) {

    setError("")
    setEstado(estadoId)
    setForm({ ...FORM_VACIO, nroTicket: ticket?.NroTicket || "" })
    setModal("gestion")

    if (Number(estadoId) === 5) await cargarEmpresas()
  }


  async function confirmarGestion() {

    const n = Number(estado)

    if (n === 5) {
      if (!form.empresaId) return setError("Debes seleccionar una empresa.")
      if (!form.nroTicket.trim()) return setError("Debes ingresar el número de ticket.")
    }

    if (n === 6 && !form.resolucion.trim()) {
      return setError("Debes ingresar la resolución.")
    }

    const fd = new FormData()

    fd.append("nuevoEstado", estado)

    if (n === 5) {
      fd.append("empresaId", form.empresaId)
      fd.append("nroTicket", form.nroTicket.trim())
    }

    if (n === 6) {
      fd.append("resolucion", form.resolucion.trim())
      if (form.archivo) fd.append("Files", form.archivo)
    }

    const ok = await run(async () => {
      await api.post(`/ticket/gestionar/${id}`, fd)
      await loadTicket()
    })

    if (ok) close()
  }


  /* -------------------------------------------------
     ASIGNACIÓN
  ------------------------------------------------- */

  async function abrirAsignacion() {

    setError("")

    try {
      const res = await api.get("/ticket/tecnico")
      setTecnicos(res.data.Tecnicos || [])
    } catch (e) {
      setError(errMsg(e))
    }

    setTecnico("")
    setModal("asignar")
  }


  async function confirmarAsignacion() {

    if (!tecnico) return setError("Debes seleccionar un técnico.")

    const ok = await run(async () => {
      await api.post(`/ticket/asignar/${id}`, {
        accion: "Asignar",
        tecnico: Number(tecnico)
      })
      await loadTicket()
    })

    if (ok) close()
  }


  const tomarTicket = () =>
    run(async () => {
      await api.post(`/ticket/asignar/${id}`, { accion: "Tomar" })
      await loadTicket()
    })


  /* -------------------------------------------------
     DERIVACIONES
  ------------------------------------------------- */

  async function abrirDerivaciones() {

    setError("")
    setEditando(null)
    setConfirm(null)
    setModal("derivaciones")

    await cargarEmpresas()
  }


  function iniciarEdicion(d) {

    setError("")
    setEditando(d.derivacionId)

    setEditForm({
      empresaId: String(d.empresaId ?? ""),
      nroTicket: d.nroTicket || "",
      comentario: d.comentario || ""
    })
  }


  async function guardarEdicion(d) {

    const actual = {
      empresaId: String(d.empresaId ?? ""),
      nroTicket: d.nroTicket || "",
      comentario: d.comentario || ""
    }

    const nuevo = {
      ...editForm,
      nroTicket: editForm.nroTicket.trim(),
      comentario: editForm.comentario.trim()
    }

    /* Solo se envía lo que cambió */
    const cambios = {}

    for (const k of Object.keys(actual)) {
      if (nuevo[k] !== actual[k]) {
        cambios[k] = k === "empresaId" ? Number(nuevo[k]) : nuevo[k]
      }
    }

    if (!Object.keys(cambios).length) return setEditando(null)

    if ("nroTicket" in cambios && !cambios.nroTicket) {
      return setError("El número de ticket no puede estar vacío.")
    }

    if ("empresaId" in cambios && !cambios.empresaId) {
      return setError("Debes seleccionar una empresa.")
    }

    const ok = await run(async () => {
      await api.put(`/ticket/derivacion/${d.derivacionId}`, cambios)
      await loadTicket()
    })

    if (ok) setEditando(null)
  }


  async function ejecutarConfirmacion() {

    const { tipo, d } = confirm
    const url = `/ticket/derivacion/${d.derivacionId}`

    await run(async () => {

      if (tipo === "borrar") await api.put(url, { activo: false })
      else await api.post(url)

      await loadTicket()
    })

    setConfirm(null)
  }


  /* -------------------------------------------------
     CHAT
  ------------------------------------------------- */

  function clearAdjunto() {

    setArchivoAdjunto(null)

    if (fileInputRef.current) fileInputRef.current.value = ""
  }


  async function sendMessage() {

    if (!nuevoMensaje.trim() && !archivoAdjunto) return

    const fd = new FormData()

    fd.append("ticketId", id)
    fd.append("mensaje", nuevoMensaje)

    if (archivoAdjunto) fd.append("files", archivoAdjunto)

    await api.post("/message", fd)

    setNuevoMensaje("")
    clearAdjunto()

    await loadMessages()
  }


  useEffect(() => {

    async function init() {

      await loadTicket()
      await loadMessages()

      if (!socket.connected) socket.connect()

      socket.emit("join_ticket", { ticketId: id })

      socket.on("new_message", msg => {

        if (String(msg.ticketId) !== String(id)) return

        setMensajes(prev => [
          ...prev,
          { ...msg, mine: msg.usuario.userId === user.userId }
        ])
      })
    }

    init()

    return () => {
      socket.off("new_message")
    }

  }, [id])


  useEffect(() => {

    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    return () => clearTimeout(t)

  }, [mensajes])


  if (!ticket) return <h2>Cargando ticket...</h2>


  const handlers = { asignar: abrirAsignacion, tomar: tomarTicket }

  const meta = [
    ["Fecha de creación", formatearFecha(ticket.fechaCreacionTicket) || "—"],
    ["Última gestión", formatearFecha(ticket.fechaActualizacionTicket) || "—"],
    [
      "Solicitante",
      <UsuarioHover nombre={ticket.usuarioSolicitante} datos={data.solicitante} />
    ],
    [
      "Técnico asignado",
      ticket.usuarioAsignado
        ? <UsuarioHover nombre={ticket.usuarioAsignado} datos={data.Asignado} />
        : <span className="sin-asignacion">Sin asignación</span>
    ],
  ]


  /* -------------------------------------------------
     RENDER
  ------------------------------------------------- */

  return (

    <div className="ticket-detail-page">


      {/* INFORMACIÓN DEL TICKET */}

      <div className="ticket-info-card">

        <div className="ticket-info-main">

          <h1>{ticket.NroTicket}</h1>

          <h2>{ticket.tituloTicket}</h2>

          <div className="ticket-badges">
            <span className="badge priority">{ticket.prioridadTicket}</span>
            <span className="badge status">{ticket.estadoTicket}</span>
            <span className="badge category">{ticket.subCat}</span>
          </div>

        </div>


        <div className="ticket-actions">

          <button disabled={busy}>Modificar</button>

          <button disabled={busy}>Historial</button>

          <button onClick={abrirDerivaciones} disabled={busy}>
            Derivaciones{derivaciones.length > 0 && ` (${derivaciones.length})`}
          </button>

        </div>


        <dl className="ticket-meta">
          {meta.map(([label, valor]) => (
            <div key={label} className="ticket-meta-item">
              <dt>{label}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>

      </div>


      {/* GESTIÓN (requiere permiso) */}

      {puedeGestionar && (

        <div className="ticket-manage-card">

          <div className="ticket-actions">
            {ACCIONES.map(a => (
              <button
                key={a.label}
                onClick={handlers[a.fn] || (() => abrirGestion(a.estado))}
                disabled={busy || !tieneProximoEstado(a.estado)}
              >
                {a.label}
              </button>
            ))}
          </div>

          {!modal && <Err msg={error} />}

        </div>

      )}


      {/* CHAT */}

      <div className="chat-box">

        {mensajes.map(msg => (

          <div
            key={msg.mensajeId}
            className={msg.mine ? "message mine" : "message"}
          >
            <small>{msg.usuario.nombre}</small>

            <p>{msg.mensaje}</p>

            <MessageArchivo archivo={msg.archivo} />
          </div>

        ))}

        <div ref={messagesEndRef} />

      </div>


      <div className="chat-input">

        {archivoAdjunto && (

          <div className="adjunto-preview">

            <span className="archivo-icon">
              <FileIcon ext={archivoAdjunto.name.split(".").pop()} />
            </span>

            <span className="archivo-nombre">{archivoAdjunto.name}</span>

            <button className="adjunto-remove-btn" onClick={clearAdjunto}>
              <Icon name="x" size={14} sw={2} />
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
            onChange={e => setArchivoAdjunto(e.target.files[0] || null)}
            hidden
          />

          <button
            className="clip-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="clip" size={18} />
          </button>

          <button onClick={sendMessage}>Enviar</button>

        </div>

      </div>


      {/* MODAL GESTIONAR */}

      {modal === "gestion" && (

        <Modal
          title={`${TITULOS[Number(estado)]} ticket`}
          onClose={tryClose}
          busy={busy}
          footer={
            <Footer
              onCancel={tryClose}
              onOk={confirmarGestion}
              busy={busy}
              okText="Confirmar"
              busyText="Procesando..."
            />
          }
        >

          <div className="ticket-confirmation">
            <strong>¿Confirmar gestión?</strong>
            <span>Esta acción es irreversible</span>
          </div>

          {Number(estado) === 5 && (
            <>
              <Field label="Empresa">
                <EmpresaSelect
                  value={form.empresaId}
                  onChange={empresaId => patchForm({ empresaId })}
                  empresas={empresas}
                />
              </Field>

              <Field label="Número de ticket">
                <input
                  type="text"
                  value={form.nroTicket}
                  onChange={e => patchForm({ nroTicket: e.target.value })}
                  placeholder="Número de ticket"
                />
              </Field>
            </>
          )}

          {Number(estado) === 6 && (
            <>
              <Field label="Resolución">
                <textarea
                  rows="5"
                  value={form.resolucion}
                  onChange={e => patchForm({ resolucion: e.target.value })}
                  placeholder="Describe la resolución del ticket..."
                />
              </Field>

              <Field label="Archivo">
                <input
                  type="file"
                  onChange={e => patchForm({ archivo: e.target.files[0] || null })}
                />

                {form.archivo && (
                  <span className="ticket-file-selected">{form.archivo.name}</span>
                )}
              </Field>
            </>
          )}

          <Err msg={error} />

        </Modal>

      )}


      {/* MODAL ASIGNAR */}

      {modal === "asignar" && (

        <Modal
          title="Asignar ticket"
          subtitle="Selecciona el técnico al que deseas asignar el ticket."
          onClose={tryClose}
          busy={busy}
          footer={
            <Footer
              onCancel={tryClose}
              onOk={confirmarAsignacion}
              busy={busy}
              okText="Asignar"
              busyText="Asignando..."
            />
          }
        >

          <Field label="Técnico">
            <select value={tecnico} onChange={e => setTecnico(e.target.value)}>
              <option value="">Seleccionar técnico</option>

              {tecnicos.map(t => (
                <option key={t.userId} value={t.userId}>
                  {t.Nombre}
                </option>
              ))}
            </select>
          </Field>

          <Err msg={error} />

        </Modal>

      )}


      {/* MODAL DERIVACIONES */}

      {modal === "derivaciones" && (

        <Modal
          wide
          title="Derivaciones"
          subtitle={`${ticket.NroTicket} · ${ticket.tituloTicket}`}
          onClose={tryClose}
          busy={busy}
        >

          <Err msg={error} />

          {!derivaciones.length && (
            <p className="derivaciones-vacio">
              Este ticket no tiene derivaciones.
            </p>
          )}

          <ul className="derivaciones-lista">

            {derivaciones.map(d => {

              const enEdicion = editando === d.derivacionId
              const fechaFin = formatearFecha(d["fechaFinalización"])
              const setEdit = patch => setEditForm(f => ({ ...f, ...patch }))

              return (

                <li
                  key={d.derivacionId}
                  className="derivacion-item"
                  style={{ borderLeftColor: d.color || "#999" }}
                >

                  <div className="derivacion-contenido">

                    {enEdicion ? (

                      <>

                        <Field label="Empresa">
                          <EmpresaSelect
                            value={editForm.empresaId}
                            onChange={empresaId => setEdit({ empresaId })}
                            empresas={empresas}
                          />
                        </Field>

                        <Field label="Número de ticket">
                          <input
                            type="text"
                            value={editForm.nroTicket}
                            onChange={e => setEdit({ nroTicket: e.target.value })}
                          />
                        </Field>

                        <Field label="Comentario">
                          <textarea
                            rows="3"
                            value={editForm.comentario}
                            onChange={e => setEdit({ comentario: e.target.value })}
                          />
                        </Field>

                        <div className="derivacion-edicion-botones">
                          <Footer
                            onCancel={() => { setEditando(null); setError("") }}
                            onOk={() => guardarEdicion(d)}
                            busy={busy}
                            okText="Guardar"
                            busyText="Guardando..."
                          />
                        </div>

                      </>

                    ) : (

                      <>

                        <div className="derivacion-titulo">

                          <span
                            className="derivacion-empresa"
                            style={{ backgroundColor: d.color || "#999" }}
                          >
                            {d.nomEmpresa}
                          </span>

                          <strong>{d.nroTicket}</strong>

                          <span
                            className={`badge derivacion-estado ${
                              d.derivacionFinalizada ? "finalizada" : "pendiente"
                            }`}
                          >
                            {d.derivacionFinalizada ? "Finalizada" : "Pendiente"}
                          </span>

                        </div>

                        <p className="derivacion-comentario">
                          {d.comentario || "Sin comentario"}
                        </p>

                        <div className="derivacion-fechas">
                          <span>
                            Derivada: {formatearFecha(d.fechaDerivacion) || "—"}
                          </span>

                          {fechaFin && <span>Finalizada: {fechaFin}</span>}
                        </div>

                      </>

                    )}

                  </div>


                  {puedeGestionar && !enEdicion && (

                    <div className="derivacion-acciones">

                      <IconButton
                        label="Editar"
                        icon="edit"
                        disabled={busy}
                        onClick={() => iniciarEdicion(d)}
                      />

                      <IconButton
                        label="Borrar"
                        icon="trash"
                        variant="danger"
                        disabled={busy}
                        onClick={() => setConfirm({ tipo: "borrar", d })}
                      />

                      <IconButton
                        label="Finalizar"
                        icon="check"
                        variant="success"
                        disabled={busy || d.derivacionFinalizada}
                        onClick={() => setConfirm({ tipo: "finalizar", d })}
                      />

                    </div>

                  )}

                </li>
              )
            })}

          </ul>

        </Modal>

      )}


      {/* CONFIRMACIÓN BORRAR / FINALIZAR DERIVACIÓN */}

      {confirm && (

        <Modal
          top
          title={confirm.tipo === "borrar" ? "Borrar derivación" : "Finalizar derivación"}
          footer={
            <Footer
              onCancel={() => setConfirm(null)}
              onOk={ejecutarConfirmacion}
              busy={busy}
              okText={confirm.tipo === "borrar" ? "Borrar" : "Finalizar"}
              busyText="Procesando..."
            />
          }
        >
          <p>
            ¿Seguro que deseas {confirm.tipo === "borrar" ? "borrar" : "finalizar"} la
            derivación {confirm.d.nroTicket} de {confirm.d.nomEmpresa}?
            {confirm.tipo === "borrar" && " Dejará de mostrarse."}
          </p>
        </Modal>

      )}

    </div>
  )
}
