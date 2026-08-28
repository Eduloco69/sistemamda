import { createContext, useEffect, useState } from "react"
import api from "../services/api"

export const AuthContext = createContext()

export default function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifySession()
  }, [])

  async function verifySession() {

    try {

      const response = await api.get(
        "/auth/verify"
      )

      setUser(response.data)

    } catch {

      setUser(null)

    } finally {

      setLoading(false)

    }
  }

  async function login(email, password) {

    try {

      const response = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      )
      await verifySession()
      return response.data

    } catch (error) {
      throw error
    }
  }

  async function logout() {

    try {

      await api.post(
        "/auth/logout"
      )

    } catch (error) {

      console.log(
        "Logout error:",
        error
      )

    }

    setUser(null)
  }

  function hasPermission(permission) {

    return (
      user?.permisos?.includes(permission)
      || false
    )
  }

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasPermission,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>
  )
}