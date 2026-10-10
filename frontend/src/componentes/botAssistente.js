import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { estilos } from '../estilos/estilos';

export function BotAssistente({ aoPressionar }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={estilos.botaoFlutuante} onPress={aoPressionar}>
      <Text style={estilos.botaoFlutuanteTexto}>IA</Text>
    </TouchableOpacity>
  );
}
export default BotAssistente;