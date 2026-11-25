const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/', contentController.getAll);
router.post('/', contentController.create);
router.put('/:id', contentController.update);
router.delete('/:id', contentController.delete);

module.exports = router;