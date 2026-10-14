const mongoose = require('mongoose');

const usuario = new mongoose.Schema({

  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nomeCompleto: {
    type: String,
    required: true,
    trim: true
  },
  login: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senhaHash: {
    type: String,
    required: true
  },
  perfil: {
    type: String,
    enum: ['usuario','admin'],
    default: 'usuario',
    required: true
  },
},{
  timestamps: true,
  collection: 'usuarios'
});

module.exports = mongoose.model('Usuario',usuario);
