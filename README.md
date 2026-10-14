# PetFacil

Monorepo com backend (Express + MongoDB) e frontend (Expo/React Native) separados.

## Estrutura
```
pet_shop/
  backend/   # API Node.js (Express, Mongoose) - porta 3000
  frontend/  # App Expo - screens em src/screens, components em src/components
```

## Backend
```bash
cd backend
cp .env.example .env   # ajuste MONGODB_URI e JWT_SECRET
npm install
npm run seed           # popula produtos
npm run dev            # ou npm start - sobe em http://localhost:3000
```
Rotas: GET /api/health, POST /api/auth/register, POST /api/auth/login, GET /api/products, POST /api/orders, POST /api/chat, GET /api/chat/history.
Chat IA (Llama 3.3 via Groq, sem RAG vetorial/sem WebSocket): busca produtos + pedidos do usuario no MongoDB, monta Long Context + historico (6 msgs) e o Llama gera a resposta. Sem GROQ_API_KEY funciona em modo fallback.

## Frontend
```bash
cd frontend
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL_* se usar device fisico
npm install
npm start
```
