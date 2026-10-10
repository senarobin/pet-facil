import React, { useContext } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { ContextoCarrinho } from '../contexto/contextoCarrinho';
import { Botao } from '../componentes/botao';
import { formatarReais, formatarData } from '../utilitarios/formatadores';
import { estilos } from '../estilos/estilos';

export function DetalhesProduto({ route, navigation: navegacao }) {
  const params = route.params;
  let produto = params.produto;
  if (produto === null || produto === undefined) produto = params.product;
  const ctxCarrinho = useContext(ContextoCarrinho);
  let adicionarAoCarrinho = ctxCarrinho.adicionarAoCarrinho;

  let temPromocao = false;
  if (produto.precoPromocional !== null && produto.precoPromocional !== undefined) temPromocao = true;

  function obterFonteImagem() {
    if (produto.imagem === null || produto.imagem === undefined) return null;
    let uriVal = null;
    if (produto.imagem.uri) uriVal = produto.imagem.uri;
    if (uriVal !== null) return { uri: produto.imagem };
    return produto.imagem;
  }

  function renderizarImagem() {
    if (produto.imagem) {
      return (
        <Image
          source={obterFonteImagem()}
          style={estilos.detalhesImagemProduto}
          resizeMode="contain"
        />
      );
    }
    return (
      <View style={estilos.detalhesImagemVazia}>
        <Text style={estilos.detalhesImagemTexto}>🐾</Text>
      </View>
    );
  }

  function renderizarPreco() {
    if (temPromocao) {
      return (
        <View>
          <Text style={estilos.detalhesPrecoAntigo}>{formatarReais(produto.precoAtual)}</Text>
          <Text style={estilos.detalhesPrecoPromocional}>{formatarReais(produto.precoPromocional)}</Text>
        </View>
      );
    }
    return <Text style={estilos.detalhesPrecoNormal}>{formatarReais(produto.precoAtual)}</Text>;
  }

  function aoAdicionar() {
    adicionarAoCarrinho(produto);
    navegacao.navigate('Cart');
  }

  return (
    <ScrollView contentContainerStyle={estilos.detalhesContainer}>
      {renderizarImagem()}

      <View style={estilos.detalhesCartaoInfo}>
        <Text style={estilos.detalhesEtiquetaTipo}>{produto.tipo}</Text>
        <Text style={estilos.detalhesNome}>{produto.nome}</Text>

        <View style={estilos.detalhesLinhaPreco}>
          {renderizarPreco()}
        </View>

        <View style={estilos.detalhesDivisor} />

        <Text style={estilos.detalhesTituloSecao}>Descrição</Text>
        <Text style={estilos.detalhesDescricao}>{produto.descricao}</Text>

        <Text style={estilos.detalhesTituloSecao}>Data de Validade</Text>
        <Text style={estilos.detalhesData}>{formatarData(produto.dataValidade)}</Text>

        <Botao
          titulo="Adicionar ao Carrinho"
          estilo={estilos.detalhesBotaoEspaco}
          aoPressionar={aoAdicionar}
        />
      </View>
    </ScrollView>
  );
}
export default DetalhesProduto;

