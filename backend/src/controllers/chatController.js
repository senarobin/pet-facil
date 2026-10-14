const chat = require('../services/chatService')

async function enviarMensagem(req,res,next) {

  try {

    let idUsuario = req.usuario.sub
    let texto = req.body.mensagem

    if(texto === null || texto ===undefined) {
      texto = req.body.message
    }

    let resultado = await chat.conversar({idUsuario: idUsuario,mensagem: texto})
    return res.json(resultado)

  }
  catch(erro) {
    if(erro.status) {
      return res.status(erro.status).json({mensagem: erro.message})
    }
    return next(erro)
  }
}

async function obterHistorico(req,res,next) {

  try {

    let idUsuario = req.usuario.sub
    let limite = 20

    if(req.query) {

      if(req.query.limite !== null && req.query.limite !== undefined) {
        limite = Number(req.query.limite)
      }

      else if(req.query.limit !== null && req.query.limit !== undefined) {
        limite = Number(req.query.limit)
      }
    }

    let historico = await chat.historico(idUsuario,limite)

    return res.json(historico)
  }
  catch(erro) {
    return next(erro)
  }
}

module.exports = {enviarMensagem,obterHistorico}
