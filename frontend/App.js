import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ProvedorAutenticacao } from './src/contexto/autenticacao';
import { ProvedorCarrinho } from './src/contexto/contextoCarrinho';
import { NavegadorApp } from './src/rotas/index';
import { LimiteErro } from './src/componentes/limiteErro';

export default function App() {
  return (
    <LimiteErro>
      <ProvedorAutenticacao>
        <ProvedorCarrinho>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#143D36" />
            <NavegadorApp />
          </NavigationContainer>
        </ProvedorCarrinho>
      </ProvedorAutenticacao>
    </LimiteErro>
  );
}
