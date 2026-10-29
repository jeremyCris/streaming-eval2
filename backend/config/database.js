// config/database.js
const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables del .env

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.on('connect', () => {
    console.log('✅ Conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error fatal en PostgreSQL', err);
    process.exit(-1);
});

// Exportamos un método para hacer consultas seguras
module.exports = {
    query: (text, params) => pool.query(text, params),
};