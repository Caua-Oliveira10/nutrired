require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', servicio: 'NutriRed' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    mensaje: err.message || 'Error interno del servidor'
  });
});

module.exports = app;