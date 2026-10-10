import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { estilos } from '../estilos/estilos';

export function CampoEntrada({ rotulo, erro, ...props }) {
  let textoRotulo = rotulo;

  let mensagemErro = erro;

  function obterEstiloErro() {
    if (mensagemErro) {
      return estilos.campoEntradaErro;
    }
    return null;
  }

  function renderizarRotulo() {
    if (textoRotulo) {
      return <Text style={estilos.campoRotulo}>{textoRotulo}</Text>;
    }
    return null;
  }

  function renderizarErro() {
    if (mensagemErro) {
      return <Text style={estilos.campoTextoErro}>{mensagemErro}</Text>;
    }
    return null;
  }

  return (
    <View style={estilos.campoContainer}>
      {renderizarRotulo()}
      <TextInput
        style={[estilos.campoEntrada, obterEstiloErro()]}
        placeholderTextColor="#999"
        {...props}
      />
      {renderizarErro()}
    </View>
  );
}
export default CampoEntrada;

