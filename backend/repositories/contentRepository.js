const pool = require('../config/database');

const ContentRepository = {
    getAllContents: async () => {
        const result = await pool.query('SELECT * FROM contenidos ORDER BY created_at DESC');
        return result.rows;
    },

    createContent: async (titulo, descripcion, categoria, url_imagen, genero = null, destacado = false) => {
        const query = `
            INSERT INTO contenidos (titulo, descripcion, categoria, url_imagen, genero, destacado)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [titulo, descripcion, categoria, url_imagen, genero, Boolean(destacado)];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    updateContent: async (id, { titulo, descripcion, categoria, url_imagen, genero, destacado }) => {
        const query = `
            UPDATE contenidos
            SET titulo = $1,
                descripcion = $2,
                categoria = $3,
                url_imagen = $4,
                genero = COALESCE($5, genero),
                destacado = COALESCE($6, destacado)
            WHERE id = $7
            RETURNING *
        `;
        const values = [
            titulo,
            descripcion,
            categoria,
            url_imagen,
            genero ?? null,
            typeof destacado === 'boolean' ? destacado : null,
            id,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    deleteContent: async (id) => {
        const query = 'DELETE FROM contenidos WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },
};

module.exports = ContentRepository;