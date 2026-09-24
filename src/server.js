require('dotenv').config();
const app = require('./app');
const conectarDB = require('./config/database');

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  try {
    await conectarDB();
    app.listen(PORT, () => {
      console.log(`🚀 NutriRed API escuchando en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error al conectar la BD:', err);
    process.exit(1);
  }
};

iniciar();

module.exports = { iniciar };