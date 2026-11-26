// routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', contentController.getAll);
router.post('/', verificarToken, soloAdmin, contentController.create);
router.put('/:id', verificarToken, soloAdmin, contentController.update);
router.delete('/:id', verificarToken, soloAdmin, contentController.delete);

module.exports = router;