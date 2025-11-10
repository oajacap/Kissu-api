const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/productoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'GERENTE'), ProductoController.create);
router.get('/', ProductoController.getAll);
router.get('/:id', ProductoController.getById);
router.get('/categoria/:id_categoria', ProductoController.getByCategoria);
router.put('/:id', authorizeRoles('ADMIN', 'GERENTE'), ProductoController.update);
router.delete('/:id', authorizeRoles('ADMIN'), ProductoController.delete);

module.exports = router;