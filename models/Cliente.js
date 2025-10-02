const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  direccion: String,
  telefono: String,
  correo: String,
  documentos: [{ type: String }], // Array de paths a imágenes
  historialPrestamos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prestamo' }],
});

module.exports = mongoose.model('Cliente', clienteSchema);