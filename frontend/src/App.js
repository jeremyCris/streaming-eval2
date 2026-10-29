import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importamos las vistas
import LoginView from './views/LoginView';
import AdminView from './views/AdminView';
import SubscriberView from './views/SubscriberView';

// Importamos nuestro Guardián
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública: Cualquiera puede ver el Login */}
        <Route path="/" element={<LoginView />} />
        
        {/* Rutas protegidas: Solo con token */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suscriptor" 
          element={
            <ProtectedRoute>
              <SubscriberView />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;