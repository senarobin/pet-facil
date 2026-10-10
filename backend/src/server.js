const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const {conectarBanco} = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: 'Erro interno do servidor.' });
});

const port = process.env.PORT || 3000;
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não foi definida em backend/.env.');
}

conectarBanco()
  .then(() => app.listen(port, () => console.log(`API disponivel na porta ${port}`)))
  .catch((error) => {
    console.error(`Falha ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  });
