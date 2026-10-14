const produto = require('../services/productService')

async function listar(req,res,next) {

  try {

    let lista = await produto.listarProdutos()
    return res.json(lista)

  }
  catch(erro) {
    return next(erro)
  }
}

module.exports = {listar}
