import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Admin.css"
import {
  BotonEditar,
  Campo,
  CampoColor,
  Cargando,
  COLOR_INICIAL,
  contar,
  EncabezadoPagina,
  esColorValido,
  Estado,
  Interruptor,
  ListaInterruptores,
  Marca,
  Modal,
  obtenerMensajeError,
  Tarjeta,
  Vacio
} from "../components/AdminUI"

export default function Empresas() {

  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [modal, setModal] = useState(null)
  const [errorForm, setErrorForm] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarEmpresas()
  }, [])


  // =========================================================
  // OBTENER EMPRESAS
  // =========================================================

  async function cargarEmpresas() {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/empresa")

      setEmpresas(response.data.Empresas || [])
    } catch (error) {
      console.error(error)

      setError(
        obtenerMensajeError(
          error,
          "No fue posible obtener las empresas."
        )
      )
    } finally {
      setLoading(false)
    }
  }


  // =========================================================
  // MODAL
  // =========================================================

  function abrirCrear() {
    setErrorForm("")

    setModal({
      modo: "crear",
      empresaId: null,
      nomEmpresa: "",
      color: COLOR_INICIAL,
      activo: true
    })
  }

  function abrirEditar(empresa) {
    setErrorForm("")

    setModal({
      modo: "editar",
      empresaId: empresa.empresaId,
      nomEmpresa: empresa.nomEmpresa,
      color: empresa.color || COLOR_INICIAL,
      activo: Boolean(empresa.activo)
    })
  }

  function cerrarModal() {
    if (saving) return

    setModal(null)
    setErrorForm("")
  }

  function cambiar(campo, valor) {
    setModal(prev => ({
      ...prev,
      [campo]: valor
    }))
  }


  // =========================================================
  // CREAR / MODIFICAR EMPRESA
  // =========================================================

  async function guardarEmpresa() {
    if (!modal) return

    const nomEmpresa = modal.nomEmpresa.trim()

    if (!nomEmpresa) {
      setErrorForm("Ingresa el nombre de la empresa.")
      return
    }

    if (!esColorValido(modal.color)) {
      setErrorForm("Ingresa un color válido con el formato #RRGGBB.")
      return
    }

    try {
      setSaving(true)
      setErrorForm("")

      if (modal.modo === "crear") {
        const response = await api.post("/empresa", {
          nomEmpresa,
          color: modal.color
        })

        setEmpresas(prev => [
          ...prev,
          {
            empresaId: response.data?.EmpresaId,
            nomEmpresa,
            color: modal.color,
            activo: true
          }
        ])
      } else {
        const activo = modal.activo ? 1 : 0

        await api.put(`/empresa/${modal.empresaId}`, {
          nomEmpresa,
          color: modal.color,
          activo
        })

        setEmpresas(prev =>
          prev.map(empresa =>
            empresa.empresaId === modal.empresaId
              ? {
                  ...empresa,
                  nomEmpresa,
                  color: modal.color,
                  activo: activo === 1
                }
              : empresa
          )
        )
      }

      setModal(null)
    } catch (error) {
      console.error(error)

      setErrorForm(
        obtenerMensajeError(
          error,
          modal.modo === "crear"
            ? "No fue posible crear la empresa."
            : "No fue posible actualizar la empresa."
        )
      )
    } finally {
      setSaving(false)
    }
  }


  // =========================================================
  // RENDER
  // =========================================================

  const esCrear = modal?.modo === "crear"

  return (
    <div className="adm-page">

      <EncabezadoPagina
        titulo="Empresas"
        descripcion="Administra las empresas disponibles en el sistema."
        accion="Nueva empresa"
        onAccion={abrirCrear}
      />

      <Tarjeta
        titulo="Empresas registradas"
        resumen={
          loading || error
            ? null
            : contar(empresas.length, "empresa", "empresas")
        }
      >

        {loading ? (

          <Cargando texto="Cargando empresas..." />

        ) : error && empresas.length === 0 ? (

          <Vacio
            icono="alerta"
            titulo="No fue posible cargar las empresas"
            texto={error}
            accion="Reintentar"
            onAccion={cargarEmpresas}
          />

        ) : empresas.length === 0 ? (

          <Vacio
            icono="edificio"
            titulo="No hay empresas registradas"
            texto="Crea la primera empresa para comenzar a utilizar esta sección."
            accion="Crear empresa"
            onAccion={abrirCrear}
          />

        ) : (

          <div className="adm-table-wrap">
            <table className="adm-table">

              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Color</th>
                  <th>Estado</th>
                  <th className="adm-col-action">Acción</th>
                </tr>
              </thead>

              <tbody>
                {empresas.map(empresa => (
                  <tr
                    key={empresa.empresaId}
                    className="adm-row"
                  >
                    <td>
                      <div className="adm-name">
                        <Marca color={empresa.color} />
                        <span>{empresa.nomEmpresa}</span>
                      </div>
                    </td>

                    <td>
                      <span className="adm-hex">
                        {empresa.color}
                      </span>
                    </td>

                    <td>
                      <Estado
                        activo={empresa.activo}
                        activoTexto="Activa"
                        inactivoTexto="Inactiva"
                      />
                    </td>

                    <td className="adm-col-action">
                      <BotonEditar
                        titulo={`Editar ${empresa.nomEmpresa}`}
                        onClick={() => abrirEditar(empresa)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        )}

      </Tarjeta>

      {modal && (
        <Modal
          titulo={esCrear ? "Nueva empresa" : "Editar empresa"}
          descripcion={
            esCrear
              ? "Ingresa la información de la nueva empresa."
              : "Modifica la información de la empresa."
          }
          onCerrar={cerrarModal}
          onEnviar={guardarEmpresa}
          guardando={saving}
          error={errorForm}
          textoEnviar={esCrear ? "Crear empresa" : "Guardar cambios"}
        >

          <Campo etiqueta="Nombre de la empresa" id="empresa-nombre">
            <input
              id="empresa-nombre"
              type="text"
              value={modal.nomEmpresa}
              onChange={e => cambiar("nomEmpresa", e.target.value)}
              placeholder="Ej: Empresa ABC"
              maxLength={100}
              disabled={saving}
              autoFocus
            />
          </Campo>

          <Campo etiqueta="Color" id="empresa-color">
            <CampoColor
              id="empresa-color"
              valor={modal.color}
              onChange={valor => cambiar("color", valor)}
              deshabilitado={saving}
            />
          </Campo>

          {!esCrear && (
            <ListaInterruptores>
              <Interruptor
                titulo="Empresa activa"
                descripcion="Define si la empresa estará disponible para ser utilizada."
                checked={modal.activo}
                onChange={valor => cambiar("activo", valor)}
                deshabilitado={saving}
              />
            </ListaInterruptores>
          )}

        </Modal>
      )}

    </div>
  )
}
