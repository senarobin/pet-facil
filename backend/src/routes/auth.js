const express = require('express')
const controllerAutenticacao = require('../controllers/authController')
const router = express.Router()

router.post('/registrar',controllerAutenticacao.registrar)
router.post('/login',controllerAutenticacao.entrar)

module.exports = router
