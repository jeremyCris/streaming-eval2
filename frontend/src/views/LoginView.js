import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const BRAND_NAME = 'Streamly';

const posterCards = [
    { color: '#4c35b5', tilt: '-6deg', top: '4%', left: '6%' },
    { color: '#8f343b', tilt: '5deg', top: '12%', left: '34%' },
    { color: '#4f2c75', tilt: '-4deg', top: '6%', left: '62%' },
    { color: '#276758', tilt: '6deg', top: '42%', left: '48%' },
    { color: '#27466b', tilt: '-5deg', top: '52%', left: '10%' },
    { color: '#784c24', tilt: '4deg', top: '68%', left: '36%' },
    { color: '#2f4ea2', tilt: '-3deg', top: '56%', left: '66%' },
];

const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberSession, setRememberSession] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                email,
                password
            });

            if (rememberSession) {
                localStorage.setItem('token', response.data.token);
            } else {
                sessionStorage.setItem('token', response.data.token);
            }

            const rol = response.data.rol;
            if (rol === 'Administrador') {
                navigate('/admin');
            } else {
                navigate('/suscriptor');
            }
        } catch (err) {
            setError('Credenciales inválidas. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container-fluid min-vh-100 p-0 text-white"
            style={{ backgroundColor: '#12131a' }}
        >
            <div className="row g-0 min-vh-100">
                {/* Panel izquierdo decorativo */}
                <div
                    className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 position-relative overflow-hidden"
                    style={{ backgroundColor: '#0c0d12' }}
                >
                    <div className="d-flex align-items-center gap-2 position-relative" style={{ zIndex: 2 }}>
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded-3"
                            style={{ width: '34px', height: '34px', backgroundColor: '#6c47ff' }}
                        >
                            ▶
                        </span>
                        <span className="fw-bold fs-5">{BRAND_NAME}</span>
                    </div>

                    {/* Tarjetas inclinadas */}
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ opacity: 0.85 }}>
                        {posterCards.map((card, idx) => (
                            <div
                                key={idx}
                                className="position-absolute rounded-4 shadow"
                                style={{
                                    width: '135px',
                                    height: '190px',
                                    backgroundColor: card.color,
                                    top: card.top,
                                    left: card.left,
                                    transform: `rotate(${card.tilt})`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="position-relative" style={{ zIndex: 2 }}>
                        <h2 className="fw-bold display-6 mb-2">
                            Tus series y películas, donde quieras.
                        </h2>
                        <p className="text-secondary mb-0" style={{ maxWidth: '420px' }}>
                            Retoma justo donde lo dejaste en tu TV, celular o computador.
                        </p>
                    </div>
                </div>

                {/* Panel derecho: Formulario */}
                <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 p-sm-5">
                    <div className="w-100" style={{ maxWidth: '400px' }}>
                        <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
                            <span
                                className="d-inline-flex align-items-center justify-content-center rounded-3"
                                style={{ width: '32px', height: '32px', backgroundColor: '#6c47ff' }}
                            >
                                ▶
                            </span>
                            <span className="fw-bold fs-5">{BRAND_NAME}</span>
                        </div>

                        <h3 className="fw-bold mb-1">Bienvenido de vuelta</h3>
                        <p className="text-secondary small mb-4">
                            Ingresa a tu cuenta de {BRAND_NAME} para continuar.
                        </p>

                        {error && (
                            <div className="alert alert-danger py-2 small text-center" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label small text-light">Correo electrónico</label>
                                <input
                                    type="email"
                                    className="form-control text-white border-secondary"
                                    style={{ backgroundColor: '#000000' }}
                                    placeholder="usuario@streaming.cl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-light mb-0">Contraseña</label>
                                    <span className="small text-secondary" style={{ cursor: 'default' }}>
                                        ¿Olvidaste tu contraseña?
                                    </span>
                                </div>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control text-white border-secondary"
                                        style={{ backgroundColor: '#000000' }}
                                        placeholder="Tu contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary text-light"
                                        style={{ backgroundColor: '#000000' }}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label="Mostrar o ocultar contraseña"
                                    >
                                        {showPassword ? 'Ocultar' : 'Ver'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-check mb-4">
                                <input
                                    id="rememberSession"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={rememberSession}
                                    onChange={(e) => setRememberSession(e.target.checked)}
                                />
                                <label htmlFor="rememberSession" className="form-check-label small text-secondary">
                                    Mantener sesión iniciada
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 py-2 fw-semibold text-white"
                                style={{ backgroundColor: '#6c47ff', borderColor: '#6c47ff' }}
                                disabled={loading}
                            >
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </form>

                        <div className="d-flex align-items-center my-4 text-secondary small">
                            <hr className="flex-grow-1 border-secondary opacity-25" />
                            <span className="px-3">o continúa con</span>
                            <hr className="flex-grow-1 border-secondary opacity-25" />
                        </div>

                        <div className="row g-2 mb-4">
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 py-2 text-light"
                                    style={{ backgroundColor: '#181a24' }}
                                    disabled
                                >
                                    Google
                                </button>
                            </div>
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 py-2 text-light"
                                    style={{ backgroundColor: '#181a24' }}
                                    disabled
                                >
                                    Apple
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-secondary small mb-0">
                            ¿Nuevo en {BRAND_NAME}?{' '}
                            <span className="fw-semibold" style={{ color: '#8b6eff' }}>
                                Crea tu cuenta
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;