import { useNavigate } from "react-router-dom"

import "../styles/Configuracion.css"


function SettingsIcon({ type }) {

  const icons = {

    ticket: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16v16H4z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),

    category: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
        <circle cx="8" cy="5" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="10" cy="19" r="2" />
      </svg>
    ),

    company: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21h18" />
        <path d="M5 21V5l7-3 7 3v16" />
        <path d="M9 9h1" />
        <path d="M14 9h1" />
        <path d="M9 13h1" />
        <path d="M14 13h1" />
        <path d="M10 21v-4h4v4" />
      </svg>
    ),

    department: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
        />

        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h4" />
      </svg>
    ),

    arrow: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    )

  }


  return icons[type]

}


export default function Configuracion() {

  const navigate =
    useNavigate()


  const opciones = [

    {
      id: "tipos-ticket",

      titulo:
        "Tipo de tickets",

      descripcion:
        "Administra los tipos de tickets disponibles en el sistema.",

      icon:
        "ticket",

      ruta:
        "/configuracion/tipos-ticket"
    },

    {
      id: "categorias",

      titulo:
        "Categorías y subcategorías",

      descripcion:
        "Administra las categorías y subcategorías de los tickets.",

      icon:
        "category",

      ruta:
        "/configuracion/categorias"
    },

    {
      id: "empresas",

      titulo:
        "Empresas",

      descripcion:
        "Administra las empresas asociadas al sistema.",

      icon:
        "company",

      ruta:
        "/configuracion/empresas"
    },

    {
      id: "departamentos",

      titulo:
        "Departamentos",

      descripcion:
        "Administra los departamentos de las empresas.",

      icon:
        "department",

      ruta:
        "/configuracion/departamentos"
    }

  ]


  return (

    <div className="configuracion-page">

      <div className="configuracion-header">

        <h1>
          Configuración
        </h1>

        <p>
          Administra las opciones generales del sistema.
        </p>

      </div>


      <div className="configuracion-list">

        {opciones.map(opcion => (

          <button

            key={opcion.id}

            className="configuracion-option"

            onClick={() =>
              navigate(
                opcion.ruta
              )
            }

          >

            <div className="configuracion-option-icon">

              <SettingsIcon
                type={opcion.icon}
              />

            </div>


            <div className="configuracion-option-content">

              <h2>
                {opcion.titulo}
              </h2>

              <p>
                {opcion.descripcion}
              </p>

            </div>


            <div className="configuracion-option-arrow">

              <SettingsIcon
                type="arrow"
              />

            </div>

          </button>

        ))}

      </div>

    </div>

  )

}