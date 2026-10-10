import React from 'react';
import { View, Text} from 'react-native';
import { ContextoCarrinho } from '../contexto/contextoCarrinho';
import { useContext } from 'react';
import { Botao } from '../componentes/botao';
import { formatarReais } from '../utilitarios/formatadores';
import { estilos } from '../estilos/estilos';

export function Sucesso({ navigation: navegacao, route }) {
  const ctxCarrinho = useContext(ContextoCarrinho);
  let ultimoPedido = ctxCarrinho.ultimoPedido;
  let codigoRetirada = null;
  if (route.params && route.params.codigoRetirada) codigoRetirada = route.params.codigoRetirada;
  if (codigoRetirada === null && ultimoPedido && ultimoPedido.codigoRetirada) codigoRetirada = ultimoPedido.codigoRetirada;
  let total = null;
  if (route.params && route.params.total !== null && route.params.total !== undefined) total = route.params.total;
  else if (ultimoPedido && ultimoPedido.total !== null && ultimoPedido.total !== undefined) total = ultimoPedido.total;
  function obterCodigo() {
    if (codigoRetirada) return codigoRetirada;
    return 'Código indisponível';
  }
  function renderizarTotal() {
    if (total === null || total === undefined) return null;
    return <Text style={estilos.sucessoTotal}>Total: {formatarReais(total)}</Text>;
  }
  function aoVoltar() {
    navegacao.navigate('ProductList');
  }
  return (
    <View style={estilos.sucessoContainer}>
      <Text style={estilos.sucessoRotulo}>PEDIDO CONFIRMADO</Text>
      <Text style={estilos.sucessoIcone}>✓</Text>
      <Text style={estilos.sucessoTitulo}>Tudo certo por aqui!</Text>

      <Text style={estilos.sucessoDescricao}>
        Apresente este código no caixa físico para pagar e retirar seu pedido.
      </Text>

      <View style={estilos.sucessoCaixaInfo}>
        <Text style={estilos.sucessoTituloInfo}>CÓDIGO DE RETIRADA</Text>
        <Text style={estilos.sucessoCodigo}>{obterCodigo()}</Text>
        {renderizarTotal()}
      </View>

      <Botao
        titulo="Voltar aos Produtos"
        aoPressionar={aoVoltar}
        estilo={estilos.sucessoBotaoEspaco}
      />
    </View>
  );
}
 
export default Sucesso;
