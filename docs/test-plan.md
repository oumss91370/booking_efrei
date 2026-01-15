# Plan de test EasyBooking

## Objectifs
- Vérifier l’authentification (inscription, connexion, autorisation JWT).
- Vérifier la gestion des salles (liste, disponibilité, création).
- Vérifier la gestion des réservations (création, liste perso, annulation, non-chevauchement).
- Couvrir 4 types de tests: unitaires, intégration API, performance basique, sécurité basique.

## Portée
- Backend Node.js (Express) uniquement.
- Base de données Postgres (Supabase) via `DATABASE_URL`.

## Environnement
- Node 18+
- DB: Supabase Postgres (SSL require)
- Variables: `.env` (PORT, DATABASE_URL, JWT_SECRET)

## Outils
- Jest, Supertest

## Stratégie
- Tests unitaires: fonctions pures et validations (à compléter).
- Tests d’intégration API: endpoints réels avec DB de test (déjà implémentés, à étoffer).
- Tests de performance basiques: temps de réponse p99/ moyenne sur endpoints clés.
- Tests de sécurité basiques: cas d’autorisation / validation / injection simple.

## Critères d’acceptation
- Tous les tests passent.
- Minimum 10 cas par type de test sélectionné.
- Couverture > 80% sur les modules critiques.

## Données de test
- Utilisateurs éphémères par test (emails aléatoires)
- Salles de test injectées via seed ou création dans les tests

## Risques
- Collisions de données entre tests → création de ressources dédiées par test
- Dépendance réseau Supabase

## Planning
- J0: scaffolding + intégration OK
- J1: compléter unitaires et sécurité
- J2: performance basique + rapport qualité
