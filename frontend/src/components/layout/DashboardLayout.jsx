import {
  Outlet
} from "react-router-dom"

import Sidebar from "./Sidebar"

import Topbar from "./Topbar"

import useAuth from
  "../../hooks/useAuth"

import "../../styles/Dashboard.css"


export default function DashboardLayout() {

  const { user } =
    useAuth()


  return (

    <div className="dashboard-container">

      <Sidebar />


      <div className="dashboard-main">

        <Topbar
          email={user.email}
        />


        <main
          className="dashboard-content"
        >

          <Outlet />

        </main>

      </div>

    </div>
  )
}