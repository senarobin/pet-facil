import React from 'react'
import {TouchableOpacity} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import {estilos} from '../styles/estilos'

export function BotAssistente({pressionar}) {
  return(<TouchableOpacity activeOpacity={0.85} style={estilos.botaoFlutuante} onPress={pressionar} accessibilityLabel="Abrir assistente de IA"><Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" style={estilos.botaoFlutuanteIcone}/></TouchableOpacity>)
}

export default BotAssistente