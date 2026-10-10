# PetFacil

Monorepo com backend (Express + MongoDB) e frontend (Expo/React Native) separados.

## Estrutura
```
pet_shop/
  backend/   # API Node.js (Express, Mongoose) - porta 3000
  frontend/  # App Expo - telas em src/telas, componentes em src/componentes
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
Chat IA usa contexto direto do MongoDB (sem RAG vetorial, sem WebSocket): busca produtos + pedidos do usuario, monta Long Context e gera resposta.

## Frontend
```bash
cd frontend
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL_* se usar device fisico
npm install
npm start
```
O chat consome apenas REST (POST /api/chat) - sem socket.io.

## Migracao realizada
- Removido WebSocket (server/src/websocket.js e frontend/src/servicos/socket.js, socket.io deps)
- Pastas separadas backend/ e frontend/ (antes tudo em pet_shop/pet_shop)
- IA continua com contexto real do banco via Mongoose (chatService)
