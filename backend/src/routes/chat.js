const express = require('express');
const controladorChat = require('../controllers/chatController');
const autenticacao = require('../middleware/auth');
const exigirAutenticacao = autenticacao.exigirAutenticacao;
const router = express.Router();
router.post('/', exigirAutenticacao, controladorChat.enviarMensagem);
router.get('/history', exigirAutenticacao, controladorChat.obterHistorico);
router.get('/historico', exigirAutenticacao, controladorChat.obterHistorico);
module.exports = router;
