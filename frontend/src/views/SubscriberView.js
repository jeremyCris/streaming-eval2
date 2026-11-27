import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

const GENERO_TODOS = '__todos__';
const MAX_POR_FILA = 6;
const GENEROS_BASE = [
    'Acción',
    'Romance',
    'Terror',
    'Ciencia ficción',
    'Comedia',
    'Drama',
    'Suspenso',
    'Animación',
    'Documental',
    'Fantasía',
];

const normalizarTextoGenero = (valor = '') => {
    const limpio = valor.toString().trim();
    if (!limpio) return '';
    const lower = limpio.toLowerCase();
    if (lower === 'anime' || lower === 'animacion' || lower === 'animación') {
        return 'Animación';
    }
    if (lower === 'accion' || lower === 'acción') {
        return 'Acción';
    }
    if (lower === 'ciencia ficcion' || lower === 'ciencia ficción') {
        return 'Ciencia ficción';
    }
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
};

const getGenero = (item) => {
    const directo = normalizarTextoGenero(item?.genero || item?.genre || '');
    if (directo) return directo;

    const cat = (item?.categoria || '').toString().trim().toLowerCase();
    if (cat === 'anime' || cat === 'animación' || cat === 'animacion') return 'Animación';
    if (cat === 'documental') return 'Documental';
    return '';
};

const coincideFormato = (item, filtroTipo) => {
    if (filtroTipo === 'Todo') return true;
    const cat = (item?.categoria || '').toString().trim().toLowerCase();
    const gen = getGenero(item).toLowerCase();

    if (filtroTipo === 'Película') {
        return cat.includes('pel');
    }
    if (filtroTipo === 'Serie') {
        return cat.includes('ser');
    }
    if (filtroTipo === 'Anime') {
        return cat.includes('anim') || gen === 'animación' || gen === 'anime';
    }
    if (filtroTipo === 'Documental') {
        return cat.includes('doc') || gen === 'documental';
    }
    return true;
};

const DURACION_CARRUSEL_MS = 7000;
const TICK_CARRUSEL_MS = 100;
const MAX_SLIDES_CARRUSEL = 3;
const COLORES_RESPALDO_CARRUSEL = ['#143d24', '#4a1732', '#4a2e16', '#251e45'];

const IconoCarrusel = ({ children, size = 20, relleno = false }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={relleno ? 'currentColor' : 'none'}
        stroke={relleno ? 'none' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const estiloBotonRedondoCarrusel = {
    width: '44px',
    height: '44px',
    padding: 0,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(12, 13, 18, 0.65)',
    color: '#ffffff',
};

const SubscriberView = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todo');
    const [filtroGenero, setFiltroGenero] = useState(GENERO_TODOS);
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

    // Estado del carrusel
    const [indiceCarrusel, setIndiceCarrusel] = useState(0);
    const [progresoCarrusel, setProgresoCarrusel] = useState(0);
    const [carruselEncima, setCarruselEncima] = useState(false);
    const [carruselPausado, setCarruselPausado] = useState(() => {
        try {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            return false;
        }
    });
    const [imagenesFallidas, setImagenesFallidas] = useState({});
    const inicioToqueCarrusel = useRef(null);
    const [carruselEsGrande, setCarruselEsGrande] = useState(() => {
        try {
            return window.matchMedia('(min-width: 992px)').matches;
        } catch {
            return true;
        }
    });

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
            const lista = Array.isArray(res.data) ? res.data : res.data?.data || [];
            setItems(lista);
            setError('');
        } catch (err) {
            console.error('Error cargando catálogo desde API:', err);
            if (!silencioso) {
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

    // Solo películas/títulos marcados explícitamente como destacado (máx. 3)
    const itemsCarrusel = useMemo(() => {
        return items.filter((i) => Boolean(i.destacado)).slice(0, MAX_SLIDES_CARRUSEL);
    }, [items]);

    const totalCarrusel = itemsCarrusel.length;

    useEffect(() => {
        if (totalCarrusel < 2 || carruselPausado || carruselEncima) return undefined;
        const timer = setInterval(() => {
            setProgresoCarrusel((p) => p + (TICK_CARRUSEL_MS / DURACION_CARRUSEL_MS) * 100);
        }, TICK_CARRUSEL_MS);
        return () => clearInterval(timer);
    }, [totalCarrusel, carruselPausado, carruselEncima]);

    useEffect(() => {
        if (totalCarrusel < 2 || progresoCarrusel < 100) return;
        setIndiceCarrusel((i) => ((i < totalCarrusel ? i : 0) + 1) % totalCarrusel);
        setProgresoCarrusel(0);
    }, [progresoCarrusel, totalCarrusel]);

    useEffect(() => {
        try {
            const mq = window.matchMedia('(min-width: 992px)');
            const actualizar = (e) => setCarruselEsGrande(e.matches);
            mq.addEventListener('change', actualizar);
            return () => mq.removeEventListener('change', actualizar);
        } catch {
            return undefined;
        }
    }, []);

    const idxCarrusel = indiceCarrusel < totalCarrusel ? indiceCarrusel : 0;
    const slideActual = itemsCarrusel[idxCarrusel];

    const irACarrusel = (n) => {
        if (totalCarrusel === 0) return;
        setIndiceCarrusel(((n % totalCarrusel) + totalCarrusel) % totalCarrusel);
        setProgresoCarrusel(0);
    };

    const urlImagenCarrusel = (item) => {
        const url = getImagen(item);
        return url && !imagenesFallidas[url] ? url : '';
    };

    const urlBannerCarrusel = (item) => {
        const banner = item?.imagen_banner || item?.url_banner || '';
        if (banner && !imagenesFallidas[banner]) return banner;

        const poster = getImagen(item);
        if (poster && !imagenesFallidas[poster]) return poster;

        return '';
    };

    const marcarImagenFallida = (url) => {
        if (!url) return;
        setImagenesFallidas((prev) => ({ ...prev, [url]: true }));
    };

    const handleTeclasCarrusel = (e) => {
        if (e.key === 'ArrowRight') irACarrusel(idxCarrusel + 1);
        if (e.key === 'ArrowLeft') irACarrusel(idxCarrusel - 1);
    };

    const handleToqueInicioCarrusel = (e) => {
        inicioToqueCarrusel.current = e.touches[0].clientX;
    };

    const handleToqueFinCarrusel = (e) => {
        if (inicioToqueCarrusel.current === null) return;
        const dx = e.changedTouches[0].clientX - inicioToqueCarrusel.current;
        inicioToqueCarrusel.current = null;
        if (Math.abs(dx) > 50) irACarrusel(idxCarrusel + (dx < 0 ? 1 : -1));
    };

    const siguientesCarrusel = Array.from(
        { length: Math.min(2, Math.max(totalCarrusel - 1, 0)) },
        (_, k) => (idxCarrusel + 1 + k) % totalCarrusel
    );
    const slideEnLista = slideActual ? miListaIds.includes(slideActual.id) : false;
    const etiquetasCarrusel = slideActual
        ? [slideActual.categoria || 'Película', getGenero(slideActual), slideActual.anio, slideActual.duracion].filter(Boolean)
        : [];

    const itemsFiltrados = useMemo(() => {
        const query = busqueda.trim().toLowerCase();

        return items.filter((item) => {
            const titulo = (item.titulo || '').toLowerCase();
            const descripcion = (item.descripcion || '').toLowerCase();
            const categoria = (item.categoria || '').toLowerCase();
            const genero = getGenero(item).toLowerCase();

            const coincideBusqueda =
                !query ||
                titulo.includes(query) ||
                descripcion.includes(query) ||
                genero.includes(query) ||
                categoria.includes(query);

            if (!coincideBusqueda) return false;

            if (seccionActiva === 'Mi lista') {
                return miListaIds.includes(item.id);
            }

            return coincideFormato(item, filtroTipo);
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

    const generosDisponibles = useMemo(() => {
        const conteo = {};
        GENEROS_BASE.forEach((g) => {
            conteo[g] = 0;
        });
        itemsFiltrados.forEach((item) => {
            const g = getGenero(item);
            if (g) {
                const claveExistente = Object.keys(conteo).find(
                    (k) => k.toLowerCase() === g.toLowerCase()
                );
                const clave = claveExistente || g;
                conteo[clave] = (conteo[clave] || 0) + 1;
            }
        });
        return Object.keys(conteo).map((nombre) => ({ nombre, total: conteo[nombre] }));
    }, [itemsFiltrados]);

    const mostrarGeneros = seccionActiva !== 'Mi lista';
    const generoEfectivo =
        filtroGenero === GENERO_TODOS ||
        generosDisponibles.some((g) => g.nombre.toLowerCase() === filtroGenero.toLowerCase())
            ? filtroGenero
            : GENERO_TODOS;

    const itemsGrid =
        mostrarGeneros && generoEfectivo !== GENERO_TODOS
            ? itemsFiltrados.filter(
                  (i) => getGenero(i).toLowerCase() === generoEfectivo.toLowerCase()
              )
            : itemsFiltrados;

    const generosConContenido = generosDisponibles.filter((g) => g.total > 0);
    const verPorFilas =
        mostrarGeneros &&
        generoEfectivo === GENERO_TODOS &&
        !busqueda.trim() &&
        generosConContenido.length > 0;

    const sinGenero = itemsFiltrados.filter((i) => !getGenero(i));
    const filas = verPorFilas
        ? [
              ...generosConContenido.map((g) => ({
                  nombre: g.nombre,
                  items: itemsFiltrados.filter(
                      (i) => getGenero(i).toLowerCase() === g.nombre.toLowerCase()
                  ),
              })),
              ...(sinGenero.length > 0 ? [{ nombre: 'Otros', items: sinGenero, sinFiltro: true }] : []),
          ]
        : [];

    const chipsGenero = [
        { valor: GENERO_TODOS, etiqueta: 'Todos los géneros', total: itemsFiltrados.length },
        ...generosDisponibles.map((g) => ({ valor: g.nombre, etiqueta: g.nombre, total: g.total })),
    ];

    const renderTarjeta = (item, idx) => {
        const bgCard = item.accent || ['#143d24', '#4a1732', '#4a2e16', '#251e45'][idx % 4];
        const enLista = miListaIds.includes(item.id);
        const esSerie = (item.categoria || '').toLowerCase().includes('ser');
        const imgSrc = getImagen(item);
        const generoItem = getGenero(item);

        return (
            <div
                className="h-100 rounded-4 overflow-hidden d-flex flex-column"
                style={{
                    backgroundColor: '#12131a',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
            >
                <div
                    onClick={() => abrirReproductor(item)}
                    className="position-relative d-flex align-items-end p-3 overflow-hidden"
                    style={{
                        aspectRatio: '16 / 9',
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
                        className="btn btn-sm rounded-3 position-absolute top-0 end-0 m-2 py-0 px-2"
                        style={{
                            backgroundColor: 'rgba(12, 13, 18, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            zIndex: 2,
                        }}
                    >
                        Ver
                    </button>

                    <h3
                        className="fw-bold mb-0 position-relative text-white"
                        style={{
                            zIndex: 2,
                            fontSize: '1.15rem',
                            lineHeight: 1.15,
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                        }}
                    >
                        {item.titulo}
                    </h3>
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2 gap-1">
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span
                                className="badge rounded-pill px-2 py-1"
                                style={{
                                    backgroundColor: esSerie ? '#3b2516' : '#251e45',
                                    color: esSerie ? '#fdba74' : '#b8a6ff',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {item.categoria || 'Película'}
                            </span>
                            {generoItem && (
                                <span
                                    className="badge rounded-pill px-2 py-1"
                                    style={{
                                        backgroundColor: '#1a1c28',
                                        color: '#d1d5db',
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    {generoItem}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => toggleMiLista(item.id)}
                            className="btn btn-sm py-0 px-1"
                            style={{
                                color: enLista ? '#a78bfa' : '#9ca3af',
                                border: 'none',
                                fontSize: '0.75rem',
                            }}
                        >
                            {enLista ? 'En mi lista' : '+ Mi lista'}
                        </button>
                    </div>

                    <h6 className="fw-bold mb-1">{item.titulo}</h6>
                    <p
                        className="text-secondary mb-0"
                        style={{
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {item.descripcion}
                    </p>
                </div>
            </div>
        );
    };

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

                {/* Carrusel de destacados */}
                {slideActual && seccionActiva === 'Inicio' && !busqueda && (
                    <section
                        className="rounded-4 position-relative overflow-hidden d-flex align-items-center p-4 p-lg-5 mb-5"
                        style={{
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            minHeight: '440px',
                            paddingBottom: carruselEsGrande ? '104px' : '140px',
                            backgroundColor: '#141620',
                        }}
                        aria-roledescription="carrusel"
                        aria-label="Contenido destacado"
                        onMouseEnter={() => setCarruselEncima(true)}
                        onMouseLeave={() => setCarruselEncima(false)}
                        onKeyDown={handleTeclasCarrusel}
                        onTouchStart={handleToqueInicioCarrusel}
                        onTouchEnd={handleToqueFinCarrusel}
                    >
                        {itemsCarrusel.map((s, i) => {
                            const url = urlBannerCarrusel(s);
                            return (
                                <div
                                    key={s.id ?? i}
                                    aria-hidden="true"
                                    className="position-absolute top-0 start-0 w-100 h-100"
                                    style={{
                                        backgroundColor:
                                            s.accent || COLORES_RESPALDO_CARRUSEL[i % COLORES_RESPALDO_CARRUSEL.length],
                                        opacity: i === idxCarrusel ? 1 : 0,
                                        transition: 'opacity 0.6s ease',
                                    }}
                                >
                                    {url && (
                                        <img
                                            src={url}
                                            alt=""
                                            className="w-100 h-100"
                                            style={{
                                                objectFit: 'cover',
                                                objectPosition: '65% 25%',
                                                opacity: 1,
                                                filter: 'none',
                                            }}
                                            onError={() => marcarImagenFallida(url)}
                                        />
                                    )}
                                </div>
                            );
                        })}

                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                background:
                                    'linear-gradient(90deg, rgba(12, 13, 18, 0.92) 0%, rgba(12, 13, 18, 0.62) 48%, rgba(12, 13, 18, 0.05) 85%)',
                                zIndex: 1,
                            }}
                        />
                        <div
                            className="position-absolute start-0 w-100"
                            style={{
                                bottom: 0,
                                height: '150px',
                                background:
                                    'linear-gradient(0deg, rgba(12, 13, 18, 0.8) 0%, rgba(12, 13, 18, 0) 100%)',
                                zIndex: 1,
                            }}
                        />

                        <div
                            className="position-relative"
                            style={{ maxWidth: '560px', zIndex: 2 }}
                            aria-live={carruselPausado || carruselEncima ? 'polite' : 'off'}
                        >
                            <span
                                className="badge rounded-pill px-3 py-2 mb-3"
                                style={{ backgroundColor: '#6c47ff', color: '#ffffff', fontSize: '0.8rem' }}
                            >
                                Destacado
                            </span>

                            <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1px', lineHeight: 1.05 }}>
                                {slideActual.titulo}
                            </h1>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {etiquetasCarrusel.map((etq) => (
                                    <span
                                        key={etq}
                                        className="badge rounded-3 px-2 py-2 fw-medium"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#e5e7eb' }}
                                    >
                                        {etq}
                                    </span>
                                ))}
                            </div>

                            <p
                                className="text-light mb-4"
                                style={{
                                    opacity: 0.92,
                                    fontSize: '1.05rem',
                                    lineHeight: 1.55,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {slideActual.descripcion}
                            </p>

                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => abrirReproductor(slideActual)}
                                    className="btn px-4 fw-semibold rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
                                    style={{ backgroundColor: '#ffffff', color: '#0c0d12', height: '52px', lineHeight: 1 }}
                                >
                                    <IconoCarrusel size={16} relleno>
                                        <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
                                    </IconoCarrusel>
                                    Ver ahora
                                </button>

                                <button
                                    type="button"
                                    onClick={() => abrirDetalles(slideActual)}
                                    className="btn px-4 fw-medium rounded-3 text-white d-inline-flex align-items-center justify-content-center"
                                    style={{
                                        height: '52px',
                                        lineHeight: 1,
                                        backgroundColor: 'rgba(12, 13, 18, 0.45)',
                                        border: '1px solid rgba(255, 255, 255, 0.35)',
                                    }}
                                >
                                    Más información
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toggleMiLista(slideActual.id)}
                                    aria-label={
                                        slideEnLista
                                            ? `Quitar ${slideActual.titulo} de Mi lista`
                                            : `Agregar ${slideActual.titulo} a Mi lista`
                                    }
                                    className="btn p-0 rounded-3 d-inline-flex align-items-center justify-content-center"
                                    style={{
                                        width: '52px',
                                        height: '52px',
                                        lineHeight: 1,
                                        backgroundColor: 'rgba(12, 13, 18, 0.45)',
                                        border: `1px solid ${slideEnLista ? '#b8a6ff' : 'rgba(255, 255, 255, 0.35)'}`,
                                        color: slideEnLista ? '#b8a6ff' : '#ffffff',
                                    }}
                                >
                                    {slideEnLista ? (
                                        <IconoCarrusel size={22}><path d="M5 12.5l4.5 4.5L19 7.5" /></IconoCarrusel>
                                    ) : (
                                        <IconoCarrusel size={22}><path d="M12 5v14M5 12h14" /></IconoCarrusel>
                                    )}
                                </button>
                            </div>
                        </div>

                        {siguientesCarrusel.length > 0 && (
                            <aside
                                className="position-absolute d-none d-lg-flex flex-column gap-2"
                                style={{ top: '32px', right: '32px', width: '264px', zIndex: 2 }}
                                aria-label="A continuación"
                            >
                                <span className="small fw-semibold" style={{ color: '#d1d5db' }}>
                                    A continuación
                                </span>

                                {siguientesCarrusel.map((n) => {
                                    const s = itemsCarrusel[n];
                                    const url = urlBannerCarrusel(s) || urlImagenCarrusel(s);
                                    return (
                                        <button
                                            key={s.id ?? n}
                                            type="button"
                                            onClick={() => irACarrusel(n)}
                                            aria-label={`Ir a ${s.titulo}`}
                                            className="btn p-0 position-relative overflow-hidden rounded-3 text-start border-0"
                                            style={{
                                                aspectRatio: '16 / 9',
                                                backgroundColor:
                                                    s.accent ||
                                                    COLORES_RESPALDO_CARRUSEL[n % COLORES_RESPALDO_CARRUSEL.length],
                                            }}
                                        >
                                            {url && (
                                                <img
                                                    src={url}
                                                    alt=""
                                                    className="position-absolute top-0 start-0 w-100 h-100"
                                                    style={{ objectFit: 'cover', objectPosition: '50% 20%', opacity: 0.9 }}
                                                    onError={() => marcarImagenFallida(url)}
                                                />
                                            )}
                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100"
                                                style={{
                                                    background:
                                                        'linear-gradient(180deg, rgba(12,13,18,0.1) 0%, rgba(12,13,18,0.85) 100%)',
                                                }}
                                            />
                                            <span
                                                className="position-absolute fw-bold text-white"
                                                style={{ left: '12px', bottom: '10px', right: '12px', fontSize: '1rem' }}
                                            >
                                                {s.titulo}
                                            </span>
                                        </button>
                                    );
                                })}
                            </aside>
                        )}

                        {totalCarrusel > 1 && (
                            <div
                                className="position-absolute d-flex gap-2"
                                style={{
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    bottom: carruselEsGrande ? '26px' : '66px',
                                    zIndex: 2,
                                }}
                                role="group"
                                aria-label="Ir a un destacado"
                            >
                                {itemsCarrusel.map((s, i) => {
                                    const ancho = i < idxCarrusel ? 100 : i === idxCarrusel ? Math.min(progresoCarrusel, 100) : 0;
                                    return (
                                        <button
                                            key={s.id ?? i}
                                            type="button"
                                            onClick={() => irACarrusel(i)}
                                            aria-label={`Destacado ${i + 1}: ${s.titulo}`}
                                            aria-current={i === idxCarrusel ? 'true' : undefined}
                                            className="btn p-0 border-0 position-relative"
                                            style={{ width: '64px', height: '20px', backgroundColor: 'transparent' }}
                                        >
                                            <span
                                                className="position-absolute start-0 w-100"
                                                style={{
                                                    top: '8px',
                                                    height: '4px',
                                                    borderRadius: '2px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.28)',
                                                }}
                                            />
                                            <span
                                                className="position-absolute start-0"
                                                style={{
                                                    top: '8px',
                                                    height: '4px',
                                                    borderRadius: '2px',
                                                    backgroundColor: '#ffffff',
                                                    width: `${ancho}%`,
                                                    transition: 'width 100ms linear',
                                                }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {totalCarrusel > 1 && (
                            <div
                                className="position-absolute d-flex align-items-center gap-2"
                                style={
                                    carruselEsGrande
                                        ? { right: '32px', bottom: '14px', width: '264px', justifyContent: 'center', zIndex: 2 }
                                        : { left: '50%', transform: 'translateX(-50%)', bottom: '14px', zIndex: 2 }
                                }
                            >
                                <button
                                    type="button"
                                    onClick={() => setCarruselPausado((p) => !p)}
                                    aria-label={carruselPausado ? 'Reanudar rotación' : 'Pausar rotación'}
                                    className="btn"
                                    style={estiloBotonRedondoCarrusel}
                                >
                                    {carruselPausado ? (
                                        <IconoCarrusel size={16} relleno>
                                            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
                                        </IconoCarrusel>
                                    ) : (
                                        <IconoCarrusel size={16} relleno>
                                            <rect x="6" y="5" width="4" height="14" rx="1" />
                                            <rect x="14" y="5" width="4" height="14" rx="1" />
                                        </IconoCarrusel>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => irACarrusel(idxCarrusel - 1)}
                                    aria-label="Destacado anterior"
                                    className="btn"
                                    style={estiloBotonRedondoCarrusel}
                                >
                                    <IconoCarrusel><path d="M15 5l-7 7 7 7" /></IconoCarrusel>
                                </button>

                                <span
                                    className="small fw-semibold d-inline-flex align-items-center justify-content-center"
                                    style={{ minWidth: '52px', height: '44px', color: '#e5e7eb' }}
                                >
                                    {idxCarrusel + 1} / {totalCarrusel}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => irACarrusel(idxCarrusel + 1)}
                                    aria-label="Destacado siguiente"
                                    className="btn"
                                    style={estiloBotonRedondoCarrusel}
                                >
                                    <IconoCarrusel><path d="M9 5l7 7-7 7" /></IconoCarrusel>
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* Encabezado del catálogo, buscador y selector de formato */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div className="d-flex align-items-baseline gap-3">
                        <h3 className="fw-bold mb-0">
                            {seccionActiva === 'Mi lista' ? 'Mi lista' : 'Catálogo de transmisión'}
                        </h3>
                        {!loading && (
                            <span className="small text-secondary">
                                {itemsGrid.length} {itemsGrid.length === 1 ? 'título' : 'títulos'}
                            </span>
                        )}
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <div className="position-relative" style={{ width: '240px' }}>
                            <span
                                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary d-inline-flex align-items-center"
                                style={{ pointerEvents: 'none' }}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="form-control form-control-sm text-white rounded-3 pe-4"
                                style={{
                                    height: '38px',
                                    backgroundColor: '#12131a',
                                    border: '1px solid #222638',
                                    paddingLeft: '34px',
                                }}
                                placeholder="Buscar por título o género"
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

                        {seccionActiva !== 'Mi lista' && (
                            <div
                                className="d-inline-flex flex-wrap p-1 rounded-3"
                                style={{ backgroundColor: '#12131a', border: '1px solid #222638', minHeight: '38px' }}
                            >
                                {[
                                    { label: 'Todo', value: 'Todo' },
                                    { label: 'Películas', value: 'Película' },
                                    { label: 'Series', value: 'Serie' },
                                    { label: 'Animes', value: 'Anime' },
                                    { label: 'Documentales', value: 'Documental' },
                                ].map((btn) => {
                                    const activo = filtroTipo === btn.value;
                                    return (
                                        <button
                                            key={btn.value}
                                            type="button"
                                            onClick={() => setFiltroTipo(btn.value)}
                                            className="btn btn-sm px-3 py-1 rounded-3 fw-medium d-inline-flex align-items-center"
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
                </div>

                {/* Tira horizontal de chips por género / categoría temática */}
                {mostrarGeneros && (
                    <div
                        className="d-flex align-items-center gap-2 mb-4 pb-1"
                        style={{ overflowX: 'auto' }}
                        role="group"
                        aria-label="Filtrar por género o categoría"
                    >
                        {chipsGenero.map((chip) => {
                            const activo = generoEfectivo.toLowerCase() === chip.valor.toLowerCase();
                            return (
                                <button
                                    key={chip.valor}
                                    type="button"
                                    onClick={() => setFiltroGenero(chip.valor)}
                                    aria-pressed={activo}
                                    className="btn btn-sm rounded-pill px-3 py-2 fw-medium flex-shrink-0 d-inline-flex align-items-center gap-2"
                                    style={{
                                        backgroundColor: activo ? '#6c47ff' : '#12131a',
                                        border: `1px solid ${activo ? '#6c47ff' : '#222638'}`,
                                        color: activo ? '#ffffff' : '#e5e7eb',
                                    }}
                                >
                                    <span>{chip.etiqueta}</span>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            color: activo ? '#e4dcff' : '#9ca3af',
                                        }}
                                    >
                                        {chip.total}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Contenido: filas por género o cuadrícula */}
                {loading ? (
                    <div className="text-center py-5 text-secondary">Cargando catálogo...</div>
                ) : itemsGrid.length === 0 ? (
                    <div
                        className="p-5 rounded-4 text-center text-secondary"
                        style={{ backgroundColor: '#12131a', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        No hay títulos publicados o no coinciden con el filtro.
                    </div>
                ) : verPorFilas ? (
                    <div className="d-flex flex-column gap-5">
                        {filas.map((fila) => (
                            <section key={fila.nombre} aria-label={fila.nombre}>
                                <div className="d-flex justify-content-between align-items-baseline mb-3">
                                    <div className="d-flex align-items-baseline gap-2">
                                        <h4 className="fw-bold mb-0">{fila.nombre}</h4>
                                        <span className="small text-secondary">
                                            {fila.items.length} {fila.items.length === 1 ? 'título' : 'títulos'}
                                        </span>
                                    </div>
                                    {!fila.sinFiltro && (
                                        <button
                                            type="button"
                                            onClick={() => setFiltroGenero(fila.nombre)}
                                            className="btn btn-link btn-sm p-0 text-decoration-none fw-medium"
                                            style={{ color: '#a78bfa' }}
                                        >
                                            Ver todo
                                        </button>
                                    )}
                                </div>

                                <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-4 row-cols-xxl-6">
                                    {fila.items.slice(0, MAX_POR_FILA).map((item, i) => (
                                        <div key={item.id || i} className={i >= 4 ? 'col d-none d-xxl-block' : 'col'}>
                                            {renderTarjeta(item, i)}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-4 row-cols-xxl-6">
                        {itemsGrid.map((item, idx) => (
                            <div key={item.id || idx} className="col">
                                {renderTarjeta(item, idx)}
                            </div>
                        ))}
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
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    <span
                                        className="badge rounded-pill px-3 py-1"
                                        style={{ backgroundColor: '#251e45', color: '#b8a6ff' }}
                                    >
                                        {itemSeleccionado.categoria || 'Película'}
                                    </span>
                                    {getGenero(itemSeleccionado) && (
                                        <span
                                            className="badge rounded-pill px-3 py-1"
                                            style={{ backgroundColor: '#1a1c28', color: '#d1d5db' }}
                                        >
                                            {getGenero(itemSeleccionado)}
                                        </span>
                                    )}
                                </div>
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