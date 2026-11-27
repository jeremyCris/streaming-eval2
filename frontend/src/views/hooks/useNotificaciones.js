
import { useState, useEffect, useCallback, useMemo } from 'react';

const LEIDAS_KEY = 'streamly_notifs_leidas';
const DESCARTADAS_KEY = 'streamly_notifs_descartadas';

const leerListaStorage = (key) => {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export function useNotificaciones(contenidos = []) {
    const [idsLeidos, setIdsLeidos] = useState(() => leerListaStorage(LEIDAS_KEY));
    const [idsDescartados, setIdsDescartados] = useState(() => leerListaStorage(DESCARTADAS_KEY));

    useEffect(() => {
        try {
            localStorage.setItem(LEIDAS_KEY, JSON.stringify(idsLeidos));
        } catch (err) {
            console.error('Error guardando notificaciones leídas:', err);
        }
    }, [idsLeidos]);

    useEffect(() => {
        try {
            localStorage.setItem(DESCARTADAS_KEY, JSON.stringify(idsDescartados));
        } catch (err) {
            console.error('Error guardando notificaciones descartadas:', err);
        }
    }, [idsDescartados]);

    const notificaciones = useMemo(() => {
        if (!Array.isArray(contenidos)) return [];

        return [...contenidos]
            .reverse()
            .map((item, idx) => {
                const baseId = item.id ?? item.id_contenido ?? item._id ?? `idx-${idx}`;
                const notifId = `pub-${baseId}`;
                const titulo = item.titulo || 'Nuevo contenido';
                const categoria = item.categoria || 'Película';
                const fecha =
                    item.created_at ||
                    item.creado_en ||
                    item.fecha_creacion ||
                    new Date().toISOString();

                return {
                    id: notifId,
                    contenidoId: baseId,
                    titulo,
                    categoria,
                    mensaje: `Nuevo título disponible en el catálogo: «${titulo}» (${categoria}).`,
                    fecha,
                    leida: idsLeidos.includes(notifId),
                    item,
                };
            })
            .filter((notif) => !idsDescartados.includes(notif.id))
            .slice(0, 25);
    }, [contenidos, idsLeidos, idsDescartados]);

    const marcarLeida = useCallback((notifId) => {
        setIdsLeidos((prev) => (prev.includes(notifId) ? prev : [...prev, notifId]));
    }, []);

    const marcarTodasLeidas = useCallback(() => {
        setIdsLeidos((prev) => {
            const todos = notificaciones.map((n) => n.id);
            return Array.from(new Set([...prev, ...todos]));
        });
    }, [notificaciones]);

    const limpiarNotificaciones = useCallback(() => {
        const idsActivos = notificaciones.map((n) => n.id);
        setIdsDescartados((prev) => Array.from(new Set([...prev, ...idsActivos])));
        setIdsLeidos((prev) => Array.from(new Set([...prev, ...idsActivos])));
    }, [notificaciones]);

    const noLeidas = useMemo(
        () => notificaciones.filter((n) => !n.leida).length,
        [notificaciones]
    );

    return {
        notificaciones,
        noLeidas,
        marcarLeida,
        marcarTodasLeidas,
        limpiarNotificaciones,
    };
}