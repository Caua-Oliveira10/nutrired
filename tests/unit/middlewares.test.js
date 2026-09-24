const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

const app = require('../../src/app');
const User = require('../../src/models/User');
const { generarToken } = require('../../src/utils/jwt');

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

describe('authMiddleware', () => {
  test('rechaza token con usuario inexistente (401)', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const token = generarToken({ id: fakeId.toString(), role: 'donante' });

    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.mensaje).toBe('Usuario no encontrado');
  });

  test('rechaza header sin "Bearer" (401)', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', 'tokenSinPrefijo');

    expect(res.statusCode).toBe(401);
  });

  test('rechaza token expirado (401)', async () => {
    const expirado = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString(), role: 'donante' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${expirado}`);

    expect(res.statusCode).toBe(401);
  });
});

describe('roleMiddleware', () => {
  test('usuario donante no accede a ruta admin (403)', async () => {
    const reg = await request(app).post('/api/auth/registro').send({
      nombre: 'Usuario Test',
      email: 'role@test.com',
      password: 'password123'
    });

    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.mensaje).toContain('Acceso denegado');
  });

  test('administrador sí accede a ruta admin (200)', async () => {
    const admin = await User.create({
      nombre: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'administrador'
    });

    const token = generarToken({ id: admin._id.toString(), role: 'administrador' });

    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Listado de usuarios (solo administrador)');
  });
});

describe('app - manejo de errores y salud', () => {
  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('ruta inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/noexiste');
    expect(res.statusCode).toBe(404);
  });
});

describe('roleMiddleware - casos extremos', () => {
  test('rechaza si no hay usuario en req (403)', () => {
    const { autorizarRoles } = require('../../src/middlewares/roleMiddleware');
    const middleware = autorizarRoles('administrador');

    const req = {};  // ← sin req.usuario
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('permite paso cuando el rol coincide', () => {
    const { autorizarRoles } = require('../../src/middlewares/roleMiddleware');
    const middleware = autorizarRoles('administrador', 'donante');

    const req = { usuario: { role: 'donante' } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});