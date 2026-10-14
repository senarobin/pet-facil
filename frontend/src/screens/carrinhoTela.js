import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextoCarrinho } from '../contexts/contextoCarrinho';
import { Botao } from '../components/botao';
import { formatarReais } from '../utils/formatadores';
import { BarraNavegacao } from '../components/barraNavegacao';
import { estilos } from '../styles/estilos';

export function Carrinho({ navigation: navegacao }) {

  const ctxCarrinho = useContext(ContextoCarrinho);
  let itensCarrinho = ctxCarrinho.itensCarrinho;
  let removerDoCarrinho = ctxCarrinho.removerDoCarrinho;
  let removerProdutoDoCarrinho = ctxCarrinho.removerProdutoDoCarrinho;
  let limparCarrinhoCtx = ctxCarrinho.limparCarrinho;
  let obterTotalCarrinho = ctxCarrinho.obterTotalCarrinho;
  let obterItensAgrupados = ctxCarrinho.obterItensAgrupados;
  let finalizarPedido = ctxCarrinho.finalizarPedido;
  const [finalizando, setFinalizando] = useState(false);
  const [mostrarConfirmarLimpar, setMostrarConfirmarLimpar] = useState(false);

  function solicitarLimparCarrinho() {

    if (itensCarrinho.length === 0) {
      return;
    }

    setMostrarConfirmarLimpar(true);
  }

  function confirmarLimparCarrinho() {
    limparCarrinhoCtx();
    setMostrarConfirmarLimpar(false);
  }

  async function finalizar() {
    if (finalizando) {
      return;
    }

    setFinalizando(true);

    const resultado = await finalizarPedido();
    setFinalizando(false);

    let sucesso = false;

    if (resultado.sucesso === true) {
      sucesso = true;
    }
 
    if (sucesso) {
      navegacao.replace('OrderSuccess', {
        codigoRetirada: resultado.codigoRetirada,
 
        total: resultado.total,
      });

    }else {
      let msg = resultado.mensagem;
      Alert.alert('Não foi possível finalizar', msg);
    }
  }

  function obterDesabilitado() {

    if (itensCarrinho.length === 0) {
      return true;
    }

    if (finalizando) {
      return true;
    }

    return false;
  }

  return (
    <View style={estilos.carrinhoTela}>
      <View style={estilos.carrinhoContainer}>
        <Text style={estilos.carrinhoTitulo}>Meu Carrinho</Text>

      {function renderizarListaCarrinho() {
        if (itensCarrinho.length === 0) {
          return(
            <View style={estilos.carrinhoVazioContainer}>
              <View style={estilos.carrinhoVazioIconeWrap}><Ionicons name="bag-outline" size={30} color="#167D63"/></View>
              <Text style={estilos.carrinhoVazioTexto}>Seu carrinho está vazio</Text>
              <Text style={estilos.carrinhoVazioSubtexto}>Adicione produtos da loja para continuar</Text>
            </View>
          );
        }

        return(
          <FlatList
            data={obterItensAgrupados()}
            keyExtractor={function extrair(itemAgrupado) {
              return itemAgrupado.item.id;
            }}

            contentContainerStyle={estilos.carrinhoConteudoLista}
            renderItem={function renderizar({
              item: agrupadoItem
            }) {
              const item = agrupadoItem.item;
              const quantidade = agrupadoItem.quantidade;
              let preco = item.precoAtual;

              if (item.precoPromocional !== null && item.precoPromocional !== undefined) {
                preco = item.precoPromocional;
              }

              return(
                <View style={estilos.carrinhoCartaoItem}>
                  <View style={estilos.carrinhoFlex1}><Text style={estilos.carrinhoNomeItem}>{quantidade}x {item.nome}</Text><Text style={estilos.carrinhoPrecoItem}>{formatarReais(preco)} cada</Text></View>
                  <View style={estilos.carrinhoColunaAcoes}>
                    <TouchableOpacity
                      style={estilos.carrinhoBotaoRemover}
                      onPress={function remover1(){ removerDoCarrinho(item.idItemCarrinho); }}>
                      <Text style={estilos.carrinhoTextoRemover}>Remover 1 Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.carrinhoBotaoRemoverTodos}
                      onPress={function removerTodos(){ removerProdutoDoCarrinho(item.id); }}>
                      <Text style={estilos.carrinhoTextoRemoverTodos}>Remover todos</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        );
      }()}

        <View style={estilos.carrinhoRodape}>
        <View style={estilos.carrinhoLinhaTotal}><Text style={estilos.carrinhoLabelTotal}>Total:</Text><Text style={estilos.carrinhoValorTotal}>{formatarReais(obterTotalCarrinho())}</Text></View>
        <Botao titulo="Finalizar pedido" variante="secundaria" desabilitado={obterDesabilitado()} pressionar={finalizar}/>
        <TouchableOpacity
          style={estilos.carrinhoBotaoLimpar}onPress={solicitarLimparCarrinho} disabled={obterDesabilitado()}>
          <Text style={estilos.carrinhoTextoLimpar}>Limpar carrinho</Text>
        </TouchableOpacity>
        </View>
      </View>
      <BarraNavegacao navigation={navegacao} active="Cart"/>
      <Modal visible={mostrarConfirmarLimpar} transparent animationType="fade" onRequestClose={function fechar(){ setMostrarConfirmarLimpar(false); }}>
        <View style={estilos.modalSobreposicao}>
          <View style={estilos.modalCaixaConfirmacao}>
            <Text style={estilos.modalTituloConfirmacao}>Apagar todos os itens?</Text>
            <Text style={estilos.modalMensagemConfirmacao}>
              Você quer remover todos os itens que colocou no carrinho? Essa ação não pode ser desfeita.
            </Text>

            <View style={estilos.modalAcoesConfirmacao}>
              <TouchableOpacity style={estilos.modalBotaoCancelar}onPress={function cancelar(){
                setMostrarConfirmarLimpar(false);
                }}>
                <Text style={estilos.modalTextoCancelar}>Não, voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={estilos.modalBotaoConfirmar} onPress={confirmarLimparCarrinho}>
                <Text style={estilos.modalTextoConfirmar}>Apagar tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
 
export default Carrinho;

