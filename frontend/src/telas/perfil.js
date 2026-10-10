import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { ContextoAutenticacao } from '../contexto/autenticacao';
import { api } from '../servicos/api';
import { formatarReais } from '../utilitarios/formatadores';
import { BarraNavegacao } from '../componentes/barraNavegacao';
import { estilos } from '../estilos/estilos';

export function Perfil({ navigation: navegacao }) {
  const ctxAuth = useContext(ContextoAutenticacao);
  let usuarioAtual = ctxAuth.usuarioAtual;
  let sair = ctxAuth.sair;
  let cadastrarRostoCtx = ctxAuth.cadastrarRosto;
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null);
  const [idCancelando, setIdCancelando] = useState(null);
  const [statusRosto, setStatusRosto] = useState(null);
  const [carregandoRosto, setCarregandoRosto] = useState(false);

  useEffect(function efeitoInicial() {
    carregarPedidos();
    let token = null;
    if (usuarioAtual && usuarioAtual.token) token = usuarioAtual.token;
    let funcStatus = api.statusRosto;
    funcStatus(token).then(function(s){ let norm={}; if(s.temRosto!==undefined) norm.temRosto=s.temRosto; else if(s.hasFace!==undefined) norm.temRosto=s.hasFace; else norm.temRosto=false; if(s.registradoEm) norm.registradoEm=s.registradoEm; else if(s.registeredAt) norm.registradoEm=s.registeredAt; setStatusRosto(norm); }).catch(function(){ setStatusRosto({ temRosto: false }); });
  }, [usuarioAtual.token]);

  async function carregarPedidos() {
    try {
      let funcPedidos = api.pedidos;
      let token = null;
      if (usuarioAtual && usuarioAtual.token) token = usuarioAtual.token;
      const dados = await funcPedidos(token);
      if (Array.isArray(dados)) setPedidos(dados);
      else setPedidos([]);
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  function confirmarCancelamento(pedido) {
    setPedidoParaCancelar(pedido);
  }

  async function cancelarPedido() {
    if (pedidoParaCancelar === null || idCancelando) return;
    const pedido = pedidoParaCancelar;
    setIdCancelando(pedido.id);
    try {
      let funcCancelar = api.cancelarPedido;
      let token = null;
      if (usuarioAtual && usuarioAtual.token) token = usuarioAtual.token;
      await funcCancelar(token, pedido.id);
      setPedidos(function(prev) {
        let novo = [];
        for (let i = 0; i < prev.length; i++) {
          let it = prev[i];
          if (it.id === pedido.id) {
            let copia = {};
            Object.assign(copia, it);
            copia.status = 'cancelled';
            novo.push(copia);
          } else novo.push(it);
        }
        return novo;
      });
      setPedidoParaCancelar(null);
    } catch (erro) {
      Alert.alert('Não foi possível cancelar', erro.message);
    } finally {
      setIdCancelando(null);
    }
  }

  function renderizarPapel() { if (usuarioAtual && usuarioAtual.role) { let extra=''; if(usuarioAtual.role==='admin') extra=' (acesso total)'; return null; } return null; }
  async function aoCadastrarRosto() {
    setCarregandoRosto(true);
    let loginVal = '';
    if (usuarioAtual) {
      if (usuarioAtual.login) {
        loginVal = usuarioAtual.login;
      }
    }
    const fakeDescriptor = Array.from({ length: 128 }, function(_, i) { return Math.sin(loginVal.charCodeAt(i % loginVal.length) * (i + 7)) * 0.5; });
    let r = await cadastrarRostoCtx(fakeDescriptor);
    let titulo = 'Erro';
    let ok = r.sucesso;
    if (ok === null || ok === undefined) {
      ok = r.success;
    }
    if (ok === true) {
      titulo = 'Sucesso';
    }
    let msg = r.mensagem;
    if (msg === null || msg === undefined) {
      msg = r.message;
    }
    Alert.alert(titulo, msg);
    if (ok === true) {
      let f = api.statusRosto;
      let tk = null;
      if (usuarioAtual) {
        if (usuarioAtual.token) {
          tk = usuarioAtual.token;
        }
      }
      let ss = await f(tk).catch(function(){ return null; });
      if (ss !== null) {
        if (ss !== undefined) {
          setStatusRosto(ss);
        }
      }
    }
    setCarregandoRosto(false);
  }
  function obterTextoStatusRosto() {
    if (statusRosto === null) return 'Verificando...';
    if (statusRosto.temRosto === true) {
      let dataStr = '';
      if (statusRosto.registradoEm) dataStr = new Date(statusRosto.registradoEm).toLocaleDateString('pt-BR');
      return 'Rosto cadastrado em ' + dataStr;
    }
    return 'Nenhum rosto cadastrado. Cadastre para entrar sem senha.';
  }
  function obterEstiloBotaoRosto() {
    if (statusRosto !== null && statusRosto !== undefined && statusRosto.temRosto === true) return estilos.perfilBotaoFacialCadastrado;
    return estilos.perfilBotaoFacialNaoCadastrado;
  }
  function obterTextoBotaoRosto() {
    if (carregandoRosto) return 'Salvando...';
    if (statusRosto && statusRosto.temRosto === true) return 'Recadastrar rosto';
    return 'Cadastrar meu rosto';
  }

  return (
    <View style={estilos.perfilTela}>
      <FlatList
        data={pedidos}
        keyExtractor={extrairId}
        contentContainerStyle={estilos.perfilConteudo}
        ListHeaderComponent={(
          <View>
            <View style={estilos.perfilCabecalho}>
              <View style={estilos.perfilAvatar}><Text style={estilos.perfilAvatarTexto}>●</Text></View>
              <View style={estilos.perfilInfoUsuario}>
                <Text style={estilos.perfilSobretitulo}>MINHA CONTA</Text>
                <Text style={estilos.perfilNome}>{usuarioAtual.nomeCompleto}</Text>
                <Text style={estilos.perfilEmail}>{usuarioAtual.login}</Text>
              </View>
              <TouchableOpacity
                style={estilos.perfilBotaoSair}
                onPress={sair}
                accessibilityLabel="Sair da conta"
              >
                <Text style={estilos.perfilIconeSair}>Sair</Text>
              </TouchableOpacity>
            </View>
            <View style={estilos.perfilCartaoFacial}>
              <Text style={estilos.perfilTituloFacial}>Reconhecimento Facial - Parte 1</Text>
              <Text style={estilos.perfilDescricaoFacial}>
                {obterTextoStatusRosto()}
              </Text>
              <TouchableOpacity
                style={[estilos.perfilBotaoFacial, obterEstiloBotaoRosto()]}
                onPress={aoCadastrarRosto}
                disabled={carregandoRosto}
              >
                <Text style={estilos.perfilTextoBotaoFacial}>{obterTextoBotaoRosto()}</Text>
              </TouchableOpacity>
              <Text style={estilos.perfilTextoDicaFacial}>Demo: gera descriptor fake determinístico. Em produção usaria expo-camera + face-api.js.</Text>
              {renderizarPapel()}
            </View>
            <View style={estilos.perfilCabecalhoSecao}>
              <View>
                <Text style={estilos.perfilTituloSecao}>Meus pedidos</Text>
                <Text style={estilos.perfilSubtitulo}>Códigos para apresentar no caixa</Text>
              </View>
              <Text style={estilos.perfilContador}>{pedidos.length}</Text>
            </View>
            {renderizarCarregando()}
            {renderizarErro()}
            {renderizarVazio()}
          </View>
        )}
        renderItem={function(props){ let item = props.item; return (
          <View style={estilos.perfilCartaoPedido}>
            <View style={estilos.perfilTopoPedido}>
              <Text style={estilos.perfilDataPedido}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
              <Text style={estilos.perfilTotalPedido}>{formatarReais(item.total)}</Text>
            </View>
            <Text style={estilos.perfilRotuloCodigo}>CÓDIGO DE RETIRADA</Text>
            <Text style={estilos.perfilCodigo}>{item.codigoRetirada}</Text>
            <Text style={estilos.perfilItens}>
              {obterTextoItens(item)}
            </Text>
            {renderizarAcaoPedido(item)}
          </View>
        );}}
      />
      <BarraNavegacao navigation={navegacao} active="Profile" />
      <Modal
        visible={obterVisivelModal()}
        transparent
        animationType="fade"
        onRequestClose={function(){ setPedidoParaCancelar(null); }}
      >
        <View style={estilos.perfilSobreposicaoModal}>
          <View style={estilos.perfilCaixaConfirmacao}>
            <Text style={estilos.perfilTituloConfirmacao}>Cancelar pedido?</Text>
            <Text style={estilos.perfilMensagemConfirmacao}>
              Tem certeza que deseja cancelar o pedido {obterCodigoCancelar()}? Se houver reembolso, ele podera levar alguns dias para ser processado.
            </Text>
            <View style={estilos.perfilAcoesConfirmacao}>
              <TouchableOpacity
                style={estilos.perfilBotaoVoltar}
                onPress={function(){ setPedidoParaCancelar(null); }}
                disabled={obterDesabilitado()}
              >
                <Text style={estilos.perfilTextoVoltar}>Não, voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={estilos.perfilBotaoConfirmar}
                onPress={cancelarPedido}
                disabled={obterDesabilitado()}
              >
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
