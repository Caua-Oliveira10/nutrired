// tests/unit/database.test.js
const mongoose = require('mongoose');
const conectarDB = require('../../src/config/database');

describe('config/database - conectarDB', () => {
  let connectSpy;

  beforeEach(() => {
    connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(true);
  });

  afterEach(() => {
    connectSpy.mockRestore();
  });

  test('conecta a MongoDB usando MONGO_URI del entorno', async () => {
    process.env.MONGO_URI = 'mongodb://test:27017/nutrired_test';

    await conectarDB();

    expect(connectSpy).toHaveBeenCalledWith('mongodb://test:27017/nutrired_test');
  });

  test('usa URI por defecto si MONGO_URI no está definido', async () => {
    delete process.env.MONGO_URI;

    await conectarDB();

    expect(connectSpy).toHaveBeenCalledWith('mongodb://localhost:27017/nutrired');
  });
});