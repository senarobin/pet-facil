const express = require('express');
const controladorProduto = require('../controllers/productController');
const router = express.Router();
router.get('/', controladorProduto.listar);
module.exports = router;
