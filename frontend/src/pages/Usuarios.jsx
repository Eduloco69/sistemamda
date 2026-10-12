
import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Usuarios.css"

const FORMULARIO_VACIO = {
  rut: "",
  userNom: "",
  userApPat: "",
  userApMat: "",
  userMail: "",
  userTelMovil: "",
  userTelFijo: "",
  departamento: "",
  rol: ""
}

function formatearRut(valor) {
  const limpio = String(valor || "")
    .replace(/[^0-9kK]/g, "")
    .toUpperCase()

  if (limpio.length <= 1) return limpio

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  return `${cuerpo}-${dv}`
}


function obtenerMensajeError(error, fallback) {
  const data = error.response?.data
  const detalle = data?.Error ?? data?.Mensaje

  if (Array.isArray(detalle)) return detalle.join(", ")
  if (typeof detalle === "string") return detalle

  return fallback
}

function valorTexto(valor) {
  return valor === null || valor === undefined ? "" : String(valor)
}

function normalizarUsuario(usuario, rutBuscado = "") {
  return {
    rut: usuario.userRut || rutBuscado,
    userNom: valorTexto(usuario.userNom),
    userApPat: valorTexto(usuario.userApPat),
    userApMat: valorTexto(usuario.userApMat),
    userMail: valorTexto(usuario.userMail),
    userTelMovil: valorTexto(usuario.userTelMovil),
    userTelFijo: valorTexto(usuario.userTelFijo),
    departamento: usuario.departamentoId == null
      ? ""
      : String(usuario.departamentoId),
    rol: usuario.rolId == null ? "" : String(usuario.rolId)
  }
}

export default function Usuarios() {
  const [departamentos, setDepartamentos] = useState([])
  const [roles, setRoles] = useState([])

  const [criterio, setCriterio] = useState("rut")
  const [busqueda, setBusqueda] = useState("")

  const [form, setForm] = useState(FORMULARIO_VACIO)
  const [original, setOriginal] = useState(null)
  const [usuarioId, setUsuarioId] = useState(null)
  const [usuarioActivo, setUsuarioActivo] = useState(null)

  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [confirmacionEstado, setConfirmacionEstado] = useState(false)

  useEffect(() => {
    cargarCatalogos()
  }, [])

  async function cargarCatalogos() {
    try {
      setLoadingCatalogos(true)
      setError("")

      const [resDepartamentos, resRoles] = await Promise.all([
        api.get("/departamento"),
        api.get("/auth/roles")
      ])

      setDepartamentos(
        (resDepartamentos.data.Departamentos || []).filter(
          (departamento) =>
            departamento.activo === true ||
            departamento.activo === 1
        )
      )

      setRoles(resRoles.data.Roles || [])
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible cargar los departamentos y roles."
        )
      )
    } finally {
      setLoadingCatalogos(false)
    }
  }

  function actualizarCampo(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor
    }))

    setError("")
    setMensaje("")
  }

  function limpiarFormulario() {
    setForm(FORMULARIO_VACIO)
    setOriginal(null)
    setUsuarioId(null)
    setUsuarioActivo(null)
    setError("")
    setMensaje("")
    setConfirmacionEstado(false)
  }

  
async function buscarUsuario(e) {
    e.preventDefault()

    const valor = busqueda.trim()

    if (!valor) {
      setError(
        criterio === "rut"
          ? "Ingresa un RUT para realizar la búsqueda."
          : "Ingresa un correo electrónico para realizar la búsqueda."
      )
      return
    }

    try {
      setBuscando(true)
      setError("")
      setMensaje("")

      const params = criterio === "rut"
        ? { rut: valor }
        : { mail: valor }

      const response = await api.get("/auth/usuario", { params })
      const usuario = response.data

      const formulario = normalizarUsuario(
        usuario,
        criterio === "rut" ? valor : ""
      )

      setForm(formulario)
      setOriginal({ ...formulario })
      setUsuarioId(usuario.userId)
      setUsuarioActivo(
        usuario.ActiveFlg === true ||
        usuario.ActiveFlg === 1
      )
      setConfirmacionEstado(false)
    } catch (err) {
      setForm(FORMULARIO_VACIO)
      setOriginal(null)
      setUsuarioId(null)
      setUsuarioActivo(null)

      setError(
        obtenerMensajeError(
          err,
          "No fue posible encontrar al usuario."
        )
      )
    } finally {
      setBuscando(false)
    }
  }

  function validarFormulario() {
    if (!form.rut.trim()) return "Debes ingresar el RUT."
    if (!form.userNom.trim()) return "Debes ingresar el nombre."
    if (!form.userApPat.trim()) return "Debes ingresar el apellido paterno."
    if (!form.userApMat.trim()) return "Debes ingresar el apellido materno."
    if (!form.userMail.trim()) return "Debes ingresar el correo electrónico."

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.userMail.trim())) {
      return "Ingresa un correo electrónico válido."
    }

    if (!form.departamento) {
      return "Debes seleccionar un departamento."
    }

    if (!form.rol) {
      return "Debes seleccionar un rol."
    }

    if (
      form.userTelMovil.trim() &&
      !/^\d+$/.test(form.userTelMovil.trim())
    ) {
      return "El teléfono móvil debe contener solamente números."
    }

    if (
      form.userTelFijo.trim() &&
      !/^\d+$/.test(form.userTelFijo.trim())
    ) {
      return "El teléfono fijo debe contener solamente números."
    }

    return ""
  }

  async function crearUsuario() {
    const errorValidacion = validarFormulario()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    const payload = {
      userNom: form.userNom.trim(),
      rut: form.rut.trim(),
      userApPat: form.userApPat.trim(),
      userApMat: form.userApMat.trim(),
      userMail: form.userMail.trim(),
      departamento: Number(form.departamento),
      rol: Number(form.rol)
    }

    if (form.userTelMovil.trim()) {
      payload.userTelMovil = Number(form.userTelMovil)
    }

    if (form.userTelFijo.trim()) {
      payload.userTelFijo = Number(form.userTelFijo)
    }

    try {
      setGuardando(true)
      setError("")
      setMensaje("")

      const response = await api.post("/auth/register", payload)

      setMensaje(
        response.data?.Mensaje || "Usuario creado correctamente."
      )

      setBusqueda(form.rut)
      setCriterio("rut")

      // Se limpia el formulario para evitar crear accidentalmente
      // el mismo usuario una segunda vez.
      setForm(FORMULARIO_VACIO)
      setOriginal(null)
      setUsuarioId(null)
      setUsuarioActivo(null)
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible crear el usuario."
        )
      )
    } finally {
      setGuardando(false)
    }
  }

  async function guardarCambios(e) {
    e.preventDefault()

    if (usuarioId === null || !original) {
      await crearUsuario()
      return
    }

    const errorValidacion = validarFormulario()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    const campos = [
      "rut",
      "userNom",
      "userApPat",
      "userApMat",
      "userMail",
      "userTelMovil",
      "userTelFijo",
      "departamento",
      "rol"
    ]

    const payload = {}

    const equivalencias = {
      userTelMovil: "telMovil",
      userTelFijo: "telFijo",
      departamento: "departamento",
      rol: "rol"
    }

    for (const campo of campos) {
      if (form[campo] === original[campo]) continue

      const claveApi = equivalencias[campo] || campo
      let valor = form[campo]

      if (campo === "departamento" || campo === "rol") {
        valor = Number(valor)
      }

      if (campo === "userTelMovil" || campo === "userTelFijo") {
        valor = valor.trim() ? Number(valor) : ""
      }

      payload[claveApi] = valor
    }

    if (Object.keys(payload).length === 0) {
      setMensaje("No hay cambios pendientes.")
      setError("")
      return
    }

    try {
      setGuardando(true)
      setError("")
      setMensaje("")

      const response = await api.put(
        `/auth/usuario/${usuarioId}`,
        payload
      )

      setOriginal({ ...form })

      setMensaje(
        response.data?.Mensaje || "Usuario actualizado correctamente."
      )
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible actualizar el usuario."
        )
      )
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstadoUsuario() {
    if (usuarioId === null || usuarioActivo === null) return

    const nuevoEstado = !usuarioActivo

    try {
      setCambiandoEstado(true)
      setError("")
      setMensaje("")

      const response = await api.put(
        `/auth/usuario/${usuarioId}`,
        { activo: nuevoEstado }
      )

      setUsuarioActivo(nuevoEstado)
      setConfirmacionEstado(false)

      setMensaje(
        response.data?.Mensaje ||
        `Usuario ${nuevoEstado ? "activado" : "desactivado"} correctamente.`
      )
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No fue posible cambiar el estado del usuario."
        )
      )
    } finally {
      setCambiandoEstado(false)
    }
  }

  const esEdicion = usuarioId !== null

  return (
    <div className="usuarios-page">
      <header className="usuarios-header">
        <div>
          <h1>Usuarios</h1>
        </div>

        <div className="usuarios-header-actions">
          <span className="usuarios-header-mark">
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
          </span>
        </div>
      </header>

      <section className="usuarios-card">
        <div className="usuarios-card-heading">
          <div>
            <h2>Administración de usuarios</h2>
          </div>

          {esEdicion && (
            <span
              className={`usuarios-status ${
                usuarioActivo ? "usuarios-status-active" : "usuarios-status-inactive"
              }`}
            >
              <span className="usuarios-status-dot" />
              {usuarioActivo ? "Activo" : "Inactivo"}
            </span>
          )}
        </div>

        <div className="usuarios-card-content">
          <form className="usuarios-search" onSubmit={buscarUsuario}>
            <div className="usuarios-search-options">
              <label className="usuarios-radio">
                <input
                  type="radio"
                  name="criterioBusqueda"
                  value="rut"
                  checked={criterio === "rut"}
                  onChange={() => setCriterio("rut")}
                />
                <span>RUT</span>
              </label>

              <label className="usuarios-radio">
                <input
                  type="radio"
                  name="criterioBusqueda"
                  value="mail"
                  checked={criterio === "mail"}
                  onChange={() => setCriterio("mail")}
                />
                <span>Correo electrónico</span>
              </label>
            </div>

            <div className="usuarios-search-controls">
              <input
                type={criterio === "mail" ? "email" : "text"}
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    criterio === "rut"
                      ? formatearRut(e.target.value)
                      : e.target.value
                  )
                }
                placeholder={
                  criterio === "rut"
                    ? "Ej. 11111111-1"
                    : "Ej. usuario@empresa.cl"
                }
                aria-label={criterio === "rut" ? "RUT para buscar" : "Correo para buscar"}
              />

              <button
                type="submit"
                className="usuarios-button usuarios-button-primary"
                disabled={buscando}
              >
                {buscando ? "Buscando..." : "Buscar"}
              </button>

              <button
                type="button"
                className="usuarios-button usuarios-button-secondary"
                onClick={limpiarFormulario}
                disabled={guardando || buscando}
              >
                Limpiar
              </button>
            </div>
          </form>

          {(error || mensaje) && (
            <div
              className={`usuarios-feedback ${
                error ? "usuarios-feedback-error" : "usuarios-feedback-success"
              }`}
              role="status"
            >
              <span>{error || mensaje}</span>
              <button
                type="button"
                onClick={() => {
                  setError("")
                  setMensaje("")
                }}
                aria-label="Cerrar mensaje"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <form className="usuarios-form" onSubmit={guardarCambios}>
            <div className="usuarios-section-title">
              <h3>Información del usuario</h3>
            </div>

            <div className="usuarios-fields-grid">
              <div className="usuarios-field">
                <label htmlFor="userMail">Correo electrónico</label>
                <input
                  id="userMail"
                  type="email"
                  value={form.userMail}
                  onChange={(e) => actualizarCampo("userMail", e.target.value)}
                  placeholder="usuario@empresa.cl"
                  disabled={loadingCatalogos || guardando}
                  required
                />
              </div>

            <div className="usuarios-field">
              <label htmlFor="rut">RUT</label>
              <input
                id="rut"
                value={form.rut}
                onChange={(e) =>
                  actualizarCampo("rut", formatearRut(e.target.value))
                }
                placeholder="11111111-1"
                disabled={loadingCatalogos || guardando}
                required
              />
            </div>

              <div className="usuarios-field">
                <label htmlFor="userNom">Nombre</label>
                <input
                  id="userNom"
                  value={form.userNom}
                  onChange={(e) => actualizarCampo("userNom", e.target.value)}
                  placeholder="Nombre"
                  disabled={loadingCatalogos || guardando}
                  required
                />
              </div>

              <div className="usuarios-field">
                <label htmlFor="userApPat">Apellido paterno</label>
                <input
                  id="userApPat"
                  value={form.userApPat}
                  onChange={(e) => actualizarCampo("userApPat", e.target.value)}
                  placeholder="Apellido paterno"
                  disabled={loadingCatalogos || guardando}
                  required
                />
              </div>

              <div className="usuarios-field">
                <label htmlFor="userApMat">Apellido materno</label>
                <input
                  id="userApMat"
                  value={form.userApMat}
                  onChange={(e) => actualizarCampo("userApMat", e.target.value)}
                  placeholder="Apellido materno"
                  disabled={loadingCatalogos || guardando}
                  required
                />
              </div>

              <div className="usuarios-field">
                <label htmlFor="userTelMovil">Teléfono móvil</label>
                <input
                  id="userTelMovil"
                  type="tel"
                  inputMode="numeric"
                  value={form.userTelMovil}
                  onChange={(e) => actualizarCampo("userTelMovil", e.target.value)}
                  placeholder="Ej. 912345678"
                  disabled={loadingCatalogos || guardando}
                />
              </div>

              <div className="usuarios-field">
                <label htmlFor="userTelFijo">Teléfono fijo</label>
                <input
                  id="userTelFijo"
                  type="tel"
                  inputMode="numeric"
                  value={form.userTelFijo}
                  onChange={(e) => actualizarCampo("userTelFijo", e.target.value)}
                  placeholder="Ej. 22345678"
                  disabled={loadingCatalogos || guardando}
                />
              </div>

              <div className="usuarios-field">
                <label htmlFor="departamento">Departamento</label>
                <select
                  id="departamento"
                  value={form.departamento}
                  onChange={(e) => actualizarCampo("departamento", e.target.value)}
                  disabled={loadingCatalogos || guardando}
                  required
                >
                  <option value="">
                    {loadingCatalogos ? "Cargando..." : "Seleccionar departamento"}
                  </option>

                  {departamentos.map((departamento) => (
                    <option
                      key={departamento.departamentoId}
                      value={departamento.departamentoId}
                    >
                      {departamento.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="usuarios-field">
                <label htmlFor="rol">Rol de usuario</label>
                <select
                  id="rol"
                  value={form.rol}
                  onChange={(e) => actualizarCampo("rol", e.target.value)}
                  disabled={loadingCatalogos || guardando}
                  required
                >
                  <option value="">
                    {loadingCatalogos ? "Cargando..." : "Seleccionar rol"}
                  </option>

                  {roles.map((rol) => (
                    <option key={rol.rolId} value={rol.rolId}>
                      {rol.rolGlosa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="usuarios-form-footer">
              <div className="usuarios-form-actions">
                {esEdicion && (
                  <button
                    type="button"
                    className={`usuarios-button ${
                      usuarioActivo
                        ? "usuarios-button-danger"
                        : "usuarios-button-success"
                    }`}
                    onClick={() => setConfirmacionEstado(true)}
                    disabled={guardando || cambiandoEstado}
                  >
                    {usuarioActivo ? "Desactivar usuario" : "Activar usuario"}
                  </button>
                )}

                <button
                  type="submit"
                  className="usuarios-button usuarios-button-primary"
                  disabled={guardando || loadingCatalogos}
                >
                  {guardando
                    ? "Guardando..."
                    : esEdicion
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {confirmacionEstado && (
        <div
          className="usuarios-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !cambiandoEstado) {
              setConfirmacionEstado(false)
            }
          }}
        >
          <div
            className="usuarios-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-confirm-title"
          >
            <div className="usuarios-confirm-icon">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <h2 id="usuarios-confirm-title">
              {usuarioActivo ? "Desactivar usuario" : "Activar usuario"}
            </h2>

            <p>
              {usuarioActivo
                ? "¿Confirmas que deseas desactivar este usuario?"
                : "¿Confirmas que deseas activar este usuario?"}
              {" "}Esta acción modificará su estado en el sistema.
            </p>

            <div className="usuarios-confirm-actions">
              <button
                type="button"
                className="usuarios-button usuarios-button-secondary"
                onClick={() => setConfirmacionEstado(false)}
                disabled={cambiandoEstado}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={`usuarios-button ${
                  usuarioActivo
                    ? "usuarios-button-danger"
                    : "usuarios-button-success"
                }`}
                onClick={cambiarEstadoUsuario}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado
                  ? "Procesando..."
                  : usuarioActivo
                    ? "Sí, desactivar"
                    : "Sí, activar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}