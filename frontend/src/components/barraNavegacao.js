import React,{useContext} from 'react'
import {View,Text,TouchableOpacity} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {ContextoCarrinho} from '../contexts/contextoCarrinho'
import {estilos} from '../styles/estilos'

export function BarraNavegacao({navigation:navegacao,active:ativo}) {

  const {itensCarrinho} = useContext(ContextoCarrinho)

  function direcionarPara(tela) {

    if(ativo !== tela){
      navegacao.navigate(tela)
    }
  }

  function obterEstiloItem(tela) {

    if(ativo === tela) {
      return estilos.barraItemAtivo
    }

    return null
  }

  function obterEstiloCarrinho() {

    if(ativo === 'Cart'){
      return estilos.barraCarrinhoAtivo
    }

    return null
  }

  let quantidadeItens = 0

  if(itensCarrinho) {
    quantidadeItens = itensCarrinho.length
  }

  const corAtiva = '#167D63'
  const corInativa = '#6A7771'

  function obterCorIcone(tela) {
    return ativo === tela ? corAtiva : corInativa
  }

  return (
    <View style={estilos.barraNavegacao}>
      <TouchableOpacity style={[estilos.barraItemNavegacao,obterEstiloItem('Profile')]}onPress={
        function direcionarParaPerfil() {
          direcionarPara('Profile')
        }}accessibilityLabel="Abrir perfil e pedidos"activeOpacity={0.7}>

        <Ionicons name={ativo === 'Profile' ? 'person' : 'person-outline'} size={24} color={obterCorIcone('Profile')}/>
        <Text style={[estilos.labelBarra, ativo === 'Profile' && estilos.labelBarraAtivo]}>Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.barraItemCarrinho,obterEstiloCarrinho()]}onPress={
          function direcionarParaCarrinho() {
            direcionarPara('Cart')
          }}accessibilityLabel={`Abrir carrinho com ${quantidadeItens} itens`}activeOpacity={0.7}>

        <View style={estilos.barraIconeWrapper}>
          <Ionicons name={ativo === 'Cart' ? 'cart' : 'cart-outline'} size={24} color={obterCorIcone('Cart')}/>
          <View style={estilos.barraBadge}>
            <Text style={estilos.barraBadgeTexto}>{quantidadeItens}</Text>
          </View>
        </View><Text style={[estilos.labelBarra, ativo === 'Cart' && estilos.labelBarraAtivo]}>Carrinho</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.barraItemNavegacao,obterEstiloItem('AIChat')]}
        onPress={
          function direcionarParaIChat() {
            direcionarPara('AIChat')
          }}accessibilityLabel="Abrir assistente de IA"activeOpacity={0.7}>

        <Ionicons name={ativo === 'AIChat' ? 'sparkles' : 'sparkles-outline'} size={24} color={obterCorIcone('AIChat')}/>
        <Text style={[estilos.labelBarra,ativo === 'AIChat' && estilos.labelBarraAtivo]}>Assistente</Text>
      </TouchableOpacity>
    </View>
  )
}
 
export default BarraNavegacao
