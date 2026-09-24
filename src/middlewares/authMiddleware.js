const { verificarToken } = require('../utils/jwt');
const User = require('../models/User');

const proteger = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ mensaje: 'No autorizado, token faltante' });
    }

    const decoded = verificarToken(token);
    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = { proteger };