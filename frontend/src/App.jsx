import {Routes,Route,Navigate} from "react-router-dom"

import DashboardLayout from "./components/layout/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Tickets from "./pages/Tickets"
import TicketDetail from "./pages/TicketDetail"
import Login from "./pages/Login"
import useAuth from "./hooks/useAuth"
import CreateTicket from "./pages/CreateTicket"
import Configuracion from "./pages/Configuracion"
import Categorias from "./pages/categorias"

export default function App() {

  const {
    user,
    loading
  } = useAuth()


  if (loading) {
    return <p>Cargando...</p>
  }


  if (!user) {
    return <Login />
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
              to="/dashboard"
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
          path="/crear-ticket"
          element={<CreateTicket />}
        />

        <Route
          path="tickets/:id"
          element={
            <TicketDetail />
          }
        />

        <Route
          path="/configuracion"
          element={
            <Configuracion />
          }
        />

        <Route
          path="/configuracion/categorias"
          element={
            <Categorias />
          }
        />

      </Route>

    </Routes>
  )
}