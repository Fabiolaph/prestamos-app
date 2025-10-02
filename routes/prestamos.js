const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');
const Cliente = require('../models/Cliente');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth(), async (req, res) => {
  const prestamos = await Prestamo.find().populate('cliente').populate('pagos');
  res.render('prestamos/list', { prestamos });
});

router.get('/create', requireAuth(['admin', 'asistente']), async (req, res) => {
  const clientes = await Cliente.find();
  res.render('prestamos/create', { clientes });
});

router.post('/create', requireAuth(['admin', 'asistente']), async (req, res) => {
  const { cliente, monto, tasaInteres, plazo } = req.body;
  const prestamo = new Prestamo({ cliente, monto: parseFloat(monto), tasaInteres: parseFloat(tasaInteres), plazo: parseInt(plazo) });
  await prestamo.save();
  await Cliente.findByIdAndUpdate(cliente, { $push: { historialPrestamos: prestamo._id } });
  res.redirect('/prestamos');
});

router.get('/:id', requireAuth(), async (req, res) => {
  const prestamo = await Prestamo.findById(req.params.id).populate('cliente').populate('pagos');
  res.render('prestamos/view', { prestamo });
});

// Agrega delete si necesitas: router.post('/:id/delete', ...)

module.exports = router;