const mongoose = require('mongoose');

async function conectarBanco() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');
}

module.exports = {conectarBanco};
