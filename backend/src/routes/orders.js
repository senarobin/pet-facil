const express = require('express');
const controladorPedido = require('../controllers/orderController');
const autenticacao = require('../middleware/auth');
const exigirAutenticacao = autenticacao.exigirAutenticacao;
const exigirPerfil = autenticacao.exigirPerfil;
const router = express.Router();
router.get('/', exigirAutenticacao, controladorPedido.listar);
router.patch('/:id/cancel', exigirAutenticacao, controladorPedido.cancelar);
router.post('/', exigirAutenticacao, controladorPedido.criar);
router.get('/admin/all', exigirAutenticacao, exigirPerfil('admin'), async function(req, res, next) {
  try {
    let Pedido = require('../models/Order');
    let pedidos = await Pedido.find().sort({ createdAt: -1 }).populate('itens.produto', 'nome').populate('usuario', 'login nomeCompleto');
    if (pedidos.length === 0) {
      pedidos = await Pedido.find().sort({ createdAt: -1 }).populate('items.product', 'nome').populate('user', 'login nomeCompleto');
    }
    let lista = [];
    for (let i = 0; i < pedidos.length; i++) {
      let p = pedidos[i];
      let usuarioLogin = null;
      if (p.usuario) {
        if (p.usuario.login) {
          usuarioLogin = p.usuario.login;
        }
      } else {
        if (p.user) {
          if (p.user.login) {
            usuarioLogin = p.user.login;
          }
        }
      }
      let codigo = p.codigoRetirada;
      if (codigo === null || codigo === undefined) {
        codigo = p.pickupCode;
      }
      let situacao = p.situacao;
      if (situacao === null || situacao === undefined) {
        situacao = p.status;
      }
      lista.push({ id: p.id, usuario: usuarioLogin, user: usuarioLogin, codigoRetirada: codigo, pickupCode: codigo, situacao: situacao, status: situacao, total: p.total });
    }
    return res.json(lista);
  } catch (erro) {
    return next(erro);
  }
});
module.exports = router;
