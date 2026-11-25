const pool = require('../config/database');

const ContentRepository = {
    // Obtener todo el catálogo
    getAllContents: async () => {
        const result = await pool.query('SELECT * FROM contenidos ORDER BY created_at DESC');
        return result.rows;
    },

    // Crear un nuevo contenido (para el admin)
    createContent: async (titulo, descripcion, categoria, url_imagen) => {
        const query = `
            INSERT INTO contenidos (titulo, descripcion, categoria, url_imagen)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [titulo, descripcion, categoria, url_imagen];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Actualizar un contenido existente por ID
    updateContent: async (id, { titulo, descripcion, categoria, url_imagen }) => {
        const query = `
            UPDATE contenidos
            SET titulo = $1, descripcion = $2, categoria = $3, url_imagen = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [titulo, descripcion, categoria, url_imagen, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Eliminar un contenido por ID
    deleteContent: async (id) => {
        const query = 'DELETE FROM contenidos WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },
};

module.exports = ContentRepository;