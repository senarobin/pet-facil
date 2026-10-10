import React, { createContext, useState } from 'react';
import { api } from '../servicos/api';

export const AuthContext = createContext();
export const ContextoAutenticacao = AuthContext;

export function ProvedorAutenticacao({ children: filhos }) {
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  async function cadastrar({ cpf, nomeCompleto, login, senha }) {
    try {
      let cpfLimpo = cpf;
      if (cpfLimpo && cpfLimpo.trim) {
        cpfLimpo = cpfLimpo.trim();
      }
      let nomeLimpo = nomeCompleto;
      if (nomeLimpo && nomeLimpo.trim) {
        nomeLimpo = nomeLimpo.trim();
      }
      let loginLimpo = login;
      if (loginLimpo && loginLimpo.trim) {
        loginLimpo = loginLimpo.trim().toLowerCase();
      }
      await api.cadastro({
        cpf: cpfLimpo,
        nomeCompleto: nomeLimpo,
        login: loginLimpo,
        senha: senha,
      });
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message };
    }
  }

  async function entrar(loginInformado, senhaInformada) {
    try {
      let loginLimpo = loginInformado;
      if (loginLimpo && loginLimpo.trim) {
        loginLimpo = loginLimpo.trim().toLowerCase();
      }
      const resultado = await api.login({ login: loginLimpo, senha: senhaInformada });
      setUsuarioAtual({ ...resultado.user, token: resultado.token });
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message };
    }
  }

  async function loginComRosto(descritor, dicaLogin) {
    try {
      const resultado = await api.loginRosto(descritor, dicaLogin);
      setUsuarioAtual({ ...resultado.user, token: resultado.token });
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message };
    }
  }

  async function cadastrarRosto(descritor) {
    try {
      if (usuarioAtual === null || usuarioAtual === undefined) {
        return { sucesso: false, mensagem: 'Faça login primeiro.' };
      }
      if (usuarioAtual.token === null || usuarioAtual.token === undefined) {
        return { sucesso: false, mensagem: 'Faça login primeiro.' };
      }
      const resposta = await api.cadastrarRosto(usuarioAtual.token, descritor);
      return { sucesso: true, mensagem: resposta.message };
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message };
    }
  }

  function sair() {
    setUsuarioAtual(null);
  }

  return (
    <AuthContext.Provider value={{ usuarioAtual: usuarioAtual, cadastrar: cadastrar, entrar: entrar, loginComRosto: loginComRosto, cadastrarRosto: cadastrarRosto, sair: sair }}>
      {filhos}
    </AuthContext.Provider>
  );
}

export const ProvedorAutenticacaoAlias = ProvedorAutenticacao;
 
