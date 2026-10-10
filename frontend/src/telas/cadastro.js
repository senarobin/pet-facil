import React, { useState, useContext } from 'react';
import { View, Text, Alert, Modal, ScrollView } from 'react-native';
import { ContextoAutenticacao } from '../contexto/autenticacao';
import { CampoEntrada } from '../componentes/campoEntrada';
import { Botao } from '../componentes/botao';
import { validarCpf } from '../utilitarios/validadorCpf';
import { mascararCpf } from '../utilitarios/formatadores';
import { estilos } from '../estilos/estilos';

export function Registro({ navigation: navegacao }) {
  const ctxAuth = useContext(ContextoAutenticacao);
  let funcCadastrar = ctxAuth.cadastrar;

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [login, setLogin] = useState('');
  const [cpfValor, setCpfValor] = useState('');
  const [senha, setSenha] = useState('');
  const [repetirSenha, setRepetirSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [retorno, setRetorno] = useState(null);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  function ehNomeValido() {
    let n = nomeCompleto.trim();
    if (n.length >= 2) return true;
    return false;
  }
  function ehEmailValido() {
    if (/\S+@\S+\.\S+/.test(login.trim())) return true;
    return false;
  }
  let nomeOk = ehNomeValido();
  let emailOk = ehEmailValido();
  let cpfOk = validarCpf(cpfValor);
  let senhaOk = false;
  if (senha.length >= 6) senhaOk = true;
  let repetirOk = false;
  if (repetirSenha.length > 0 && repetirSenha === senha) repetirOk = true;
  let formOk = false;
  if (nomeOk && emailOk && cpfOk && senhaOk && repetirOk) formOk = true;

  function obterErroNome() {
    if (nomeCompleto.length > 0 && nomeOk === false) return 'Mínimo de 2 caracteres obrigatório';
    return null;
  }
  function obterErroEmail() {
    if (login.length > 0 && emailOk === false) return 'Formato de e-mail inválido';
    return null;
  }
  function obterErroCpf() {
    if (cpfValor.length > 0 && cpfOk === false) return 'CPF inválido (dígitos verificadores)';
    return null;
  }
  function obterErroSenha() {
    if (senha.length > 0 && senhaOk === false) return 'A senha deve ter pelo menos 6 caracteres';
    return null;
  }
  function obterErroRepetir() {
    if (repetirSenha.length > 0 && repetirOk === false) return 'As senhas não conferem';
    return null;
  }
  function obterTituloBotao() {
    if (enviando) return 'Criando conta...';
    return 'Cadastrar';
  }
  function obterTipoRetorno() {
    if (retorno === null) return null;
 
    if (retorno.tipo === 'sucesso') return estilos.cadastroFeedbackSucesso;
    return estilos.cadastroFeedbackErro;
  }
  function obterMensagemRetorno() {
    if (retorno === null) return '';
 
    if (retorno.mensagem) return retorno.mensagem;
    return '';
  }
  function renderRetorno() {
    if (retorno === null) return null;
    return (
      <View style={[estilos.cadastroFeedback, obterTipoRetorno()]}>
        <Text style={estilos.cadastroFeedbackTexto}>{obterMensagemRetorno()}</Text>
      </View>
    );
  }

  async function aoCadastrar() {
    if (formOk === false) {
      setRetorno({ type: 'error', message: 'Revise os campos destacados antes de criar sua conta.' });
      return;
    }
    if (enviando) return;
    setEnviando(true);
    setRetorno(null);
    try {
      let cpfLimpo = cpfValor.trim();
      let nomeLimpo = nomeCompleto.trim();
      let loginLimpo = login.trim();
      const res = await funcCadastrar({ cpf: cpfLimpo, nomeCompleto: nomeLimpo, login: loginLimpo, senha: senha });
      let sucesso = false;
      if (res.sucesso === true) sucesso = true;
      if (sucesso) {
        setRetorno({ tipo: 'sucesso', mensagem: 'Cadastro realizado com sucesso!' });
        setMostrarSucesso(true);
      } else {
        let msg = '';
        if (res.mensagem) msg = res.mensagem;
        if (msg === null || msg === undefined) msg = 'Não foi possível criar a conta. Tente novamente.';
        setRetorno({ tipo: 'erro', mensagem: msg });
        Alert.alert('Não foi possível criar a conta', msg);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <ScrollView contentContainerStyle={estilos.cadastroContainer}>
      <Text style={estilos.cadastroTitulo}>Criar Conta</Text>
      {renderRetorno()}

      <CampoEntrada
        rotulo="Nome Completo"
        placeholder="Seu nome"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
        erro={obterErroNome()}
      />

      <CampoEntrada
        rotulo="E-mail (Login)"
        placeholder="nome@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={login}
        onChangeText={setLogin}
        erro={obterErroEmail()}
      />

      <CampoEntrada
        rotulo="CPF"
        placeholder="000.000.000-00"
        keyboardType="numeric"
        value={cpfValor}
        onChangeText={function(txt){ setCpfValor(mascararCpf(txt)); }}
        erro={obterErroCpf()}
      />

      <CampoEntrada
        rotulo="Senha"
        placeholder="Digite sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        erro={obterErroSenha()}
      />

      <CampoEntrada
        rotulo="Confirmar Senha"
        placeholder="Confirme sua senha"
        secureTextEntry
        value={repetirSenha}
        onChangeText={setRepetirSenha}
        erro={obterErroRepetir()}
      />

      <Botao
        titulo={obterTituloBotao()}
        desabilitado={enviando}
        aoPressionar={aoCadastrar}
        estilo={estilos.cadastroBotaoEspaco}
      />
      </ScrollView>
      <Modal visible={mostrarSucesso} transparent animationType="fade">
        <View style={estilos.cadastroSobreposicaoModal}>
          <View style={estilos.cadastroModalSucesso}>
            <Text style={estilos.cadastroIconeSucesso}>✓</Text>
            <Text style={estilos.cadastroTituloSucesso}>Conta criada!</Text>
            <Text style={estilos.cadastroMensagemSucesso}>
              Seu cadastro foi realizado com sucesso. Agora faça login para continuar.
            </Text>
            <Botao
              titulo="Ir para o login"
              aoPressionar={function aoIrLogin(){ setMostrarSucesso(false); navegacao.navigate('Login'); }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
// Alias brasileiro principal
export const Cadastro = Registro;
export default Registro;

