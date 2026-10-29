import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Verificamos si existe un token en el navegador
    const token = localStorage.getItem('token');
    
    // Si NO hay token, lo pateamos de vuelta a la ruta raíz (Login)
    if (!token) {
        return <Navigate to="/" />;
    }

    // Si SÍ hay token, le permitimos ver el componente que solicitó
    return children;
};

export default ProtectedRoute;