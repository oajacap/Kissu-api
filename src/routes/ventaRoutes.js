const express = require('express');
const router = express.Router();
const VentaController = require('../controllers/ventaController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'VENDEDOR', 'CAJERO'), VentaController.create);
router.get('/', VentaController.getAll);
router.get('/:id', VentaController.getById);
router.put('/:id/cancelar', authorizeRoles('ADMIN', 'GERENTE'), VentaController.cancel);

module.exports = router;