import { useState } from "react"
import { useNavigate } from "react-router-dom"

import useAuth from "../hooks/useAuth"

import "../styles/login.css"

export default function Login() {

  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  async function handleSubmit(event) {

    event.preventDefault()
    setError("")
    setLoading(true)

    try {

      await login(email, password)

    } catch (error) {

      const status = error.response?.status
      const data   = error.response?.data

      if (status === 422 && data?.tokenChangePass) {
        navigate(
          `/cambiar-contraseña?token=${encodeURIComponent(data.tokenChangePass)}`
        )
        return
      }

      if (data?.Error) {
        setError(
          Array.isArray(data.Error)
            ? data.Error.join(" ")
            : data.Error
        )
      } else if (data?.Mensaje) {
        setError(data.Mensaje)
      } else {
        setError("No fue posible iniciar sesión")
      }

    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>Sistema MDA</h1>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="login-field">
            <label htmlFor="email">
              Correo electrónico
            </label>
            <div className="input-wrapper">

              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Contraseña
            </label>
            <div className="input-wrapper">

              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

            </div>
          </div>

          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? <><span className="login-spinner" /> Ingresando...</>
              : "Ingresar"
            }
          </button>

          <button
            type="button"
            className="forgot-password"
            onClick={() => navigate("/recuperar-contraseña")}
          >
            Recuperar contraseña
          </button>

        </form>

      </div>

    </div>
  )
}