import {useEffect,useState} from "react"
import {useNavigate} from "react-router-dom"
import api from "../services/api"
import "../styles/Tickets.css"

export default function Tickets() {

  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])

  const [filters, setFilters] = useState({
    estado: "",
    asignado: "",
    categoria: "",
    subcategoria: "",
    prioridad: "",
    nroTicket: "",
    fechaDesde: "",
    fechaHasta: ""
  })

  async function fetchTickets() {
    try {
      setLoading(true)
      const response = await api.get("/ticket", {
        params: {
          ...filters,
          pagina
        }
      })
      setTickets(response.data.tickets || [])
      setTotalPaginas(response.data.total_paginas || 1)
    } catch (error) {
      console.error("Error cargando tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategorias() {
    try {
      const response = await api.get("/ticket/categoria")
      setCategorias(response.data.Categorias || [])
    } catch (error) {
      console.error("Error cargando categorías:", error)
    }
  }

  async function fetchSubcategorias(categoriaId) {
    if (!categoriaId) {
      setSubcategorias([])
      return
    }
    try {
      const response = await api.get(`/ticket/subcategoria/${categoriaId}`)
      setSubcategorias(response.data.Subcategorias || [])
    } catch (error) {
      console.error("Error cargando subcategorías:", error)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [pagina])

  function handleChange(e) {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
      ...(name === "categoria" ? { subcategoria: "" } : {})
    })
    if (name === "categoria") {
      fetchSubcategorias(value)
    }
  }

  function handleSearch() {
    setPagina(1)
    fetchTickets()
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("es-CL")
  }

  function getVisiblePages() {
    const group = Math.floor((pagina - 1) / 10)
    const start = (group * 10) + 1
    const end = Math.min(start + 9, totalPaginas)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  if (loading) {
    return <h2>Cargando tickets...</h2>
  }

  return (
    <div className="tickets-page">

      <h1>Tickets</h1>

      <div className="ticket-filters">

        <input
          name="nroTicket"
          placeholder="Nro ticket"
          value={filters.nroTicket}
          onChange={handleChange}
        />

        <select
          name="estado"
          value={filters.estado}
          onChange={handleChange}
        >
          <option value="">Estado</option>
          <option value="Abierto">Abierto</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Resuelto">Resuelto</option>
          <option value="Cerrado">Cerrado</option>
        </select>

        <input
          name="asignado"
          placeholder="Asignado"
          value={filters.asignado}
          onChange={handleChange}
        />

        <select
          name="categoria"
          value={filters.categoria}
          onChange={handleChange}
        >
          <option value="">Categoría</option>
          {categorias.map(cat => (
            <option key={cat.categoriaId} value={cat.categoriaId}>
              {cat.categoria}
            </option>
          ))}
        </select>

        <select
          name="subcategoria"
          value={filters.subcategoria}
          onChange={handleChange}
          disabled={!filters.categoria}
        >
          <option value="">Subcategoría</option>
          {subcategorias.map(sub => (
            <option key={sub.subCatId} value={sub.subCatId}>
              {sub.subCat}
            </option>
          ))}
        </select>

        <select
          name="prioridad"
          value={filters.prioridad}
          onChange={handleChange}
        >
          <option value="">Prioridad</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
          <option value="Crítica">Crítica</option>
        </select>

        <input
          type="date"
          name="fechaDesde"
          value={filters.fechaDesde}
          onChange={handleChange}
        />

        <input
          type="date"
          name="fechaHasta"
          value={filters.fechaHasta}
          onChange={handleChange}
        />

        <button onClick={handleSearch}>
          Buscar
        </button>

      </div>

      <div className="tickets-grid">
        {tickets.map(ticket => (
          <div
            key={ticket.ticketId}
            className="ticket-card"
            onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
          >
            <div className="ticket-header">
              <span className="ticket-category">
                {ticket.categoria}
              </span>
              <span className={`priority ${ticket.prioridadTicket}`}>
                {ticket.prioridadTicket}
              </span>
            </div>
            <h3>{ticket.NroTicket}</h3>
            <p className="ticket-title">{ticket.tituloTicket}</p>
            <p className="ticket-user">{ticket.usuarioSolicitante}</p>
            <div className="ticket-footer">
              <span className="status">{ticket.estadoTicket}</span>
              <span>{formatDate(ticket.fechaCreacionTicket)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">

        {pagina > 10 && (
          <button
            className="page-btn"
            onClick={() => setPagina(pagina - 10)}
          >
            ←
          </button>
        )}

        {getVisiblePages().map(num => (
          <button
            key={num}
            className={pagina === num ? "page-btn active" : "page-btn"}
            onClick={() => setPagina(num)}
          >
            {num}
          </button>
        ))}

        {totalPaginas > 10 && pagina <= totalPaginas - 10 && (
          <button
            className="page-btn"
            onClick={() => setPagina(pagina + 10)}
          >
            →
          </button>
        )}

      </div>

    </div>
  )
}