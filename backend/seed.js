const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function poblarBaseDeDatos() {
    console.log('Iniciando sembrado de base de datos (Seeding)...');
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                rol VARCHAR(50) NOT NULL DEFAULT 'Suscriptor'
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS contenidos (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(150) NOT NULL,
                descripcion TEXT,
                categoria VARCHAR(50),
                url_imagen TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const resUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        if (parseInt(resUsuarios.rows[0].count) === 0) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            await pool.query(`
                INSERT INTO usuarios (nombre, email, password, rol) 
                VALUES 
                ('Administrador', 'admin@streaming.cl', $1, 'Administrador'),
                ('Suscriptor Prueba', 'usuario@streaming.cl', $1, 'Suscriptor')
            `, [hashedPassword]);
            console.log('✅ Usuarios creados con contraseña encriptada (123456).');
        } else {
            console.log('⚡ La tabla usuarios ya tiene datos, se omitió la inserción.');
        }

   
        const resContenidos = await pool.query('SELECT COUNT(*) FROM contenidos');
        if (parseInt(resContenidos.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO contenidos (titulo, descripcion, categoria, url_imagen) 
                VALUES 
                ('Inception', 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de intercambio de sueños.', 'Película', 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'),
                ('Stranger Things', 'Un grupo de jóvenes en los 80 enfrenta fenómenos paranormales y experimentos secretos.', 'Serie', 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg');
            `);
            console.log('✅ Contenidos iniciales agregados al catálogo.');
        } else {
            console.log('⚡ La tabla contenidos ya tiene datos, se omitió la inserción.');
        }

    } catch (error) {
        console.error('❌ Error poblando la base de datos:', error);
    } finally {
        pool.end();
        process.exit();
    }
}

poblarBaseDeDatos();