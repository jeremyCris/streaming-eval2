const ContentRepository = require('../repositories/contentRepository');
const { buscarEnTmdb } = require('../services/tmdbService');

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
        const { titulo, descripcion, categoria, url_imagen, imagen_url, autocompletar = true } = req.body;
        const imagenInicial = url_imagen ?? imagen_url;

        if (!titulo || !String(titulo).trim()) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }

        let extra = {};
        if (autocompletar) {
            const { results } = await buscarEnTmdb(String(titulo).trim());
            if (results && results.length > 0) {
                extra = results[0];
            }
        }

        const tituloFinal = String(titulo).trim().slice(0, 150);
        const descripcionFinal =
            descripcion && String(descripcion).trim()
                ? String(descripcion).trim()
                : extra.descripcion || undefined;
        const categoriaFinal =
            categoria && String(categoria).trim()
                ? String(categoria).trim()
                : extra.categoria || undefined;
        const imagenFinal =
            imagenInicial && String(imagenInicial).trim()
                ? String(imagenInicial).trim()
                : extra.url_imagen || undefined;

        const nuevoContenido = await ContentRepository.createContent(
            tituloFinal,
            descripcionFinal,
            categoriaFinal,
            imagenFinal
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
        const { titulo, descripcion, categoria, url_imagen, imagen_url } = req.body;
        const imagenFinal = url_imagen ?? imagen_url;

        if (!titulo) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }

        const actualizado = await ContentRepository.updateContent(id, {
            titulo,
            descripcion,
            categoria,
            url_imagen: imagenFinal,
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