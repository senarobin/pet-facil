import React,{createContext,useState} from 'react'
import {api} from '../services/api'

export const AuthContext = createContext()
export const ContextoAutenticacao = AuthContext

export function ProvedorAutenticacao({children}) {

  const [usuarioAtual,setUsuarioAtual] = useState(null)

  async function cadastrar({cpf,nomeCompleto,login,senha}) {

    try {

      let cpfLimpo = cpf

      if(cpfLimpo) {
        if(cpfLimpo.trim) {
          cpfLimpo = cpfLimpo.trim()
        }
      }

      let nomeLimpo = nomeCompleto

      if(nomeLimpo) {
        if(nomeLimpo.trim) {
          nomeLimpo = nomeLimpo.trim()
        }
      }

      let loginLimpo = login

      if(loginLimpo) {
        if(loginLimpo.trim) {
          loginLimpo = loginLimpo.trim().toLowerCase()
        }
      }

      await api.cadastro({cpf: cpfLimpo,nomeCompleto: nomeLimpo,login: loginLimpo,senha: senha})
      return {sucesso: true}
    }
    catch(erro) {
      return {sucesso: false,mensagem: erro.message}
    }
  }

  async function entrar(loginInformado,senhaInformada) {

    try {

      let loginLimpo = loginInformado

      if(loginLimpo) {
        if(loginLimpo.trim) {
          loginLimpo = loginLimpo.trim().toLowerCase()
        }
      }

      const resultado = await api.login({login: loginLimpo,senha: senhaInformada})
      
      let usuarioResp = resultado.usuario

      if(usuarioResp === undefined){
        usuarioResp = resultado.user
      }
      
      const tokenResp = resultado.token

      if(usuarioResp === null){
        throw new Error('Resposta de login inválida da api')
      }

      if(usuarioResp === undefined) {
        throw new Error('Resposta de login inválida da api')
      }

      if(tokenResp === null) {
        throw new Error('Resposta de login inválida da api')
      }

      if(tokenResp === undefined) {
        throw new Error('Resposta de login inválida da api')
      }

      setUsuarioAtual({...usuarioResp,token: tokenResp})

      return {sucesso: true}
    }
    catch(erro) {
      return {
        sucesso: false,
        mensagem: erro.message
      }
    }
  }

  function sair() {
    setUsuarioAtual(null)
  }

  return (
    <AuthContext.Provider value={{usuarioAtual: usuarioAtual,cadastrar: cadastrar,entrar: entrar,sair: sair}}>{children}</AuthContext.Provider>
  )
}
