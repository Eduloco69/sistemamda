import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import api from "../services/api"

import "../styles/login.css"

const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?"{}|<>]).{6,12}$/

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function IconEye({ open }) {
  return open
    ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    )
    : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    )
}

function IconError() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12" y2="16"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}


const RULES = [
  { label: "Entre 6 y 12 caracteres",        test: v => v.length >= 6 && v.length <= 12 },
  { label: "Al menos una minúscula",          test: v => /[a-z]/.test(v) },
  { label: "Al menos una mayúscula",          test: v => /[A-Z]/.test(v) },
  { label: "Al menos un número",             test: v => /\d/.test(v) },
  { label: "Al menos un carácter especial",  test: v => /[!@#$%^&*(),.?"{}|<>]/.test(v) },
]


export default function CambiarContrasena() {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get("token")

  const [tokenValido, setTokenValido]   = useState(false)
  const [tokenError,  setTokenError]    = useState("")
  const [validando,   setValidando]     = useState(true)

  const [password,    setPassword]      = useState("")
  const [confirmar,   setConfirmar]     = useState("")
  const [showPass,    setShowPass]      = useState(false)
  const [showConf,    setShowConf]      = useState(false)

  const [error,       setError]         = useState("")
  const [loading,     setLoading]       = useState(false)
  const [exitoso,     setExitoso]       = useState(false)


  useEffect(() => {

    async function validarToken() {

      if (!token) {
        setTokenError("Token no encontrado en la URL")
        setValidando(false)

        setTimeout(() => navigate("/login"), 3000)
        return
      }

      try {

        await api.get(`/auth/token?token=${encodeURIComponent(token)}`)
        setTokenValido(true)

      } catch (err) {

        const msg =
          err.response?.data?.Error ||
          err.response?.data?.Mensaje ||
          "Token no válido"

        setTokenError(msg)

        setTimeout(() => navigate("/login"), 3000)

      } finally {
        setValidando(false)
      }
    }

    validarToken()

  }, [token])


  const passValida   = PASSWORD_REGEX.test(password)
  const coinciden    = password === confirmar && confirmar !== ""
  const formValido   = passValida && coinciden


  async function handleSubmit(e) {

    e.preventDefault()

    if (!formValido) return

    setError("")
    setLoading(true)

    try {

      await api.post(
        `/auth/cambiar_contraseña?token=${encodeURIComponent(token)}`,
        { password: password }
      )

      setExitoso(true)

      setTimeout(() => navigate("/login"), 2500)

    } catch (err) {

      const msg =
        err.response?.data?.Error ||
        err.response?.data?.Mensaje ||
        "No fue posible cambiar la contraseña"

      setError(msg)

    } finally {
      setLoading(false)
    }
  }


  if (validando) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Verificando token</h1>
            <p>Estamos validando tu enlace...</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <span className="login-spinner" style={{ borderTopColor: "#2563eb", borderColor: "rgba(37,99,235,.2)", width: 28, height: 28 }} />
          </div>
        </div>
      </div>
    )
  }


  if (!tokenValido) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Enlace inválido</h1>
            <p>Serás redirigido al inicio de sesión</p>
          </div>
          <div className="login-error">
            <IconError />
            {tokenError}
          </div>
        </div>
      </div>
    )
  }


  if (exitoso) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Contraseña actualizada</h1>
            <p>Serás redirigido al inicio de sesión</p>
          </div>
          <div className="login-error" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}>
            <IconCheck />
            Tu contraseña fue cambiada correctamente
          </div>
        </div>
      </div>
    )
  }


  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>Nueva contraseña</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>

          {/* CONTRASEÑA */}
          <div className="login-field">
            <label htmlFor="password">Nueva contraseña</label>
            <div className="input-wrapper">

              <span className="input-icon">
                <IconLock />
              </span>

              <input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                <IconEye open={showPass} />
              </button>

            </div>

            {/* REGLAS */}
            {password && (
              <ul className="password-rules">
                {RULES.map(rule => (
                  <li
                    key={rule.label}
                    className={rule.test(password) ? "rule ok" : "rule"}
                  >
                    {rule.test(password) ? <IconCheck /> : <IconError />}
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

          </div>

          {/* CONFIRMAR */}
          <div className="login-field">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <div className="input-wrapper">

              <span className="input-icon">
                <IconLock />
              </span>

              <input
                id="confirmar"
                type={showConf ? "text" : "password"}
                placeholder="••••••••"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                required
              />

              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowConf(v => !v)}
                tabIndex={-1}
              >
                <IconEye open={showConf} />
              </button>

            </div>

            {confirmar && !coinciden && (
              <div className="login-error" style={{ marginTop: 6 }}>
                <IconError />
                Las contraseñas no coinciden
              </div>
            )}

          </div>

          {error && (
            <div className="login-error">
              <IconError />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={!formValido || loading}
          >
            {loading
              ? <><span className="login-spinner" /> Guardando...</>
              : "Cambiar contraseña"
            }
          </button>

          <button
            type="button"
            className="forgot-password"
            onClick={() => navigate("/login")}
          >
            Volver al inicio de sesión
          </button>

        </form>

      </div>

    </div>
  )
}