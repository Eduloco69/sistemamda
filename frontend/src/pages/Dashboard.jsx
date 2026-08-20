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
  CartesianGrid,
  Cell
} from "recharts"
import "../styles/Dashboard.css"

const BAR_COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe"]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{payload[0].value} tickets</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [animado, setAnimado] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (data) setTimeout(() => setAnimado(true), 100)
  }, [data])

  async function fetchDashboard() {
    try {
      const response = await api.get("/ticket/dashboard")
      setData(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  if (!data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"/>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  function getEstado(nombre) {
    const estado = data.porEstado.find(e => e.nombre === nombre)
    return estado?.cantidad || 0
  }

  const statusCards = [
    { label: "Abiertos",    value: getEstado("Abierto"),    cls: "abierto",   icon: "◎", delay: 0   },
    { label: "En proceso",  value: getEstado("En proceso"), cls: "proceso",   icon: "◑", delay: 80  },
    { label: "Pendientes",  value: getEstado("Pendiente"),  cls: "pendiente", icon: "◷", delay: 160 },
    { label: "Reabiertos",  value: getEstado("Reabierto"),  cls: "reabierto", icon: "↺", delay: 240 },
  ]

  return (
    <div className={`dashboard-page ${animado ? "animado" : ""}`}>

      {/* KPI CARDS */}
      <div className="status-grid">
        {statusCards.map(({ label, value, cls, icon, delay }) => (
          <div
            key={cls}
            className={`status-card ${cls}`}
            style={{ animationDelay: `${delay}ms` }}
          >
            <div className="status-card-top">
              <span className="status-label">{label}</span>
              <span className="status-icon">{icon}</span>
            </div>
            <h2 className="status-number">{value}</h2>
            <div className="status-bar">
              <div className="status-bar-fill" style={{ width: `${Math.min((value / 15) * 100, 100)}%` }}/>
            </div>
          </div>
        ))}
      </div>

      {/* FILA MEDIA */}
      <div className="middle-grid">

        <div className="chart-card">
          <div className="card-header">
            <h3>Tickets por categoría</h3>
            <span className="card-badge">{data.porCategoria?.length} categorías</span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.porCategoria} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                {data.porCategoria?.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="today-card">
          <span className="today-label">Tickets hoy</span>
          <div className="today-number-wrap">
            <h1 className="today-number">{data.ticketsHoy}</h1>
          </div>
          <span className="today-sub">nuevos ingresos</span>
        </div>

      </div>

      {/* LÍNEA 30 DÍAS */}
      <div className="line-card">
        <div className="card-header">
          <h3>Tendencia últimos 30 días</h3>
          <span className="card-badge">diario</span>
        </div>
        <ResponsiveContainer width="100%" height="82%">
          <LineChart data={data.ultimos30Dias}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line
              dataKey="cantidad"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#6366f1" }}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}