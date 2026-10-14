const pedido = require('../services/orderService')

async function listar(req,res,next) {

  try {

    let idUsuario = req.usuario.sub

    let lista = await pedido.listarPedidos(idUsuario)
    return res.json(lista)
  }
  catch(erro) {
    return next(erro)
  }
}

async function cancelar(req,res,next) {

  try {

    let idUsuario = req.usuario.sub

    let idPedido = req.params.id

    let resultado = await pedido.cancelarPedido(idUsuario,idPedido)
    return res.json(resultado)

  }
  catch(erro) {
    if(erro.status) {
      return res.status(erro.status).json({mensagem: erro.message})
    }
    return next(erro)
  }
}

async function criar(req,res,next) {

  try {

    let idUsuario = req.usuario.sub
    let itens = null

    if(req.body) {
      itens = req.body.itens

      if(itens === null || itens === undefined) {
        itens = req.body.items
      }
      if(Array.isArray(itens)) {

        let conv = []
        for(let i=0;i<itens.length;i++) {
          let it = itens[i]
          let idP = it.idProduto

          if(idP === undefined || idP === null){
            idP=it.productId
          }
          if(idP === undefined || idP === null){
            idP=it.id
          }

          let q = it.quantidade

          if(q === undefined||q ===null){
            q=it.quantity
          }

          conv.push({idProduto: idP,quantidade: q})
        }
        itens = conv
      }
    }

    let resultado = await pedido.criarPedido(idUsuario,itens)
    return res.status(201).json(resultado)

  } 
  catch(erro) {
    if(erro.status) {
      return res.status(erro.status).json({mensagem: erro.message})
    }
    return next(erro)
  }
}

module.exports = {listar,cancelar,criar}
