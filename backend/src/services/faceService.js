const jwt = require('jsonwebtoken');
const Usuario = require('../models/User');

function distanciaEuclidiana(a, b) {
  if (a === null || a === undefined) {
    return Infinity;
  }
  if (b === null || b === undefined) {
    return Infinity;
  }
  if (a.length !== b.length) {
    return Infinity;
  }
  let soma = 0;
  for (let i = 0; i < a.length; i++) {
    let diff = a[i] - b[i];
    soma = soma + diff * diff;
  }
  return Math.sqrt(soma);
}

function euclideanDistance(a, b) {
  return distanciaEuclidiana(a, b);
}

const LIMITE_ROSTO = 0.6;
const FACE_THRESHOLD = LIMITE_ROSTO;

async function cadastrarRosto(idUsuario, descritor) {
  if (Array.isArray(descritor) === false) {
    throw Object.assign(new Error('Descriptor facial invalido. Envie um vetor numerico com pelo menos 10 posicoes.'), { status: 400 });
  }
  if (descritor.length < 10) {
    throw Object.assign(new Error('Descriptor facial invalido. Envie um vetor numerico com pelo menos 10 posicoes.'), { status: 400 });
  }
  let temInvalido = false;
  for (let i = 0; i < descritor.length; i++) {
    if (typeof descritor[i] !== 'number') {
      temInvalido = true;
    } else {
      if (Number.isNaN(descritor[i])) {
        temInvalido = true;
      }
    }
  }
  if (temInvalido) {
    throw Object.assign(new Error('Descriptor deve conter apenas numeros.'), { status: 400 });
  }
  let usuario = await Usuario.findByIdAndUpdate(idUsuario, { descritorFacial: descritor, rostoRegistradoEm: new Date() }, { new: true });
  if (usuario === null || usuario === undefined) {
    throw Object.assign(new Error('Usuario nao encontrado.'), { status: 404 });
  }
  return { mensagem: 'Rosto cadastrado com sucesso. Agora voce pode fazer login por reconhecimento facial.', message: 'Rosto cadastrado com sucesso. Agora voce pode fazer login por reconhecimento facial.', registradoEm: usuario.rostoRegistradoEm, registeredAt: usuario.rostoRegistradoEm };
}

async function registrarRosto(idUsuario, descritor) {
  return cadastrarRosto(idUsuario, descritor);
}

async function registerFace(idUsuario, descritor) {
  return cadastrarRosto(idUsuario, descritor);
}

async function entrarComRosto(descritor, dicaLogin) {
  if (Array.isArray(descritor) === false) {
    throw Object.assign(new Error('Descriptor facial invalido.'), { status: 400 });
  }
  if (descritor.length < 10) {
    throw Object.assign(new Error('Descriptor facial invalido.'), { status: 400 });
  }
  let candidatos = [];
  if (dicaLogin) {
    let loginLimpo = dicaLogin.toLowerCase().trim();
    let usuario = await Usuario.findOne({ login: loginLimpo });
    if (usuario === null || usuario === undefined) {
      throw Object.assign(new Error('Nenhum rosto cadastrado para este e-mail. Faca login com senha primeiro.'), { status: 404 });
    }
    if (usuario.descritorFacial === null || usuario.descritorFacial === undefined) {
      if (usuario.faceDescriptor === null || usuario.faceDescriptor === undefined) {
        throw Object.assign(new Error('Nenhum rosto cadastrado para este e-mail. Faca login com senha primeiro.'), { status: 404 });
      }
    }
    let desc = usuario.descritorFacial;
    if (desc === null || desc === undefined) {
      desc = usuario.faceDescriptor;
    }
    if (desc === null || desc === undefined) {
      throw Object.assign(new Error('Nenhum rosto cadastrado para este e-mail. Faca login com senha primeiro.'), { status: 404 });
    }
    candidatos = [usuario];
  } else {
    let todos = await Usuario.find({});
    for (let i = 0; i < todos.length; i++) {
      let u = todos[i];
      let d = u.descritorFacial;
      if (d === null || d === undefined) {
        d = u.faceDescriptor;
      }
      if (d !== null && d !== undefined) {
        candidatos.push(u);
      }
    }
    if (candidatos.length === 0) {
      throw Object.assign(new Error('Nenhum usuario com rosto cadastrado.'), { status: 404 });
    }
  }
  let melhor = null;
  let melhorDist = Infinity;
  for (let i = 0; i < candidatos.length; i++) {
    let u = candidatos[i];
    let descU = u.descritorFacial;
    if (descU === null || descU === undefined) {
      descU = u.faceDescriptor;
    }
    let dist = distanciaEuclidiana(descritor, descU);
    if (dist < melhorDist) {
      melhorDist = dist;
      melhor = u;
    }
  }
  if (melhor === null) {
    throw Object.assign(new Error('Rosto nao reconhecido. Tente novamente em melhor iluminacao.'), { status: 401 });
  }
  if (melhorDist > LIMITE_ROSTO) {
    throw Object.assign(new Error('Rosto nao reconhecido. Tente novamente em melhor iluminacao.'), { status: 401 });
  }
  let perfil = melhor.perfil;
  if (perfil === null || perfil === undefined) {
    perfil = melhor.role;
  }
  if (perfil === null || perfil === undefined) {
    perfil = 'usuario';
  }
  let token = jwt.sign({ sub: melhor.id, perfil: perfil, role: perfil }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token: token, usuario: { id: melhor.id, cpf: melhor.cpf, nomeCompleto: melhor.nomeCompleto, login: melhor.login, perfil: perfil }, user: { id: melhor.id, cpf: melhor.cpf, nomeCompleto: melhor.nomeCompleto, login: melhor.login, perfil: perfil, role: perfil }, distance: Number(melhorDist.toFixed(4)) };
}

async function loginWithFace(descritor, dicaLogin) {
  return entrarComRosto(descritor, dicaLogin);
}

async function statusRosto(idUsuario) {
  let usuario = await Usuario.findById(idUsuario).select('descritorFacial rostoRegistradoEm faceDescriptor faceRegisteredAt');
  let temRosto = false;
  let registradoEm = null;
  if (usuario) {
    let d = usuario.descritorFacial;
    if (d === null || d === undefined) {
      d = usuario.faceDescriptor;
    }
    if (d !== null && d !== undefined) {
      temRosto = true;
    }
    registradoEm = usuario.rostoRegistradoEm;
    if (registradoEm === null || registradoEm === undefined) {
      registradoEm = usuario.faceRegisteredAt;
    }
  }
  return { temRosto: temRosto, registradoEm: registradoEm, hasFace: temRosto, registeredAt: registradoEm };
}

async function faceStatus(idUsuario) {
  return statusRosto(idUsuario);
}

module.exports = { cadastrarRosto, entrarComRosto, statusRosto, distanciaEuclidiana, LIMITE_ROSTO, registerFace, loginWithFace, faceStatus, euclideanDistance, FACE_THRESHOLD, registrarRosto };
