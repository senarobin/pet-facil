import { Platform } from 'react-native';

function obterUrlApiPlataforma() {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL_WEB;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID;
  }
  return process.env.EXPO_PUBLIC_API_URL_IOS;
}
const urlApiPlataforma = obterUrlApiPlataforma();

function obterUrlApiPadrao() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
}
const urlApiPadrao = obterUrlApiPadrao();

function obterUrlApiFinal() {
  if (urlApiPlataforma) {
    return urlApiPlataforma;
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return urlApiPadrao;
}
const URL_API = obterUrlApiFinal();

async function requisitar(caminho, opcoes = {}) {
  let resposta;
  const controlador = new AbortController();
  const idTimeout = setTimeout(function() { controlador.abort(); }, 15000);
  try {
    resposta = await fetch(URL_API + caminho, {
      ...opcoes,
      signal: controlador.signal,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
    });
  } catch (erro) {
    clearTimeout(idTimeout);
    const err = new Error('Nao foi possivel conectar ao servidor. Verifique se a API esta rodando.');
    err.status = 0;
    throw err;
  }
  clearTimeout(idTimeout);
  const dados = await resposta.json().catch(function() { return {}; });
  if (resposta.ok === false) {
    let msgErro = 'Nao foi possivel concluir a solicitacao.';
    if (dados.message) {
      msgErro = dados.message;
    }
    const erro = new Error(msgErro);
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

export const api = {
  login: function(credenciais) { return requisitar('/auth/login', { method: 'POST', body: JSON.stringify(credenciais) }); },
  cadastro: function(usuario) { return requisitar('/auth/register', { method: 'POST', body: JSON.stringify(usuario) }); },
  produtos: function() { return requisitar('/products'); },
  criarPedido: function(token, itens) { let itensApi = itens.map(function(it){ let id = it.idProduto; if (id === undefined || id === null) id = it.productId; let q = it.quantidade; if (q === undefined || q === null) q = it.quantity; return { productId: id, quantity: q }; }); return requisitar('/orders', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ items: itensApi }) }).then(function(r){ let norm={}; Object.assign(norm,r); if (r.pickupCode && !norm.codigoRetirada) norm.codigoRetirada=r.pickupCode; return norm; }); },
  pedidos: function(token) { return requisitar('/orders', { headers: { Authorization: 'Bearer ' + token } }).then(function(lista){ if (Array.isArray(lista)) return lista.map(function(o){ let n={}; Object.assign(n,o); if (o.pickupCode && !n.codigoRetirada) n.codigoRetirada=o.pickupCode; if (o.items) n.itens=o.items; return n; }); return lista; }); },
  cancelarPedido: function(token, idPedido) { return requisitar('/orders/' + idPedido + '/cancel', { method: 'PATCH', headers: { Authorization: 'Bearer ' + token } }); },
  chat: function(token, mensagem) { return requisitar('/chat', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ message: mensagem }) }); },
  historicoChat: function(token, limite) {
    if (limite === undefined || limite === null) limite = 20;
    return requisitar('/chat/history?limit=' + limite, { headers: { Authorization: 'Bearer ' + token } });
  },
  cadastrarRosto: function(token, descritor) { return requisitar('/auth/face-register', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ descriptor: descritor }) }); },
  loginRosto: function(descritor, login) { return requisitar('/auth/face-login', { method: 'POST', body: JSON.stringify({ descriptor: descritor, login: login }) }); },
  statusRosto: function(token) { return requisitar('/auth/face-status', { headers: { Authorization: 'Bearer ' + token } }).then(function(r){ let norm={}; if (r.hasFace !== undefined) norm.temRosto=r.hasFace; if (r.temRosto !== undefined) norm.temRosto=r.temRosto; if (r.registeredAt) norm.registradoEm=r.registeredAt; if (r.registradoEm) norm.registradoEm=r.registradoEm; if (r.hasFace === undefined && r.temRosto === undefined) Object.assign(norm,r); return norm; }); },
};

export default api;
