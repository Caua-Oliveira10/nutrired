const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
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

describe('POST /api/auth/registro', () => {
  test('registra un donante y devuelve 201 + token', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Empresa Test',
      email: 'test@empresa.com',
      password: 'password123',
      tipoDonante: 'empresa'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.role).toBe('donante');
  });

  test('rechaza email duplicado con 409', async () => {
    const payload = {
      nombre: 'Test',
      email: 'dup@test.com',
      password: 'password123'
    };
    await request(app).post('/api/auth/registro').send(payload);
    const res = await request(app).post('/api/auth/registro').send(payload);
    expect(res.statusCode).toBe(409);
  });
});

describe('GET /api/auth/perfil', () => {
  test('rechaza sin token (401)', async () => {
    const res = await request(app).get('/api/auth/perfil');
    expect(res.statusCode).toBe(401);
  });

  test('devuelve perfil con token válido', async () => {
    const reg = await request(app).post('/api/auth/registro').send({
      nombre: 'User',
      email: 'user@test.com',
      password: 'password123'
    });

    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.email).toBe('user@test.com');
  });
});

describe('Control de roles', () => {
  test('usuario donante no accede a /admin/usuarios (403)', async () => {
    const reg = await request(app).post('/api/auth/registro').send({
      nombre: 'User',
      email: 'norole@test.com',
      password: 'password123'
    });

    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.statusCode).toBe(403);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/registro').send({
      nombre: 'Login Test',
      email: 'login@test.com',
      password: 'password123'
    });
  });

  test('login exitoso devuelve 200 + token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('login con credenciales inválidas devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'mal'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.mensaje).toBe('Credenciales inválidas');
  });
});