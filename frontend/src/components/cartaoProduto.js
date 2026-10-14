import React from 'react'
import {View,Text,TouchableOpacity,Image} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {formatarReais} from '../utils/formatadores'
import {estilos} from '../styles/estilos'

export function CartaoProduto({produto,pressionarCartao,adicionarAoCarrinho,quantidade=0}) {
  let prod = produto

  let acaoCartao = pressionarCartao

  let acadicionar = adicionarAoCarrinho

  let qtd = quantidade
  if(qtd === undefined || qtd === null) {
    qtd = 0
  }

  let temPromocao = false

  if(prod.precoPromocional !== null && prod.precoPromocional !== undefined) {
    temPromocao = true
  }

  function renderizarImagem() {
    if (prod.imagem){
      let origem = prod.imagem

      if(typeof origem === 'string') {
        origem = {
          uri: origem
        }
      }
      else if(origem && origem.uri) {
        if (typeof origem.uri === 'string'){origem ={uri: origem.uri}}
        else origem = {
          uri: String(origem.uri)
        }
      }
      else if(origem && typeof origem === 'object') {
      }

      if(origem && origem.uri === undefined && typeof prod.imagem === 'string'){
        origem = {uri: prod.imagem}
      }

      return <Image source={origem} style={estilos.cartaoImagemProduto} resizeMode="contain"/>;
    }
    return <View style={estilos.cartaoImagemVazia}><Ionicons name="paw" size={26} color="#167D63" style={estilos.cartaoIconePlaceholder} /></View>
  }

  function renderizarPreco() {

    if(temPromocao) {
      return (
        <View><Text style={estilos.cartaoPrecoAntigo}>{formatarReais(prod.precoAtual)}</Text><Text style={estilos.cartaoPrecoPromocional}>{formatarReais(prod.precoPromocional)}</Text></View>
      )
    }
    return <Text style={estilos.cartaoPrecoNormal}>{formatarReais(prod.precoAtual)}</Text>
  }

  function renderizarBadge() {

    if(qtd > 0) {
      return <View style={estilos.cartaoBadgeQuantidade}><Text style={estilos.cartaoTextoQuantidade}>{qtd}</Text></View>
    }

    return null
  }

  function pressionarAdicionar(e) {
    e.stopPropagation()

    if(acadicionar) {
      acadicionar();
    }
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={estilos.cartaoProduto} onPress={acaoCartao}>
      {renderizarImagem()}
      <View style={estilos.cartaoInfoContainer}>
        <Text style={estilos.labelCartao}>{prod.tipo}</Text><Text style={estilos.cartaoNome} numberOfLines={2}>{prod.nome}</Text><View style={estilos.cartaoContainerPreco}>{renderizarPreco()}
        </View>
      </View>
      <TouchableOpacity
        style={estilos.cartaoBotadicionar}onPress={pressionarAdicionar}accessibilityLabel={`Adicionar ${prod.nome} ao carrinho`}>
        <Ionicons name="bag-add" size={19} color="#FFFFFF"/>
        {renderizarBadge()}
      </TouchableOpacity>
    </TouchableOpacity>
  )
}
export default CartaoProduto

