import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextoAutenticacao } from '../contexts/autenticacao';
import { api } from '../services/api';
import { respostaPadraoBot } from '../data/baseConhecimento';
import { BarraNavegacao } from '../components/barraNavegacao';
import { estilos } from '../styles/estilos';

export function ChatAssistente({ navigation: navegacao }) {

  const contextoAuth = useContext(ContextoAutenticacao);

  let usuarioAtual = contextoAuth.usuarioAtual;

  const [mensagens, setMensagens] = useState([{ id: 'msg-1',remetente: 'bot',texto: respostaPadraoBot }]);

  const [textoEntrada, setTextoEntrada] = useState('');
  const [carregando, setCarregando] = useState(false);
  const refLista = useRef(null);

  let tokenDependencia = undefined;

  if(usuarioAtual && usuarioAtual.token) {
    tokenDependencia = usuarioAtual.token;
  }

  function obterComportamentoTeclado(){
    if(Platform.OS==='ios') {
      return 'padding';
    }
    return undefined;
  }

  function obterEstiloBolha(r){
    return r==='user'?estilos.chatBolhaUsuario:estilos.chatBolhaBot;
  }

  function obterEstiloTextoBolha(r){
    return r==='user'?estilos.chatTextoUsuario:estilos.chatTextoBot;
  }

  function obterTextoStatusConexao(){
    return 'Contexto direto do banco ativo';
  }

  function obterEstiloStatusConexao(){
    return estilos.chatStatusDesconectado;
  }

  function obterTextoBotaoEnvio(){
    return carregando?'...' : 'Enviar';
  }

  function obterEstiloBotaoEnvio(){
    return carregando ? estilos.chatBotaoEnviarDesabilitado : null;
  }

  function obterRemetente(p){
    if(p === 'usuario' || p === 'user') {
      return 'user';
    }

    if(p === 'assistente' || p === 'assistant' || p === 'bot') {
      return 'bot';
    }
    return 'bot';
  }

  function obterIdMensagem(m){
    if(m._id) {
      return String(m._id);
    }

    let papel = m.papel || m.role;
    let conteudo = m.conteudo || m.content;
    return `${papel}-${conteudo}-${m.createdAt}`;
  }

  function obterMensagemErroSegura(e){
    return e.message?e.message:'Erro ao enviar';
  }

  function renderizarCarregando(){
    if(carregando) {
      return <ActivityIndicator size="small" color="#167D63" style={estilos.chatCarregandoIndicador} />;
    }

    return null;
  }

  useEffect(function efeitoHistorico(){

    let tem = false;

    if(usuarioAtual && usuarioAtual.token) {
      tem=true;
    }

    if(!tem){
      return;
    }

    api.historicoChat(usuarioAtual.token,20).then(function(h){

      if(!Array.isArray(h) || !h.length)
        return;

      setMensagens(function(a) {
        const mapeados=h.map(function(m) {

          let papelRaw = m.papel || m.role;
          let textoRaw = m.conteudo || m.content;
          return {id: obterIdMensagem(m), remetente:obterRemetente(papelRaw), texto:textoRaw};
        });

        const res=[a[0]]; for(let i=0;i<mapeados.length;i++) res.push(mapeados[i]); return res;
      });
      
    })
    .catch(function(){});
  },[tokenDependencia]);

  async function enviarMensagem(){

    const texto=textoEntrada.trim();
      if(!texto||carregando) 
        return;

    setMensagens(function(a){
      const c=a.slice();
      c.push({id:`usr-${Date.now()}`, remetente:'user', texto});
      return c;
    });

    setTextoEntrada('');
    setCarregando(true);

    try{

      const r = await api.chat(usuarioAtual.token, texto);
      let textoResposta = r.resposta || r.answer || r.mensagem || r.message || 'Sem resposta.';
      setMensagens(function(a){ const c=a.slice();
      c.push({id:`bot-${Date.now()}`, remetente: 'bot', texto: textoResposta});
      return c;
    });
    }
    catch(erro) {
      setMensagens(function(a){
        const c = a.slice();
        c.push({id:`bot-${Date.now()}`,
        remetente:'bot',
        texto: obterMensagemErroSegura(erro)});
        return c;
      });
    }
    finally { setCarregando(false); }
  }
  return (
    <View style={estilos.chatTela}>
      <KeyboardAvoidingView style={estilos.chatContainer} behavior={obterComportamentoTeclado()} keyboardVerticalOffset={80}>
      <FlatList data={mensagens} keyExtractor={function(i){return i.id;}} contentContainerStyle={estilos.chatListaMensagens} renderItem={function(p){ const it=p.item; return (<View style={[estilos.chatBolha, obterEstiloBolha(it.remetente)]}><Text style={[estilos.chatTextoBolha, obterEstiloTextoBolha(it.remetente)]}>{it.texto}</Text></View>);}} />
      <View style={estilos.chatBarraStatus}><Text style={[estilos.chatTextoStatus, obterEstiloStatusConexao()]}>{obterTextoStatusConexao()}</Text>{renderizarCarregando()}</View>
      <View style={estilos.chatBarraEntrada}><TextInput style={estilos.chatCampoTexto} placeholder="Tire dúvidas sobre produtos ou pedidos..." placeholderTextColor="#9AA8A1" value={textoEntrada} onChangeText={setTextoEntrada} onSubmitEditing={enviarMensagem} editable={carregando===false} /><TouchableOpacity style={[estilos.chatBotaoEnviar, obterEstiloBotaoEnvio()]} onPress={enviarMensagem} disabled={carregando} accessibilityLabel="Enviar mensagem"><Ionicons name="send" size={18} color="#FFFFFF" style={estilos.chatIconeEnviar} /></TouchableOpacity></View>
      </KeyboardAvoidingView>
      <BarraNavegacao navigation={navegacao} active="AIChat" />
    </View>
  );
}
export default ChatAssistente;
