const crypto = require('crypto');
const Pedido = require('../models/Order');
const Produto = require('../models/Product');

function criarCodigoRetirada() {
  let bytes = crypto.randomBytes(3).toString('hex').toUpperCase();
  return '#' + bytes;
}

function createPickupCode() {
  return criarCodigoRetirada();
}

async function listarPedidos(idUsuario) {
  let pedidos = await Pedido.find({ usuario: idUsuario }).sort({ createdAt: -1 }).populate('itens.produto', 'nome');
  let lista = [];
  for (let i = 0; i < pedidos.length; i++) {
    let p = pedidos[i];
    let itensLista = [];
    for (let j = 0; j < p.itens.length; j++) {
      let it = p.itens[j];
      let nome = 'Produto';
      if (it.produto) {
        if (it.produto.nome) {
          nome = it.produto.nome;
        }
      }
      itensLista.push({ nome: nome, quantidade: it.quantidade, precoUnitario: it.precoUnitario, quantity: it.quantidade, unitPrice: it.precoUnitario, name: nome });
    }
    lista.push({ id: p.id, codigoRetirada: p.codigoRetirada, pickupCode: p.codigoRetirada, situacao: p.situacao, status: p.situacao, total: p.total, createdAt: p.createdAt, itens: itensLista, items: itensLista });
  }
  return lista;
}

async function cancelarPedido(idUsuario, idPedido) {
  let pedido = await Pedido.findOneAndUpdate({ _id: idPedido, usuario: idUsuario, situacao: { " \\: ['pendente', null] } }, { situacao: 'cancelado' }, { new: true });
 if (pedido === null || pedido === undefined) {
 throw Object.assign(new Error('Pedido não encontrado ou já cancelado.'), { status: 404 });
 }
 return { id: pedido.id, situacao: pedido.situacao, status: pedido.situacao };
}

async function criarPedido(idUsuario, itensSolicitados) {
 if (Array.isArray(itensSolicitados) === false) {
 throw Object.assign(new Error('O pedido está vazio.'), { status: 400 });
 }
 if (itensSolicitados.length === 0) {
 throw Object.assign(new Error('O pedido está vazio.'), { status: 400 });
 }
 let normalizados = [];
 for (let i = 0; i < itensSolicitados.length; i++) {
 let item = itensSolicitados[i];
 let idProduto = '';
 if (item) {
 if (typeof item.productId === 'string') {
 idProduto = item.productId.trim();
 } else {
 if (typeof item.idProduto === 'string') {
 idProduto = item.idProduto.trim();
 } else {
 if (typeof item.id === 'string') {
 idProduto = item.id.trim();
 }
 }
 }
 }
 let quantidade = 1;
 if (item) {
 if (item.quantity !== null && item.quantity !== undefined) {
 quantidade = Number(item.quantity);
 } else {
 if (item.quantidade !== null && item.quantidade !== undefined) {
 quantidade = Number(item.quantidade);
 }
 }
 }
 normalizados.push({ idProduto: idProduto, quantidade: quantidade, productId: idProduto, quantity: quantidade });
 }
 let invalido = null;
 for (let i = 0; i < normalizados.length; i++) {
 let it = normalizados[i];
 if (it.idProduto === '' || Number.isInteger(it.quantidade) === false || it.quantidade < 1) {
 invalido = it;
 }
 }
 if (invalido !== null) {
 throw Object.assign(new Error('Cada item precisa ter produto e quantidade inteira positiva.'), { status: 400 });
 }
 let idsProdutos = [];
 for (let i = 0; i < normalizados.length; i++) {
 let jaExiste = false;
 for (let j = 0; j < idsProdutos.length; j++) {
 if (idsProdutos[j] === normalizados[i].idProduto) {
 jaExiste = true;
 }
 }
 if (jaExiste === false) {
 idsProdutos.push(normalizados[i].idProduto);
 }
 }
 let produtos = await Produto.find({ id: { \\\: idsProdutos } }).lean();
 let itensPedido = [];
 for (let i = 0; i < normalizados.length; i++) {
 let item = normalizados[i];
 let produtoEncontrado = null;
 for (let j = 0; j < produtos.length; j++) {
 if (produtos[j].id === item.idProduto) {
 produtoEncontrado = produtos[j];
 }
 }
 if (produtoEncontrado === null) {
 throw Object.assign(new Error('Produto não encontrado.'), { status: 400 });
 }
 let preco = produtoEncontrado.precoAtual;
 if (produtoEncontrado.precoPromocional !== null && produtoEncontrado.precoPromocional !== undefined) {
 preco = produtoEncontrado.precoPromocional;
 }
 itensPedido.push({ produto: produtoEncontrado._id, quantidade: item.quantidade, precoUnitario: preco, product: produtoEncontrado._id, quantity: item.quantidade, unitPrice: preco });
 }
 let total = 0;
 for (let i = 0; i < itensPedido.length; i++) {
 total = total + itensPedido[i].precoUnitario * itensPedido[i].quantidade;
 }
 let codigo = criarCodigoRetirada();
 let pedido = await Pedido.create({ usuario: idUsuario, codigoRetirada: codigo, itens: itensPedido, total: total, user: idUsuario, pickupCode: codigo, items: itensPedido, status: 'pendente', situacao: 'pendente' });
 return { id: pedido.id, codigoRetirada: pedido.codigoRetirada, pickupCode: pedido.codigoRetirada, total: pedido.total };
}

async function listOrders(idUsuario) {
 return listarPedidos(idUsuario);
}

async function cancelOrder(idUsuario, idPedido) {
 return cancelarPedido(idUsuario, idPedido);
}

async function createOrder(idUsuario, itens) {
 return criarPedido(idUsuario, itens);
}

module.exports = { listarPedidos, cancelarPedido, criarPedido, criarCodigoRetirada, listOrders, cancelOrder, createOrder, createPickupCode };
