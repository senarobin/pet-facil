const servicoRosto = require('../services/faceService');

async function cadastrarRosto(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let descritor = null;
    if (req.body) {
      descritor = req.body.descriptor;
      if (descritor === null || descritor === undefined) {
        descritor = req.body.descritor;
      }
    }
    let resultado = await servicoRosto.cadastrarRosto(idUsuario, descritor);
    return res.json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function entrarComRosto(req, res, next) {
  try {
    let descritor = null;
    let dicaLogin = null;
    if (req.body) {
      descritor = req.body.descriptor;
      if (descritor === null || descritor === undefined) {
        descritor = req.body.descritor;
      }
      dicaLogin = req.body.login;
      if (dicaLogin === null || dicaLogin === undefined) {
        dicaLogin = req.body.loginHint;
      }
    }
    let resultado = await servicoRosto.entrarComRosto(descritor, dicaLogin);
    return res.json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function statusRosto(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let resultado = await servicoRosto.statusRosto(idUsuario);
    return res.json(resultado);
  } catch (erro) {
    return next(erro);
  }
}

async function registerFace(req, res, next) {
  return cadastrarRosto(req, res, next);
}

async function loginWithFace(req, res, next) {
  return entrarComRosto(req, res, next);
}

async function faceStatus(req, res, next) {
  return statusRosto(req, res, next);
}

module.exports = { cadastrarRosto, entrarComRosto, statusRosto, registerFace, loginWithFace, faceStatus };
