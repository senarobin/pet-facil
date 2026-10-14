const express = require('express')

const controllerPedido = require('../controllers/orderController')
const autenticacao = require('../middleware/auth')
const exigirAutenticacao = autenticacao.autenticacao
const exigirPerfil = autenticacao.perfil
const router = express.Router()

router.get('/',exigirAutenticacao,controllerPedido.listar)
router.patch('/:id/cancelar',exigirAutenticacao,controllerPedido.cancelar)
router.post('/',exigirAutenticacao,controllerPedido.criar)
router.get('/admin/todos',exigirAutenticacao,exigirPerfil('admin'),
async function(req,res,next) {

  try {

    let Pedido = require('../models/Pedido')

    let pedidos = await Pedido.find().sort({createdAt:-1})
    .populate('itens.produto','nome')
    .populate('usuario','login nomeCompleto')

    let lista = [];
    for (let i=0;i<pedidos.length;i++){
      let p = pedidos[i]
      let usuarioLogin = null

      if(p.usuario){
        if(p.usuario.login){
          usuarioLogin= p.usuario.login
        }
      }

      let codigo = p.codigoRetirada

      let situacao = p.situacao

      lista.push({
        id: p.id,
        usuario: usuarioLogin,
        codigoRetirada: codigo,
        situacao: situacao,
        total: p.total
      })
    }

    return res.json(lista)

  }

  catch(erro) {
    return next(erro)
  }
});

module.exports = router
