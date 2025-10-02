const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Cliente = require('../models/Cliente');
const requireAuth = require('../middleware/auth');

// Config Multer para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/', requireAuth(), async (req, res) => {
  const clientes = await Cliente.find().populate('historialPrestamos');
  res.render('clientes/list', { clientes });
});

router.get('/create', requireAuth(['admin', 'asistente']), (req, res) => res.render('clientes/create'));

router.post('/create', requireAuth(['admin', 'asistente']), upload.array('documentos', 5), async (req, res) => {
  const { nombre, direccion, telefono, correo } = req.body;
  const documentos = req.files.map(file => `/images/${file.filename}`);
  const cliente = new Cliente({ nombre, direccion, telefono, correo, documentos });
  await cliente.save();
  res.redirect('/clientes');
});

// Similar para view, edit, delete...

module.exports = router;