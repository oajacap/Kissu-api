const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/clienteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.post('/', ClienteController.create);
router.get('/', ClienteController.getAll);
router.get('/search', ClienteController.search);
router.get('/:id', ClienteController.getById);
router.get('/:id/historial', ClienteController.getHistorialCompras);
router.put('/:id', ClienteController.update);
router.delete('/:id', authorizeRoles('ADMIN'), ClienteController.delete);

module.exports = router;