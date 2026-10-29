import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginView = () => {
    // Estado (El Modelo en nuestro MVC)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Hook de navegación de React Router
    const navigate = useNavigate();

    // Función que intercepta el formulario (El Controlador en MVC)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); 

        try {
            // Petición al backend que creaste en el puerto 3000
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password
            });

            // Guardamos el token JWT (Sesión Stateless)
            localStorage.setItem('token', response.data.token);
            const rol = response.data.rol;

            // Redirección corregida para coincidir exactamente con App.js
            if (rol === 'Administrador') {
                navigate('/admin');
            } else {
                navigate('/suscriptor');
            }

        } catch (err) {
            setError('Credenciales inválidas. Inténtalo de nuevo.');
        }
    };

    // La interfaz (La Vista en MVC)
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div className="card p-4 shadow-lg" style={{ width: '350px', borderRadius: '15px' }}>
                <h3 className="text-center mb-4">Streaming Login</h3>
                
                {error && <div className="alert alert-danger p-2 text-center">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="usuario@streaming.cl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-3">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;