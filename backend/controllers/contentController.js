const ContentRepository = require('../repositories/contentRepository');

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
        const { titulo, descripcion, categoria, url_imagen, imagen_url } = req.body;
        const imagenFinal = url_imagen ?? imagen_url;

        if (!titulo) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }

        const nuevoContenido = await ContentRepository.createContent(
            titulo,
            descripcion,
            categoria,
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