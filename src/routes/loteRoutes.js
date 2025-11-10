const express = require('express');
const router = express.Router();
const LoteController = require('../controllers/loteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'GERENTE'), LoteController.create);
router.get('/', LoteController.getAll);
router.get('/proximos-vencer', LoteController.getLotesProximosVencer);
router.get('/:id', LoteController.getById);
router.get('/producto/:id_producto', LoteController.getByProducto);
router.put('/:id/estado', authorizeRoles('ADMIN', 'GERENTE'), LoteController.updateEstado);

module.exports = router;