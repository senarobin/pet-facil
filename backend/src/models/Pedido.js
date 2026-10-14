const mongoose = require('mongoose');

const pedido = new mongoose.Schema({

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  codigoRetirada: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  situacao: {
    type: String, 
    enum: ['pendente','cancelado'],
    default: 'pendente',
    required: true
  },
  itens: [{
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto', required: true
    },
    quantidade: {
      type: Number,
      min: 1,
      required: true
    },
    precoUnitario: {
      type: Number,
      min: 0,
      required: true
    },
  }],

  total: {
    type: Number,
    min: 0,
    required: true
  },
},{
  timestamps: true,
  collection: 'pedidos'
});

module.exports = mongoose.model('Pedido',pedido);
