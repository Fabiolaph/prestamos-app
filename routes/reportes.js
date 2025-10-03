const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');
const Cliente = require('../models/Cliente');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth(['admin']), async (req, res) => {
  try {
    const activos = await Prestamo.countDocuments({ estado: 'activo' });
    const vencidos = await Prestamo.countDocuments({ estado: 'vencido' });
    const pagados = await Prestamo.countDocuments({ estado: 'pagado' });

    const ingresos = await Prestamo.aggregate([
      { $match: { estado: 'pagado' } },
      { $group: { _id: null, total: { $sum: '$intereses' } } }
    ]);

    // === GANANCIAS MENSUALES Y ANUALES ===
    const now = new Date();
    const year = now.getFullYear();
    // Ganancias mensuales (por mes del año actual)
    const mensual = await Prestamo.aggregate([
      { $match: { estado: 'pagado', fechaVencimiento: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) } } },
      { $group: {
        _id: { mes: { $month: '$fechaVencimiento' } },
        total: { $sum: '$intereses' }
      } },
      { $sort: { '_id.mes': 1 } }
    ]);
    // Ganancia anual (acumulada por año)
    const anual = await Prestamo.aggregate([
      { $match: { estado: 'pagado' } },
      { $group: {
        _id: { anio: { $year: '$fechaVencimiento' } },
        total: { $sum: '$intereses' }
      } },
      { $sort: { '_id.anio': 1 } }
    ]);

    // Preparar datos para Chart.js
    const labels = Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('es-MX', {month: 'short'}));
    const dataMes = Array(12).fill(0);
    mensual.forEach(m => { dataMes[m._id.mes-1] = m.total; });
    // Para la gráfica anual, solo mostrar el año actual
    const dataAnual = anual.filter(a => a._id.anio === year).map(a => a.total);

    const clientesCumplidos = await Cliente.aggregate([
      {
        $lookup: {
          from: 'prestamos',
          localField: 'historialPrestamos',
          foreignField: '_id',
          as: 'prestamos'
        }
      },
      {
        $addFields: {
          cumplidos: {
            $size: {
              $filter: {
                input: '$prestamos',
                as: 'prestamo',
                cond: {
                  $and: [
                    { $eq: ['$$prestamo.estado', 'pagado'] },
                    { $lte: ['$$prestamo.fechaVencimiento', '$$prestamo.updatedAt'] }
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { cumplidos: -1 } },
      { $limit: 5 }
    ]);

    const deudores = await Cliente.aggregate([
      {
        $lookup: {
          from: 'prestamos',
          localField: 'historialPrestamos',
          foreignField: '_id',
          as: 'prestamos'
        }
      },
      {
        $addFields: {
          vencidos: {
            $size: {
              $filter: {
                input: '$prestamos',
                as: 'prestamo',
                cond: { $eq: ['$$prestamo.estado', 'vencido'] }
              }
            }
          }
        }
      },
      { $sort: { vencidos: -1 } },
      { $limit: 5 }
    ]);

    res.render('reportes', {
      activos,
      vencidos,
      pagados,
      ingresos: ingresos[0]?.total || 0,
      clientesCumplidos,
      deudores,
      labels,
      dataMes,
      dataAnual
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando el reporte');
  }
});

module.exports = router;
