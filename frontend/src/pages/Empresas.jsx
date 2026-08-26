import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Empresas.css"

export default function Empresas() {

  const [empresas, setEmpresas] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [modal, setModal] = useState(null)

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

      setEmpresas(
        response.data.Empresas || []
      )

    } catch (error) {

      console.error(error)

      setError(
        error.response?.data?.Mensaje ||
        "No fue posible obtener las empresas"
      )

    } finally {

      setLoading(false)

    }

  }


  // =========================================================
  // ABRIR MODAL CREAR
  // =========================================================

  function abrirCrear() {

    setModal({

      modo: "crear",

      empresaId: null,

      nomEmpresa: "",

      color: "#2563eb",

      activo: true

    })

  }


  // =========================================================
  // ABRIR MODAL EDITAR
  // =========================================================

  function abrirEditar(empresa) {

    setModal({

      modo: "editar",

      empresaId: empresa.empresaId,

      nomEmpresa: empresa.nomEmpresa,

      color: empresa.color || "#2563eb",

      activo: empresa.activo

    })

  }


  // =========================================================
  // CERRAR MODAL
  // =========================================================

  function cerrarModal() {

    if (saving)
      return

    setModal(null)

  }


  // =========================================================
  // CAMBIAR CAMPOS
  // =========================================================

  function handleChange(e) {

    const {
      name,
      value,
      type,
      checked
    } = e.target

    setModal(prev => ({

      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value

    }))

  }


  // =========================================================
  // CREAR EMPRESA
  // =========================================================

  async function crearEmpresa() {

    if (!modal)
      return

    if (!modal.nomEmpresa.trim()) {

      alert(
        "El nombre de la empresa es obligatorio"
      )

      return

    }

    if (!modal.color) {

      alert(
        "El color de la empresa es obligatorio"
      )

      return

    }


    try {

      setSaving(true)

      const data = {

        nomEmpresa:
          modal.nomEmpresa.trim(),

        color:
          modal.color

      }


      const response =
        await api.post(
          "/empresa",
          data
        )


      const empresaId =
        response.data?.EmpresaId


      const nuevaEmpresa = {

        empresaId,

        nomEmpresa:
          data.nomEmpresa,

        color:
          data.color,

        activo: true

      }


      setEmpresas(prev => [

        ...prev,

        nuevaEmpresa

      ])


      setModal(null)


    } catch (error) {

      console.error(error)

      alert(
        error.response?.data?.Mensaje ||
        error.response?.data?.Error ||
        "No fue posible crear la empresa"
      )

    } finally {

      setSaving(false)

    }

  }


  // =========================================================
  // MODIFICAR EMPRESA
  // =========================================================

  async function guardarEmpresa() {

    if (!modal)
      return

    if (!modal.nomEmpresa.trim()) {

      alert(
        "El nombre de la empresa es obligatorio"
      )

      return

    }

    if (!modal.color) {

      alert(
        "El color de la empresa es obligatorio"
      )

      return

    }


    try {

      setSaving(true)

      const data = {

        nomEmpresa:
          modal.nomEmpresa.trim(),

        color:
          modal.color,

        activo:
          modal.activo
            ? 1
            : 0

      }


      await api.put(
        `/empresa/${modal.empresaId}`,
        data
      )


      setEmpresas(prev =>

        prev.map(empresa =>

          empresa.empresaId ===
          modal.empresaId

            ? {

                ...empresa,

                nomEmpresa:
                  data.nomEmpresa,

                color:
                  data.color,

                activo:
                  data.activo === 1

              }

            : empresa

        )

      )


      setModal(null)


    } catch (error) {

      console.error(error)

      alert(
        error.response?.data?.Mensaje ||
        error.response?.data?.Error ||
        "No fue posible actualizar la empresa"
      )

    } finally {

      setSaving(false)

    }

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="empresas-page">

        <div className="empresas-loading">

          <div className="loading-spinner"></div>

          <span>
            Cargando empresas...
          </span>

        </div>

      </div>

    )

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="empresas-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="empresas-header">

        <div>

          <h1>
            Empresas
          </h1>

        </div>


        <button
          className="action-button primary"
          onClick={abrirCrear}
        >

          + Nueva empresa

        </button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="empresas-error">

          {error}

        </div>

      )}


      {/* =====================================================
          TABLA
      ===================================================== */}

      <div className="empresas-card">

        <div className="empresas-table-wrapper">

          <table className="empresas-table">

            <thead>

              <tr>

                <th>
                  Empresa
                </th>

                <th>
                  Color
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Acciones
                </th>

              </tr>

            </thead>


            <tbody>

              {empresas.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="empty-state"
                  >

                    No existen empresas configuradas.

                  </td>

                </tr>

              ) : (

                empresas.map(empresa => (

                  <tr
                    key={empresa.empresaId}
                    className="empresa-row"
                  >

                    {/* EMPRESA */}

                    <td>

                      <div className="empresa-name">

                        <span
                          className="empresa-color-dot"
                          style={{
                            backgroundColor:
                              empresa.color
                          }}
                        />

                        <span>
                          {empresa.nomEmpresa}
                        </span>

                      </div>

                    </td>


                    {/* COLOR */}

                    <td>

                      <div className="color-preview">

                        <span
                          className="color-box"
                          style={{
                            backgroundColor:
                              empresa.color
                          }}
                        />

                        <span>
                          {empresa.color}
                        </span>

                      </div>

                    </td>


                    {/* ESTADO */}

                    <td>

                      <span
                        className={
                          empresa.activo
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >

                        {empresa.activo
                          ? "Activa"
                          : "Inactiva"}

                      </span>

                    </td>


                    {/* ACCIONES */}

                    <td>

                      <div className="empresa-actions">

                        <button
                          className="action-button primary"
                          onClick={() =>
                            abrirEditar(empresa)
                          }
                        >

                          Editar

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          MODAL
      ===================================================== */}

      {modal && (

        <div
          className="modal-overlay"
          onMouseDown={cerrarModal}
        >

          <div
            className="empresa-modal"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="modal-header">

              <div>

                <h2>

                  {modal.modo === "crear"
                    ? "Nueva empresa"
                    : "Editar empresa"}

                </h2>

              </div>


              <button
                className="modal-close"
                onClick={cerrarModal}
                disabled={saving}
              >

                ×

              </button>

            </div>


            {/* BODY */}

            <div className="modal-body">


              {/* NOMBRE */}

              <div className="modal-form-group">

                <label>
                  Nombre de la empresa
                </label>

                <input
                  type="text"
                  name="nomEmpresa"
                  value={
                    modal.nomEmpresa
                  }
                  onChange={handleChange}
                  placeholder="Ej: Empresa ABC"
                  maxLength={100}
                />

              </div>


              {/* COLOR */}

              <div className="modal-form-group">

                <label>
                  Color
                </label>

                <div className="color-input-wrapper">

                  <input
                    type="color"
                    name="color"
                    value={
                      modal.color ||
                      "#2563eb"
                    }
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="color"
                    value={
                      modal.color
                    }
                    onChange={handleChange}
                    placeholder="#2563eb"
                  />

                </div>

              </div>


              {/* ESTADO */}

              {modal.modo === "editar" && (

                <div className="modal-options">

                  <label className="switch-option">

                    <input
                      type="checkbox"
                      name="activo"
                      checked={
                        modal.activo
                      }
                      onChange={handleChange}
                    />

                    <span className="switch"></span>

                    <span>

                      <strong>
                        Empresa activa
                      </strong>

                    </span>

                  </label>

                </div>

              )}

            </div>


            {/* FOOTER */}

            <div className="modal-footer">

              <button
                className="modal-cancel"
                onClick={cerrarModal}
                disabled={saving}
              >

                Cancelar

              </button>


              <button
                className="modal-save"
                onClick={
                  modal.modo === "crear"
                    ? crearEmpresa
                    : guardarEmpresa
                }
                disabled={saving}
              >

                {saving

                  ? "Guardando..."

                  : modal.modo === "crear"
                    ? "Crear empresa"
                    : "Guardar cambios"}

              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  )

}