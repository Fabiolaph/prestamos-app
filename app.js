const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./utils/db');
const cookieParser = require('cookie-parser'); // Nueva importación

// Rutas completas
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const prestamosRoutes = require('./routes/prestamos');
const pagosRoutes = require('./routes/pagos');
const reportesRoutes = require('./routes/reportes');

// Importa el middleware de auth
const requireAuth = require('./middleware/auth');

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Nuevo: Para manejar cookies

app.use('/', authRoutes);
app.use('/clientes', clientesRoutes);
app.use('/prestamos', prestamosRoutes);
app.use('/pagos', pagosRoutes);
app.use('/reportes', reportesRoutes);

app.get('/dashboard', requireAuth(), (req, res) => res.render('dashboard', { user: req.user }));

// Ruta para raíz
app.get('/', (req, res) => {
  res.redirect('/login');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
  console.log(`Navega en: http://localhost:${port}`);
});