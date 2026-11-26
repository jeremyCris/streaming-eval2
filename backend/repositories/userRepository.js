const db = require('../config/database');

const findUserByEmail = async (email) => {
  const queryText = 'SELECT id, email, password_hash, rol FROM usuarios WHERE email = $1';
  const result = await db.query(queryText, [email]);
  return result.rows[0];
};

const createUser = async (email, passwordHash, rol = 'Suscriptor') => {
  const queryText = `
    INSERT INTO usuarios (email, password_hash, rol)
    VALUES ($1, $2, $3)
    RETURNING id, email, rol
  `;
  const result = await db.query(queryText, [email, passwordHash, rol]);
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser
};