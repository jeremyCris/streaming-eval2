// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definimos que cuando alguien haga un POST a /login, se ejecute nuestro controlador
router.post('/login', authController.login);

module.exports = router;