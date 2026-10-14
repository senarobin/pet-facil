const express = require('express')

const controllerProduto = require('../controllers/productController')
const router = express.Router()

router.get('/',controllerProduto.listar)

module.exports = router
