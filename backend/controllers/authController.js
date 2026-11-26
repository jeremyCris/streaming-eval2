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

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Debes ingresar correo y contraseña' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Por seguridad, todo registro público nace como suscriptor
    const newUser = await userRepository.createUser(email, passwordHash, 'Suscriptor');

    const token = jwt.sign(
      { id: newUser.id, rol: newUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      rol: newUser.rol,
      user: newUser
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
};

module.exports = {
    login,
    register
};