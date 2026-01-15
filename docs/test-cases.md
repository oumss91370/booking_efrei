# Fiche de tests (cas et résultats)

## Auth (intégration) – 3 cas
- Inscription puis connexion avec succès → PASS
- Refus email dupliqué → PASS
- Refus login invalide → PASS

## Rooms (intégration) – 4 cas
- Liste des salles → PASS
- Filtre disponibilité par fenêtre temporelle → PASS
- Création de salle sans auth refusée → PASS
- Création de salle avec auth acceptée → PASS

## Bookings (intégration) – 2 cas
- Création, liste, annulation; refus chevauchement → PASS
- Refus sans auth (create/list/cancel) → PASS

## Health (sanity) – 1 cas
- GET /health renvoie OK → PASS

## À compléter pour atteindre 10 cas par type
- Unitaires: validations d’input, format dates, utilitaires JWT, hachage.
- Intégration: cas d’erreurs supplémentaires (formats invalides, dates inversées, capacité négative, etc.).
- Performance: mesurer temps de réponse p95/p99 sur /rooms, /rooms/available, /bookings.
- Sécurité: tests d’accès sans token, token invalide/expiré, injection SQL bloquée (paramétrage), bruteforce basique.

## Captures d’exécution
- Exporter les sorties Jest (`npm test`) et ajouter des captures ici si demandé.
