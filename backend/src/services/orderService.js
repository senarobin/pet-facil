const crypto = require('crypto')
const Pedido = require('../models/Pedido')
const Produto = require('../models/Produto')

function criarCodigoRetirada() {
  let bytes = crypto.randomBytes(3).toString('hex').toUpperCase()
  return '#' + bytes
}

async function listarPedidos(idUsuario) {

  let pedidos = await Pedido.find({usuario: idUsuario}).sort({createdAt: -1}).populate('itens.produto','nome')

  let lista = []
  for(let i=0;i<pedidos.length;i++){
    let p = pedidos[i]
    let itensLista = []

    for(let j=0;j<p.itens.length;j++) {
      let it = p.itens[j]
      let nome = 'Produto'

      if(it.produto) {

        if(it.produto.nome) {
          nome = it.produto.nome
        }
      }

      itensLista.push({nome: nome,quantidade: it.quantidade,precoUnitario: it.precoUnitario})
    }

    lista.push({id: p.id,codigoRetirada: p.codigoRetirada,situacao: p.situacao,total: p.total,createdAt: p.createdAt,itens: itensLista})
  }
  return lista
}

async function cancelarPedido(idUsuario,idPedido) {

  let filtro = { _id: idPedido,usuario: idUsuario,situacao: {
    $in: ['pendente',
      null]
    }
  }

  let pedido = await Pedido.findOneAndUpdate(filtro,{
    situacao: 'cancelado'
  },{new: true})

  if(pedido === null || pedido === undefined){
    throw Object.assign(new Error(
      'Pedido nao encontrado ou ja cancelado.'
    ),{status: 404})
  }

  return {id: pedido.id,situacao: pedido.situacao}
}

async function criarPedido(idUsuario,itensSolicitados) {

  if(Array.isArray(itensSolicitados) === false){
    throw Object.assign(
      new Error('O pedido esta vazio.'),{status: 400})
  }

  if(itensSolicitados.length === 0) {
    throw Object.assign(
      new Error('O pedido esta vazio.'),{status: 400}
    )
  }

  let normalizados = []

  for(let i=0;i<itensSolicitados.length;i++) {

    let item = itensSolicitados[i]
    let idProduto = ''

    if(item){
      if(typeof item.idProduto=== 'string') {
        idProduto = item.idProduto.trim()
      }
      else{
        if(typeof item.id === 'string') {
          idProduto = item.id.trim()
        }
      }
    }

    let quantidade = 1
    if(item) {

      if(item.quantidade !== null && item.quantidade !== undefined) {
        quantidade = Number(item.quantidade)
      }
    }

    normalizados.push({idProduto: idProduto,quantidade: quantidade})
  }

  let invalido = null

  for(let i=0;i<normalizados.length;i++) {

    let it = normalizados[i]

    if(it.idProduto === '' || Number.isInteger(it.quantidade) === false || it.quantidade < 1){
      invalido = it
    }
  }

  if(invalido !== null){
    throw Object.assign(
      new Error('Cada item precisa ter produto e quantidade inteira positiva.'),{status: 400})
  }

  let idsProdutos = []

  for(let i=0;i<normalizados.length;i++) {
    let jaExiste = false

    for(let j=0;j<idsProdutos.length;j++) {

      if(idsProdutos[j] === normalizados[i].idProduto) {
        jaExiste = true
      }

    }

    if(jaExiste === false){
      idsProdutos.push(normalizados[i].idProduto)
    }
  }

  let filtroProdutos = { 
    id: {$in: idsProdutos}
  }

  let produtos = await Produto.find(filtroProdutos).lean()
  let itensPedido = []

  for(let i=0; i<normalizados.length;i++){

    let item = normalizados[i]
    let produtoEncontrado = null

    for(let j=0;j<produtos.length;j++) {

      if(produtos[j].id === item.idProduto){
        produtoEncontrado = produtos[j]
      }
    }

    if(produtoEncontrado === null) {
      throw Object.assign(new Error('Produto nao encontrado.'),{status: 400})
    }

    let preco = produtoEncontrado.precoAtual

    if(produtoEncontrado.precoPromocional !== null && produtoEncontrado.precoPromocional !== undefined) {
      preco = produtoEncontrado.precoPromocional
    }

    itensPedido.push({produto: produtoEncontrado._id,quantidade: item.quantidade,precoUnitario: preco})
  }

  let total = 0

  for(let i=0;i<itensPedido.length; i++){
    total = total + itensPedido[i].precoUnitario*itensPedido[i].quantidade
  }

  let codigo = criarCodigoRetirada()
  let pedido = await Pedido.create({usuario: idUsuario,codigoRetirada: codigo,itens: itensPedido,total: total,situacao: 'pendente'})

  return {
    id: pedido.id,
    codigoRetirada: pedido.codigoRetirada,
    total: pedido.total
  }
}

module.exports = {listarPedidos,cancelarPedido,criarPedido,criarCodigoRetirada}
