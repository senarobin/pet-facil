const Produto = require('../models/Produto')
const Pedido = require('../models/Pedido')
const MensagemChat = require('../models/MensagemChat')

function construirContexto(produtos,pedidos) {

  let ctx = 'Voce e o assistente da PetFacil. Responda em portugues, curto e util.\n'
  ctx += 'Use apenas as INFO abaixo.\n\n### CATALOGO\n'

  for(let p of produtos) {

    let preco = 'R$ ' + p.precoAtual.toFixed(2);
    if(p.precoPromocional){
      preco += ' -> PROMO R$ ' +p.precoPromocional.toFixed(2)
    } 

    ctx+= '- [' + p.id + '] '+ p.nome + ' | ' + p.tipo + ' | ' + preco + '\n  '+ p.descricao + '\n'
  }

  if(pedidos && pedidos.length > 0) {
    
    ctx += '\n### ULTIMOS PEDIDOS\n'

    let lim = pedidos.length < 5 ? pedidos.length : 5

    for(let i=0;i<lim;i++){
      let ped=pedidos[i];

      let cod = ped.codigoRetirada || 'sem-codigo'
      let sit = ped.situacao || ''

      let tot = ped.total !=null ? ped.total.toFixed(2) : '0.00'

      ctx += '- ' + cod + ' (' + sit + ') R$ ' + tot + '\n'
    }
  }

  ctx += '\n### REGRA: pagamento e retirada SO no caixa fisico.\n'
  return ctx
}

async function chamarLlama(pergunta,contexto,historico) {

  let msgs = []
  msgs.push({role: 'system',content: contexto})

  if(historico) {

    for(let h of historico) {
      msgs.push(h)
    }
  }

  msgs.push({role: 'user',content: pergunta})

  let r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',headers: {'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: msgs,
      temperature: 0.5,
      max_tokens: 600
    })
  })

  if(!r.ok) {
    let t = await r.text();
    throw new Error('Groq ' + r.status + ': ' + t.slice(0,300))
  }

  let d = await r.json();
  return d.choices[0].message.content
}

async function conversar(dados) {

  let id = dados.idUsuario || dados.userId
  let msg = dados.mensagem || dados.message

  if(!msg || !msg.trim()){
    throw Object.assign(
      new Error('Mensagem vazia'),
      {
        status: 400
      }
    )
  }

  let limpa = msg.trim().slice(0,2000)
  
  let produtos = await Produto.find().lean()
  let pedidos = await Pedido.find({usuario: id}).sort({createdAt: -1}).populate('itens.produto','nome').lean()
  let ctx = construirContexto(produtos,pedidos)

  let histDB = await MensagemChat.find({usuario: id}).sort({ createdAt: -1 }).limit(6).lean()
  histDB.reverse()

  let hist = []

  for(let m of histDB) {
    let papelConvertido = 'assistant'

    if(m.papel === 'usuario') {
      papelConvertido = 'user'
    }

    hist.push({role: papelConvertido,content: m.conteudo})
  }

  let resposta
  try {
    resposta = await chamarLlama(limpa,ctx,hist)
  } catch(erroGroq) {
    console.warn('Groq fallback:', erroGroq.message)
    resposta = 'No momento estou sem conexao com a IA externa, mas posso te ajudar com base no catalogo. ' +
      'Produtos disponiveis: ' + produtos.map(p=> p.nome).join('; ') + '. ' +
      'Pagamento e retirada apenas no caixa fisico.'
  }

  let total = await MensagemChat.countDocuments({usuario: id})

  if(total > 100){

    let antigas = await MensagemChat.find({usuario: id}).sort({createdAt: 1}).limit(total - 100).select('_id')
    let ids = antigas.map(x =>x._id);
    await MensagemChat.deleteMany({ _id:{
      $in:ids
    }
  })
  }

  await MensagemChat.create({usuario: id,papel: 'usuario',conteudo: limpa})
  
  await MensagemChat.create({usuario: id,papel: 'assistente',conteudo: resposta, 
    metadados: {
      fontes: [],
      tamanhoContextoUsado: ctx.length
    } 
  })

  let rel = []
  for(let i=0;i<3&&i<produtos.length;i++){

    let p = Object.assign({},produtos[i])
    delete p._id
    delete p.__v
    
    let imagemDefinida = null

    if(p.urlImagem){
      imagemDefinida = p.urlImagem
    }

    p.imagem= imagemDefinida
    
    rel.push(p)
  }

  return {resposta: resposta,fontes: [],tamanhoContextoUsado: ctx.length,produtosRelevantes: rel}
}

async function historico(id,lim) {

  if(lim == null) {
    lim = 20
  }
  if(lim > 50) {
    lim = 50
  }
  let msgs = await MensagemChat.find({usuario: id}).sort({ createdAt: -1 }).limit(lim).lean()
    
  msgs.reverse()
  
  for(let m of msgs){
    if(m.papel === 'user') {
      m.papel = 'usuario'
    }
    if(m.papel === 'assistant') {
      m.papel = 'assistente'
    }
  }
  return msgs
}

module.exports = {conversar,historico,construirContexto,construirContextoLongo: construirContexto,chamarLlama}
