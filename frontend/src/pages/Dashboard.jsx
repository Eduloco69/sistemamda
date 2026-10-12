import { useEffect, useState } from "react"
import api from "../services/api"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from "recharts"

import "../styles/Dashboard.css"
import "../styles/Admin.css"
import "../styles/DashboardPage.css"

import {
  Cargando,
  contar,
  EncabezadoPagina,
  obtenerMensajeError,
  Tarjeta,
  Vacio
} from "../components/AdminUI"


/* =========================================================
   Constantes de estilo
========================================================= */

const COLOR_MARCA = "#25336d"
const COLOR_GRILLA = "#edf0f2"
const COLOR_TEXTO_EJE = "#697386"

// Un color por estado (se busca por nombre, sin tildes ni mayúsculas)
const COLORES_ESTADO = {
  "abierto": "#3b6ea8",
  "asignado": "#6a5fa6",
  "en gestion": "#2f8f6b",
  "derivado": "#c0832b",
  "reabierto": "#b4503f"
}

const COLOR_ESTADO_RESPALDO = "#7a8494"

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function colorEstado(nombre) {
  return COLORES_ESTADO[normalizar(nombre)] || COLOR_ESTADO_RESPALDO
}


/* =========================================================
   Fechas (el backend envía "AAAA-MM-DD")
========================================================= */

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
]

const DIAS = [
  "domingo", "lunes", "martes", "miércoles",
  "jueves", "viernes", "sábado"
]

function partesFecha(texto) {
  const [anio, mes, dia] = String(texto).split("-").map(Number)

  if (!anio || !mes || !dia) return null

  return { anio, mes, dia }
}

function fechaCorta(texto) {
  const f = partesFecha(texto)

  return f ? `${f.dia} ${MESES[f.mes - 1]}` : texto
}

function fechaLarga(texto) {
  const f = partesFecha(texto)

  if (!f) return texto

  const diaSemana = DIAS[new Date(f.anio, f.mes - 1, f.dia).getDay()]

  return `${diaSemana} ${f.dia} ${MESES[f.mes - 1]} ${f.anio}`
}


/* =========================================================
   Tooltip de los gráficos
========================================================= */

function TooltipTickets({ active, payload, label, formatearEtiqueta }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="dsh-tooltip">
      <span>
        {formatearEtiqueta ? formatearEtiqueta(label) : label}
      </span>

      <strong>
        {contar(payload[0].value, "ticket", "tickets")}
      </strong>
    </div>
  )
}


/* =========================================================
   Propiedades comunes de los ejes
   (el eje Y solo muestra números enteros)
========================================================= */

const propsEjeY = {
  allowDecimals: false,
  domain: [0, max => Math.max(max, 3)],
  width: 30,
  tick: { fontSize: 12, fill: COLOR_TEXTO_EJE },
  axisLine: false,
  tickLine: false
}


/* =========================================================
   Contenido
========================================================= */

function ContenidoDashboard({ data }) {

  const estados = [...(data.porEstado || [])].sort(
    (a, b) => a.estadoTicketId - b.estadoTicketId
  )

  const categorias = data.porCategoria || []
  const dias = data.ultimos30Dias || []

  const totalEstados = estados.reduce(
    (total, e) => total + (e.cantidad || 0),
    0
  )

  const sumar = lista =>
    lista.reduce((total, d) => total + (d.cantidad || 0), 0)

  const total30 = sumar(dias)
  const total7 = sumar(dias.slice(-7))

  return (
    <div className="dsh-stack">

      {/* =====================================================
          ESTADOS
      ===================================================== */}

      <Tarjeta
        titulo="Tickets por estado"
        resumen={contar(totalEstados, "ticket", "tickets")}
      >

        {estados.length === 0 ? (

          <p className="dsh-note">
            No hay información de estados para mostrar.
          </p>

        ) : (
          <>
            <div className="dsh-card-body dsh-card-body--bar">
              <div
                className="dsh-bar"
                role="img"
                aria-label="Distribución de tickets por estado"
              >
                {estados
                  .filter(e => e.cantidad > 0)
                  .map(e => (
                    <span
                      key={e.estadoTicketId}
                      className="dsh-bar-seg"
                      style={{
                        flex: `${e.cantidad} 1 0`,
                        backgroundColor: colorEstado(e.nombre)
                      }}
                      title={`${e.nombre}: ${e.cantidad}`}
                    />
                  ))}
              </div>
            </div>

            <div
              className="dsh-states"
              style={{ "--cols": estados.length }}
            >
              {estados.map(e => {
                const porcentaje =
                  totalEstados > 0
                    ? Math.round((e.cantidad / totalEstados) * 100)
                    : 0

                return (
                  <div
                    key={e.estadoTicketId}
                    className={
                      e.cantidad === 0
                        ? "dsh-state is-zero"
                        : "dsh-state"
                    }
                  >
                    <span className="dsh-state-name">
                      <span
                        className="dsh-dot"
                        style={{
                          backgroundColor: colorEstado(e.nombre)
                        }}
                      />
                      {e.nombre}
                    </span>

                    <span className="dsh-state-count">
                      {e.cantidad}
                      <small>{porcentaje}%</small>
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </Tarjeta>


      {/* =====================================================
          CATEGORIAS + ACTIVIDAD
      ===================================================== */}

      <div className="dsh-grid">

        <Tarjeta
          titulo="Tickets por categoría"
          resumen={contar(
            categorias.length,
            "categoría",
            "categorías"
          )}
        >
          <div className="dsh-card-body">
            <div className="dsh-chart-scroll">
              <div className="dsh-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categorias}
                    margin={{ top: 8, right: 8, left: -6, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke={COLOR_GRILLA}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="nombre"
                      interval={0}
                      tickMargin={8}
                      tick={{ fontSize: 12, fill: COLOR_TEXTO_EJE }}
                      axisLine={{ stroke: "#d5dae1" }}
                      tickLine={false}
                    />

                    <YAxis {...propsEjeY} />

                    <Tooltip
                      cursor={{ fill: "#f1f3f8" }}
                      content={<TooltipTickets />}
                    />

                    <Bar
                      dataKey="cantidad"
                      fill={COLOR_MARCA}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta titulo="Actividad">
          <div className="dsh-today">
            <span className="dsh-today-label">
              Tickets ingresados hoy
            </span>

            <span className="dsh-today-value">
              {data.ticketsHoy ?? 0}
            </span>
          </div>

          <ul className="dsh-metrics">
            <li>
              <span>Últimos 7 días</span>
              <strong>{total7}</strong>
            </li>

            <li>
              <span>Últimos 30 días</span>
              <strong>{total30}</strong>
            </li>
          </ul>
        </Tarjeta>

      </div>


      {/* =====================================================
          TENDENCIA 30 DIAS
      ===================================================== */}

      <Tarjeta
        titulo="Tendencia de los últimos 30 días"
        resumen={`${contar(total30, "ticket", "tickets")} en el período`}
      >
        <div className="dsh-card-body">
          <div className="dsh-chart-scroll">
            <div className="dsh-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dias}
                  margin={{ top: 8, right: 12, left: -6, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke={COLOR_GRILLA}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="fecha"
                    tickFormatter={fechaCorta}
                    interval="preserveStartEnd"
                    minTickGap={28}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: COLOR_TEXTO_EJE }}
                    axisLine={{ stroke: "#d5dae1" }}
                    tickLine={false}
                  />

                  <YAxis {...propsEjeY} />

                  <Tooltip
                    cursor={{ stroke: "#c3c9d4" }}
                    content={
                      <TooltipTickets formatearEtiqueta={fechaLarga} />
                    }
                  />

                  <Line
                    dataKey="cantidad"
                    type="linear"
                    stroke={COLOR_MARCA}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: COLOR_MARCA, strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: COLOR_MARCA,
                      stroke: "#ffffff",
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Tarjeta>

    </div>
  )
}


/* =========================================================
   Página
========================================================= */

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    cargarDashboard()
  }, [])

  async function cargarDashboard() {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/ticket/dashboard")

      setData(response.data)
    } catch (error) {
      console.error(error)

      setError(
        obtenerMensajeError(
          error,
          "No fue posible obtener los datos del dashboard."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-page">

      <EncabezadoPagina
        titulo="Dashboard"
        descripcion="Resumen de la actividad de tickets."
      />

      {loading ? (

        <section className="adm-card">
          <Cargando texto="Cargando dashboard..." />
        </section>

      ) : error || !data ? (

        <section className="adm-card">
          <Vacio
            icono="alerta"
            titulo="No fue posible cargar el dashboard"
            texto={error}
            accion="Reintentar"
            onAccion={cargarDashboard}
          />
        </section>

      ) : (

        <ContenidoDashboard data={data} />

      )}

    </div>
  )
}
