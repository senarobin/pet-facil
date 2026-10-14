import React, { useState, useContext } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextoAutenticacao } from '../contexts/autenticacao';
import { CampoEntrada } from '../components/campoEntrada';
import { Botao } from '../components/botao';
import { estilos } from '../styles/estilos';

export function Login({navigation: navegacao}) {

  const contexto = useContext(ContextoAutenticacao);
  const entrarContexto = contexto.entrar;
  const [entradaLogin, setEntradaLogin] = useState('');
  const [entradaSenha, setEntradaSenha] = useState('');

  async function entrarLocal() {

    let loginLimpo = entradaLogin;

    if (loginLimpo && loginLimpo.trim) {
      loginLimpo = loginLimpo.trim();
    }

    if (loginLimpo === '' || entradaSenha === '' || entradaSenha === null || entradaSenha === undefined) {
      Alert.alert('Campos obrigatórios', 'Preencha login e senha');
      return;
    }

    let vazioLogin = false;

    if (entradaLogin === null || entradaLogin === undefined) {
      vazioLogin = true;

    }
    else {
      if(entradaLogin.trim() === '') vazioLogin = true;
    }

    if(vazioLogin) {
      Alert.alert('Campos obrigatórios','Preencha login e senha');
      return;
    }

    const resultado = await entrarContexto(entradaLogin, entradaSenha);

    if(resultado.sucesso === false) {

      let mensagem = resultado.mensagem;
      if (mensagem === null || mensagem === undefined) {
      }

      Alert.alert('Falha na Autenticação', mensagem);
    }
  }

  function irParaCadastro() {
    navegacao.navigate('Register');
  }

  return (
    <ScrollView contentContainerStyle={estilos.loginContainer}>
      <View style={estilos.loginHeader}>
        <View style={estilos.loginCirculoLogo}><Text style={estilos.loginTextoLogo}>🐶</Text></View>
        <Text style={estilos.loginTitulo}>PetFácil</Text>
      </View>

      <View style={estilos.loginCartao}>
        <CampoEntrada label="Login" placeholder="Gmail" autoCapitalize="none" keyboardType="email-address"
          value={entradaLogin}
          onChangeText={setEntradaLogin}/>

        <CampoEntrada label="Senha" placeholder="******" secureTextEntry value={entradaSenha}
          onChangeText={setEntradaSenha}/>

        <Botao titulo="Entrar" pressionar={entrar} />

        <Botao titulo="Registre-se" variante="secundaria" pressionar={irParaCadastro}/>
      </View>
    </ScrollView>
  );
}
 
export default Login;

