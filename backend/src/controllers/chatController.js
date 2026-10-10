const servicoChat = require('../services/chatService');

async function enviarMensagem(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let texto = null;
    if (req.body) {
      texto = req.body.message;
      if (texto === null || texto === undefined) {
        texto = req.body.mensagem;
      }
    }
    let resultado = await servicoChat.conversar({ idUsuario: idUsuario, mensagem: texto });
    return res.json(resultado);
  } catch (erro) {
    if (erro.status) {
      return res.status(erro.status).json({ mensagem: erro.message, message: erro.message });
    }
    return next(erro);
  }
}

async function obterHistorico(req, res, next) {
  try {
    let idUsuario = null;
    if (req.usuario) {
      idUsuario = req.usuario.sub;
    } else {
      if (req.user) {
        idUsuario = req.user.sub;
      }
    }
    let limite = 20;
    if (req.query) {
      if (req.query.limit !== null && req.query.limit !== undefined) {
        limite = Number(req.query.limit);
      } else {
        if (req.query.limite !== null && req.query.limite !== undefined) {
          limite = Number(req.query.limite);
        }
      }
    }
    let historico = await servicoChat.historico(idUsuario, limite);
    return res.json(historico);
  } catch (erro) {
    return next(erro);
  }
}

async function sendMessage(req, res, next) {
  return enviarMensagem(req, res, next);
}

async function getHistory(req, res, next) {
  return obterHistorico(req, res, next);
}

module.exports = { enviarMensagem, obterHistorico, sendMessage, getHistory };
