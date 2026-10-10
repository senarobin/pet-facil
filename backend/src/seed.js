const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    id: 'prod-1',
    nome: 'Ração Seca Golden Fórmula Senior Frango/Arroz Cães Pequenos 3kg',
    precoAtual: 66.05,
    precoPromocional: 59.60,
    tipo: 'Ração',
    descricao: 'Alimento completo, balanceado e rico em nutrientes para cães adultos de pequeno porte.',
    dataValidade: '2027-08-15',
  },
  {
    id: 'prod-2',
    nome: 'Ração Úmida Pedigree Sachê Carne Cães Filhotes 100g',
    precoAtual: 4.50,
    precoPromocional: null,
    tipo: 'Ração',
    descricao: 'Refeição completa e saborosa, especialmente formulada para cães filhotes.',
    dataValidade: '2027-02-10',
  },
  {
    id: 'prod-3',
    nome: 'Brinquedo para Cachorro Mordedor Pneu de Borracha Resistente Off-Road',
    precoAtual: 29.90,
    precoPromocional: null,
    tipo: 'Brinquedo',
    descricao: 'Mordedor resistente que estimula a higiene bucal e oferece diversão.',
    dataValidade: '2030-12-31',
  },
  {
    id: 'prod-4',
    nome: 'Shampoo Kelldrin Matt 6 Em 1 Anti Pulgas E Carrapatos 500ml',
    precoAtual: 29.99,
    precoPromocional: null,
    tipo: 'Higiene',
    descricao: 'Shampoo condicionador com ação antipulgas e carrapaticida.',
    dataValidade: '2026-11-20',
  },
  {
    id: 'prod-5',
    nome: 'Areia Higiênica Pipicat Classic para Gatos 4Kg',
    precoAtual: 22,
    precoPromocional: null,
    tipo: 'Higiene',
    descricao: 'Areia mineral com absorção rápida e neutralização de odores.',
    dataValidade: '2028-06-30',
  },
];

mongoose.connect(process.env.MONGODB_URI)
  .then(() => Product.bulkWrite(products.map((product) => ({
    updateOne: { filter: { id: product.id }, update: { $set: product }, upsert: true },
  }))))
  .then(() => console.log(`${products.length} produtos sincronizados.`))
  .catch((error) => {
    console.error(`Falha no seed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());