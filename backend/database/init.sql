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
    genero VARCHAR(100),
    url_imagen TEXT,
    imagen_banner TEXT,
    destacado BOOLEAN DEFAULT FALSE,
    anio VARCHAR(10),
    duracion VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contenidos_categoria ON contenidos(categoria);
CREATE INDEX IF NOT EXISTS idx_contenidos_genero ON contenidos(genero);
CREATE INDEX IF NOT EXISTS idx_contenidos_titulo ON contenidos(titulo);

INSERT INTO usuarios (email, password_hash, rol)
VALUES ('admin@streaming.cl', crypt('123456', gen_salt('bf', 10)), 'Administrador')
ON CONFLICT (email) DO NOTHING;

INSERT INTO contenidos (titulo, descripcion, categoria, genero, url_imagen, imagen_banner, destacado, anio, duracion)
VALUES
    -- 3 películas fijas para el carrusel (con banner horizontal)
    ('John Wick', 'Un exasesino a sueldo sale de su retiro para enfrentar a quienes destruyeron lo último que le quedaba.', 'Película', 'Acción', 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg', 'https://images.hdqwalls.com/wallpapers/2019-john-wick-chapter-3-parabellum-4k-17.jpg', TRUE, '2014', '1h 41m'),
    ('The Dark Knight', 'Batman enfrenta una amenaza anárquica conocida como el Guasón que pone a prueba los límites de Ciudad Gótica.', 'Película', 'Acción', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'https://images.hdqwalls.com/download/the-batman-dark-knight-of-gotham-b4-1920x1080.jpg', TRUE, '2008', '2h 32m'),
    ('Interestelar', 'Un grupo de exploradores viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.', 'Película', 'Ciencia ficción', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://cdn.wallpapersafari.com/47/21/P6cKJe.jpg', TRUE, '2014', '2h 49m'),

    -- Resto del catálogo (destacado = FALSE)
    ('Inception', 'Un ladrón que roba secretos corporativos a través del uso de la tecnología de intercambio de sueños.', 'Película', 'Ciencia ficción', 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', NULL, FALSE, '2010', '2h 28m'),
    ('Stranger Things', 'Un grupo de jóvenes en los 80 enfrenta fenómenos paranormales y experimentos secretos.', 'Serie', 'Ciencia ficción', 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', NULL, FALSE, '2016', '51m ep'),
    ('Mad Max: Fury Road', 'En un desierto postapocalíptico, una rebelde y un vagabundo huyen de un tirano en una persecución implacable.', 'Película', 'Acción', 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', NULL, FALSE, '2015', '2h 00m'),
    ('Gladiator', 'Un general romano traicionado es reducido a esclavitud y lucha en la arena para vengar a su familia.', 'Película', 'Acción', 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', NULL, FALSE, '2000', '2h 35m'),
    ('La La Land', 'Una aspirante a actriz y un músico de jazz luchan por mantener vivo su amor mientras persiguen sus sueños en Los Ángeles.', 'Película', 'Romance', 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4f8uit3WH5e.jpg', NULL, FALSE, '2016', '2h 08m'),
    ('Orgullo y prejuicio', 'Las tensiones y malentendidos entre la decidida Elizabeth Bennet y el reservado Sr. Darcy en la Inglaterra rural.', 'Película', 'Romance', 'https://image.tmdb.org/t/p/w500/sGjAwjhYtswFytEvDypNItOUBSB.jpg', NULL, FALSE, '2005', '2h 07m'),
    ('Eterno resplandor de una mente sin recuerdos', 'Tras una ruptura dolorosa, una pareja decide borrar los recuerdos del otro mediante un procedimiento médico.', 'Película', 'Romance', 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdkeFa5taOtg.jpg', NULL, FALSE, '2004', '1h 48m'),
    ('Cuestión de tiempo', 'Un joven descubre que puede viajar en el tiempo dentro de su propia vida y usa ese don para conquistar al amor de su vida.', 'Película', 'Romance', 'https://image.tmdb.org/t/p/w500/iUqfpmO58v1o8l0p36V0g2R3gG.jpg', NULL, FALSE, '2013', '2h 03m'),
    ('El conjuro', 'Investigadores paranormales ayudan a una familia acosada por una presencia oscura en una granja aislada.', 'Película', 'Terror', 'https://image.tmdb.org/t/p/w500/wVYBvHODrwUPBcqrxibMKXVKFe3.jpg', NULL, FALSE, '2013', '1h 52m'),
    ('¡Huye!', 'Un joven afroamericano visita la finca de la familia de su novia y descubre un secreto inquietante.', 'Película', 'Terror', 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', NULL, FALSE, '2017', '1h 44m'),
    ('Hereditary', 'Tras la muerte de la matriarca, una familia empieza a desmoronarse ante revelaciones siniestras sobre su linaje.', 'Película', 'Terror', 'https://image.tmdb.org/t/p/w500/p9fMUW0N8u4j4W0n4n9uY6s2s7L.jpg', NULL, FALSE, '2018', '2h 07m'),
    ('Un lugar en silencio', 'Una familia debe vivir en absoluto silencio para no ser cazada por criaturas con un oído prodigioso.', 'Película', 'Terror', 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg', NULL, FALSE, '2018', '1h 30m'),
    ('Blade Runner 2049', 'Un nuevo blade runner descubre un secreto enterrado durante mucho tiempo que podría sumir a la sociedad en el caos.', 'Película', 'Ciencia ficción', 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', NULL, FALSE, '2017', '2h 44m'),
    ('Duna', 'El heredero de una familia noble debe viajar al planeta más peligroso del universo para asegurar el futuro de su pueblo.', 'Película', 'Ciencia ficción', 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', NULL, FALSE, '2021', '2h 35m'),
    ('Arrival', 'Una lingüista es reclutada para comunicarse con naves extraterrestres que han aterrizado en distintos puntos de la Tierra.', 'Película', 'Ciencia ficción', 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJ8mpoeo.jpg', NULL, FALSE, '2016', '1h 56m'),
    ('Superbad', 'Dos amigos inseparables intentan vivir una última gran fiesta antes de graduarse e ir a distintas universidades.', 'Película', 'Comedia', 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg', NULL, FALSE, '2007', '1h 53m'),
    ('The Grand Budapest Hotel', 'Las aventuras de un conserje legendario y su joven botones en un famoso hotel europeo entre guerras.', 'Película', 'Comedia', 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', NULL, FALSE, '2014', '1h 40m'),
    ('Game Night', 'Una noche de juegos entre amigos se sale de control cuando creen que un secuestro forma parte del misterio.', 'Película', 'Comedia', 'https://image.tmdb.org/t/p/w500/85R8lksnDMR3eG4b5jS1N4u3d1R.jpg', NULL, FALSE, '2018', '1h 40m'),
    ('Parasite', 'Una familia de escasos recursos se infiltra en el hogar de una familia adinerada con consecuencias imprevisibles.', 'Película', 'Suspenso', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', NULL, FALSE, '2019', '2h 12m'),
    ('Whiplash', 'Un joven baterista ambicioso se enfrenta a un instructor implacable que lleva su talento al límite.', 'Película', 'Drama', 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', NULL, FALSE, '2014', '1h 46m'),
    ('Se7en', 'Dos detectives cazan a un asesino en serie que utiliza los siete pecados capitales como eje de sus crímenes.', 'Película', 'Suspenso', 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg', NULL, FALSE, '1995', '2h 07m'),
    ('El Señor de los Anillos: La Comunidad del Anillo', 'Un joven hobbit emprende una travesía épica para destruir un anillo de poder absoluto.', 'Película', 'Fantasía', 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', NULL, FALSE, '2001', '2h 58m'),
    ('Pan''s Labyrinth', 'En la España de posguerra, una niña se refugia en un mundo fantástico habitado por criaturas mágicas.', 'Película', 'Fantasía', 'https://image.tmdb.org/t/p/w500/z7x8h3p9y8x4s5t6u7v8w9x0y1z.jpg', NULL, FALSE, '2006', '1h 58m'),
    ('One Piece', 'Monkey D. Luffy y su tripulación navegan el Grand Line en busca del legendario tesoro One Piece.', 'Anime', 'Animación', 'https://image.tmdb.org/t/p/w500/cMD9Soz1u3l416vuABvRlaeHKuL.jpg', NULL, FALSE, '1999', '24m ep'),
    ('Spirited Away', 'Una niña queda atrapada en un mundo de espíritus y debe trabajar en una casa de baños para liberar a sus padres.', 'Anime', 'Animación', 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', NULL, FALSE, '2001', '2h 05m'),
    ('Breaking Bad', 'Un profesor de química se asocia con un exalumno para fabricar y vender metanfetamina tras recibir un duro diagnóstico.', 'Serie', 'Drama', 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', NULL, FALSE, '2008', '47m ep'),
    ('Planet Earth II', 'Un recorrido visual por los hábitats más extraordinarios del planeta y la vida salvaje que los habita.', 'Documental', 'Documental', 'https://image.tmdb.org/t/p/w500/w7e6G00aV2gL0h6d7v8w9x0y1z2a.jpg', NULL, FALSE, '2016', '50m ep')
ON CONFLICT DO NOTHING;