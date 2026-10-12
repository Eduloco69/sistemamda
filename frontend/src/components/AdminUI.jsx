import { useEffect, useId } from "react"

export const COLOR_INICIAL = "#2563eb"

const COLOR_HEX = /^#[0-9a-fA-F]{6}$/

export function esColorValido(color) {
  return COLOR_HEX.test(color || "")
}

export function contar(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}
export function obtenerMensajeError(error, respaldo) {
  const data = error?.response?.data

  if (Array.isArray(data?.Error) && data.Error.length > 0) {
    return data.Error.join(", ")
  }

  if (typeof data?.Mensaje === "string" && data.Mensaje) {
    return data.Mensaje
  }

  if (typeof data?.Error === "string" && data.Error) {
    return data.Error
  }

  return respaldo
}

const ICONOS = {
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  editar: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  cerrar: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  alerta: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  lista: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
  edificio: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h4" />
    </>
  )
}

export function Icono({ nombre, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS[nombre]}
    </svg>
  )
}

export function EncabezadoPagina({ titulo, descripcion, accion, onAccion }) {
  return (
    <header className="adm-header">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>

      {accion && (
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          onClick={onAccion}
        >
          <Icono nombre="plus" />
          {accion}
        </button>
      )}
    </header>
  )
}

export function Tarjeta({ titulo, resumen, children }) {
  return (
    <section className="adm-card">
      <div className="adm-card-header">
        <h2>{titulo}</h2>
        {resumen && <span>{resumen}</span>}
      </div>

      {children}
    </section>
  )
}

export function Cargando({ texto, compacto = false }) {
  return (
    <div
      className={compacto ? "adm-state adm-state--compact" : "adm-state"}
      role="status"
    >
      <span className="adm-spinner" />
      <span>{texto}</span>
    </div>
  )
}

export function Vacio({
  icono = "lista",
  titulo,
  texto,
  accion,
  onAccion
}) {
  return (
    <div className="adm-state adm-state--empty">
      <div className="adm-state-icon">
        <Icono nombre={icono} size={22} />
      </div>

      <h3>{titulo}</h3>

      {texto && <p>{texto}</p>}

      {accion && (
        <button
          type="button"
          className="adm-btn adm-btn--secondary"
          onClick={onAccion}
        >
          {accion}
        </button>
      )}
    </div>
  )
}

export function Marca({ color, icono }) {
  if (icono) {
    return (
      <span className="adm-mark adm-mark--icon">
        <Icono nombre={icono} size={16} />
      </span>
    )
  }

  return (
    <span
      className="adm-mark"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

export function Estado({
  activo,
  activoTexto = "Activo",
  inactivoTexto = "Inactivo"
}) {
  return (
    <span
      className={
        activo
          ? "adm-status adm-status--on"
          : "adm-status adm-status--off"
      }
    >
      <span className="adm-status-dot" />
      {activo ? activoTexto : inactivoTexto}
    </span>
  )
}

export function SiNo({ valor }) {
  return valor
    ? <span className="adm-tag">Sí</span>
    : <span className="adm-muted">No</span>
}

export function BotonEditar({ onClick, titulo, pequeno = false }) {
  return (
    <button
      type="button"
      className={
        pequeno
          ? "adm-icon-btn adm-icon-btn--sm"
          : "adm-icon-btn"
      }
      onClick={onClick}
      title={titulo}
      aria-label={titulo}
    >
      <Icono nombre="editar" size={pequeno ? 15 : 16} />
    </button>
  )
}

export function Modal({
  titulo,
  descripcion,
  onCerrar,
  onEnviar,
  guardando,
  textoEnviar,
  textoGuardando = "Guardando...",
  error,
  children
}) {
  const id = useId()

  useEffect(() => {
    function alPresionarTecla(e) {
      if (e.key === "Escape" && !guardando) {
        onCerrar()
      }
    }

    document.addEventListener("keydown", alPresionarTecla)

    return () => {
      document.removeEventListener("keydown", alPresionarTecla)
    }
  }, [guardando, onCerrar])

  function alEnviar(e) {
    e.preventDefault()
    onEnviar()
  }

  return (
    <div
      className="adm-overlay"
      onMouseDown={e => {
        if (e.target === e.currentTarget && !guardando) {
          onCerrar()
        }
      }}
    >
      <form
        className="adm-modal"
        onSubmit={alEnviar}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        noValidate
      >
        <div className="adm-modal-header">
          <div>
            <h2 id={`${id}-titulo`}>{titulo}</h2>
            {descripcion && <p>{descripcion}</p>}
          </div>

          <button
            type="button"
            className="adm-icon-btn adm-icon-btn--ghost"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar"
          >
            <Icono nombre="cerrar" size={18} />
          </button>
        </div>

        <div className="adm-modal-body">
          {error && (
            <div className="adm-form-error" role="alert">
              <Icono nombre="alerta" />
              <span>{error}</span>
            </div>
          )}

          {children}
        </div>

        <div className="adm-modal-footer">
          <button
            type="button"
            className="adm-btn adm-btn--secondary"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="adm-btn adm-btn--primary"
            disabled={guardando}
          >
            {guardando ? (
              <>
                <span className="adm-spinner adm-spinner--light" />
                {textoGuardando}
              </>
            ) : (
              textoEnviar
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export function Campo({ etiqueta, id, ayuda, children }) {
  return (
    <div className="adm-field">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && <small>{ayuda}</small>}
    </div>
  )
}

export function CampoColor({ id, valor, onChange, deshabilitado }) {
  return (
    <div className="adm-color-field">
      <input
        type="color"
        aria-label="Elegir color"
        value={esColorValido(valor) ? valor : COLOR_INICIAL}
        onChange={e => onChange(e.target.value)}
        disabled={deshabilitado}
      />

      <input
        id={id}
        type="text"
        value={valor}
        onChange={e => onChange(e.target.value)}
        placeholder="#2563eb"
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        disabled={deshabilitado}
      />
    </div>
  )
}

export function ListaInterruptores({ children }) {
  return <div className="adm-switch-list">{children}</div>
}

export function Interruptor({
  titulo,
  descripcion,
  checked,
  onChange,
  deshabilitado
}) {
  return (
    <label className="adm-switch-row">
      <span className="adm-switch-text">
        <strong>{titulo}</strong>
        {descripcion && <small>{descripcion}</small>}
      </span>

      <span className="adm-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={deshabilitado}
        />
        <span className="adm-switch-track" />
      </span>
    </label>
  )
}
