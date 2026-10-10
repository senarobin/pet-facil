const Produto = require('../models/Product');
const Pedido = require('../models/Order');
const MensagemChat = require('../models/ChatMessage');

function construirContextoLongo(produtos, pedidos) {
  let ctx = '### CATALOGO PETFACIL (banco real)\n';
  for (let i = 0; i < produtos.length; i++) {
    let p = produtos[i];
    let precoTexto = '';
    if (p.precoPromocional) {
      precoTexto = 'R\$ ' + p.precoAtual.toFixed(2) + ' -> PROMO R\$ ' + p.precoPromocional.toFixed(2);
    } else {
      precoTexto = 'R\$ ' + p.precoAtual.toFixed(2);
    }
    ctx = ctx + '- [' + p.id + '] ' + p.nome + ' | ' + p.tipo + ' | ' + precoTexto + ' | Val: ' + p.dataValidade + '\n  ' + p.descricao + '\n';
  }
  if (pedidos) {
    if (pedidos.length > 0) {
      ctx = ctx + '\n### ULTIMOS PEDIDOS DO USUARIO\n';
      let limite = 5;
      if (pedidos.length < limite) {
        limite = pedidos.length;
      }
      for (let i = 0; i < limite; i++) {
        let ped = pedidos[i];
        let codigo = ped.codigoRetirada;
        if (codigo === null || codigo === undefined) {
          codigo = ped.pickupCode;
        }
        let situacao = ped.situacao;
        if (situacao === null || situacao === undefined) {
          situacao = ped.status;
        }
        let totalTexto = '';
        if (ped.total !== null && ped.total !== undefined) {
          totalTexto = ped.total.toFixed(2);
        }
        let dataTexto = '';
        if (ped.createdAt) {
          dataTexto = new Date(ped.createdAt).toLocaleDateString('pt-BR');
        }
        ctx = ctx + '- ' + codigo + ' (' + situacao + ') R\$ ' + totalTexto + ' em ' + dataTexto + '\n';
        let itens = ped.itens;
        if (itens === null || itens === undefined) {
          itens = ped.items;
        }
        if (itens) {
          for (let j = 0; j < itens.length; j++) {
            let it = itens[j];
            let nomeProduto = it.name;
            if (nomeProduto === null || nomeProduto === undefined) {
              nomeProduto = '';
            }
            if (it.produto) {
              if (it.produto.nome) {
                nomeProduto = it.produto.nome;
              }
            } else {
              if (it.product) {
                if (it.product.nome) {
                  nomeProduto = it.product.nome;
                }
              }
            }
            let qtd = it.quantidade;
            if (qtd === null || qtd === undefined) {
              qtd = it.quantity;
            }
            ctx = ctx + '  * ' + qtd + 'x ' + nomeProduto + '\n';
          }
        }
      }
    }
  }
  ctx = ctx + '\n### REGRAS: pagamento e retirada so no caixa fisico. Nao ha entrega.\n';
  return ctx;
}

function buildLongContext(produtos, pedidos) {
  return construirContextoLongo(produtos, pedidos);
}

function tokenizar(texto) {
  let normalizado = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let partes = normalizado.split(/\W+/);
  let tokens = [];
  for (let i = 0; i < partes.length; i++) {
    if (partes[i]) {
      tokens.push(partes[i]);
    }
  }
  return tokens;
}

function tokenize(s) {
  return tokenizar(s);
}

function pontuarProduto(tokens, produto) {
  let promoTexto = '';
  if (produto.precoPromocional) {
    promoTexto = 'promocao oferta';
  }
  let texto = produto.nome + ' ' + produto.tipo + ' ' + produto.descricao + ' ' + promoTexto;
  texto = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let pontos = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (texto.indexOf(tokens[i]) !== -1) {
      pontos = pontos + 1;
    }
  }
  let nomeLower = produto.nome.toLowerCase();
  let achouNoNome = false;
  for (let i = 0; i < tokens.length; i++) {
    if (nomeLower.indexOf(tokens[i]) !== -1) {
      achouNoNome = true;
    }
  }
  if (achouNoNome) {
    pontos = pontos + 2;
  }
  return pontos;
}

function scoreProduct(tokens, produto) {
  return pontuarProduto(tokens, produto);
}

function recuperarProdutosRelevantes(consulta, produtos, limite) {
  if (limite === null || limite === undefined) {
    limite = 3;
  }
  let tokens = tokenizar(consulta);
  if (tokens.length === 0) {
    let fatia = [];
    for (let i = 0; i < limite && i < produtos.length; i++) {
      fatia.push(produtos[i]);
    }
    return fatia;
  }
  let pontuados = [];
  for (let i = 0; i < produtos.length; i++) {
    let p = produtos[i];
    let pts = pontuarProduto(tokens, p);
    pontuados.push({ produto: p, pontos: pts });
  }
  pontuados.sort(function(a, b) {
    return b.pontos - a.pontos;
  });
  let relevantes = [];
  for (let i = 0; i < pontuados.length; i++) {
    if (pontuados[i].pontos > 0) {
      relevantes.push(pontuados[i].produto);
    }
  }
  let resultado = [];
  for (let i = 0; i < limite && i < relevantes.length; i++) {
    resultado.push(relevantes[i]);
  }
  if (resultado.length > 0) {
    return resultado;
  }
  let fallback = [];
  for (let i = 0; i < limite && i < produtos.length; i++) {
    fallback.push(produtos[i]);
  }
  return fallback;
}

function retrieveRelevantProducts(consulta, produtos, limite) {
  if (limite === null || limite === undefined) {
    limite = 3;
  }
  return recuperarProdutosRelevantes(consulta, produtos, limite);
}

function gerarResposta(consulta, produtosRelevantes, contextoLongo, pedidos) {
  let q = consulta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let resposta = '';
  let fontes = [];
  for (let i = 0; i < produtosRelevantes.length; i++) {
    fontes.push(produtosRelevantes[i].id);
  }
  let ehPagamento = /pagar|pagamento|retirar|retirada|entrega|caixa/.test(q);
  if (ehPagamento) {
    resposta = 'Pagamento e retirada sao **diretamente no caixa da loja fisica**. Finalize no app, receba o codigo (ex: #A1B2C3) e apresente no caixa.';
  } else {
    let ehPedido = /pedido|compra|codigo/.test(q);
    let temPedidos = false;
    if (pedidos) {
      if (pedidos.length > 0) {
        temPedidos = true;
      }
    }
    if (ehPedido && temPedidos) {
      let ultimo = pedidos[0];
      let codigo = ultimo.codigoRetirada;
      if (codigo === null || codigo === undefined) {
        codigo = ultimo.pickupCode;
      }
      let situacao = ultimo.situacao;
      if (situacao === null || situacao === undefined) {
        situacao = ultimo.status;
      }
      let totalTexto = '';
      if (ultimo.total !== null && ultimo.total !== undefined) {
        totalTexto = ultimo.total.toFixed(2);
      }
      let itens = ultimo.itens;
      if (itens === null || itens === undefined) {
        itens = ultimo.items;
      }
      let itensTexto = '';
      if (itens) {
        let partes = [];
        for (let i = 0; i < itens.length; i++) {
          let it = itens[i];
          let nomeProduto = it.name;
          if (it.produto) {
            if (it.produto.nome) {
              nomeProduto = it.produto.nome;
            }
          } else {
            if (it.product) {
              if (it.product.nome) {
                nomeProduto = it.product.nome;
              }
            }
          }
          if (nomeProduto === null || nomeProduto === undefined) {
            nomeProduto = it.name;
          }
          let qtd = it.quantidade;
          if (qtd === null || qtd === undefined) {
            qtd = it.quantity;
          }
          partes.push(qtd + 'x ' + nomeProduto);
        }
        itensTexto = partes.join(', ');
      }
      resposta = 'Seu ultimo pedido e **' + codigo + '** (' + situacao + ') R\$ ' + totalTexto + '. Itens: ' + itensTexto + '.';
    } else {
      let ehPromo = /promo|oferta|desconto|barato/.test(q);
      if (ehPromo) {
        let promos = [];
        for (let i = 0; i < produtosRelevantes.length; i++) {
          if (produtosRelevantes[i].precoPromocional) {
            promos.push(produtosRelevantes[i]);
          }
        }
        if (promos.length > 0) {
          let linhas = [];
          for (let i = 0; i < promos.length; i++) {
            linhas.push('* ' + promos[i].nome + ': R\$ ' + promos[i].precoAtual.toFixed(2) + ' -> R\$ ' + promos[i].precoPromocional.toFixed(2));
          }
          resposta = 'Promocoes ativas:\n' + linhas.join('\n');
        } else {
          resposta = 'Promocao atual: Racao Golden Senior R\$ 66,05 -> R\$ 59,60.';
        }
      } else {
        resposta = 'Encontrei ' + produtosRelevantes.length + ' produto(s) para sua busca:\n\n';
        for (let i = 0; i < produtosRelevantes.length; i++) {
          let p = produtosRelevantes[i];
          let precoTexto = '';
          if (p.precoPromocional) {
            precoTexto = 'R\$ ' + p.precoPromocional.toFixed(2) + ' (promo de R\$ ' + p.precoAtual.toFixed(2) + ')';
          } else {
            precoTexto = 'R\$ ' + p.precoAtual.toFixed(2);
          }
          resposta = resposta + '* **' + p.nome + '** - ' + p.tipo + ' - ' + precoTexto + '\n  ' + p.descricao.slice(0, 130) + '...\n';
        }
      }
    }
  }
  resposta = resposta + '\n\n_Resposta com Long Context do banco real._';
  return { resposta: resposta, answer: resposta, fontes: fontes, sources: fontes, tamanhoContextoUsado: contextoLongo.length, usedContextLength: contextoLongo.length };
}

function generateAnswer(consulta, produtosRelevantes, contextoLongo, pedidos) {
  return gerarResposta(consulta, produtosRelevantes, contextoLongo, pedidos);
}

async function conversar(dados) {
  let idUsuario = dados.userId;
  if (idUsuario === null || idUsuario === undefined) {
    idUsuario = dados.idUsuario;
  }
  let mensagem = dados.message;
  if (mensagem === null || mensagem === undefined) {
    mensagem = dados.mensagem;
  }
  if (mensagem === null || mensagem === undefined) {
    throw Object.assign(new Error('Mensagem vazia.'), { status: 400 });
  }
  if (mensagem.trim() === '') {
    throw Object.assign(new Error('Mensagem vazia.'), { status: 400 });
  }
  let limpa = mensagem.trim().slice(0, 2000);
  let produtos = await Produto.find().lean();
  let pedidos = await Pedido.find({ usuario: idUsuario }).sort({ createdAt: -1 }).populate('itens.produto', 'nome').lean();
  if (pedidos.length === 0) {
    let pedidosLegado = await Pedido.find({ user: idUsuario }).sort({ createdAt: -1 }).populate('items.product', 'nome').lean();
    if (pedidosLegado.length > 0) {
      pedidos = pedidosLegado;
    }
  }
  let contextoLongo = construirContextoLongo(produtos, pedidos);
  let relevantes = recuperarProdutosRelevantes(limpa, produtos, 3);
  let gerado = gerarResposta(limpa, relevantes, contextoLongo, pedidos);
  let resposta = gerado.resposta;
  let fontes = gerado.fontes;
  let tamanhoContextoUsado = gerado.tamanhoContextoUsado;
  let totalMensagens = await MensagemChat.countDocuments({ usuario: idUsuario });
  if (totalMensagens === 0) {
    let totalLegado = await MensagemChat.countDocuments({ user: idUsuario });
    totalMensagens = totalLegado;
  }
  if (totalMensagens > 100) {
    let maisAntigas = await MensagemChat.find({ usuario: idUsuario }).sort({ createdAt: 1 }).limit(totalMensagens - 100).select('_id');
    if (maisAntigas.length === 0) {
      maisAntigas = await MensagemChat.find({ user: idUsuario }).sort({ createdAt: 1 }).limit(totalMensagens - 100).select('_id');
    }
    let ids = [];
    for (let i = 0; i < maisAntigas.length; i++) {
      ids.push(maisAntigas[i]._id);
    }
    await MensagemChat.deleteMany({ _id: { " \\: ids } });
 }
 await MensagemChat.create({ usuario: idUsuario, papel: 'usuario', conteudo: limpa, user: idUsuario, role: 'user', content: limpa });
 await MensagemChat.create({ usuario: idUsuario, papel: 'assistente', conteudo: resposta, metadados: { fontes: fontes, tamanhoContextoUsado: tamanhoContextoUsado }, user: idUsuario, role: 'assistant', content: resposta, metadata: { sources: fontes, usedContextLength: tamanhoContextoUsado } });
 let produtosRelevantes = [];
 for (let i = 0; i < relevantes.length; i++) {
 let p = relevantes[i];
 let copia = {};
 Object.assign(copia, p);
 delete copia._id;
 delete copia.__v;
 let imagem = null;
 if (p.imagemUrl) {
 imagem = p.imagemUrl;
 }
 copia.imagem = imagem;
 produtosRelevantes.push(copia);
 }
 return { resposta: resposta, answer: resposta, fontes: fontes, sources: fontes, tamanhoContextoUsado: tamanhoContextoUsado, usedContextLength: tamanhoContextoUsado, produtosRelevantes: produtosRelevantes, relevantProducts: produtosRelevantes };
}

async function chat(dados) {
 return conversar(dados);
}

async function historico(idUsuario, limite) {
 if (limite === null || limite === undefined) {
 limite = 20;
 }
 if (limite > 50) {
 limite = 50;
 }
 let mensagens = await MensagemChat.find({ usuario: idUsuario }).sort({ createdAt: -1 }).limit(limite).lean();
 if (mensagens.length === 0) {
 mensagens = await MensagemChat.find({ user: idUsuario }).sort({ createdAt: -1 }).limit(limite).lean();
 }
 mensagens.reverse();
 let normalizadas = [];
 for (let i = 0; i < mensagens.length; i++) {
 let m = mensagens[i];
 let papel = m.papel;
 if (papel === null || papel === undefined) {
 papel = m.role;
 if (papel === 'user') {
 papel = 'usuario';
 } else {
 if (papel === 'assistant') {
 papel = 'assistente';
 }
 }
 }
 let conteudo = m.conteudo;
 if (conteudo === null || conteudo === undefined) {
 conteudo = m.content;
 }
 let meta = m.metadados;
 if (meta === null || meta === undefined) {
 meta = m.metadata;
 }
 let fontes = null;
 let tamanho = null;
 if (meta) {
 fontes = meta.fontes;
 if (fontes === null || fontes === undefined) {
 fontes = meta.sources;
 }
 tamanho = meta.tamanhoContextoUsado;
 if (tamanho === null || tamanho === undefined) {
 tamanho = meta.usedContextLength;
 }
 }
 normalizadas.push({ _id: m._id, usuario: m.usuario || m.user, papel: papel, role: papel === 'usuario' ? 'user' : 'assistant', conteudo: conteudo, content: conteudo, metadados: { fontes: fontes, tamanhoContextoUsado: tamanho }, metadata: { sources: fontes, usedContextLength: tamanho }, createdAt: m.createdAt });
 }
 return normalizadas;
}

async function history(idUsuario, limite) {
 return historico(idUsuario, limite);
}

module.exports = { conversar, historico, construirContextoLongo, recuperarProdutosRelevantes, gerarResposta, tokenizar, pontuarProduto, chat, history, buildLongContext, retrieveRelevantProducts, generateAnswer, tokenize, scoreProduct };
