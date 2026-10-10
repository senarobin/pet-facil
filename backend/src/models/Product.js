const mongoose = require('mongoose');

const esquemaProduto = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  precoAtual: { type: Number, required: true, min: 0 },
  precoPromocional: { type: Number, default: null },
  tipo: { type: String, required: true },
  descricao: { type: String, required: true },
  dataValidade: { type: String, required: true },
  imagemUrl: { type: String, default: null },
}, { timestamps: true, collection: 'produtos' });

module.exports = mongoose.model('Produto', esquemaProduto);
