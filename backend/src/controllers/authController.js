const servicoAutenticacao = require('../services/authService');

async function registrar(req, res, next) {
  try {
    let resultado = await servicoAutenticacao.registrar(req.body);
    return res.status(201).json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function entrar(req, res, next) {
  try {
    let resultado = await servicoAutenticacao.entrar(req.body);
    return res.json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function login(req, res, next) {
  return entrar(req, res, next);
}

module.exports = { registrar, entrar, login };
