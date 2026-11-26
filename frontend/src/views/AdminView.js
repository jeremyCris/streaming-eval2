import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNotificaciones } from './hooks/useNotificaciones';

const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3000`;
const BRAND_NAME = 'Streamly';
const CATEGORIAS = ['Película', 'Serie', 'Documental', 'Anime'];

const POSTER_STYLES = [
    { bg: '#2B3140', color: '#B4BAC6' },
    { bg: '#0F2A1C', color: '#7CF0A8' },
    { bg: '#4A1530', color: '#FF9EC4' },
    { bg: '#3A2A1F', color: '#F2C79B' },
    { bg: '#0F3A3A', color: '#9AF0E6' },
];

const BADGE_STYLES = {
    Película: { bg: '#241D45', color: '#D9D2FF' },
    Serie: { bg: '#0F3A3A', color: '#9AF0E6' },
    Documental: { bg: '#3A2A1F', color: '#F2C79B' },
    Anime: { bg: '#4A1530', color: '#FF9EC4' },
};

const posterFor = (titulo = '') => {
    const hash = [...titulo].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return POSTER_STYLES[hash % POSTER_STYLES.length];
};

const ICON_PATHS = {
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    list: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 4v16" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M17 11a3 3 0 1 0 0-6M21.5 20c0-2.6-1.7-4.6-4-5.4" /></>,
    logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
    edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
    trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
};

const Icon = ({ name, size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {ICON_PATHS[name]}
    </svg>
);

const PlayIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
    </svg>
);

const Poster = ({ item }) => {
    const [fallo, setFallo] = useState(false);
    const url = item.url_imagen || item.imagen_url || item.imagen;
    const estilo = posterFor(item.titulo);
    const inicial = (item.titulo || '?').trim().charAt(0).toUpperCase();

    return (
        <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 fw-bold overflow-hidden"
            style={{
                width: '72px',
                height: '104px',
                backgroundColor: estilo.bg,
                color: estilo.color,
                fontSize: '1.75rem',
            }}
        >
            {url && !fallo ? (
                <img
                    src={url}
                    alt={item.titulo || ''}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={() => setFallo(true)}
                />
            ) : (
                inicial
            )}
        </div>
    );
};

const inputDarkStyle = {
    backgroundColor: '#171A22',
    borderColor: '#2A2F3B',
    color: '#F2F3F5',
};

const panelStyle = {
    backgroundColor: '#12141C',
    borderColor: '#232733',
};

const formatHora = (iso) => {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

const AdminView = () => {
    const navigate = useNavigate();

    const {
        notificaciones,
        noLeidas,
        agregarNotificacion,
        marcarLeida,
        marcarTodasLeidas,
        limpiarNotificaciones,
    } = useNotificaciones();

    const [mostrarNotif, setMostrarNotif] = useState(false);
    const [activeTab, setActiveTab] = useState('catalogo');

    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('Película');
    const [imagenUrl, setImagenUrl] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todo');

    const [editandoItem, setEditandoItem] = useState(null);
    const [editTitulo, setEditTitulo] = useState('');
    const [editCategoria, setEditCategoria] = useState('Película');
    const [editImagenUrl, setEditImagenUrl] = useState('');
    const [editDescripcion, setEditDescripcion] = useState('');
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    const [eliminandoItem, setEliminandoItem] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [catalogo, setCatalogo] = useState([]);
    const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
    const [imgError, setImgError] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    const getItemId = (item) => item.id ?? item.id_contenido ?? item._id;

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const cambiarTab = (tab) => {
        setMensaje({ tipo: '', texto: '' });
        setMostrarNotif(false);
        setActiveTab(tab);
    };

    const handleLimpiar = () => {
        setTitulo('');
        setCategoria('Película');
        setImagenUrl('');
        setDescripcion('');
        setImgError(false);
        setMensaje({ tipo: '', texto: '' });
    };

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const cargarCatalogo = async () => {
        setCargandoCatalogo(true);
        try {
            const res = await axios.get(`${API_URL}/api/contenidos`, getAuthHeaders());
            setCatalogo(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            console.error('Error al cargar catálogo:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleLogout();
            }
        } finally {
            setCargandoCatalogo(false);
        }
    };

    const handleEliminar = async () => {
        if (!eliminandoItem) return;
        const id = getItemId(eliminandoItem);
        setEliminando(true);
        try {
            await axios.delete(`${API_URL}/api/contenidos/${id}`, getAuthHeaders());
            setCatalogo((prev) => prev.filter((item) => getItemId(item) !== id));
            setMensaje({ tipo: 'success', texto: 'Contenido eliminado correctamente.' });
        } catch (err) {
            console.error('Error al eliminar contenido:', err);
            setMensaje({
                tipo: 'danger',
                texto: err.response?.data?.error || err.response?.data?.message || 'No se pudo eliminar el contenido.',
            });
        } finally {
            setEliminando(false);
            setEliminandoItem(null);
        }
    };

    const abrirModalEditar = (item) => {
        setEditandoItem(item);
        setEditTitulo(item.titulo || '');
        setEditCategoria(item.categoria || 'Película');
        setEditImagenUrl(item.url_imagen || item.imagen_url || item.imagen || '');
        setEditDescripcion(item.descripcion || '');
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        if (!editandoItem) return;

        const id = getItemId(editandoItem);
        setGuardandoEdicion(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const urlLimpia = editImagenUrl.trim();
            const payload = {
                titulo: editTitulo,
                categoria: editCategoria,
                url_imagen: urlLimpia,
                imagen_url: urlLimpia,
                descripcion: editDescripcion,
            };

            const res = await axios.put(`${API_URL}/api/contenidos/${id}`, payload, getAuthHeaders());
            const actualizado = res.data?.data || res.data || { ...editandoItem, ...payload };

            setCatalogo((prev) =>
                prev.map((item) => (getItemId(item) === id ? { ...item, ...actualizado } : item))
            );
            setEditandoItem(null);
            setMensaje({ tipo: 'success', texto: 'Contenido actualizado correctamente.' });
        } catch (err) {
            console.error('Error al editar contenido:', err);
            setMensaje({
                tipo: 'danger',
                texto: err.response?.data?.error || err.response?.data?.message || 'No se pudo actualizar el contenido.',
            });
        } finally {
            setGuardandoEdicion(false);
        }
    };

const handlePublicar = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });
        setLoading(true);

        try {
            const urlLimpia = imagenUrl.trim();
            const res = await axios.post(
                `${API_URL}/api/contenidos`,
                {
                    titulo,
                    categoria,
                    url_imagen: urlLimpia,
                    imagen_url: urlLimpia,
                    descripcion,
                },
                getAuthHeaders()
            );

            try {
                const creado = res?.data?.data || res?.data || {};
                const tituloPublicado = creado.titulo || titulo;
                const categoriaPublicada = creado.categoria || categoria;

                agregarNotificacion({
                    titulo: tituloPublicado,
                    categoria: categoriaPublicada,
                    mensaje: `Se publicó «${tituloPublicado}» (${categoriaPublicada}) en el catálogo.`,
                    tipo: 'publicacion',
                });
            } catch (notifErr) {
                console.error('Error al registrar notificación local:', notifErr);
            }

            setMensaje({ tipo: 'success', texto: 'Contenido publicado correctamente en el catálogo.' });
            setTitulo('');
            setCategoria('Película');
            setImagenUrl('');
            setDescripcion('');
            setImgError(false);
        } catch (err) {
            console.error('Error al publicar contenido:', err);
            setMensaje({
                tipo: 'danger',
                texto:
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    'No se pudo publicar el contenido. Revisa la conexión o el token.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'catalogo') {
            cargarCatalogo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        if (!editandoItem && !eliminandoItem) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setEditandoItem(null);
                setEliminandoItem(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [editandoItem, eliminandoItem]);

    useEffect(() => {
        if (!mensaje.texto) return undefined;
        const t = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
        return () => clearTimeout(t);
    }, [mensaje]);

    const catalogoFiltrado = useMemo(() => {
        return catalogo.filter((item) => {
            const t = (item.titulo || '').toLowerCase();
            const c = item.categoria || 'Película';
            const q = busqueda.trim().toLowerCase();

            const coincideTexto = !q || t.includes(q);
            if (filtroTipo === 'Todo') return coincideTexto;
            return coincideTexto && c === filtroTipo;
        });
    }, [catalogo, busqueda, filtroTipo]);

    const badgeDe = (cat) => BADGE_STYLES[cat] || BADGE_STYLES['Película'];

    return (
        <div
            className="d-flex flex-column flex-lg-row min-vh-100 text-light"
            style={{ backgroundColor: '#0B0D12' }}
        >
            {/* Barra lateral */}
            <aside
                className="p-3 p-lg-4 border-bottom border-lg-bottom-0 border-lg-end flex-shrink-0"
                style={{
                    width: '260px',
                    maxWidth: '100%',
                    backgroundColor: '#12141C',
                    borderColor: '#232733',
                }}
            >
                <div className="d-flex align-items-center gap-2 px-2 mb-3 mb-lg-4">
                    <span
                        className="d-inline-flex align-items-center justify-content-center rounded-3 text-white"
                        style={{ width: '32px', height: '32px', backgroundColor: '#6A46FF' }}
                    >
                        <PlayIcon />
                    </span>
                    <span className="fw-bold fs-4">{BRAND_NAME}</span>
                </div>

                <nav className="nav flex-row flex-lg-column gap-2 overflow-auto" aria-label="Administración">
                    <button
                        type="button"
                        onClick={() => cambiarTab('agregar')}
                        aria-current={activeTab === 'agregar' ? 'page' : undefined}
                        className="btn text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-0 text-nowrap"
                        style={{
                            backgroundColor: activeTab === 'agregar' ? '#241D45' : 'transparent',
                            color: activeTab === 'agregar' ? '#D9D2FF' : '#B4BAC6',
                        }}
                    >
                        <Icon name="plus" />
                        <span>Agregar contenido</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => cambiarTab('catalogo')}
                        aria-current={activeTab === 'catalogo' ? 'page' : undefined}
                        className="btn text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-0 text-nowrap"
                        style={{
                            backgroundColor: activeTab === 'catalogo' ? '#241D45' : 'transparent',
                            color: activeTab === 'catalogo' ? '#D9D2FF' : '#B4BAC6',
                        }}
                    >
                        <Icon name="list" />
                        <span>Contenido publicado</span>
                    </button>

                    <button
                        type="button"
                        disabled
                        className="btn text-start d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-0 text-nowrap"
                        style={{ color: '#6B7280' }}
                    >
                        <Icon name="users" />
                        <span>Usuarios</span>
                    </button>
                </nav>
            </aside>

            {/* Contenido principal */}
            <main className="flex-grow-1 p-4 p-lg-5">
                <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 className="fw-bold mb-1">Panel de administración</h1>
                        <p className="text-secondary mb-0">
                            {activeTab === 'agregar'
                                ? `Agrega nuevo contenido al catálogo de ${BRAND_NAME}.`
                                : `Administra el catálogo publicado en ${BRAND_NAME}.`}
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-2 position-relative">
                        <button
                            type="button"
                            onClick={() => setMostrarNotif((prev) => !prev)}
                            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                            style={{
                                backgroundColor: mostrarNotif ? '#241D45' : '#171A22',
                                borderColor: '#2A2F3B',
                                color: '#F2F3F5',
                            }}
                        >
                            <Icon name="bell" />
                            <span>Notificaciones</span>
                            {noLeidas > 0 && (
                                <span
                                    className="badge rounded-pill"
                                    style={{ backgroundColor: '#6A46FF', color: '#FFFFFF' }}
                                >
                                    {noLeidas}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: '#5A2A33',
                                color: '#FF9A9A',
                            }}
                        >
                            <Icon name="logout" />
                            <span>Cerrar sesión</span>
                        </button>

                        {mostrarNotif && (
                            <div
                                className="card rounded-4 p-3 text-light shadow-lg"
                                style={{
                                    ...panelStyle,
                                    border: '1px solid #2A2F3B',
                                    width: '340px',
                                    maxWidth: '92vw',
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    zIndex: 1050,
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-between pb-2 mb-2" style={{ borderBottom: '1px solid #232733' }}>
                                    <span className="fw-semibold small">Notificaciones de publicación</span>
                                    <div className="d-flex gap-2">
                                        {noLeidas > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm p-0 text-decoration-none"
                                                style={{ color: '#D9D2FF' }}
                                                onClick={marcarTodasLeidas}
                                            >
                                                Marcar leídas
                                            </button>
                                        )}
                                        {notificaciones.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm p-0 text-decoration-none text-secondary"
                                                onClick={limpiarNotificaciones}
                                            >
                                                Limpiar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {notificaciones.length === 0 ? (
                                    <p className="text-secondary small mb-0 py-3 text-center">
                                        Aún no hay publicaciones registradas.
                                    </p>
                                ) : (
                                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                        {notificaciones.map((n) => (
                                            <div
                                                key={n.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => marcarLeida(n.id)}
                                                onKeyDown={(e) => e.key === 'Enter' && marcarLeida(n.id)}
                                                className="p-2 rounded-3"
                                                style={{
                                                    backgroundColor: n.leida ? '#171A22' : '#1E1A33',
                                                    border: '1px solid #2A2F3B',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                                                    <span className="fw-semibold small text-truncate">{n.titulo}</span>
                                                    <small className="text-secondary text-nowrap">{formatHora(n.fecha)}</small>
                                                </div>
                                                <p className="text-secondary small mb-0">{n.mensaje}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo} rounded-3 mb-4`} role="alert">
                        {mensaje.texto}
                    </div>
                )}

                {activeTab === 'agregar' ? (
                    <div className="row g-4 align-items-start">
                        {/* Formulario */}
                        <div className="col-12 col-xl-7">
                            <section
                                className="card rounded-4 p-4 text-light"
                                style={panelStyle}
                                aria-labelledby="form-title"
                            >
                                <h2 id="form-title" className="h4 fw-bold mb-4">Nuevo contenido</h2>

                                <form onSubmit={handlePublicar}>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="titulo">Título</label>
                                        <input
                                            id="titulo"
                                            type="text"
                                            className="form-control rounded-3 py-2 px-3"
                                            style={inputDarkStyle}
                                            placeholder="Ej: Nombre de la película o serie"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="categoria">Categoría</label>
                                        <select
                                            id="categoria"
                                            className="form-select rounded-3 py-2 px-3"
                                            style={inputDarkStyle}
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                        >
                                            {CATEGORIAS.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="imagen">URL de imagen / carátula</label>
                                        <input
                                            id="imagen"
                                            type="url"
                                            className="form-control rounded-3 py-2 px-3"
                                            style={inputDarkStyle}
                                            placeholder="https://ejemplo.com/imagen.jpg (opcional, se autocompleta)"
                                            value={imagenUrl}
                                            onChange={(e) => {
                                                setImagenUrl(e.target.value);
                                                setImgError(false);
                                            }}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label" htmlFor="descripcion">Descripción</label>
                                        <textarea
                                            id="descripcion"
                                            rows="5"
                                            className="form-control rounded-3 py-2 px-3"
                                            style={inputDarkStyle}
                                            placeholder="Escribe una sinopsis breve (opcional, se autocompleta)"
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn px-4 py-2 rounded-3 text-light"
                                            style={{ borderColor: '#2A2F3B', backgroundColor: 'transparent' }}
                                            onClick={handleLimpiar}
                                        >
                                            Limpiar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn px-4 py-2 rounded-3 fw-semibold text-white"
                                            style={{ backgroundColor: '#6A46FF', borderColor: '#6A46FF' }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Publicando...' : 'Publicar contenido'}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>

                        {/* Vista previa */}
                        <div className="col-12 col-xl-5">
                            <aside
                                className="card rounded-4 p-4 text-light"
                                style={panelStyle}
                                aria-label="Vista previa"
                            >
                                <h2 className="h4 fw-bold mb-3">Vista previa</h2>

                                <div
                                    className="rounded-4 d-flex flex-column align-items-center justify-content-center text-secondary overflow-hidden mb-3"
                                    style={{
                                        aspectRatio: '2 / 3',
                                        backgroundColor: '#171A22',
                                        border: '1px dashed #3A4050',
                                    }}
                                >
                                    {imagenUrl && !imgError ? (
                                        <img
                                            src={imagenUrl}
                                            alt={titulo || 'Vista previa'}
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover' }}
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="text-center p-3">
                                            <div className="mb-2"><Icon name="image" size={32} /></div>
                                            <small>La carátula aparecerá aquí</small>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span
                                        className="badge rounded-pill px-3 py-2 mb-2"
                                        style={{ backgroundColor: badgeDe(categoria).bg, color: badgeDe(categoria).color }}
                                    >
                                        {categoria}
                                    </span>
                                    <h3 className="h5 fw-semibold mt-1 mb-1">
                                        {titulo.trim() || 'Título del contenido'}
                                    </h3>
                                    <p className="text-secondary small mb-0">
                                        {descripcion.trim() ||
                                            'La descripción se mostrará aquí tal como la verán tus usuarios.'}
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                            <div className="d-flex align-items-center gap-2">
                                <h2 className="h4 fw-bold mb-0">Contenido publicado</h2>
                                <span
                                    className="badge rounded-pill px-3 py-2"
                                    style={{ backgroundColor: '#1A1D27', color: '#B4BAC6' }}
                                >
                                    {catalogoFiltrado.length} {catalogoFiltrado.length === 1 ? 'título' : 'títulos'}
                                </span>
                            </div>

                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <div className="position-relative" style={{ width: '240px' }}>
                                    <span
                                        className="position-absolute top-50 translate-middle-y ms-3 text-secondary"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <Icon name="search" size={16} />
                                    </span>
                                    <input
                                        type="search"
                                        className="form-control rounded-3 ps-5"
                                        style={inputDarkStyle}
                                        aria-label="Buscar contenido"
                                        placeholder="Buscar título"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>

                                <div className="btn-group flex-wrap" role="group" aria-label="Filtrar por categoría">
                                    {[
                                        { label: 'Todo', value: 'Todo' },
                                        { label: 'Películas', value: 'Película' },
                                        { label: 'Series', value: 'Serie' },
                                        { label: 'Documentales', value: 'Documental' },
                                        { label: 'Anime', value: 'Anime' },
                                    ].map((btn) => {
                                        const activo = filtroTipo === btn.value;
                                        return (
                                            <button
                                                key={btn.value}
                                                type="button"
                                                className="btn btn-sm px-3 py-2"
                                                aria-pressed={activo}
                                                onClick={() => setFiltroTipo(btn.value)}
                                                style={{
                                                    backgroundColor: activo ? '#F2F3F5' : 'transparent',
                                                    color: activo ? '#0B0D12' : '#D6D9E0',
                                                    borderColor: '#2A2F3B',
                                                }}
                                            >
                                                {btn.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {cargandoCatalogo ? (
                            <p className="text-secondary">Cargando catálogo...</p>
                        ) : catalogoFiltrado.length === 0 ? (
                            <div
                                className="rounded-4 p-5 text-center text-secondary"
                                style={{ border: '1px dashed #2A2F3B' }}
                            >
                                No hay contenido que coincida. Agrega un título nuevo o cambia el filtro.
                            </div>
                        ) : (
                            <div className="row g-3">
                                {catalogoFiltrado.map((item, idx) => {
                                    const id = getItemId(item);
                                    const badge = badgeDe(item.categoria);

                                    return (
                                        <div key={id ?? idx} className="col-12 col-md-6 col-xl-4">
                                            <article
                                                className="card h-100 rounded-4 overflow-hidden text-light"
                                                style={panelStyle}
                                            >
                                                <div className="card-body d-flex gap-3 p-3">
                                                    <Poster item={item} />
                                                    <div className="min-w-0 flex-grow-1">
                                                        <span
                                                            className="badge rounded-pill px-2 py-1 mb-1"
                                                            style={{ backgroundColor: badge.bg, color: badge.color }}
                                                        >
                                                            {item.categoria || 'Película'}
                                                        </span>
                                                        <h3 className="h6 fw-semibold text-truncate mt-1 mb-1">
                                                            {item.titulo}
                                                        </h3>
                                                        <p className="text-secondary small mb-0">
                                                            {item.descripcion}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div
                                                    className="card-footer p-0 d-flex"
                                                    style={{ backgroundColor: 'transparent', borderColor: '#232733' }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="btn w-50 py-2 rounded-0 d-flex align-items-center justify-content-center gap-2 border-0"
                                                        style={{
                                                            color: '#D9D2FF',
                                                            borderRight: '1px solid #232733',
                                                        }}
                                                        aria-label={`Editar ${item.titulo}`}
                                                        onClick={() => abrirModalEditar(item)}
                                                    >
                                                        <Icon name="edit" size={16} />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn w-50 py-2 rounded-0 d-flex align-items-center justify-content-center gap-2 border-0"
                                                        style={{ color: '#FF9A9A' }}
                                                        aria-label={`Eliminar ${item.titulo}`}
                                                        onClick={() => setEliminandoItem(item)}
                                                    >
                                                        <Icon name="trash" size={16} />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </article>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal: editar contenido */}
            {editandoItem && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
                    onClick={() => setEditandoItem(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 text-light" style={{ ...panelStyle, border: '1px solid #2A2F3B' }}>
                            <div className="modal-header" style={{ borderColor: '#232733' }}>
                                <div>
                                    <h2 className="modal-title h5 fw-bold mb-1">Editar contenido</h2>
                                    <p className="text-secondary small mb-0">
                                        Modifica los datos y guarda para actualizar el catálogo.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm text-secondary border-0"
                                    aria-label="Cerrar"
                                    onClick={() => setEditandoItem(null)}
                                >
                                    <Icon name="close" size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleGuardarEdicion}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="e-titulo">Título</label>
                                        <input
                                            id="e-titulo"
                                            type="text"
                                            className="form-control rounded-3"
                                            style={inputDarkStyle}
                                            value={editTitulo}
                                            onChange={(e) => setEditTitulo(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="e-cat">Categoría</label>
                                        <select
                                            id="e-cat"
                                            className="form-select rounded-3"
                                            style={inputDarkStyle}
                                            value={editCategoria}
                                            onChange={(e) => setEditCategoria(e.target.value)}
                                        >
                                            {CATEGORIAS.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="e-img">URL de imagen / carátula</label>
                                        <input
                                            id="e-img"
                                            type="url"
                                            className="form-control rounded-3"
                                            style={inputDarkStyle}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            value={editImagenUrl}
                                            onChange={(e) => setEditImagenUrl(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label" htmlFor="e-desc">Descripción</label>
                                        <textarea
                                            id="e-desc"
                                            rows="4"
                                            className="form-control rounded-3"
                                            style={inputDarkStyle}
                                            value={editDescripcion}
                                            onChange={(e) => setEditDescripcion(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ borderColor: '#232733' }}>
                                    <button
                                        type="button"
                                        className="btn px-3 py-2 rounded-3 text-light"
                                        style={{ borderColor: '#2A2F3B', backgroundColor: 'transparent' }}
                                        onClick={() => setEditandoItem(null)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn px-4 py-2 rounded-3 fw-semibold text-white"
                                        style={{ backgroundColor: '#6A46FF', borderColor: '#6A46FF' }}
                                        disabled={guardandoEdicion}
                                    >
                                        {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: confirmar eliminación */}
            {eliminandoItem && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
                    onClick={() => !eliminando && setEliminandoItem(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="modal-content rounded-4 p-4 text-center text-light"
                            role="alertdialog"
                            aria-modal="true"
                            style={{ ...panelStyle, border: '1px solid #2A2F3B' }}
                        >
                            <div
                                className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: '#3A1A20',
                                    color: '#FF9A9A',
                                }}
                            >
                                <Icon name="trash" size={28} />
                            </div>

                            <h2 className="h4 fw-bold mb-2">
                                ¿Eliminar «{eliminandoItem.titulo}»?
                            </h2>
                            <p className="text-secondary mb-4">
                                Este título dejará de aparecer en el catálogo de tus suscriptores. Esta acción no se
                                puede deshacer.
                            </p>

                            <div className="row g-2">
                                <div className="col-6">
                                    <button
                                        type="button"
                                        className="btn w-100 py-2 rounded-3 text-light"
                                        style={{ borderColor: '#2A2F3B', backgroundColor: 'transparent' }}
                                        disabled={eliminando}
                                        onClick={() => setEliminandoItem(null)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button
                                        type="button"
                                        className="btn btn-danger w-100 py-2 rounded-3 fw-semibold"
                                        disabled={eliminando}
                                        onClick={handleEliminar}
                                    >
                                        {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;