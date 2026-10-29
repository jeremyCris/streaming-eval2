import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminView = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Película');
  const [urlImagen, setUrlImagen] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleCreateContent = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      await axios.post('http://localhost:3000/api/contenidos', {
        titulo,
        descripcion,
        categoria,
        url_imagen: urlImagen
      });

      setMensaje('✅ Contenido publicado exitosamente.');
      setTitulo('');
      setDescripcion('');
      setUrlImagen('');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al publicar el contenido.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Administración</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className="card p-4 shadow-sm mb-4">
        <h4>Agregar Nuevo Contenido</h4>
        {mensaje && <div className="alert alert-info mt-2">{mensaje}</div>}

        <form onSubmit={handleCreateContent} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Título</label>
            <input 
              type="text" 
              className="form-control" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Categoría</label>
            <select 
              className="form-select" 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Película">Película</option>
              <option value="Serie">Serie</option>
              <option value="Documental">Documental</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">URL de Imagen / Carátula</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder="https://ejemplo.com/imagen.jpg" 
              value={urlImagen} 
              onChange={(e) => setUrlImagen(e.target.value)} 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-success">
            Publicar Contenido
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminView;