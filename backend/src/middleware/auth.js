const jwt = require('jsonwebtoken')

function autenticacao(req,res,next) {

  let header = null
  
  if(req.headers) {
    header = req.headers.authorization
  }
  let token = null

  if(header){token =header.replace('Bearer ','')
  }

  if(token === null ||token === undefined || token === ''){
    return res.status(401).json({mensagem:'Token não informado.'})
  }

  try {
    let decodificado = jwt.verify(token,process.env.JWT_SECRET)
    req.usuario = decodificado
    return next()

  }
  catch(erro) {
    return res.status(401).json({mensagem: 'Token inválido'})
  }
}

function perfil() {

  let perfisPermitidos = []

  for(let i=0;i<arguments.length;i++){
    perfisPermitidos.push(arguments[i])
  }

  return function(req,res,next) {

    if(req.usuario === null || req.usuario === undefined){
      return res.status(401).json({mensagem: 'Não autenticado.'})
    }

    let usuarioToken = req.usuario

    let perfilUsuario = 'usuario'

    if(usuarioToken.perfil) {
      perfilUsuario= usuarioToken.perfil
    }

    else {
      if(usuarioToken.role) {
        if(usuarioToken.role === 'admin'){
          perfilUsuario = 'admin'
        }
        else{
          perfilUsuario = 'usuario'
        }
      }
    }

    let permitido = false

    for(let i=0;i< perfisPermitidos.length;i++){
      if(perfisPermitidos[i]=== perfilUsuario) {
        permitido = true
      }
    }

    if(permitido === false) {
      return res.status(403).json({mensagem:'Infelizmente o seu perfil logado não tem permissão para acessar este recurso'})
    }
    return next()
  };
}

module.exports = {autenticacao,perfil}
