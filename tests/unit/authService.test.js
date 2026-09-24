const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authService = require('../../src/services/authService');
const User = require('../../src/models/User');

process.env.JWT_SECRET = 'test_secret';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('authService.registrarUsuario', () => {
  test('registra un donante correctamente', async () => {
    const resultado = await authService.registrarUsuario({
      nombre: 'Empresa Solidaria',
      email: 'contacto@solidaria.com',
      password: 'password123',
      tipoDonante: 'empresa'
    });

    expect(resultado.token).toBeDefined();
    expect(resultado.usuario.email).toBe('contacto@solidaria.com');
    expect(resultado.usuario.role).toBe('donante');
  });

  test('lanza error si el email ya existe', async () => {
    await authService.registrarUsuario({
      nombre: 'Empresa Uno',
      email: 'dup@test.com',
      password: 'password123'
    });

    await expect(
      authService.registrarUsuario({
        nombre: 'Empresa Dos',
        email: 'dup@test.com',
        password: 'password123'
      })
    ).rejects.toThrow('El email ya está registrado');
  });
});

describe('authService.loginUsuario', () => {
  beforeEach(async () => {
    await authService.registrarUsuario({
      nombre: 'Donante Uno',
      email: 'donante@test.com',
      password: 'password123'
    });
  });

  test('login exitoso devuelve token', async () => {
    const res = await authService.loginUsuario({
      email: 'donante@test.com',
      password: 'password123'
    });
    expect(res.token).toBeDefined();
  });

  test('login con contraseña incorrecta falla', async () => {
    await expect(
      authService.loginUsuario({
        email: 'donante@test.com',
        password: 'incorrecta'
      })
    ).rejects.toThrow('Credenciales inválidas');
  });
});

describe('User model - hooks', () => {
  test('no re-hashea password si no fue modificado', async () => {
    const User = require('../../src/models/User');

    const user = await User.create({
      nombre: 'Hook Test',
      email: 'hook@test.com',
      password: 'password123'
    });

    const hashOriginal = user.password;

    // Actualizar otro campo SIN tocar el password
    user.nombre = 'Hook Test Actualizado';
    await user.save();

    const userRecargado = await User.findById(user._id).select('+password');
    expect(userRecargado.password).toBe(hashOriginal); // no cambió
  });
});

test('login de usuario inactivo falla con 403', async () => {
  await authService.registrarUsuario({
    nombre: 'Usuario Inactivo',
    email: 'inactivo@test.com',
    password: 'password123'
  });

  const User = require('../../src/models/User');
  await User.updateOne({ email: 'inactivo@test.com' }, { activo: false });

  await expect(
    authService.loginUsuario({
      email: 'inactivo@test.com',
      password: 'password123'
    })
  ).rejects.toThrow('Usuario inactivo');
});