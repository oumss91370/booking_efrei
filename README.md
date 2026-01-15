# EasyBooking

Application web minimale de réservation de salles (API Node.js + Supabase).

## Prérequis
- Node.js 18+
- Compte Supabase (URL et anon key)

## Installation
```bash
npm install
```

## Configuration
Créez un fichier `.env` à la racine (ou utilisez `.env.example`):
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

## Schéma base de données
Le fichier `db/schema.sql` contient les tables `users`, `rooms`, `bookings`.
- Importez ce SQL dans Supabase (SQL Editor) avant de démarrer.

## Démarrer l’API
```bash
npm run dev
# ou
npm start
```
Endpoint de santé:
```
GET http://localhost:3000/health
```

## Endpoints principaux
- Authentification: `POST /api/auth/register`, `POST /api/auth/login`
- Rooms: `GET /api/rooms`, `GET /api/rooms/available?start_time=ISO&end_time=ISO`, `POST /api/rooms` (auth)
- Bookings: `POST /api/bookings` (auth), `GET /api/bookings/mine` (auth), `DELETE /api/bookings/:id` (auth)

## Tests
```bash
npm test
```

## Supabase (Notes)
- RLS désactivée dans `db/schema.sql` pour simplifier le dev API. En production, activer RLS et utiliser la service role key côté backend.

## Seed (optionnel)
Créer des salles via `POST /api/rooms` avec un token utilisateur ou insérer via Supabase GUI.

## Sécurité
- MDP hashés (bcrypt)
- JWT (24h). Stockage côté client à votre charge (non inclus ici).

