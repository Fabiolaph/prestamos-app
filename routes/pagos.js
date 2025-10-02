const express = require('express');
const router = express.Router();
const Pago = require('../models/Pago');
const Prestamo = require('../models/Prestamo');
const requireAuth = require('../middleware/auth');

// Nueva ruta base: Lista todos los pagos
router.get('/', requireAuth(), async (req, res) => {
  const pagos = await Pago.find().populate({ path: 'prestamo', populate: { path: 'cliente' } });
  res.render('pagos/list', { pagos });
});

router.get('/create/:prestamoId', requireAuth(['admin', 'cobrador']), async (req, res) => {
  const prestamo = await Prestamo.findById(req.params.prestamoId).populate('cliente');
  res.render('pagos/create', { prestamo });
});

router.post('/create', requireAuth(['admin', 'cobrador']), async (req, res) => {
  const { prestamo, monto } = req.body;
  const pago = new Pago({ prestamo, monto: parseFloat(monto) });
  await pago.save();
  await Prestamo.findByIdAndUpdate(prestamo, { $push: { pagos: pago._id } });
  res.redirect(`/prestamos/${prestamo}`);
});

router.get('/estado/:clienteId', requireAuth(), async (req, res) => {
  const cliente = await Cliente.findById(req.params.clienteId).populate('historialPrestamos');
  const prestamos = await Prestamo.find({ _id: { $in: cliente.historialPrestamos } }).populate('pagos');
  res.render('pagos/estado', { cliente, prestamos });
});

module.exports = router;