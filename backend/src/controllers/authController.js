const autenticacao = require('../services/authService')

async function registrar(req,res,next) {

  try {
    let resultado = await autenticacao.registrar(req.body)
    return res.status(201).json(resultado)
  }
  catch(erro) {
    if(erro.status) {
      return res.status(erro.status).json({mensagem: erro.message})
    }
    return next(erro)
  }
}

async function entrar(req,res,next) {

  try {
    let resultado = await autenticacao.entrar(req.body)
    return res.json(resultado)
  }
  catch(erro) {
    if(erro.status) {
      return res.status(erro.status).json({mensagem: erro.message})
    }
    return next(erro)
  }
}

module.exports = {registrar,entrar}
