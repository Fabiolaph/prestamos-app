const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://a23328061310457_db_user:PEHW080427MTSRRNA5@prestamosapp.hzcorg5.mongodb.net/?retryWrites=true&w=majority&appName=prestamosapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;