const ContentRepository = require('../repositories/contentRepository');
const { buscarEnTmdb } = require('../services/tmdbService');

const normalizarGenero = (valor) => {
    if (!valor) return null;
    const limpio = String(valor).trim();
    if (!limpio) return null;
    if (limpio.toLowerCase() === 'anime') return 'Animación';
    return limpio;
};

const getAll = async (req, res) => {
    try {
        const contenidos = await ContentRepository.getAllContents();
        res.json(contenidos);
    } catch (error) {
        console.error('Error al obtener contenidos:', error);
        res.status(500).json({ error: 'Error al obtener los contenidos' });
    }
};

const create = async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            categoria,
            genero,
            url_imagen,
            imagen_url,
            destacado = false,
            autocompletar = true,
        } = req.body;
        const imagenInicial = url_imagen ?? imagen_url;

        if (!titulo || !String(titulo).trim()) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }

        let extra = {};
        if (autocompletar) {
            try {
                const respuestaTmdb = await buscarEnTmdb(String(titulo).trim());
                const results = respuestaTmdb?.results;
                if (Array.isArray(results) && results.length > 0) {
                    extra = results[0] || {};
                }
            } catch (tmdbErr) {
                console.warn('Autocompletado TMDb omitido por error:', tmdbErr.message || tmdbErr);
            }
        }

        const tituloFinal = String(titulo).trim().slice(0, 150);
        const descripcionFinal =
            descripcion && String(descripcion).trim()
                ? String(descripcion).trim()
                : extra.descripcion || null;
        const categoriaFinal =
            categoria && String(categoria).trim()
                ? String(categoria).trim()
                : extra.categoria || 'Película';
        const generoFinal =
            normalizarGenero(genero) ||
            normalizarGenero(extra.genero) ||
            (categoriaFinal.toLowerCase() === 'anime'
                ? 'Animación'
                : categoriaFinal.toLowerCase() === 'documental'
                  ? 'Documental'
                  : null);
        const imagenFinal =
            imagenInicial && String(imagenInicial).trim()
                ? String(imagenInicial).trim()
                : extra.url_imagen || null;

        const nuevoContenido = await ContentRepository.createContent(
            tituloFinal,
            descripcionFinal,
            categoriaFinal,
            imagenFinal,
            generoFinal,
            Boolean(destacado)
        );
        res.status(201).json(nuevoContenido);
    } catch (error) {
        console.error('Error al crear contenido:', error);
        res.status(500).json({ error: 'Error al registrar el contenido' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, categoria, genero, url_imagen, imagen_url, destacado } = req.body;
        const imagenFinal = url_imagen ?? imagen_url;

        if (!titulo || !String(titulo).trim()) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }

        const generoNormalizado = genero !== undefined ? normalizarGenero(genero) : null;

        const actualizado = await ContentRepository.updateContent(id, {
            titulo: String(titulo).trim().slice(0, 150),
            descripcion: descripcion ?? null,
            categoria: categoria ?? 'Película',
            genero: generoNormalizado,
            url_imagen: imagenFinal ?? null,
            destacado,
        });

        if (!actualizado) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        res.json(actualizado);
    } catch (error) {
        console.error('Error al actualizar contenido:', error);
        res.status(500).json({ error: 'Error al actualizar el contenido' });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await ContentRepository.deleteContent(id);

        if (!eliminado) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        res.json({ message: 'Contenido eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar contenido:', error);
        res.status(500).json({ error: 'Error al eliminar el contenido' });
    }
};

module.exports = { getAll, create, update, delete: remove };