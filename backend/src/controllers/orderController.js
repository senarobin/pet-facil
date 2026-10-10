const servicoPedido = require('../services/orderService');

async function listar(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let lista = await servicoPedido.listarPedidos(idUsuario);
    return res.json(lista);
  } catch (erro) {
    return next(erro);
  }
}

async function cancelar(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let idPedido = req.params.id;
    let resultado = await servicoPedido.cancelarPedido(idUsuario, idPedido);
    return res.json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function criar(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let itens = null;
    if (req.body) {
      itens = req.body.items;
      if (itens === null || itens === undefined) {
        itens = req.body.itens;
      }
    }
    let resultado = await servicoPedido.criarPedido(idUsuario, itens);
    return res.status(201).json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function list(req, res, next) {
  return listar(req, res, next);
}

async function cancel(req, res, next) {
  return cancelar(req, res, next);
}

async function create(req, res, next) {
  return criar(req, res, next);
}

module.exports = { listar, cancelar, criar, list, cancel, create };
