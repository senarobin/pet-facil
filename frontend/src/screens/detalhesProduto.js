import React, { useContext } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextoCarrinho } from '../contexts/contextoCarrinho';
import { Botao } from '../components/botao';
import { formatarReais, formatarData } from '../utils/formatadores';
import { estilos } from '../styles/estilos';

export function DetalhesProduto({route,navigation: navegacao}) {

  const params = route.params;

  let produto = params.produto;

  if(produto === null || produto === undefined) {
    produto = params.product;
  }

  const ctxCarrinho = useContext(ContextoCarrinho);

  let adicionarAoCarrinho = ctxCarrinho.adicionarAoCarrinho;

  let temPromocao = false;

  if(produto.precoPromocional !== null && produto.precoPromocional !== undefined) {
    temPromocao = true;
  }

  function obterFonteImagem() {
    if(produto.imagem === null || produto.imagem === undefined) {
      return null;
    }
    
    if(typeof produto.imagem === 'string') {
      return { uri: produto.imagem };
    }

    if(produto.imagem.uri) {
      if(typeof produto.imagem.uri === 'string') {
        return { uri: produto.imagem.uri };
      }
      return {
        uri: String(produto.imagem.uri)
      };
    }

    return produto.imagem;
  }

  function renderizarImagem() {

    if(produto.imagem) {
      return (
        <Image source={obterFonteImagem()} style={estilos.detalhesImagemProduto} resizeMode="contain"/>
      );
    }

    return (
      <View style={estilos.detalhesImagemVazia}>
        <View style={estilos.detalhesIconePlaceholder}>
          <Ionicons name="paw" size={36} color="#167D63" />
        </View>
      </View>
    );
  }

  function renderizarPreco() {

    if(temPromocao) {
      return (
        <View>
          <Text style={estilos.detalhesPrecoAntigo}>{formatarReais(produto.precoAtual)}</Text>
          <Text style={estilos.detalhesPrecoPromocional}>{formatarReais(produto.precoPromocional)}</Text>
        </View>
      );
    }

    return <Text style={estilos.detalhesPrecoNormal}>{formatarReais(produto.precoAtual)}</Text>;
  }

  function adicionar() {

    adicionarAoCarrinho(produto);
    navegacao.navigate('Cart');

  }

  return (
    <ScrollView contentContainerStyle={estilos.detalhesContainer}>
      {renderizarImagem()}
      <View style={estilos.detalhesCartaoInfo}>
        <Text style={estilos.labelDetalhesTipo}>{produto.tipo}</Text>
        <Text style={estilos.detalhesNome}>{produto.nome}</Text>
        <View style={estilos.detalhesLinhaPreco}>
          {renderizarPreco()}
        </View>
        <View style={estilos.detalhesDivisor} />
        <Text style={estilos.detalhesTituloSecao}>Descrição</Text>
        <Text style={estilos.detalhesDescricao}>{produto.descricao}</Text>
        <Text style={estilos.detalhesTituloSecao}>Data de Validade</Text>
        <Text style={estilos.detalhesData}>{formatarData(produto.dataValidade)}</Text>
        <Botao titulo="Adicionar ao Carrinho" estilo={estilos.detalhesBotaoEspaco} pressionar={adicionar}/>
      </View>
    </ScrollView>
  );
}
export default DetalhesProduto;

