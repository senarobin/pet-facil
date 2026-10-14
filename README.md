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
## Frontend
```bash
cd frontend
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL_* se usar device fisico
npm install
npm start
```
