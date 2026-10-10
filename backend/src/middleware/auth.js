const jwt = require('jsonwebtoken');

function exigirAutenticacao(req, res, next) {
  let cabecalho = null;
  if (req.headers) {
    cabecalho = req.headers.authorization;
  }
  let token = null;
  if (cabecalho) {
    token = cabecalho.replace('Bearer ', '');
  }
  if (token === null || token === undefined || token === '') {
    return res.status(401).json({ mensagem: 'Token não informado.' });
  }
  try {
    let decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado;
    req.user = decodificado;
    return next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}

function exigirPerfil() {
  let perfisPermitidos = [];
  for (let i = 0; i < arguments.length; i++) {
    perfisPermitidos.push(arguments[i]);
  }
  return function(req, res, next) {
    if (req.usuario === null || req.usuario === undefined) {
      if (req.user === null || req.user === undefined) {
        return res.status(401).json({ mensagem: 'Não autenticado.' });
      }
    }
    let usuarioToken = req.usuario;
    if (usuarioToken === null || usuarioToken === undefined) {
      usuarioToken = req.user;
    }
    let perfilUsuario = 'usuario';
    if (usuarioToken.perfil) {
      perfilUsuario = usuarioToken.perfil;
    } else {
      if (usuarioToken.role) {
        if (usuarioToken.role === 'admin') {
          perfilUsuario = 'admin';
        } else {
          perfilUsuario = 'usuario';
        }
      }
    }
    let permitido = false;
    for (let i = 0; i < perfisPermitidos.length; i++) {
      if (perfisPermitidos[i] === perfilUsuario) {
        permitido = true;
      }
    }
    if (permitido === false) {
      return res.status(403).json({ mensagem: 'Acesso negado. Permissão insuficiente.' });
    }
    return next();
  };
}

function requireAuth(req, res, next) {
  return exigirAutenticacao(req, res, next);
}

function requireRole() {
  let args = [];
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  let fn = exigirPerfil.apply(null, args);
  return fn;
}

module.exports = { exigirAutenticacao, exigirPerfil, requireAuth, requireRole };