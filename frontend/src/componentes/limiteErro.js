import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { estilos } from '../estilos/estilos';

export class LimiteErro extends React.Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro: erro };
  }

  componentDidCatch(erro, infoErro) {
    console.error('Erro ao renderizar a aplicação:', erro, infoErro);
  }

  aoRecarregar = function() {
    this.setState({ erro: null });
  };

  render() {
    if (this.state.erro === null) {
      return this.props.children;
    }

    let mensagem = '';
    if (this.state.erro && this.state.erro.message) {
      mensagem = this.state.erro.message;
    }

    return (
      <View style={estilos.erroContainer}>
        <Text style={estilos.erroTitulo}>Não foi possível carregar esta tela</Text>
        <Text style={estilos.erroMensagem}>
          Ocorreu um erro ao abrir o conteúdo. Tente recarregar a tela.
        </Text>
        <Text selectable style={estilos.erroDetalhes}>
          {mensagem}
        </Text>
        <TouchableOpacity style={estilos.erroBotao} onPress={this.aoRecarregar}>
          <Text style={estilos.erroBotaoTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
export default LimiteErro;
