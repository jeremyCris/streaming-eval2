import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNotificaciones } from './hooks/useNotificaciones';

const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3000`;
const BRAND_NAME = 'Streamly';

const formatHora = (iso) => {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

const SubscriberView = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todo'); // 'Todo' | 'Película' | 'Serie'
    const [seccionActiva, setSeccionActiva] = useState('Inicio');
    const [mostrarNotif, setMostrarNotif] = useState(false);
    const [miListaIds, setMiListaIds] = useState(() => {
        try {
            const guardados = localStorage.getItem('streamly_mi_lista');
            return guardados ? JSON.parse(guardados) : [];
        } catch {
            return [];
        }
    });

    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [reproduciendo, setReproduciendo] = useState(false);

    const {
        notificaciones,
        noLeidas,
        marcarLeida,
        marcarTodasLeidas,
        limpiarNotificaciones,
    } = useNotificaciones(items);

    const getImagen = (item) => item?.url_imagen || item?.imagen_url || item?.imagen || '';

    const obtenerCatalogo = useCallback(async (silencioso = false) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!silencioso) {
            setLoading(true);
            setError('');
        }
        try {
            const res = await axios.get(`${API_URL}/api/contenidos`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const lista = Array.isArray(res.data) ? res.data : res.data.data || [];
            setItems(lista);
            setError('');
        } catch (err) {
            console.error('Error cargando catálogo desde API:', err);
            if (!silencioso) {
                setItems([]);
                setError('No se pudo cargar el catálogo desde el servidor. Verifica que el backend esté activo.');
            }
        } finally {
            if (!silencioso) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        obtenerCatalogo(false);
        const intervalo = setInterval(() => {
            obtenerCatalogo(true);
        }, 10000);
        return () => clearInterval(intervalo);
    }, [obtenerCatalogo]);

    useEffect(() => {
        localStorage.setItem('streamly_mi_lista', JSON.stringify(miListaIds));
    }, [miListaIds]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const toggleMiLista = (id) => {
        setMiListaIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleNavClick = (seccion) => {
        setSeccionActiva(seccion);
        setMostrarNotif(false);
        if (seccion === 'Películas') {
            setFiltroTipo('Película');
        } else if (seccion === 'Series') {
            setFiltroTipo('Serie');
        } else {
            setFiltroTipo('Todo');
        }
    };

    const itemDestacado = useMemo(() => {
        if (items.length === 0) return null;
        return items.find((i) => i.destacado) || items[0];
    }, [items]);

    const itemsFiltrados = useMemo(() => {
        return items.filter((item) => {
            const titulo = (item.titulo || '').toLowerCase();
            const descripcion = (item.descripcion || '').toLowerCase();
            const categoria = (item.categoria || 'Película').toLowerCase();
            const query = busqueda.trim().toLowerCase();

            const coincideBusqueda = !query || titulo.includes(query) || descripcion.includes(query);

            if (seccionActiva === 'Mi lista') {
                return coincideBusqueda && miListaIds.includes(item.id);
            }

            if (filtroTipo === 'Película') {
                return coincideBusqueda && categoria.includes('pel');
            }

            if (filtroTipo === 'Serie') {
                return coincideBusqueda && categoria.includes('ser');
            }

            return coincideBusqueda;
        });
    }, [items, busqueda, filtroTipo, seccionActiva, miListaIds]);

    const abrirReproductor = (item) => {
        setItemSeleccionado(item);
        setReproduciendo(true);
    };

    const abrirDetalles = (item) => {
        setItemSeleccionado(item);
        setReproduciendo(false);
    };

    const handleClickNotificacion = (notif) => {
        marcarLeida(notif.id);
        setMostrarNotif(false);
        if (notif.item) {
            abrirDetalles(notif.item);
        }
    };

    const destacadoImg = getImagen(itemDestacado);
    const destacadoAccent = itemDestacado?.accent || '#141620';

    return (
        <div className="min-vh-100 text-white" style={{ backgroundColor: '#0c0d12' }}>
            {/* Navbar superior */}
            <header
                className="sticky-top px-3 px-lg-5 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
                style={{
                    backgroundColor: '#0f1017',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
            >
                <div className="d-flex align-items-center gap-4 flex-wrap">
                    <button
                        type="button"
                        onClick={() => handleNavClick('Inicio')}
                        className="btn p-0 d-flex align-items-center gap-2 text-white text-decoration-none border-0 bg-transparent"
                    >
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded-3"
                            style={{ width: '32px', height: '32px', backgroundColor: '#6c47ff' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
                            </svg>
                        </span>
                        <span className="fw-bold fs-5">{BRAND_NAME}</span>
                    </button>

                    <nav className="d-flex align-items-center gap-2">
                        {['Inicio', 'Películas', 'Series', 'Mi lista'].map((tab) => {
                            const activa = seccionActiva === tab;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => handleNavClick(tab)}
                                    className="btn btn-sm px-3 py-1 rounded-3 fw-medium"
                                    style={{
                                        backgroundColor: activa ? '#232533' : 'transparent',
                                        color: activa ? '#ffffff' : '#9ca3af',
                                        border: 'none',
                                    }}
                                >
                                    {tab}
                                    {tab === 'Mi lista' && miListaIds.length > 0 && (
                                        <span
                                            className="badge rounded-pill ms-2"
                                            style={{ backgroundColor: '#6c47ff', fontSize: '0.7rem' }}
                                        >
                                            {miListaIds.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="d-flex align-items-center gap-2 gap-sm-3 position-relative">
                    <div className="position-relative" style={{ width: '210px' }}>
                        <input
                            type="text"
                            className="form-control form-control-sm text-white rounded-3 pe-4"
                            style={{
                                backgroundColor: '#181a24',
                                border: '1px solid #282c3d',
                                paddingLeft: '12px',
                            }}
                            placeholder="Buscar títulos..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button
                                type="button"
                                onClick={() => setBusqueda('')}
                                aria-label="Limpiar búsqueda"
                                className="btn btn-sm p-0 text-secondary position-absolute top-50 end-0 translate-middle-y me-2 border-0"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMostrarNotif((prev) => !prev)}
                        className="btn btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                        style={{
                            backgroundColor: mostrarNotif ? '#241d45' : '#161822',
                            border: '1px solid #282c3d',
                            color: '#e5e7eb',
                        }}
                    >
                        <span>Notificaciones</span>
                        {noLeidas > 0 && (
                            <span
                                className="badge rounded-pill"
                                style={{ backgroundColor: '#6c47ff', color: '#ffffff' }}
                            >
                                {noLeidas}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => obtenerCatalogo(false)}
                        className="btn btn-sm px-3 py-2 rounded-3"
                        style={{
                            backgroundColor: '#161822',
                            border: '1px solid #282c3d',
                            color: '#d1d5db',
                        }}
                    >
                        Actualizar
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn btn-sm px-3 py-2 rounded-3"
                        style={{
                            backgroundColor: '#161822',
                            border: '1px solid #282c3d',
                            color: '#e5e7eb',
                        }}
                    >
                        Cerrar sesión
                    </button>

                    {mostrarNotif && (
                        <div
                            className="rounded-4 p-3 text-white shadow-lg"
                            style={{
                                backgroundColor: '#12131a',
                                border: '1px solid #282c3d',
                                width: '340px',
                                maxWidth: '92vw',
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                zIndex: 1060,
                            }}
                        >
                            <div
                                className="d-flex justify-content-between align-items-center pb-2 mb-2"
                                style={{ borderBottom: '1px solid #222638' }}
                            >
                                <span className="fw-semibold small">Nuevas publicaciones</span>
                                <div className="d-flex gap-2">
                                    {noLeidas > 0 && (
                                        <button
                                            type="button"
                                            onClick={marcarTodasLeidas}
                                            className="btn btn-link btn-sm p-0 text-decoration-none"
                                            style={{ color: '#a78bfa' }}
                                        >
                                            Marcar leídas
                                        </button>
                                    )}
                                    {notificaciones.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={limpiarNotificaciones}
                                            className="btn btn-link btn-sm p-0 text-decoration-none text-secondary"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {notificaciones.length === 0 ? (
                                <p className="text-secondary small mb-0 py-3 text-center">
                                    No hay notificaciones por ahora.
                                </p>
                            ) : (
                                <div
                                    className="d-flex flex-column gap-2"
                                    style={{ maxHeight: '280px', overflowY: 'auto' }}
                                >
                                    {notificaciones.map((notif) => (
                                        <div
                                            key={notif.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleClickNotificacion(notif)}
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' && handleClickNotificacion(notif)
                                            }
                                            className="p-2 rounded-3"
                                            style={{
                                                backgroundColor: notif.leida ? '#171a22' : '#1e1a33',
                                                border: '1px solid #282c3d',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                                                <span className="fw-semibold small text-truncate">
                                                    {notif.titulo}
                                                </span>
                                                <small className="text-secondary text-nowrap">
                                                    {formatHora(notif.fecha)}
                                                </small>
                                            </div>
                                            <p className="text-secondary small mb-0">{notif.mensaje}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="px-3 px-lg-5 py-4">
                {error && (
                    <div className="alert alert-warning py-2 small mb-4" role="alert">
                        {error}
                    </div>
                )}

                {/* Banner destacado */}
                {itemDestacado && seccionActiva === 'Inicio' && !busqueda && (
                    <section
                        className="rounded-4 p-4 p-lg-5 mb-5 position-relative overflow-hidden d-flex align-items-center"
                        style={{
                            backgroundColor: destacadoAccent,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            minHeight: '300px',
                        }}
                    >
                        {destacadoImg && (
                            <img
                                src={destacadoImg}
                                alt={itemDestacado.titulo}
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: '50% 15%',
                                    opacity: 0.9,
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}

                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                background:
                                    'linear-gradient(90deg, rgba(12, 13, 18, 0.92) 0%, rgba(12, 13, 18, 0.68) 48%, rgba(12, 13, 18, 0.22) 100%)',
                                zIndex: 1,
                            }}
                        />

                        <div className="position-relative" style={{ maxWidth: '540px', zIndex: 2 }}>
                            <span
                                className="badge rounded-pill px-3 py-2 mb-3"
                                style={{
                                    backgroundColor: 'rgba(12, 13, 18, 0.8)',
                                    color: '#e5e7eb',
                                    border: '1px solid rgba(255,255,255,0.14)',
                                }}
                            >
                                {itemDestacado.categoria || 'Película'} · Destacado
                            </span>

                            <h1 className="display-5 fw-bold mb-2">{itemDestacado.titulo}</h1>
                            <p className="text-light mb-4" style={{ opacity: 0.9 }}>
                                {itemDestacado.descripcion}
                            </p>

                            <div className="d-flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => abrirReproductor(itemDestacado)}
                                    className="btn px-4 py-2 fw-semibold rounded-3"
                                    style={{ backgroundColor: '#ffffff', color: '#0c0d12' }}
                                >
                                    Ver ahora
                                </button>

                                <button
                                    type="button"
                                    onClick={() => abrirDetalles(itemDestacado)}
                                    className="btn px-4 py-2 fw-medium rounded-3 text-white"
                                    style={{
                                        backgroundColor: 'rgba(18, 20, 28, 0.75)',
                                        border: '1px solid rgba(255, 255, 255, 0.22)',
                                    }}
                                >
                                    Más información
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Encabezado del catálogo y filtros */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <h3 className="fw-bold mb-0">
                            {seccionActiva === 'Mi lista' ? 'Mi lista' : 'Catálogo de transmisión'}
                        </h3>
                        {!loading && (
                            <span className="small text-secondary">
                                ({itemsFiltrados.length} {itemsFiltrados.length === 1 ? 'título' : 'títulos'})
                            </span>
                        )}
                    </div>

                    {seccionActiva !== 'Mi lista' && (
                        <div
                            className="d-inline-flex p-1 rounded-3"
                            style={{ backgroundColor: '#141620', border: '1px solid #222638' }}
                        >
                            {[
                                { label: 'Todo', value: 'Todo' },
                                { label: 'Películas', value: 'Película' },
                                { label: 'Series', value: 'Serie' },
                            ].map((btn) => {
                                const activo = filtroTipo === btn.value;
                                return (
                                    <button
                                        key={btn.value}
                                        type="button"
                                        onClick={() => setFiltroTipo(btn.value)}
                                        className="btn btn-sm px-3 py-1 rounded-3 fw-medium"
                                        style={{
                                            backgroundColor: activo ? '#ffffff' : 'transparent',
                                            color: activo ? '#0c0d12' : '#9ca3af',
                                            border: 'none',
                                        }}
                                    >
                                        {btn.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Cuadrícula de contenido */}
                {loading ? (
                    <div className="text-center py-5 text-secondary">Cargando catálogo...</div>
                ) : itemsFiltrados.length === 0 ? (
                    <div
                        className="p-5 rounded-4 text-center text-secondary"
                        style={{ backgroundColor: '#12131a', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        No hay títulos publicados o no coinciden con el filtro.
                    </div>
                ) : (
                    <div className="row g-4">
                        {itemsFiltrados.map((item, idx) => {
                            const bgCard = item.accent || ['#143d24', '#4a1732', '#4a2e16', '#251e45'][idx % 4];
                            const enLista = miListaIds.includes(item.id);
                            const esSerie = (item.categoria || '').toLowerCase().includes('ser');
                            const imgSrc = getImagen(item);

                            return (
                                <div key={item.id || idx} className="col-12 col-md-6 col-lg-4">
                                    <div
                                        className="h-100 rounded-4 overflow-hidden d-flex flex-column"
                                        style={{
                                            backgroundColor: '#12131a',
                                            border: '1px solid rgba(255, 255, 255, 0.06)',
                                        }}
                                    >
                                        {/* Portada superior */}
                                        <div
                                            onClick={() => abrirReproductor(item)}
                                            className="position-relative d-flex align-items-end p-4 overflow-hidden"
                                            style={{
                                                height: '220px',
                                                backgroundColor: bgCard,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {imgSrc && (
                                                <img
                                                    src={imgSrc}
                                                    alt={item.titulo}
                                                    className="position-absolute top-0 start-0 w-100 h-100"
                                                    style={{
                                                        objectFit: 'cover',
                                                        objectPosition: '50% 15%',
                                                        opacity: 0.85,
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            )}

                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100"
                                                style={{
                                                    background:
                                                        'linear-gradient(180deg, rgba(12,13,18,0.15) 0%, rgba(12,13,18,0.82) 100%)',
                                                    zIndex: 1,
                                                }}
                                            />

                                            <button
                                                type="button"
                                                aria-label={`Reproducir ${item.titulo}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    abrirReproductor(item);
                                                }}
                                                className="btn btn-sm rounded-3 position-absolute top-0 end-0 m-3"
                                                style={{
                                                    backgroundColor: 'rgba(12, 13, 18, 0.8)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    color: '#ffffff',
                                                    zIndex: 2,
                                                }}
                                            >
                                                Ver
                                            </button>

                                            <h3
                                                className="fw-bold mb-0 position-relative text-white"
                                                style={{
                                                    zIndex: 2,
                                                    fontSize: '1.5rem',
                                                    lineHeight: 1.15,
                                                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                                                }}
                                            >
                                                {item.titulo}
                                            </h3>
                                        </div>

                                        {/* Información inferior */}
                                        <div className="p-4 d-flex flex-column flex-grow-1 justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span
                                                        className="badge rounded-pill px-3 py-1"
                                                        style={{
                                                            backgroundColor: esSerie ? '#3b2516' : '#251e45',
                                                            color: esSerie ? '#fdba74' : '#b8a6ff',
                                                        }}
                                                    >
                                                        {item.categoria || 'Película'}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleMiLista(item.id)}
                                                        className="btn btn-sm py-0 px-2"
                                                        style={{
                                                            color: enLista ? '#a78bfa' : '#9ca3af',
                                                            border: 'none',
                                                        }}
                                                    >
                                                        {enLista ? 'En mi lista' : '+ Mi lista'}
                                                    </button>
                                                </div>

                                                <h5 className="fw-bold mb-1">{item.titulo}</h5>
                                                <p className="text-secondary small mb-0">{item.descripcion}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal de reproducción / información */}
            {itemSeleccionado && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)', zIndex: 1050 }}
                    onClick={() => setItemSeleccionado(null)}
                >
                    <div
                        className="rounded-4 p-4 w-100 text-white"
                        style={{
                            maxWidth: '540px',
                            backgroundColor: '#12131a',
                            border: '1px solid #282c3d',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <span
                                    className="badge rounded-pill px-3 py-1 mb-2"
                                    style={{ backgroundColor: '#251e45', color: '#b8a6ff' }}
                                >
                                    {itemSeleccionado.categoria || 'Película'}
                                </span>
                                <h4 className="fw-bold mb-0">{itemSeleccionado.titulo}</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setItemSeleccionado(null)}
                                className="btn btn-sm text-secondary border-0"
                            >
                                Cerrar
                            </button>
                        </div>

                        {reproduciendo ? (
                            <div
                                className="rounded-4 d-flex flex-column align-items-center justify-content-center text-center p-4 mb-3"
                                style={{ height: '210px', backgroundColor: '#090a0f', border: '1px solid #1f2230' }}
                            >
                                <div className="fs-4 fw-semibold mb-2" style={{ color: '#8b6eff' }}>
                                    Reproduciendo ahora
                                </div>
                                <p className="text-secondary small mb-0">
                                    Transmisión activa de <strong>{itemSeleccionado.titulo}</strong>
                                </p>
                            </div>
                        ) : null}

                        <p className="text-secondary mb-4">{itemSeleccionado.descripcion}</p>

                        <div className="d-flex justify-content-end gap-2">
                            {!reproduciendo && (
                                <button
                                    type="button"
                                    onClick={() => setReproduciendo(true)}
                                    className="btn px-4 py-2 fw-semibold text-white rounded-3"
                                    style={{ backgroundColor: '#6c47ff' }}
                                >
                                    Ver ahora
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setItemSeleccionado(null)}
                                className="btn px-4 py-2 text-light rounded-3"
                                style={{ backgroundColor: '#1b1d28', border: '1px solid #2e3244' }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriberView;