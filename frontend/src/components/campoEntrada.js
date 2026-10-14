import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { estilos } from '../styles/estilos'

export function CampoEntrada({label,rotulo,erro,...props }) {

  let textoLabel = label || rotulo
  let mensagemErro = erro

  function obterEstiloErro() {

    if(mensagemErro) {
      return estilos.campoEntradaErro
    }

    return null
  }

  function renderizarLabel() {
    if(textoLabel) {
      return <Text style={estilos.campoLabel}>{textoLabel}</Text>
    }

    return null
  }

  function renderizarErro() {
    if (mensagemErro) {
      return <Text style={estilos.campoTextoErro}>{mensagemErro}</Text>
    }
    return null
  }

  return (
    <View style={estilos.campoContainer}>
      {renderizarLabel()}
      <TextInput style={[estilos.campoEntrada,obterEstiloErro()]}placeholderTextColor="#999"{...props}/>
      {renderizarErro()}
    </View>
  )
}
export default CampoEntrada

