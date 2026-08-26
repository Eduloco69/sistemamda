import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import useAuth from "../hooks/useAuth";

import "../styles/CreateTicket.css";

export default function CreateTicket() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    const [tipos, setTipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [files, setFiles] = useState([]);

    const [solicitanteTipo, setSolicitanteTipo] = useState("");
    const [usuarioEncontrado, setUsuarioEncontrado] = useState("");

    const [form, setForm] = useState({
        tituloTicket: "",
        ticketDesc: "",
        tipoTicketId: "",
        categoriaId: "",
        subCatId: "",
        prioridadTicketId: "",
        correo: "",
        nombre: "",
        telefono: "",
        tecnicoId: ""
    });

    const esAdmin = hasPermission("CREAR_TICKETS_ADMIN");
    const esTecnico = hasPermission("CREAR_TICKET_TEC");
    const esUsuario = hasPermission("CREAR_TICKETS");

    const modo = esAdmin
        ? "admin"
        : esTecnico
            ? "tecnico"
            : esUsuario
                ? "usuario"
                : null;

    useEffect(() => {
        if (!modo) {
            navigate("/dashboard");
            return;
        }

        loadInitialData();
    }, [modo]);


    async function loadInitialData() {
        try {
            const [tiposRes, categoriasRes] = await Promise.all([
                api.get("/ticket/tipoticket"),
                api.get("/categoria")
            ]);

            setTipos(tiposRes.data.TipoTicket || []);

            const categoriasActivas = (
                categoriasRes.data.Categorias || []
            ).filter(categoria => {
                if (categoria.activo !== true) {
                    return false;
                }

                if (!esAdmin && categoria.adminflg !== true) {
                    return false;
                }

                return true;
            });

            setCategorias(categoriasActivas);

            if (modo === "admin") {
                const tecnicosRes = await api.get("/ticket/tecnico");

                setTecnicos(tecnicosRes.data.Tecnicos || []);
            }
        } catch (error) {
            console.error("Error cargando datos iniciales:", error);
        }
    }

    async function handleCategoria(e) {
        const categoriaId = e.target.value;

        setForm(prev => ({
            ...prev,
            categoriaId,
            subCatId: ""
        }));

        setSubcategorias([]);

        if (!categoriaId) {
            return;
        }

        try {
            const response = await api.get(
                `/categoria/subcategoria/${categoriaId}`
            );

            const SubCatActivas = (
                response.data.Subcategorias || []
            ).filter(subcategoria => {
                if (subcategoria.activo !== true) {
                    return false
                }
                if (!esAdmin && categoria.adminflg !== true) {
                    return false;
                }
8
                return true;
            })

            setSubcategorias(SubCatActivas || []);
        } catch (error) {
            console.error("Error cargando subcategorías:", error);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "correo") {
            setSolicitanteTipo("");
            setUsuarioEncontrado("");
        }
    }

    async function buscarSolicitante() {
        if (!form.correo.trim()) {
            return;
        }

        try {
            const response = await api.get("/ticket/solicitante", {
                params: {
                    correo: form.correo.trim()
                }
            });

            const data = response.data;

            setSolicitanteTipo(data.tipo);

            if (data.tipo === "SOLICITANTE_EXISTENTE") {
                setForm(prev => ({
                    ...prev,
                    nombre: data.nombre || "",
                    telefono: data.telefono || ""
                }));

                return;
            }

            if (data.tipo === "SOLICITANTE_NUEVO") {
                setForm(prev => ({
                    ...prev,
                    nombre: "",
                    telefono: ""
                }));

                return;
            }

            if (data.tipo === "USUARIO") {
                setUsuarioEncontrado(data.nombre || "");

                setForm(prev => ({
                    ...prev,
                    nombre: data.nombre || "",
                    telefono: ""
                }));
            }
        } catch (error) {
            console.error("Error buscando solicitante:", error);
        }
    }

    function handleFiles(e) {
        setFiles(Array.from(e.target.files));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const tipoSeleccionado = tipos.find(
                tipo => tipo.tipoTicketId === Number(form.tipoTicketId)
            );

            const subcategoriaSeleccionada = subcategorias.find(
                sub => sub.subCatId === Number(form.subCatId)
            );

            const formData = new FormData();

            formData.append("tituloTicket", form.tituloTicket);
            formData.append("ticketDesc", form.ticketDesc);
            formData.append("tipoTicket", form.tipoTicketId);
            formData.append("prioridadTicket", form.prioridadTicketId);
            formData.append("subcategoriaTicket", form.subCatId);

            files.forEach(file => {
                formData.append("files", file);
            });

            if (modo === "tecnico") {
                const solicitanteInfo = {
                    correo: form.correo
                };

                if (
                    solicitanteTipo === "SOLICITANTE_EXISTENTE" ||
                    solicitanteTipo === "SOLICITANTE_NUEVO"
                ) {
                    solicitanteInfo.nombre = form.nombre;
                    solicitanteInfo.telefono = form.telefono;
                }

                formData.append(
                    "solicitanteInfo",
                    JSON.stringify(solicitanteInfo)
                );
            }

            if (modo === "admin") {
                formData.append(
                    "usuarioTicketAsignado",
                    form.tecnicoId
                );

                const solicitanteInfo = {
                    correo: form.correo
                };

                if (
                    solicitanteTipo === "SOLICITANTE_EXISTENTE" ||
                    solicitanteTipo === "SOLICITANTE_NUEVO"
                ) {
                    solicitanteInfo.nombre = form.nombre;
                    solicitanteInfo.telefono = form.telefono;
                }

                formData.append(
                    "solicitanteInfo",
                    JSON.stringify(solicitanteInfo)
                );
            }

            const response = await api.post("/ticket", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200) {
                alert(
                    response.data.Mensaje ||
                    "Ticket creado correctamente"
                );

                navigate(`/tickets/${response.data.ticketId}`);
            }
        } catch (error) {
            console.error("Error creando ticket:", error);

            const data = error.response?.data;

            if (data?.Error) {
                const errores = Array.isArray(data.Error)
                    ? data.Error.join("\n")
                    : data.Error;

                alert(
                    data.Mensaje
                        ? `${data.Mensaje}\n\n${errores}`
                        : errores
                );

                return;
            }

            if (data?.Mensaje) {
                alert(data.Mensaje);
                return;
            }

            alert("Ocurrió un error al crear el ticket");
        }
    }

    return (
        <div className="create-ticket-page">
            <div className="create-ticket-card">
                <h1>Crear Ticket</h1>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Título</label>

                        <input
                            type="text"
                            name="tituloTicket"
                            value={form.tituloTicket}
                            onChange={handleChange}
                            maxLength="40"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>

                        <textarea
                            name="ticketDesc"
                            rows="3"
                            placeholder="Describenos tu problema"
                            value={form.ticketDesc}
                            onChange={handleChange}
                            maxLength="250"
                            required
                        />
                    </div>

                    <div className="grid-3">

                        <select
                            name="tipoTicketId"
                            value={form.tipoTicketId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Tipo Ticket
                            </option>

                            {tipos.map(tipo => (
                                <option
                                    key={tipo.tipoTicketId}
                                    value={tipo.tipoTicketId}
                                >
                                    {tipo.tipoTicket}
                                </option>
                            ))}
                        </select>

                        <select
                            name="categoriaId"
                            value={form.categoriaId}
                            onChange={handleCategoria}
                            required
                        >
                            <option value="">
                                Categoría
                            </option>

                            {categorias.map(categoria => (
                                <option
                                    key={categoria.categoriaId}
                                    value={categoria.categoriaId}
                                >
                                    {categoria.categoria}
                                </option>
                            ))}
                        </select>

                        <select
                            name="subCatId"
                            value={form.subCatId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Subcategoría
                            </option>

                            {subcategorias.map(sub => (
                                <option
                                    key={sub.subCatId}
                                    value={sub.subCatId}
                                >
                                    {sub.subCat}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="form-group">
                        <label>Prioridad</label>

                        <select
                            name="prioridadTicketId"
                            value={form.prioridadTicketId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Seleccionar prioridad
                            </option>

                            <option value="1">
                                Baja
                            </option>

                            <option value="2">
                                Media
                            </option>

                            <option value="3">
                                Alta
                            </option>

                            <option value="4">
                                Crítica
                            </option>
                        </select>
                    </div>

                    {(modo === "tecnico" || modo === "admin") && (
                        <>
                            <h3>Solicitante</h3>

                            <div className="grid-1">

                                <input
                                    type="email"
                                    name="correo"
                                    placeholder="Correo electrónico"
                                    value={form.correo}
                                    onChange={handleChange}
                                    onBlur={buscarSolicitante}
                                    required
                                />

                                {solicitanteTipo === "SOLICITANTE_EXISTENTE" && (
                                    <div className="grid-2">

                                        <input
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            required
                                        />

                                        <input
                                            type="text"
                                            name="telefono"
                                            placeholder="Teléfono"
                                            value={form.telefono}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>
                                )}

                                {solicitanteTipo === "SOLICITANTE_NUEVO" && (
                                    <div className="grid-2">

                                        <input
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombre"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            required
                                        />

                                        <input
                                            type="text"
                                            name="telefono"
                                            placeholder="Teléfono"
                                            value={form.telefono}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>
                                )}

                                {solicitanteTipo === "USUARIO" && (
                                    <div className="usuario-info">
                                        Usuario encontrado:&nbsp;
                                        {usuarioEncontrado}
                                    </div>
                                )}

                            </div>
                        </>
                    )}

                    {modo === "admin" && (
                        <div className="form-group">
                            <label>Asignar técnico</label>

                            <select
                                name="tecnicoId"
                                value={form.tecnicoId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Seleccionar técnico
                                </option>

                                {tecnicos.map(tecnico => (
                                    <option
                                        key={tecnico.userId}
                                        value={tecnico.userId}
                                    >
                                        {tecnico.Nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="upload-section">
                        <label>Adjuntar archivos</label>

                        <input
                            type="file"
                            multiple
                            onChange={handleFiles}
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="file-list">
                            {files.map((file, index) => (
                                <div
                                    className="file-item"
                                    key={index}
                                >
                                    <span>{file.name}</span>

                                    <span>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Crear Ticket
                    </button>

                </form>
            </div>
        </div>
    );
}