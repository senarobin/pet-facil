const Produto = require('../models/Produto')

async function listarProdutos() {

  let produtos = await Produto.find().sort({createdAt: 1}).lean()
  let lista = []

  for(let i=0;i<produtos.length;i++) {

    let p = produtos[i]
    let item = {}

    Object.assign(item,p)
    delete item._id
    delete item.__v

    let imagem = null

    if(p.urlImagem){
      imagem = p.urlImagem
    }
    else if(p.imagemUrl) {
      imagem = p.imagemUrl
    }
    else {
      imagem = null
    }

    item.imagem = imagem
    lista.push(item)
  }
  return lista
}

async function obterProdutoPorId(id) {

  let produto = await Produto.findOne({id: id}).lean()
  return produto
}

module.exports = {listarProdutos,obterProdutoPorId}
