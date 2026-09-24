const express = require('express');
const router = express.Router();
const { registrar, login, perfil } = require('../controllers/authController');
const { proteger } = require('../middlewares/authMiddleware');
const { autorizarRoles } = require('../middlewares/roleMiddleware');

router.post('/registro', registrar);
router.post('/login', login);
router.get('/perfil', proteger, perfil);

// Ruta exclusiva para administradores (ejemplo)
router.get('/admin/usuarios', proteger, autorizarRoles('administrador'), (req, res) => {
  res.json({ mensaje: 'Listado de usuarios (solo administrador)' });
});

module.exports = router;