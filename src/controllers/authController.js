const authService = require('../services/authService');

const registrar = async (req, res, next) => {
  try {
    const resultado = await authService.registrarUsuario(req.body);
    res.status(201).json({
      mensaje: 'Usuario donante registrado exitosamente',
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const resultado = await authService.loginUsuario(req.body);
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      ...resultado
    });
  } catch (error) {
    next(error);
  }
};

const perfil = async (req, res) => {
  res.status(200).json({ usuario: req.usuario });
};

module.exports = { registrar, login, perfil };