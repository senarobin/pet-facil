import React, { useState, useContext } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { ContextoAutenticacao } from '../contexto/autenticacao';
import { CampoEntrada } from '../componentes/campoEntrada';
import { Botao } from '../componentes/botao';
import { estilos } from '../estilos/estilos';

export function Login({ navigation: navegacao }) {
  const contexto = useContext(ContextoAutenticacao);
  const entrar = contexto.entrar;
  const loginComRosto = contexto.loginComRosto;
  const [entradaLogin, setEntradaLogin] = useState('');
  const [entradaSenha, setEntradaSenha] = useState('');
  const [carregandoRosto, setCarregandoRosto] = useState(false);

  function obterTextoBotaoRosto() {
    if (carregandoRosto) {
      return 'Verificando rosto...';
    }
    return 'Entrar com Reconhecimento Facial';
  }

  async function aoEntrar() {
    let loginLimpo = entradaLogin;
    if (loginLimpo && loginLimpo.trim) {
      loginLimpo = loginLimpo.trim();
    }
    if (loginLimpo === '' || entradaSenha === '' || entradaSenha === null || entradaSenha === undefined) {
      Alert.alert('Campos obrigatórios', 'Preencha login e senha.');
      return;
    }
    let vazioLogin = false;
    if (entradaLogin === null || entradaLogin === undefined) {
      vazioLogin = true;
    } else {
      if (entradaLogin.trim() === '') vazioLogin = true;
    }
    if (vazioLogin) {
      Alert.alert('Campos obrigatórios', 'Preencha login e senha.');
      return;
    }
    const resultado = await entrar(entradaLogin, entradaSenha);
    if (resultado.sucesso === false) {
      let mensagem = resultado.mensagem;
      if (mensagem === null || mensagem === undefined) {
   
      }
      Alert.alert('Falha na Autenticação', mensagem);
    }
  }

  async function aoEntrarComRosto() {
    let loginTrim = '';
    if (entradaLogin && entradaLogin.trim) loginTrim = entradaLogin.trim();
    if (loginTrim === '') {
      Alert.alert('Informe o e-mail', 'Digite seu e-mail para login facial.');
      return;
    }
    setCarregandoRosto(true);
    try {
      const descritorFake = [];
      for (let i = 0; i < 128; i++) {
        let codigo = 0;
        if (entradaLogin.length > 0) codigo = entradaLogin.charCodeAt(i % entradaLogin.length);
        descritorFake.push(Math.sin(codigo * (i + 1)) * 0.5);
      }
      const res = await loginComRosto(descritorFake, entradaLogin);
      if (res.sucesso === false) {
        let msg = res.mensagem;
 
        Alert.alert('Reconhecimento Facial', msg + '\n\nDica: cadastre seu rosto no Perfil apos login com senha.');
      }
 
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
    setCarregandoRosto(false);
  }

  function irParaCadastro() {
    navegacao.navigate('Register');
  }

  return (
    <ScrollView contentContainerStyle={estilos.loginContainer}>
      <View style={estilos.loginCabecalho}>
        <View style={estilos.loginCirculoLogo}>
          <Text style={estilos.loginTextoLogo}>🐶</Text>
        </View>
        <Text style={estilos.loginTitulo}>PetFácil</Text>
      </View>

      <View style={estilos.loginCartao}>
        <CampoEntrada
          rotulo="Login (E-mail)"
          placeholder="Gmail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={entradaLogin}
          onChangeText={setEntradaLogin}
        />
        <CampoEntrada
          rotulo="Senha"
          placeholder="******"
          secureTextEntry
          value={entradaSenha}
          onChangeText={setEntradaSenha}
        />

        <Botao titulo="Entrar" aoPressionar={aoEntrar} />
        <Botao titulo={obterTextoBotaoRosto()} variante="secundaria" aoPressionar={aoEntrarComRosto} />

        <Botao
          titulo="Registre-se"
          variante="secundaria"
          aoPressionar={irParaCadastro}
        />
        <Text style={estilos.loginDica}>Facial Parte 1: cadastre o rosto no Perfil após login com senha.</Text>
      </View>
    </ScrollView>
  );
}
 
export default Login;

