const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// GET /api/contenidos -> Obtener catálogo completo
router.get('/', contentController.getAll);

// POST /api/contenidos -> Crear nuevo título
router.post('/', contentController.create);

module.exports = router;