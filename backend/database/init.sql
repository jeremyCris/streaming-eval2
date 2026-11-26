CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Suscriptor' CHECK (rol IN ('Administrador', 'Suscriptor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contenidos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    url_imagen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de optimización para consultas de catálogo
CREATE INDEX IF NOT EXISTS idx_contenidos_categoria ON contenidos(categoria);
CREATE INDEX IF NOT EXISTS idx_contenidos_titulo ON contenidos(titulo);

INSERT INTO usuarios (email, password_hash, rol)
VALUES ('admin@streaming.cl', crypt('123456', gen_salt('bf', 10)), 'Administrador')
ON CONFLICT (email) DO NOTHING;

INSERT INTO contenidos (titulo, descripcion, categoria, url_imagen)
VALUES 
    ('Inception', 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de intercambio de sueños.', 'Película', 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'),
    ('Stranger Things', 'Un grupo de jóvenes en los 80 enfrenta fenómenos paranormales y experimentos secretos.', 'Serie', 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg')
ON CONFLICT DO NOTHING;