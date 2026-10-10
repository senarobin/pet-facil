const servicoProduto = require('../services/productService');

async function listar(req, res, next) {
  try {
    let lista = await servicoProduto.listarProdutos();
    return res.json(lista);
  } catch (erro) {
    return next(erro);
  }
}

async function list(req, res, next) {
  return listar(req, res, next);
}

module.exports = { listar, list };
