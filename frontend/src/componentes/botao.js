import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { estilos } from '../estilos/estilos';

export function Botao({ titulo, aoPressionar, desabilitado, variante = 'primaria', estilo }) {
  let texto = titulo;
  if (texto === undefined || texto === null) {
    texto = '';
  }

  let acao = aoPressionar;

  let estaDesabilitado = desabilitado;
  if (estaDesabilitado === undefined || estaDesabilitado === null) {
    estaDesabilitado = false;
  }

  let vari = variante;

  let estiloExtra = estilo;

  let varianteNorm = vari;
  if (varianteNorm === 'secondary') {
    varianteNorm = 'secundaria';
  } else if (varianteNorm === 'primary') {
    varianteNorm = 'primaria';
  }

  function obterEstiloVariante() {
    if (varianteNorm === 'primaria') {
      return estilos.botaoPrimario;
    }
    return estilos.botaoSecundario;
  }

  function obterEstiloDesabilitado() {
    if (estaDesabilitado) {
      return estilos.botaoDesabilitado;
    }
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={acao}
      disabled={estaDesabilitado}
      style={[
        estilos.botao,
        obterEstiloVariante(),
        obterEstiloDesabilitado(),
        estiloExtra,
      ]}
    >
      <Text style={estilos.botaoTexto}>{texto}</Text>
    </TouchableOpacity>
  );
}

export default Botao;

