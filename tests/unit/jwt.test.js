process.env.JWT_SECRET = 'test_secret';

const jwt = require('jsonwebtoken');
const { generarToken, verificarToken } = require('../../src/utils/jwt');

describe('Utilidades JWT', () => {
  test('genera y verifica un token correctamente', () => {
    const token = generarToken({ id: '123', role: 'donante' });
    const decoded = verificarToken(token);
    expect(decoded.id).toBe('123');
    expect(decoded.role).toBe('donante');
  });

  test('lanza error con token inválido', () => {
    expect(() => verificarToken('token.falso.invalido')).toThrow();
  });

  test('usa 24h por defecto si JWT_EXPIRES_IN no está definido', () => {
    const original = process.env.JWT_EXPIRES_IN;
    delete process.env.JWT_EXPIRES_IN;

    jest.resetModules();
    const jwtFresh = require('../../src/utils/jwt');
    const token = jwtFresh.generarToken({ id: '1', role: 'donante' });
    const decoded = jwt.decode(token);

    expect(decoded.exp - decoded.iat).toBe(86400); // 24h

    process.env.JWT_EXPIRES_IN = original;
  });
});

test('respeta JWT_EXPIRES_IN cuando está definido', () => {
  process.env.JWT_EXPIRES_IN = '2h';
  jest.resetModules();
  const jwtFresh = require('../../src/utils/jwt');
  const token = jwtFresh.generarToken({ id: '1', role: 'donante' });
  const decoded = jwt.decode(token);

  // 2h = 7200 segundos
  expect(decoded.exp - decoded.iat).toBe(7200);
});