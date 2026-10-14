const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

function normalizarLogin(valor) {

  if(typeof valor === 'string') {
    return valor.trim().toLowerCase()
  }

  return ''
}

function normalizarCpf(valor) {

  if (typeof valor === 'string') {
    return valor.replace(/\D/g, '')
  }

  return ''
}

function cpfValido(valor) {

  if(/^\d{11}$/.test(valor) === false ||/^(\d)\1{10}$/.test(valor)) {
    return false
  }

  let digitos = valor.split('').map(Number);
  let somaPrimeiro = 0

  for (let i=0;i<9;i++){
    somaPrimeiro = somaPrimeiro + digitos[i]*(10-i)
  }

  let digitoPrimeiro = (somaPrimeiro*10)% 11 %10

  if(digitoPrimeiro !== digitos[9]){
    return false
  }

  let somaSegundo = 0

  for(let i=0;i<10;i++){
    somaSegundo = somaSegundo + digitos[i]* (11-i)
  }

  let digitoSegundo = (somaSegundo*10) % 11%10

  if (digitoSegundo !== digitos[10]) {
    return false
  }

  return true
}

function respostaUsuario(usuario) {
  return {
    id: usuario.id,
    cpf: usuario.cpf,
    nomeCompleto: usuario.nomeCompleto,
    login: usuario.login,
    perfil: usuario.perfil
  }
}

async function registrar(dados) {

  let cpf=dados.cpf

  let nomeCompleto=dados.nomeCompleto

  let login=dados.login

  let senha=dados.senha

  let perfilInformado=dados.perfil
  
  let cpfLimpo = normalizarCpf(cpf)
  let nomeLimpo = ''

  if(typeof nomeCompleto === 'string'){
    nomeLimpo = nomeCompleto.trim()
  }

  let loginLimpo = normalizarLogin(login)
  let senhaLimpa = ''

  if(typeof senha ==='string'){
    senhaLimpa = senha
  }

  if(cpfLimpo ==='' || nomeLimpo ==='' || loginLimpo ==='' || senhaLimpa ===''){
    throw Object.assign(
      new Error('Todos os campos são obrigatórios.'),
      {
        status: 400
      }
    )
  }

  if(cpfValido(cpfLimpo) === false) {
    throw Object.assign(
      new Error('Informe um CPF válido.'),{
        status: 400
      }
    )
  }

  let emailValido =/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginLimpo)

  if(emailValido === false){
    throw Object.assign(
      new Error('Informe um e-mail válido.'

      ),{
        status: 400
      }
    )
  }

  if(senhaLimpa.length < 8) {
    throw Object.assign(
      new Error('A senha deve ter pelo menos 8 caracteres.'),{
      status: 400
    }
  )
  }

  let usuariosCpf = await Usuario.find({}).select('cpf').lean()
  let loginExiste= await Usuario.exists({login:loginLimpo})

  let cpfExiste = false

  for(let i=0;i<usuariosCpf.length;i++){
    let cpfAtual = normalizarCpf(usuariosCpf[i].cpf)
    if(cpfAtual === cpfLimpo){
      cpfExiste = true
    }
  }

  if(cpfExiste || loginExiste){
    let mensagem = ''

    if(cpfExiste && loginExiste){
      mensagem = 'cpf e email já cadastrados'
    }
    else{

      if(cpfExiste) {
        mensagem = 'Este cpf já está cadastrado'
      }
      else {
        mensagem = 'Este email já está cadastrado'
      }
    }

    throw Object.assign(
      new Error(mensagem),{
        status: 409
      }
    )
  }

  let senhaHash = await bcrypt.hash(senhaLimpa,12)

  let perfilFinal = 'usuario'
  // Registro público nunca pode criar admin — apenas via seed/admin direto no banco

  try {

    let dadosCriar =
    {
      cpf: cpfLimpo,
      nomeCompleto: nomeLimpo,
      login: loginLimpo,
      senhaHash: senhaHash,
      perfil: perfilFinal
    }

    await Usuario.create(dadosCriar)

  }
  catch(erro) {

    if(erro.code === 11000) {

      let campo = ''

      if(erro.keyPattern) {

        let chaves = Object.keys(erro.keyPattern)

        if(chaves.length > 0) {
          campo = chaves[0]
        }
      }

      let mensagem = 'email já cadastrado.'

      if(campo === 'cpf') {
        mensagem = 'cpf já cadastrado.'
      }

      throw Object.assign(new Error(mensagem),{
        status: 409
      }
    )
    }

    throw erro
  }

  return {mensagem: 'Cadastro realizado'}
}

async function entrar(dados) {

  let login = dados.login
  let senha = dados.senha

  let loginLimpo = normalizarLogin(login)
  let senhaLimpa = ''

  if(typeof senha === 'string') {
    senhaLimpa = senha
  }

  if(loginLimpo === ''|| senhaLimpa === ''){

    throw Object.assign(
      new Error('Informe login e senha.'),
      {
        status: 400
      }
    );
  }

  let usuario = await Usuario.findOne({login:loginLimpo})
  let valido = false

  if(usuario) {

    let compara = await bcrypt.compare(senhaLimpa,usuario.senhaHash)

    if(compara){
      valido = true
    }
  }

  if(valido ===false) {
    throw Object.assign(
      new Error('Login ou senha incorretos.'),
      {
        status: 401
      }
    )
  }

  let token = jwt.sign({sub: usuario.id,perfil: usuario.perfil},process.env.JWT_SECRET,{expiresIn: '7d'})

  return {token: token,usuario: respostaUsuario(usuario)}
}

module.exports = {registrar,entrar,respostaUsuario,normalizarLogin,normalizarCpf,cpfValido}
