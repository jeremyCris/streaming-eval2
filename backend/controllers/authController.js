// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository'); // Llamamos al repositorio
require('dotenv').config();

const login = async (req, res) => {
    // 1. Recibimos el correo y contraseña que envía React
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan credenciales' });
        }

        // 2. Buscamos al usuario en la BD usando el Patrón Repositorio
        const user = await userRepository.findUserByEmail(email);
        
        // Si no existe, devolvemos error genérico por seguridad
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' }); 
        }

        // 3. Comparamos la contraseña en texto plano con el hash encriptado de la BD
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 4. Si la contraseña es correcta, generamos el Token JWT
        const token = jwt.sign(
            { id: user.id, rol: user.rol }, // Guardamos el rol dentro del token
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // 5. Enviamos el token de vuelta al frontend
        res.json({
            message: 'Login exitoso',
            token: token,
            rol: user.rol
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    login
};