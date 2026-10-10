import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { formatarReais } from '../utilitarios/formatadores';
import { estilos } from '../estilos/estilos';

export function CartaoProduto({ produto, aoPressionarCartao, aoAdicionarAoCarrinho, quantidade = 0 }) {
  let prod = produto;

  let acaoCartao = aoPressionarCartao;

  let acaoAdicionar = aoAdicionarAoCarrinho;

  let qtd = quantidade;
  if (qtd === undefined || qtd === null) {
    qtd = 0;
  }

  let temPromocao = false;
  if (prod.precoPromocional !== null && prod.precoPromocional !== undefined) {
    temPromocao = true;
  }

  function renderizarImagem() {
    if (prod.imagem) {
      let origem = prod.imagem;
      if (prod.imagem && prod.imagem.uri) {
        origem = { uri: prod.imagem };
      }
      return <Image source={origem} style={estilos.cartaoImagemProduto} resizeMode="contain" />;
    }
    return <View style={estilos.cartaoImagemVazia}><Text style={estilos.cartaoImagemTexto}>🐾</Text></View>;
  }

  function renderizarPreco() {
    if (temPromocao) {
      return (
        <View>
          <Text style={estilos.cartaoPrecoAntigo}>{formatarReais(prod.precoAtual)}</Text>
          <Text style={estilos.cartaoPrecoPromocional}>{formatarReais(prod.precoPromocional)}</Text>
        </View>
      );
    }
    return <Text style={estilos.cartaoPrecoNormal}>{formatarReais(prod.precoAtual)}</Text>;
  }

  function renderizarBadge() {
    if (qtd > 0) {
      return <View style={estilos.cartaoBadgeQuantidade}><Text style={estilos.cartaoTextoQuantidade}>{qtd}</Text></View>;
    }
    return null;
  }

  function aoPressionarAdicionar(evento) {
    evento.stopPropagation();
    if (acaoAdicionar) {
      acaoAdicionar();
    }
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={estilos.cartaoProduto} onPress={acaoCartao}>
      {renderizarImagem()}
      <View style={estilos.cartaoInfoContainer}>
        <Text style={estilos.cartaoEtiqueta}>{prod.tipo}</Text>
        <Text style={estilos.cartaoNome} numberOfLines={2}>{prod.nome}</Text>
        <View style={estilos.cartaoContainerPreco}>
          {renderizarPreco()}
        </View>
      </View>
      <TouchableOpacity
        style={estilos.cartaoBotaoAdicionar}
        onPress={aoPressionarAdicionar}
        accessibilityLabel={`Adicionar ${prod.nome} ao carrinho`}
      >
        <Text style={estilos.cartaoTextoAdicionar}>+</Text>
        {renderizarBadge()}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
export default CartaoProduto;

