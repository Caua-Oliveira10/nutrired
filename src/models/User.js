const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 8,
      select: false
    },
    telefono: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['administrador', 'donante', 'organizacion'],
      default: 'donante'
    },
    tipoDonante: {
      type: String,
      enum: ['empresa', 'persona_natural'],
      default: 'persona_natural'
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash automático de contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);