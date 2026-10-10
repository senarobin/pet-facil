const mongoose = require('mongoose');

const esquemaMensagemChat = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  papel: { type: String, enum: ['usuario', 'assistente'], required: true },
  conteudo: { type: String, required: true },
  metadados: {
    fontes: [{ type: String }],
    tamanhoContextoUsado: { type: Number },
  },
}, { timestamps: true, collection: 'mensagens_chat' });

esquemaMensagemChat.index({ usuario: 1, createdAt: 1 });

module.exports = mongoose.model('MensagemChat', esquemaMensagemChat);

