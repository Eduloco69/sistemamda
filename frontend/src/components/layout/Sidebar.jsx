import { useState } from "react"

import {
  Menu,
  TicketPlus,
  ClipboardList,
  Users,
  BarChart3,
  Settings
} from "lucide-react"

import {useNavigate} from "react-router-dom"

import useAuth from "../../hooks/useAuth"

import "../../styles/Dashboard.css"


export default function Sidebar() {

  const { hasPermission } =
    useAuth()

  const navigate =
    useNavigate()


  const [collapsed, setCollapsed] =
    useState(false)


  const menu = [

    {
      permission:"VER_MENU_NUEVO_TICKET",
      label:"Nuevo Ticket",
      icon: TicketPlus,
      route:"/crear-ticket",
      primary:true
    },

    {
      permission:"VER_MENU_TICKETS",
      label:"Tickets",
      icon: ClipboardList,
      route:"/tickets"
    },

    {
      permission:"VER_MENU_USUARIOS",
      label:"Usuarios",
      icon: Users,
      route:"/usuarios"
    },

    {
      permission:"VER_MENU_DASHBOARDS",
      label:"Dashboard",
      icon: BarChart3,
      route:"/dashboard"
    },

    {
      permission:"VER_MENU_CONFIGURACION",
      label:"Configuración",
      icon: Settings,
      route:"/configuracion"
    }
  ]


  return (

    <aside
      className={
        `sidebar ${
          collapsed
            ? "collapsed"
            : ""
        }`
      }
    >

      <button

        className="collapse-btn"

        onClick={() =>
          setCollapsed(
            !collapsed
          )
        }
      >
        ☰
      </button>

      <nav>
        {
          menu.map(item => {

            const Icon = item.icon

            return (

              hasPermission(item.permission) && (

                <button
                  key={item.permission}
                  onClick={() => navigate(item.route)}
                  className={
                    item.primary
                      ? "menu-btn primary"
                      : "menu-btn"
                  }
                >

                  <span className="icon">
                    <Icon size={20}/>
                  </span>

                  {!collapsed && (
                    <span>{item.label}</span>
                  )}

                </button>

              )
            )
          })
        }

      </nav>

    </aside>
  )
}