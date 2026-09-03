import {
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import DashboardLayout from "./components/layout/DashboardLayout"

import Dashboard from "./pages/Dashboard"
import Tickets from "./pages/Tickets"
import TicketDetail from "./pages/TicketDetail"
import Login from "./pages/Login"
import CreateTicket from "./pages/CreateTicket"
import Configuracion from "./pages/configuracion"
import Categorias from "./pages/categorias"
import Empresas from "./pages/Empresas"
import CambiarContraseña from "./pages/cambiarContraseña"
import RecuperarContraseña from "./pages/RecuperarContraseña"

import useAuth from "./hooks/useAuth"


export default function App() {

  const {
    user,
    loading
  } = useAuth()

  if (loading) {

    return (
      <div>
        Cargando...
      </div>
    )

  }

  if (!user) {

    return (

      <Routes>

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/cambiar-contraseña"
          element={
            <CambiarContraseña />
          }
        />

        <Route
          path="/recuperar-contraseña"
          element={
            <RecuperarContraseña />
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    )
  }

  return (

    <Routes>

      <Route
        path="/"
        element={
          <DashboardLayout />
        }
      >

        <Route
          index
          element={
            <Navigate
              to="/tickets"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={
            <Dashboard />
          }
        />

        <Route
          path="tickets"
          element={
            <Tickets />
          }
        />

        <Route
          path="tickets/:id"
          element={
            <TicketDetail />
          }
        />

        <Route
          path="crear-ticket"
          element={
            <CreateTicket />
          }
        />

        <Route
          path="configuracion"
          element={
            <Configuracion />
          }
        />

        <Route
          path="configuracion/categorias"
          element={
            <Categorias />
          }
        />

        <Route
          path="configuracion/empresas"
          element={
            <Empresas />
          }
        />

      </Route>

      <Route
        path="/login"
        element={
          <Navigate
            to="/tickets"
            replace
          />
        }
      />

      <Route
        path="/cambiar-contraseña"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/recuperar-contraseña"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/tickets"
            replace
          />
        }
      />

    </Routes>

  )
}