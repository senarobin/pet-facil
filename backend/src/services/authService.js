const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/User');

function normalizarLogin(valor) {
  if (typeof valor === 'string') {
    return valor.trim().toLowerCase();
  }
  return '';
}

function normalizarCpf(valor) {
  if (typeof valor === 'string') {
    return valor.replace(/\D/g, '');
  }
  return '';
}

function cpfValido(valor) {
  if (/^\d{11}$/.test(valor) === false) {
    return false;
  }
  if (/^(\d)\1{10}$/.test(valor)) {
    return false;
  }
  let digitos = valor.split('').map(Number);
  let somaPrimeiro = 0;
  for (let i = 0; i < 9; i++) {
    somaPrimeiro = somaPrimeiro + digitos[i] * (10 - i);
  }
  let digitoPrimeiro = (somaPrimeiro * 10) % 11 % 10;
  if (digitoPrimeiro !== digitos[9]) {
    return false;
  }
  let somaSegundo = 0;
  for (let i = 0; i < 10; i++) {
    somaSegundo = somaSegundo + digitos[i] * (11 - i);
  }
  let digitoSegundo = (somaSegundo * 10) % 11 % 10;
  if (digitoSegundo !== digitos[10]) {
    return false;
  }
  return true;
}

function respostaUsuario(usuario) {
  let perfil = usuario.perfil;
  if (perfil === null || perfil === undefined) {
    perfil = usuario.role;
  }
  if (perfil === null || perfil === undefined) {
    perfil = 'usuario';
  }
  return { id: usuario.id, cpf: usuario.cpf, nomeCompleto: usuario.nomeCompleto, login: usuario.login, perfil: perfil };
}

async function registrar(dados) {
  let cpf = dados.cpf;
  let nomeCompleto = dados.nomeCompleto;
  let login = dados.login;
  let senha = dados.senha;
  let perfilInformado = dados.perfil;
  if (perfilInformado === null || perfilInformado === undefined) {
    perfilInformado = dados.role;
  }
  let cpfLimpo = normalizarCpf(cpf);
  let nomeLimpo = '';
  if (typeof nomeCompleto === 'string') {
    nomeLimpo = nomeCompleto.trim();
  }
  let loginLimpo = normalizarLogin(login);
  let senhaLimpa = '';
  if (typeof senha === 'string') {
    senhaLimpa = senha;
  }
  if (cpfLimpo === '' || nomeLimpo === '' || loginLimpo === '' || senhaLimpa === '') {
    throw Object.assign(new Error('Todos os campos são obrigatórios.'), { status: 400 });
  }
  if (cpfValido(cpfLimpo) === false) {
    throw Object.assign(new Error('Informe um CPF válido.'), { status: 400 });
  }
  let emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginLimpo);
  if (emailValido === false) {
    throw Object.assign(new Error('Informe um e-mail válido.'), { status: 400 });
  }
  if (senhaLimpa.length < 6) {
    throw Object.assign(new Error('A senha deve ter pelo menos 6 caracteres.'), { status: 400 });
  }
  let usuariosCpf = await Usuario.find({}).select('cpf').lean();
  let loginExiste = await Usuario.exists({ login: loginLimpo });
  let cpfExiste = false;
  for (let i = 0; i < usuariosCpf.length; i++) {
    let cpfAtual = normalizarCpf(usuariosCpf[i].cpf);
    if (cpfAtual === cpfLimpo) {
      cpfExiste = true;
    }
  }
  if (cpfExiste || loginExiste) {
    let mensagem = '';
    if (cpfExiste && loginExiste) {
      mensagem = 'CPF e e-mail já cadastrados.';
    } else {
      if (cpfExiste) {
        mensagem = 'Este CPF já está cadastrado.';
      } else {
        mensagem = 'Este e-mail já está cadastrado.';
      }
    }
    throw Object.assign(new Error(mensagem), { status: 409 });
  }
  let senhaHash = await bcrypt.hash(senhaLimpa, 12);
  let perfilFinal = 'usuario';
  if (perfilInformado === 'admin') {
    perfilFinal = 'admin';
  }
  try {
    let dadosCriar = { cpf: cpfLimpo, nomeCompleto: nomeLimpo, login: loginLimpo, senhaHash: senhaHash, perfil: perfilFinal };
    await Usuario.create(dadosCriar);
  } catch (erro) {
    if (erro.code === 11000) {
      let campo = '';
      if (erro.keyPattern) {
        let chaves = Object.keys(erro.keyPattern);
        if (chaves.length > 0) {
          campo = chaves[0];
        }
      }
      let msg = 'E-mail já cadastrado.';
      if (campo === 'cpf') {
        msg = 'CPF já cadastrado.';
      }
      throw Object.assign(new Error(msg), { status: 409 });
    }
    throw erro;
  }
  return { mensagem: 'Cadastro realizado.', message: 'Cadastro realizado.' };
}

async function entrar(dados) {
  let login = dados.login;
  let senha = dados.senha;
  let loginLimpo = normalizarLogin(login);
  let senhaLimpa = '';
  if (typeof senha === 'string') {
    senhaLimpa = senha;
  }
  if (loginLimpo === '' || senhaLimpa === '') {
    throw Object.assign(new Error('Informe login e senha.'), { status: 400 });
  }
  let usuario = await Usuario.findOne({ login: loginLimpo });
  let valido = false;
  if (usuario) {
    let compara = await bcrypt.compare(senhaLimpa, usuario.senhaHash);
    if (compara) {
      valido = true;
    }
  }
  if (valido === false) {
    throw Object.assign(new Error('Login ou senha incorretos.'), { status: 401 });
  }
  let perfilToken = usuario.perfil;
  if (perfilToken === null || perfilToken === undefined) {
    perfilToken = usuario.role;
  }
  if (perfilToken === null || perfilToken === undefined) {
    perfilToken = 'usuario';
  }
  let token = jwt.sign({ sub: usuario.id, perfil: perfilToken, role: perfilToken }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token: token, usuario: respostaUsuario(usuario), user: respostaUsuario(usuario) };
}

function normalizeLogin(valor) {
  return normalizarLogin(valor);
}

function normalizeCpf(valor) {
  return normalizarCpf(valor);
}

function isValidCpf(valor) {
  return cpfValido(valor);
}

function userResponse(usuario) {
  return respostaUsuario(usuario);
}

module.exports = { registrar, login, entrar, respostaUsuario, userResponse, normalizarLogin, normalizarCpf, cpfValido, normalizeLogin, normalizeCpf, isValidCpf };
