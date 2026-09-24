const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.role)) {
      return res.status(403).json({
        mensaje: `Acceso denegado. Rol requerido: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { autorizarRoles };