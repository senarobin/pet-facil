import React, { createContext, useState } from 'react';
import { api } from '../servicos/api';
import { ContextoAutenticacao } from './autenticacao';

export const ContextoCarrinho = createContext();

export function ProvedorCarrinho({ children: filhos }) {
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [compras, setCompras] = useState([]);
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const ctxAuth = React.useContext(ContextoAutenticacao);
  const usuarioAtual = ctxAuth.usuarioAtual;

  function adicionarAoCarrinho(produto) {
    const idItem = produto.id + '-' + Date.now() + '-' + Math.random();
    const item = {};
    Object.assign(item, produto);
    item.idItemCarrinho = idItem;
    setItensCarrinho(function(prev) {
      const copia = prev.slice();
      copia.push(item);
      return copia;
    });
  }

  function removerDoCarrinho(idItemCarrinho) {
    setItensCarrinho(function(prev) {
      return prev.filter(function(it) {
        if (it.idItemCarrinho !== idItemCarrinho) return true;
        return false;
      });
    });
  }

  function removerProdutoDoCarrinho(idProduto) {
    setItensCarrinho(function(prev) {
      return prev.filter(function(it) {
        if (it.id !== idProduto) return true;
        return false;
      });
    });
  }

  function limparCarrinho() {
    setItensCarrinho([]);
  }

  function obterTotalCarrinho() {
    let total = 0;
    for (let i = 0; i < itensCarrinho.length; i++) {
      const it = itensCarrinho[i];
      let preco = it.precoAtual;
      if (it.precoPromocional !== null && it.precoPromocional !== undefined) preco = it.precoPromocional;
      total = total + preco;
    }
    return total;
  }

  function obterItensAgrupados() {
    const grupos = [];
    for (let i = 0; i < itensCarrinho.length; i++) {
      const it = itensCarrinho[i];
      let existente = null;
      for (let g = 0; g < grupos.length; g++) {
        if (grupos[g].item.id === it.id) existente = grupos[g];
      }
      if (existente) existente.quantidade = existente.quantidade + 1;
      else grupos.push({ item: it, quantidade: 1 });
    }
    return grupos;
  }

  async function finalizarPedido() {
    if (itensCarrinho.length === 0) return { sucesso: false, mensagem: 'Seu carrinho está vazio.' };
    let tokenUsuario = null;
    if (usuarioAtual) tokenUsuario = usuarioAtual.token;
    if (tokenUsuario === null || tokenUsuario === undefined) return { sucesso: false, mensagem: 'Sua sessão expirou. Faça login novamente.' };
    const dataAtual = new Date().toISOString();
    const agrupados = obterItensAgrupados();
    const novasCompras = [];
    for (let i = 0; i < agrupados.length; i++) {
      let pu = agrupados[i].item.precoAtual;
      if (agrupados[i].item.precoPromocional !== null && agrupados[i].item.precoPromocional !== undefined) pu = agrupados[i].item.precoPromocional;
      novasCompras.push({ nomeProduto: agrupados[i].item.nome, quantidade: agrupados[i].quantidade, preco: pu * agrupados[i].quantidade, dataDaCompra: dataAtual });
    }
    let pedido;
    try {
      const itensPedido = [];
      for (let i = 0; i < agrupados.length; i++) itensPedido.push({ productId: agrupados[i].item.id, quantity: agrupados[i].quantidade });
      pedido = await api.criarPedido(tokenUsuario, itensPedido);
    } catch (erro) {
      let msg = erro.message;
      if (msg === null || msg === undefined) msg = 'Não foi possível finalizar o pedido.';
      return { sucesso: false, mensagem: msg };
    }
    if (pedido === null || pedido === undefined) return { sucesso: false, mensagem: 'A API não retornou o código de retirada.' };
    let codigoRet = pedido.codigoRetirada;
    if (codigoRet === null || codigoRet === undefined) { if (pedido.codigoRetirada) codigoRet = pedido.codigoRetirada; }
    if (codigoRet === null || codigoRet === undefined) return { sucesso: false, mensagem: 'A API não retornou o código de retirada.' };
    setUltimoPedido({ codigoRetirada: codigoRet, total: pedido.total, createdAt: dataAtual });
    setCompras(function(prev) {
      const cp = prev.slice();
      for (let i = 0; i < novasCompras.length; i++) cp.push(novasCompras[i]);
      return cp;
    });
    limparCarrinho();
    return { sucesso: true, codigoRetirada: codigoRet, total: pedido.total };
  }

  return (
    <ContextoCarrinho.Provider value={{ itensCarrinho: itensCarrinho, compras: compras, ultimoPedido: ultimoPedido, adicionarAoCarrinho: adicionarAoCarrinho, removerDoCarrinho: removerDoCarrinho, removerProdutoDoCarrinho: removerProdutoDoCarrinho, limparCarrinho: limparCarrinho, obterTotalCarrinho: obterTotalCarrinho, obterItensAgrupados: obterItensAgrupados, finalizarPedido: finalizarPedido }}>
      {filhos}
    </ContextoCarrinho.Provider>
  );
}
export default ProvedorCarrinho;
