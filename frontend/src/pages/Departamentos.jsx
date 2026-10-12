import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Admin.css"
import {
  BotonEditar,
  Campo,
  Cargando,
  contar,
  EncabezadoPagina,
  Estado,
  Interruptor,
  ListaInterruptores,
  Marca,
  Modal,
  obtenerMensajeError,
  Tarjeta,
  Vacio
} from "../components/AdminUI"

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null)

  const [nombre, setNombre] = useState("")
  const [tipoDepartamento, setTipoDepartamento] = useState("")
  const [activo, setActivo] = useState(true)

  const [errorForm, setErrorForm] = useState("")
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarDepartamentos()
  }, [])

  async function cargarDepartamentos() {
    try {
      setLoading(true)
      setErrorCarga("")

      const response = await api.get("/departamento")

      setDepartamentos(response.data.Departamentos || [])
    } catch (error) {
      console.error("Error obteniendo departamentos:", error)

      setErrorCarga(
        obtenerMensajeError(
          error,
          "No fue posible obtener los departamentos."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  function abrirCrear() {
    setModoEdicion(false)
    setDepartamentoSeleccionado(null)

    setNombre("")
    setTipoDepartamento("")
    setActivo(true)

    setErrorForm("")
    setModalOpen(true)
  }

  function abrirEditar(departamento) {
    setModoEdicion(true)
    setDepartamentoSeleccionado(departamento)

    setNombre(departamento.nombre || "")
    setTipoDepartamento(departamento.tipoDepartamento || "")
    setActivo(Boolean(departamento.activo))

    setErrorForm("")
    setModalOpen(true)
  }

  function cerrarModal() {
    if (guardando) return

    setModalOpen(false)
    setDepartamentoSeleccionado(null)
    setErrorForm("")
  }

  async function guardarDepartamento() {
    if (!nombre.trim()) {
      setErrorForm("Debes ingresar el nombre del departamento.")
      return
    }

    if (!tipoDepartamento.trim()) {
      setErrorForm("Debes ingresar el tipo de departamento.")
      return
    }

    try {
      setGuardando(true)
      setErrorForm("")

      if (modoEdicion) {
        await api.put(
          `/departamento/${departamentoSeleccionado.departamentoId}`,
          {
            nombre: nombre.trim(),
            tipoDepartamento: tipoDepartamento.trim(),
            activo: activo ? true : false
          }
        )
      } else {
        await api.post("/departamento", {
          nombre: nombre.trim(),
          tipoDepartamento: tipoDepartamento.trim()
        })
      }

      await cargarDepartamentos()

      setModalOpen(false)
      setDepartamentoSeleccionado(null)
    } catch (error) {
      console.error("Error guardando departamento:", error)

      setErrorForm(
        obtenerMensajeError(
          error,
          "No fue posible guardar el departamento."
        )
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="adm-page">

      <EncabezadoPagina
        titulo="Departamentos"
        descripcion="Administra los departamentos disponibles en el sistema."
        accion="Nuevo departamento"
        onAccion={abrirCrear}
      />

      <Tarjeta
        titulo="Departamentos registrados"
        resumen={
          loading || errorCarga
            ? null
            : contar(
                departamentos.length,
                "departamento",
                "departamentos"
              )
        }
      >

        {loading ? (

          <Cargando texto="Cargando departamentos..." />

        ) : errorCarga && departamentos.length === 0 ? (

          <Vacio
            icono="alerta"
            titulo="No fue posible cargar los departamentos"
            texto={errorCarga}
            accion="Reintentar"
            onAccion={cargarDepartamentos}
          />

        ) : departamentos.length === 0 ? (

          <Vacio
            icono="lista"
            titulo="No hay departamentos registrados"
            texto="Crea el primer departamento para comenzar a utilizar esta sección."
            accion="Crear departamento"
            onAccion={abrirCrear}
          />

        ) : (

          <div className="adm-table-wrap">
            <table className="adm-table">

              <thead>
                <tr>
                  <th>Departamento</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th className="adm-col-action">Acción</th>
                </tr>
              </thead>

              <tbody>
                {departamentos.map(departamento => (
                  <tr
                    key={departamento.departamentoId}
                    className="adm-row"
                  >
                    <td>
                      <div className="adm-name">
                        <Marca icono="edificio" />
                        <span>{departamento.nombre}</span>
                      </div>
                    </td>

                    <td>
                      <span className="adm-plain">
                        {departamento.tipoDepartamento || "Sin tipo"}
                      </span>
                    </td>

                    <td>
                      <Estado activo={departamento.activo} />
                    </td>

                    <td className="adm-col-action">
                      <BotonEditar
                        titulo={`Editar ${departamento.nombre}`}
                        onClick={() => abrirEditar(departamento)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        )}

      </Tarjeta>

      {modalOpen && (
        <Modal
          titulo={
            modoEdicion
              ? "Editar departamento"
              : "Nuevo departamento"
          }
          descripcion={
            modoEdicion
              ? "Modifica la información del departamento."
              : "Ingresa la información del nuevo departamento."
          }
          onCerrar={cerrarModal}
          onEnviar={guardarDepartamento}
          guardando={guardando}
          error={errorForm}
          textoEnviar={
            modoEdicion
              ? "Guardar cambios"
              : "Crear departamento"
          }
        >

          <Campo
            etiqueta="Nombre del departamento"
            id="departamento-nombre"
          >
            <input
              id="departamento-nombre"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Contabilidad"
              maxLength={40}
              disabled={guardando}
              autoFocus
            />
          </Campo>

          <Campo
            etiqueta="Tipo de departamento"
            id="departamento-tipo"
          >
            <input
              id="departamento-tipo"
              type="text"
              value={tipoDepartamento}
              onChange={e => setTipoDepartamento(e.target.value)}
              placeholder="Ej: Administrativo"
              maxLength={20}
              disabled={guardando}
            />
          </Campo>

          {modoEdicion && (
            <ListaInterruptores>
              <Interruptor
                titulo="Departamento activo"
                descripcion="Define si el departamento estará disponible para ser utilizado."
                checked={activo}
                onChange={setActivo}
                deshabilitado={guardando}
              />
            </ListaInterruptores>
          )}

        </Modal>
      )}

    </div>
  )
}
