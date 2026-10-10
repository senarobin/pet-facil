import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { ContextoCarrinho } from '../contexto/contextoCarrinho';
import { Botao } from '../componentes/botao';
import { formatarReais } from '../utilitarios/formatadores';
import { BarraNavegacao } from '../componentes/barraNavegacao';
import { estilos } from '../estilos/estilos';

export function Carrinho({ navigation: navegacao }) {
  const ctxCarrinho = useContext(ContextoCarrinho);
  let itensCarrinho = ctxCarrinho.itensCarrinho;
  let removerDoCarrinho = ctxCarrinho.removerDoCarrinho;
  let removerProdutoDoCarrinho = ctxCarrinho.removerProdutoDoCarrinho;
  let limparCarrinho = ctxCarrinho.limparCarrinho;
  let obterTotalCarrinho = ctxCarrinho.obterTotalCarrinho;
  let obterItensAgrupados = ctxCarrinho.obterItensAgrupados;
  let finalizarPedido = ctxCarrinho.finalizarPedido;
  const [finalizando, setFinalizando] = useState(false);
  const [mostrarConfirmarLimpar, setMostrarConfirmarLimpar] = useState(false);

  function aoLimparCarrinho() {
    if (itensCarrinho.length === 0) return;
    setMostrarConfirmarLimpar(true);
  }

  function confirmarLimparCarrinho() {
    limparCarrinho();
    setMostrarConfirmarLimpar(false);
  }

  async function aoFinalizar() {
    if (finalizando) return;
    setFinalizando(true);
    const resultado = await finalizarPedido();
    setFinalizando(false);
    let sucesso = false;
    if (resultado.sucesso === true) sucesso = true;
 
    if (sucesso) {
      navegacao.replace('OrderSuccess', {
        codigoRetirada: resultado.codigoRetirada,
 
        total: resultado.total,
      });
    } else {
      let msg = resultado.mensagem;
 
      Alert.alert('Não foi possível finalizar', msg);
    }
  }
  function obterDesabilitado() {
    if (itensCarrinho.length === 0) return true;
    if (finalizando) return true;
    return false;
  }

  return (
    <View style={estilos.carrinhoTela}>
      <View style={estilos.carrinhoContainer}>
        <Text style={estilos.carrinhoTitulo}>Meu Carrinho</Text>

      {function renderizarListaCarrinho() {
        if (itensCarrinho.length === 0) {
          return (
            <View style={estilos.carrinhoVazioContainer}>
              <Text style={estilos.carrinhoVazioTexto}>Seu carrinho está vazio.</Text>
            </View>
          );
        }
        return (
          <FlatList
            data={obterItensAgrupados()}
            keyExtractor={function extrair(itemAgrupado) { return itemAgrupado.item.id; }}
            contentContainerStyle={estilos.carrinhoConteudoLista}
            renderItem={function renderizar({ item: agrupadoItem }) {
              const item = agrupadoItem.item;
              const quantidade = agrupadoItem.quantidade;
              let preco = item.precoAtual;
              if (item.precoPromocional !== null && item.precoPromocional !== undefined) preco = item.precoPromocional;
              return (
                <View style={estilos.carrinhoCartaoItem}>
                  <View style={estilos.carrinhoFlex1}>
                    <Text style={estilos.carrinhoNomeItem}>{quantidade}x {item.nome}</Text>
                    <Text style={estilos.carrinhoPrecoItem}>{formatarReais(preco)} cada</Text>
                  </View>
                  <View style={estilos.carrinhoColunaAcoes}>
                    <TouchableOpacity
                      style={estilos.carrinhoBotaoRemover}
                      onPress={function aoRemover1(){ removerDoCarrinho(item.idItemCarrinho); }}
                    >
                      <Text style={estilos.carrinhoTextoRemover}>Remover 1 Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.carrinhoBotaoRemoverTodos}
                      onPress={function aoRemoverTodos(){ removerProdutoDoCarrinho(item.id); }}
                    >
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
        <View style={estilos.carrinhoLinhaTotal}>
          <Text style={estilos.carrinhoRotuloTotal}>Total:</Text>
          <Text style={estilos.carrinhoValorTotal}>{formatarReais(obterTotalCarrinho())}</Text>
        </View>
        <Botao
          titulo="Finalizar pedido"
          variante="secundaria"
          desabilitado={obterDesabilitado()}
          aoPressionar={aoFinalizar}
        />
        <TouchableOpacity
          style={estilos.carrinhoBotaoLimpar}
          onPress={aoLimparCarrinho}
          disabled={obterDesabilitado()}
        >
          <Text style={estilos.carrinhoTextoLimpar}>Limpar carrinho</Text>
        </TouchableOpacity>
        </View>
      </View>
      <BarraNavegacao navigation={navegacao} active="Cart" />
      <Modal
        visible={mostrarConfirmarLimpar}
        transparent
        animationType="fade"
        onRequestClose={function aoFechar(){ setMostrarConfirmarLimpar(false); }}
      >
        <View style={estilos.modalSobreposicao}>
          <View style={estilos.modalCaixaConfirmacao}>
            <Text style={estilos.modalTituloConfirmacao}>Apagar todos os itens?</Text>
            <Text style={estilos.modalMensagemConfirmacao}>
              Você quer remover todos os itens que colocou no carrinho? Essa ação não pode ser desfeita.
            </Text>
            <View style={estilos.modalAcoesConfirmacao}>
              <TouchableOpacity
                style={estilos.modalBotaoCancelar}
                onPress={function aoCancelar(){ setMostrarConfirmarLimpar(false); }}
              >
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

