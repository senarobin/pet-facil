const express = require('express')

const controllerChat = require('../controllers/chatController')
const autenticacao = require('../middleware/auth')

const exigirAutenticacao = autenticacao.autenticacao
const router = express.Router()

router.post('/',exigirAutenticacao,controllerChat.enviarMensagem)
router.get('/historico',exigirAutenticacao,controllerChat.obterHistorico)

module.exports = router
