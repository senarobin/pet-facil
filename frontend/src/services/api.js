import { Platform } from 'react-native';

function obterUrlApiPlataforma() {

  if(Platform.OS === 'web') {
    return process.env.EXPO_API_URL_WEB;
  }

  if(Platform.OS === 'android') {
    return process.env.EXPO_API_URL_ANDROID;
  }

  return process.env.EXPO_API_URL_IOS;
}

const urlApiPlataforma = obterUrlApiPlataforma();

function obterUrlApiPadrao() {

  if(Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  return 'http://localhost:3000/api';
}

const urlApiPadrao = obterUrlApiPadrao();

function obterUrlApiFinal() {

  if(urlApiPlataforma) {
    return urlApiPlataforma;
  }

  if(process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return urlApiPadrao;
}

const URL_API = obterUrlApiFinal();

async function requisitar(caminho,opcoes) {

  if(opcoes === null || opcoes === undefined) {
    opcoes = {};
  }

  let resposta;

  const controlador = new AbortController();

  const idTimeout = setTimeout(function() {
    controlador.abort();
  },15000);

  try {
    resposta = await fetch(URL_API + caminho, {
      ...opcoes,
      signal: controlador.signal,
      headers: {'Content-Type': 'application/json',...opcoes.headers },
    });

  }
  catch(erro) {
    clearTimeout(idTimeout);
    const err = new Error('Nao foi possivel conectar ao servidor, verifique se a api esta rodando');
    err.status = 0;
    throw err;
  }

  clearTimeout(idTimeout);

  const dados = await resposta.json().catch(function() {
    return {};
  });

  if(resposta.ok === false) {

    let msgErro = 'Não foi possível concluir a solicitação';

    if(dados.mensagem) {
      msgErro = dados.mensagem;
    }
    else{
      if(dados.message) {
        msgErro = dados.message;
      }
    }

    const erro = new Error(msgErro);

    erro.status = resposta.status;

    throw erro;
  }
  return dados;
}

export const api = {

  login: function(credenciais){
    return requisitar('/auth/login',{
      method: 'POST',
      body: JSON.stringify(credenciais)
    });
  },
  cadastro: function(usuario){
    return requisitar('/auth/registrar',{
      method: 'POST',
      body: JSON.stringify(usuario)
    });
  },
  produtos: function() {
    return requisitar('/products');
  },
  criarPedido: function(token,itens){

    let itensApi= itens.map(function(it){
      let id = it.idProduto;

      if(id === undefined || id === null){
        id = it.productId;
      }

      if(id === undefined || id=== null) {
        id = it.id;
      }

      let q = it.quantidade;

      if(q === undefined || q === null) {
        q = it.quantity;
      }

      return {idProduto: id,quantidade: q};
    });

    return requisitar('/orders',{
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' +token
      },body: JSON.stringify({itens: itensApi})
    });
  },

  pedidos: function(token){
    return requisitar('/orders',{
      headers: {
        Authorization: 'Bearer ' +token
      }
    });
  },
  cancelarPedido: function(token,idPedido) {
    return requisitar('/orders/' + idPedido + '/cancelar',{
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
  },
  chat: function(token,mensagem) {
    return requisitar('/chat',{
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({mensagem: mensagem})
    });
  },
  historicoChat: function(token,limite){
    if(limite === undefined || limite === null) {
      limite = 20;
    }

    return requisitar('/chat/historico?limite=' + limite,{
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
  },
};

export default api;
