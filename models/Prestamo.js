const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  monto: { type: Number, required: true },
  tasaInteres: { type: Number, required: true }, // Porcentaje anual
  plazo: { type: Number, required: true }, // Meses
  fechaInicio: { type: Date, default: Date.now },
  fechaVencimiento: Date,
  intereses: Number, // Calculado
  saldoPendiente: Number,
  estado: { type: String, enum: ['activo', 'vencido', 'pagado'], default: 'activo' },
  pagos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pago' }],
});

prestamoSchema.pre('save', function (next) {
  if (!this.intereses) {
    this.intereses = this.monto * (this.tasaInteres / 100) * (this.plazo / 12);
  }
  this.saldoPendiente = this.monto + this.intereses;
  this.fechaVencimiento = new Date(this.fechaInicio);
  this.fechaVencimiento.setMonth(this.fechaVencimiento.getMonth() + this.plazo);
  next();
});

module.exports = mongoose.model('Prestamo', prestamoSchema);