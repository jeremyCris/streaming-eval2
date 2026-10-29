import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubscriberView = () => {
  const [contenidos, setContenidos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Obtenemos los contenidos desde el backend
    axios.get('http://localhost:3000/api/contenidos')
      .then(response => {
        setContenidos(response.data);
      })
      .catch(err => {
        console.error('Error al cargar catálogo:', err);
        setError('No se pudo cargar el catálogo de contenidos.');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Transmisión</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {contenidos.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img 
                src={item.url_imagen || 'https://via.placeholder.com/300x200'} 
                className="card-img-top" 
                alt={item.titulo}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body d-flex flex-column">
                <span className="badge bg-primary mb-2 align-self-start">{item.categoria}</span>
                <h5 className="card-title">{item.titulo}</h5>
                <p className="card-text text-muted flex-grow-1">{item.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriberView;