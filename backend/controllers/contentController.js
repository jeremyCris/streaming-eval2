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
    const { titulo, descripcion, categoria, url_imagen } = req.body;
    
    if (!titulo) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const nuevoContenido = await ContentRepository.createContent(
      titulo, 
      descripcion, 
      categoria, 
      url_imagen
    );
    res.status(201).json(nuevoContenido);
  } catch (error) {
    console.error('Error al crear contenido:', error);
    res.status(500).json({ error: 'Error al registrar el contenido' });
  }
};

module.exports = { getAll, create };