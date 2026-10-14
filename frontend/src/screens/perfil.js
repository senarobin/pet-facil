import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextoAutenticacao } from '../contexts/autenticacao';
import { api } from '../services/api';
import { formatarReais } from '../utils/formatadores';
import { BarraNavegacao } from '../components/barraNavegacao';
import { estilos } from '../styles/estilos';

export function Perfil({navigation: navegacao}) {

  const ctxAuth = useContext(ContextoAutenticacao);
  let usuarioAtual = ctxAuth.usuarioAtual;
  let sair = ctxAuth.sair;

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null);
  const [idCancelando, setIdCancelando] = useState(null);

  let tokenAtual = null;

  if(usuarioAtual && usuarioAtual.token) {
    tokenAtual = usuarioAtual.token;
  }

  useEffect(function efeitoInicial() {
    carregarPedidos();
  },[tokenAtual]);

  async function carregarPedidos(){

    try {

      let funcPedidos = api.pedidos;
      let token = tokenAtual;

      const dados = await funcPedidos(token);

      if (Array.isArray(dados)) {
        setPedidos(dados);
      }
      else {
        setPedidos([]);
      }
    }
    catch(erro) {
      setMensagemErro(erro.message);
    }
    finally {
      setCarregando(false);
    }
  }

  function confirmarCancelamento(pedido) {
    setPedidoParaCancelar(pedido);
  }

  async function cancelarPedido() {

    if(pedidoParaCancelar === null || idCancelando) {
      return;
    }

    const pedido = pedidoParaCancelar;

    setIdCancelando(pedido.id);

    try {

      let funcCancelar = api.cancelarPedido;
      let token = tokenAtual;
      let idPedidoCancelar = pedido.id || pedido._id;

      await funcCancelar(token, idPedidoCancelar);
      setPedidos(function(prev) {

        let novo = [];
        for(let i = 0; i < prev.length; i++) {

          let it = prev[i];
          let idIt = it.id || it._id;
          let idPed = pedido.id || pedido._id;

          if(String(idIt) === String(idPed)){
            let copia = {};

            Object.assign(copia,it);
            copia.situacao = 'cancelado';
            copia.status = 'cancelled';
            novo.push(copia);
          }
          else novo.push(it);
        }
        return novo;
      });

      setPedidoParaCancelar(null);
    }
    catch(erro) {
      Alert.alert('Não foi possível cancelar',erro.message);
    }
    finally {
      setIdCancelando(null);
    }
  }

  function extrairId(item) {
    if(item.id) {
      return String(item.id);
    }
    if(item._id) {
      return String(item._id);
    }
    return String(item.codigoRetirada || Math.random());
  }

  function obterTextoItens(item) {

    if(item.itens === null || item.itens === undefined || item.itens.length === 0){
      return 'Sem itens';
    }

    let partes = [];

    for(let i = 0; i < item.itens.length; i++) {
      let it = item.itens[i];
      let nome = 'Produto';

      if(it.nome) {
        nome = it.nome;
      }      
      else if(it.produto && it.produto.nome) {
        nome = it.produto.nome;
      }

      partes.push((it.quantidade || 1)+ 'x ' + nome);
    }

    return partes.join(', ');
  }

  function renderizarCarregando() {
    if(carregando) {
      return <ActivityIndicator size="small" color="#167D63" style={{marginVertical: 12}} />;
    }
    return null;
  }

  function renderizarErro() {
    if(mensagemErro) {
      return <Text style={{ color: '#D32F2F', marginBottom: 8 }}>{mensagemErro}</Text>;
    }
    return null;
  }

  function renderizarVazio() {
    if(carregando === false && pedidos.length === 0 && mensagemErro === '') {
      return <Text style={{ color: '#999', textAlign: 'center', marginTop: 12 }}>Nenhum pedido ainda</Text>;
    }
    return null;
  }

  function renderizarAcaoPedido(item) {
    let situacao = item.situacao || item.status;

    let pendente = situacao === 'pendente' || situacao === 'pending' || situacao === null || situacao === undefined;

    if(pendente === false) {
      return <Text style={{ color: '#999',marginTop: 8,fontSize: 12}}>Status: {situacao}</Text>;
    }

    let estaCancelando = idCancelando === item.id || idCancelando === item._id;
    return(
      <TouchableOpacity style={[estilos.perfilBotaoFacial, estilos.perfilBotaoFacialNaoCadastrado, { marginTop: 8 }]} onPress={function(){ confirmarCancelamento(item); }} disabled={estaCancelando}>
        <Text style={estilos.perfilTextoBotaoFacial}>{estaCancelando ? 'Cancelando...' : 'Cancelar pedido'}</Text>
      </TouchableOpacity>
    );
  }

  function obterVisivelModal() {
    return pedidoParaCancelar !== null && pedidoParaCancelar !== undefined;
  }

  function obterCodigoCancelar() {
    if(pedidoParaCancelar && pedidoParaCancelar.codigoRetirada) {
      return pedidoParaCancelar.codigoRetirada; return '';
    }
  }

  function obterDesabilitado() {
    return idCancelando !== null && idCancelando !== undefined;
  }

  function obterTextoConfirmar() {
    if(idCancelando) {
      return 'Cancelando...';
    }
    return 'Sim, cancelar';
  }

  function renderizarPapel() {
    if(usuarioAtual && (usuarioAtual.perfil === 'admin' || usuarioAtual.role === 'admin')) {
      return <Text style={estilos.perfilTextoPapel}>Perfil: admin (acesso total)</Text>;
    }
    return null;
  }

  return (
    <View style={estilos.perfilTela}>
      <FlatList data={pedidos} keyExtractor={extrairId}
        contentContainerStyle={estilos.perfilConteudo}
        ListHeaderComponent={(
          <View>
            <View style={estilos.perfilHeader}>
              <View style={estilos.perfilAvatar}><Ionicons name="person-circle-outline" size={30} color="#143D36" /></View>
              <View style={estilos.perfilInfoUsuario}>
                <Text style={estilos.perfilSobretitulo}>Minha conta</Text><Text style={estilos.perfilNome}>{usuarioAtual.nomeCompleto}</Text><Text style={estilos.perfilEmail}>{usuarioAtual.login}</Text>
              </View>
              <TouchableOpacity
                style={estilos.perfilBotaoSair} onPress={sair} accessibilityLabel="Sair da conta">
                <Ionicons name="log-out-outline" size={20} color="#D8564B"/>
              </TouchableOpacity>
            </View>
            {renderizarPapel()}
            <View style={estilos.perfilHeaderSecao}>
              <View>
                <Text style={estilos.perfilTituloSecao}>Meus pedidos</Text><Text style={estilos.perfilSubtitulo}>Códigos para apresentar no caixa</Text>
              </View>
              <Text style={estilos.perfilContador}>{pedidos.length}</Text>
            </View>
            {renderizarCarregando()}
            {renderizarErro()}
            {renderizarVazio()}
          </View>
        )}

        renderItem={function(props){
          let item = props.item;
          return(
          <View style={estilos.perfilCartaoPedido}>
            <View style={estilos.perfilTopoPedido}>
              <Text style={estilos.perfilDataPedido}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
              <Text style={estilos.perfilTotalPedido}>{formatarReais(item.total)}</Text>
            </View>
            <Text style={estilos.perfilRotuloCodigo}>Código de retirada</Text>
            <Text style={estilos.perfilCodigo}>{item.codigoRetirada}</Text>
            <Text style={estilos.perfilItens}>{obterTextoItens(item)}</Text>
            {renderizarAcaoPedido(item)}
          </View>
        );}}/>
      <BarraNavegacao navigation={navegacao} active="Profile" />
      <Modal
        visible={obterVisivelModal()} transparent animationType="fade" onRequestClose={function(){ setPedidoParaCancelar(null); 
        }}>

        <View style={estilos.perfilSobreposicaoModal}>
          <View style={estilos.perfilCaixaConfirmacao}>
            <Text style={estilos.perfilTituloConfirmacao}>Cancelar pedido?</Text>
            <Text style={estilos.perfilMensagemConfirmacao}>Tem certeza que deseja cancelar o pedido {obterCodigoCancelar()}? Se houver reembolso, ele podera levar alguns dias para ser processado</Text>
            <View style={estilos.perfilAcoesConfirmacao}>
              <TouchableOpacity style={estilos.perfilBotaoVoltar} onPress={function(){
                setPedidoParaCancelar(null);
              }} disabled={obterDesabilitado()}>
                <Text style={estilos.perfilTextoVoltar}>Não, voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.perfilBotaoConfirmar} onPress={cancelarPedido} disabled={obterDesabilitado()}>
                <Text style={estilos.perfilTextoConfirmar}>
                  {obterTextoConfirmar()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Perfil;
