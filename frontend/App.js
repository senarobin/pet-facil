import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ProvedorAutenticacao } from './src/contexts/autenticacao';
import { ProvedorCarrinho } from './src/contexts/contextoCarrinho';
import { NavegadorApp } from './src/routes/index';
import { LimiteErro } from './src/components/limiteErro';

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
