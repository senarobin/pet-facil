import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ContextoCarrinho } from '../contexto/contextoCarrinho';
import { estilos } from '../estilos/estilos';

export function BarraNavegacao({ navigation: navegacao, active: ativo }) {
  const { itensCarrinho } = useContext(ContextoCarrinho);

  function irPara(tela) {
    if (ativo !== tela) {
      navegacao.navigate(tela);
    }
  }

  function obterEstiloItem(tela) {
    if (ativo === tela) {
      return estilos.barraItemAtivo;
    }
    return null;
  }

  function obterEstiloCarrinho() {
    if (ativo === 'Cart') {
      return estilos.barraCarrinhoAtivo;
    }
    return null;
  }

  let quantidadeItens = 0;
  if (itensCarrinho) {
    quantidadeItens = itensCarrinho.length;
  }

  return (
    <View style={estilos.barraNavegacao}>
      <TouchableOpacity
        style={[estilos.barraItemNavegacao, obterEstiloItem('Profile')]}
        onPress={function aoPressionarPerfil() { irPara('Profile'); }}
        accessibilityLabel="Abrir perfil e pedidos"
      >
        <Text style={estilos.barraIcone}>●</Text>
        <Text style={estilos.barraRotulo}>Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.barraItemCarrinho, obterEstiloCarrinho()]}
        onPress={function aoPressionarCarrinho() { irPara('Cart'); }}
        accessibilityLabel={`Abrir carrinho com ${quantidadeItens} itens`}
      >
        <Text style={estilos.barraIconeCarrinho}>🛒</Text>
        <View style={estilos.barraBadge}>
          <Text style={estilos.barraBadgeTexto}>{quantidadeItens}</Text>
        </View>
        <Text style={estilos.barraRotulo}>Carrinho</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[estilos.barraItemNavegacao, obterEstiloItem('AIChat')]}
        onPress={function aoPressionarAssistente() { irPara('AIChat'); }}
        accessibilityLabel="Abrir assistente de IA"
      >
        <Text style={estilos.barraIcone}>✦</Text>
        <Text style={estilos.barraRotulo}>Assistente</Text>
      </TouchableOpacity>
    </View>
  );
}
export default BarraNavegacao;
