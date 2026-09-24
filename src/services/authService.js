const User = require('../models/User');
const { generarToken } = require('../utils/jwt');

const registrarUsuario = async ({ nombre, email, password, telefono, tipoDonante }) => {
  const existente = await User.findOne({ email });
  if (existente) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  const usuario = await User.create({
    nombre,
    email,
    password,
    telefono,
    tipoDonante,
    role: 'donante'
  });

  const token = generarToken({ id: usuario._id, role: usuario.role });

  return {
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role,
      tipoDonante: usuario.tipoDonante
    },
    token
  };
};

const loginUsuario = async ({ email, password }) => {
  const usuario = await User.findOne({ email }).select('+password');
  if (!usuario || !(await usuario.comparePassword(password))) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  if (!usuario.activo) {
    const error = new Error('Usuario inactivo');
    error.statusCode = 403;
    throw error;
  }

  const token = generarToken({ id: usuario._id, role: usuario.role });

  return {
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      role: usuario.role
    },
    token
  };
};

module.exports = { registrarUsuario, loginUsuario };