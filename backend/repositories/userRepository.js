// repositories/userRepository.js
const db = require('../config/database');

// Función que busca un usuario por su correo de forma segura
const findUserByEmail = async (email) => {
    // Usamos $1 para evitar inyección SQL 
    const queryText = 'SELECT id, email, password_hash, rol FROM usuarios WHERE email = $1';
    const values = [email];
    
    try {
        const result = await db.query(queryText, values);
        return result.rows[0]; // Retorna el usuario si existe, o undefined si no
    } catch (error) {
        console.error('Error ejecutando findUserByEmail:', error);
        throw error;
    }
};

module.exports = {
    findUserByEmail
};