import React,{useContext} from 'react';
import {TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ContextoAutenticacao} from '../contexts/autenticacao';
import {Login} from '../screens/login';
import {Registro} from '../screens/cadastro';
import {ListaProdutos} from '../screens/listaProdutos';
import {DetalhesProduto} from '../screens/detalhesProduto';
import {Carrinho} from '../screens/carrinhoTela';
import {Sucesso} from '../screens/sucessoPedido';
import {ChatAssistente} from '../screens/chatAssistente';
import {Perfil} from '../screens/perfil';
import {estilos} from '../styles/estilos';

const Stack = createNativeStackNavigator();

export function NavegadorApp() {

  const contextoAuth = useContext(ContextoAutenticacao);
  let usuarioAtual = contextoAuth.usuarioAtual;

  function obterBotaoVoltar(navigation, route) {
    let mostrar = false;
    
    if (usuarioAtual) {

      if (route.name !== 'ProductList') {

        if (route.name !== 'OrderSuccess') {
          mostrar = true;
        }
      }
    }

    if (mostrar) {
      return function renderBotaoVoltar() {
        return (

          <TouchableOpacity
            onPress={function voltar() {
               navigation.navigate('ProductList');
              }}
            accessibilityLabel="Ir para a loja"
            style={estilos.headerBotaoVoltar}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
        );
      };
    }
    return undefined;
  }

  return (
    <Stack.Navigator
      screenOptions={function(opcoes) {
        const navigation = opcoes.navigation;
        const route = opcoes.route;
        return {
          headerStyle: {
            backgroundColor: '#143D36'
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '800'
          },
          headerLeft: obterBotaoVoltar(navigation, route),
        };
      }}
    >
      {function renderizarGrupoNaoAutenticado() {

        if (usuarioAtual) {
          return null;
        }
        return (
          <>
            <Stack.Screen name="Login" component={Login}options={{ headerShown: false }}/>
            <Stack.Screen name="Register" component={Registro}options={{ title: 'Cadastro' }}/>
          </>
        );
      }()}

      {function renderizarGrupoAutenticado() {

        if (usuarioAtual === null || usuarioAtual === undefined) {
          return null;
        }
        return (
          <>
            <Stack.Screen name="ProductList" component={ListaProdutos}options={{ headerShown: false }}/>
            <Stack.Screen name="ProductDetail" component={DetalhesProduto} options={{ title: 'Detalhes do produto' }}/>
            <Stack.Screen name="Cart" component={Carrinho}options={{ title: 'Seu carrinho' }}/>
            <Stack.Screen name="OrderSuccess"component={Sucesso} options={{ headerShown: false }}/>
            <Stack.Screen name="AIChat"component={ChatAssistente} options={{ title: 'Assistente PetFácil' }}/>
            <Stack.Screen name="Profile" component={Perfil} options={{ title: 'Meu perfil' }}/>
          </>
        );
      }()}
    </Stack.Navigator>
  );
}

 
export default NavegadorApp;
