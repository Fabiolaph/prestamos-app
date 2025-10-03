const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  prestamo: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestamo', required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
});

pagoSchema.post('save', async function () {
  const Prestamo = mongoose.model('Prestamo');
  const prestamo = await Prestamo.findById(this.prestamo);
  prestamo.saldoPendiente -= this.monto;
  if (prestamo.saldoPendiente <= 0) prestamo.estado = 'pagado';
  else if (new Date() > prestamo.fechaVencimiento) prestamo.estado = 'vencido';
  await prestamo.save();
});

module.exports = mongoose.model('Pago', pagoSchema);