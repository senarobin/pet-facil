const mongoose = require('mongoose');

const esquemaUsuario = new mongoose.Schema({
  cpf: { type: String, required: true, unique: true, trim: true },
  nomeCompleto: { type: String, required: true, trim: true },
  login: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senhaHash: { type: String, required: true },
  perfil: { type: String, enum: ['usuario', 'admin'], default: 'usuario', required: true },
  descritorFacial: { type: [Number], default: null },
  rostoRegistradoEm: { type: Date, default: null },
}, { timestamps: true, collection: 'usuarios' });

module.exports = mongoose.model('Usuario', esquemaUsuario);
