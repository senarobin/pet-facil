import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { ContextoCarrinho } from '../contexto/contextoCarrinho';
import { api } from '../servicos/api';
import { CartaoProduto } from '../componentes/cartaoProduto';
import { BarraNavegacao } from '../componentes/barraNavegacao';
import { estilos } from '../estilos/estilos';

export function ListaProdutos({ navigation: navegacao }) {
  const contextoCarrinho = useContext(ContextoCarrinho);
  const adicionarAoCarrinho = contextoCarrinho.adicionarAoCarrinho;
  const itensCarrinho = contextoCarrinho.itensCarrinho;
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  function quantidadePara(idProduto) {
    let filtrados = itensCarrinho.filter(function(item) {
      if (item.id === idProduto) return true;
      return false;
    });
    return filtrados.length;
  }

  function obterProdutosValidos() {
    let validos = [];
    for (let i = 0; i < produtos.length; i++) {
      let p = produtos[i];
      if (p && p.id && p.nome) validos.push(p);
    }
    return validos;
  }

  useEffect(function efeitoCarregar() {
    function aoSucesso(dados) {
      if (Array.isArray(dados) === false) {
        throw new Error('A API retornou uma resposta inválida para os produtos.');
      }
      setProdutos(dados);
    }
    function aoErro(erro) {
      setMensagemErro(erro.message);
    }
    function aoFinalizar() {
      setCarregando(false);
    }
    api.produtos().then(aoSucesso).catch(aoErro).finally(aoFinalizar);
  }, []);

  function renderizarConteudo() {
    if (carregando) {
      return <ActivityIndicator style={estilos.listaCarregando} size="large" color="#069E6E" />;
    }
    if (mensagemErro !== '') {
      return (
        <View style={estilos.listaErroContainer}>
          <Text style={estilos.listaErroTexto}>{mensagemErro}</Text>
          <Text style={estilos.listaErroDica}>Verifique se a API está rodando e tente novamente.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={obterProdutosValidos()}
        keyExtractor={function extrair(item) { return item.id; }}
        contentContainerStyle={estilos.listaConteudo}
        renderItem={function renderizar({ item }) {
          return (
            <CartaoProduto
              produto={item}
              quantidade={quantidadePara(item.id)}
              aoPressionarCartao={function aoPressionar() { navegacao.navigate('ProductDetail', { produto: item }); }}
              aoAdicionarAoCarrinho={function aoAdicionar() { adicionarAoCarrinho(item); }}
            />
          );
        }}
      />
    );
  }

  return (
    <View style={estilos.listaContainer}>
      <View style={estilos.listaTopo}>
        <View>
          <Text style={estilos.listaSobretitulo}>PETFÁCIL • LOJA</Text>
          <Text style={estilos.listaTitulo}>Escolha o melhor para seu pet</Text>
        </View>
      </View>

      {renderizarConteudo()}

      <BarraNavegacao navigation={navegacao} active="ProductList" />
    </View>
  );
}
 
export default ListaProdutos;
