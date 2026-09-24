const mongoose = require('mongoose');

const conectarDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nutrired';
  await mongoose.connect(uri);
  console.log('✅ MongoDB conectado');
};

module.exports = conectarDB;