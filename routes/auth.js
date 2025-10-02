const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.render('login', { error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: false }); // Nueva: Guarda token en cookie (secure: true en producción)
  res.redirect('/dashboard');
});

// Ruta para registro (si la tienes)
router.get('/register', (req, res) => res.render('register', { error: null }));

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render('register', { error: 'Usuario ya existe' });
  }
  const user = new User({ username, password, role: role || 'asistente' });
  await user.save();
  res.redirect('/login');
});

// Para crear usuarios iniciales
router.get('/setup', async (req, res) => {
  await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
  res.send('Usuario admin creado');
});

module.exports = router;