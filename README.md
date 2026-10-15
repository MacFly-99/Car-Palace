════════════════════════════════════════════════════════════════════
🚗 CAR PALACE
════════════════════════════════════════════════════════════════════

Plateforme d'achat et de revente de pièces détachées automobiles
entre particuliers.

🎓 Projet de fin de formation DWWM (Titre Professionnel Développeur
   Web et Web Mobile) — Session 2026.


────────────────────────────────────────────────────────────────────
📋 SOMMAIRE
────────────────────────────────────────────────────────────────────

1. 🎯 Présentation
2. ✨ Fonctionnalités
3. 🛠️ Stack technique
4. 🏗️ Architecture
5. 🚀 Installation locale
6. 🌐 Déploiement
7. 🧪 Tests
8. 🔒 Sécurité
9. 📁 Structure du projet
10. 👤 Auteur


════════════════════════════════════════════════════════════════════
🎯 1. PRÉSENTATION
════════════════════════════════════════════════════════════════════

Car Palace est une plateforme web permettant l'achat et la revente
de pièces détachées automobiles entre particuliers.

Elle a été développée dans le cadre du Titre Professionnel
Développeur Web et Web Mobile (DWWM) avec pour objectifs :

  ✅ Mettre en œuvre une architecture full-stack découplée
     (API REST + SPA).

  ✅ Démontrer la maîtrise conjointe de bases de données
     SQL et NoSQL.

  ✅ Assurer une sécurité de niveau production (JWT, rate
     limiting, security headers, SSL).


════════════════════════════════════════════════════════════════════
✨ 2. FONCTIONNALITÉS
════════════════════════════════════════════════════════════════════

👤 Visiteur (non authentifié)
─────────────────────────────
  • Consulter le catalogue de pièces
  • Rechercher une pièce par mots-clés
  • Filtrer par marque, catégorie, état et prix
  • Consulter la fiche détaillée d'une pièce et ses avis

👥 Utilisateur connecté (ROLE_USER)
───────────────────────────────────
  • Toutes les fonctionnalités du visiteur
  • Publier, modifier et supprimer ses annonces
  • Contacter un vendeur via une messagerie interne
  • Laisser un avis (note 5 étoiles + titre + description)
  • Suivre l'état de ses commandes

🛡️ Administrateur (ROLE_ADMIN)
──────────────────────────────
  • Accéder à un tableau de bord avec statistiques
    (CA, utilisateurs, pièces, avis)
  • Gérer les utilisateurs (changement de rôle, suppression)
  • Modérer les pièces, commandes et avis
  • Consulter le détail du chiffre d'affaires par statut


════════════════════════════════════════════════════════════════════
🛠️ 3. STACK TECHNIQUE
════════════════════════════════════════════════════════════════════

⚙️ Backend
──────────
  • PHP 8.2
  • Symfony 7.4
  • API Platform 4.x
  • Doctrine ORM 3.x (MySQL)
  • Doctrine ODM 2.x (MongoDB)
  • Lexik JWT 3.x
  • Nelmio CORS 2.x
  • MySQL 8.4 (Aiven)
  • MongoDB Atlas (Cloud)

🎨 Frontend
───────────
  • React 18
  • Vite 5.x
  • React Router 6.x
  • Axios 1.x
  • Tailwind CSS 4.x

🧰 Outils
─────────
  • Git + GitHub (versioning)
  • Docker (conteneurisation backend)
  • Postman (tests API)
  • PHPUnit (tests unitaires)
  • MongoDB Compass (exploration NoSQL)
  • Figma (maquettes)


════════════════════════════════════════════════════════════════════
🏗️ 4. ARCHITECTURE
════════════════════════════════════════════════════════════════════

          👤 UTILISATEUR (Navigateur Web)
                      │
                      │ HTTPS
                      ▼
          ⚡ VERCEL — Frontend React
                      │
                      │ API REST (HTTPS + JWT)
                      ▼
          🐘 RENDER — Backend Symfony (Docker)
                      │
                ┌─────┴─────┐
                ▼           ▼
         🗄️ MySQL       🍃 MongoDB
          (Aiven)        (Atlas)

💡 Principe : frontend et backend sont découplés et communiquent
   uniquement via une API REST sécurisée par JWT.


════════════════════════════════════════════════════════════════════
🚀 5. INSTALLATION LOCALE
════════════════════════════════════════════════════════════════════

📋 Prérequis
────────────
  • PHP 8.2+
  • Composer 2.x
  • Node.js 20+ et npm
  • MySQL 8 (XAMPP, MAMP, etc.)
  • MongoDB Atlas (compte gratuit)
  • Extension PHP mongodb activée

🔧 Étapes
─────────

  1️⃣  Cloner le dépôt
      git clone https://github.com/MacFly-99/Car-Palace.git
      cd Car-Palace

  2️⃣  Installer les dépendances backend
      composer install

  3️⃣  Créer le fichier .env.local avec vos secrets
      MONGODB_URI=mongodb+srv://...
      JWT_PASSPHRASE=votre_passphrase

  4️⃣  Créer la base de données MySQL
      php bin/console doctrine:database:create

  5️⃣  Lancer les migrations
      php bin/console doctrine:migrations:migrate

  6️⃣  Charger les données de test
      php bin/console doctrine:fixtures:load

  7️⃣  Générer les clés JWT
      php bin/console lexik:jwt:generate-keypair

  8️⃣  Lancer le serveur Symfony
      symfony server:start --no-tls

  9️⃣  Dans un autre terminal, installer et lancer le frontend
      cd frontend
      npm install
      npm run dev

🌐 Accès
────────
  • Frontend   : http://localhost:5173
  • Backend API: http://localhost:8000/api

🔑 Comptes de test
──────────────────
  • 👑 Administrateur : admin@car-palace.fr / password123
  • 👤 Utilisateur    : user_test@car-palace.fr / password123


════════════════════════════════════════════════════════════════════
🌐 6. DÉPLOIEMENT
════════════════════════════════════════════════════════════════════

📦 Composants en production
───────────────────────────
  • 🎨 Frontend   : Vercel
       https://car-palace-frontend.vercel.app

  • 🐘 Backend    : Render
       https://car-palace-api.onrender.com

  • 🗄️ Base SQL   : Aiven (MySQL 8.4.11, cloud, SSL obligatoire)

  • 🍃 Base NoSQL : MongoDB Atlas (cloud)

⚙️ Procédure simplifiée
───────────────────────
  1. Backend déployé via un Dockerfile sur Render
     (conteneur PHP 8.2 + Apache + extensions MongoDB).

  2. Frontend déployé automatiquement sur Vercel à chaque
     git push sur la branche main.

  3. Base SQL provisionnée sur Aiven avec SSL obligatoire.

  4. Sécurité : SSL MySQL, JWT 4h, rate limiting, security headers.


════════════════════════════════════════════════════════════════════
🧪 7. TESTS
════════════════════════════════════════════════════════════════════

🔬 Tests unitaires (PHPUnit)
────────────────────────────
  • Commande : php bin/phpunit
  • Résultat attendu : OK (16 tests, 24 assertions)

📮 Tests d'intégration (Postman)
────────────────────────────────
  Une collection Postman complète couvre :

  • Authentification (login admin + user)
  • CRUD complet sur les pièces
  • Routes admin (stats, gestion utilisateurs, pièces,
    commandes, avis)
  • Tests de sécurité (401, 403, 429)
  • Messagerie MongoDB


════════════════════════════════════════════════════════════════════
🔒 8. SÉCURITÉ
════════════════════════════════════════════════════════════════════

🛡️ Mesures en place
────────────────────
  • Authentification JWT (Lexik) avec durée de vie réduite à 4h
    en production.

  • Rate limiting sur login et inscription (5 tentatives / 15 min).

  • Hachage des mots de passe avec Bcrypt.

  • Contrôle d'accès par rôles (ROLE_USER / ROLE_ADMIN)
    côté serveur via #[IsGranted] et côté client via AdminRoute.

  • Vérification du propriétaire : un utilisateur ne peut modifier
    que ses propres ressources.

  • Connexion MySQL SSL (certificat CA Aiven).

  • Security Headers : CSP, X-Frame-Options, X-Content-Type-Options,
    Referrer-Policy, Permissions-Policy.

  • CORS strict : seules les URLs de production sont autorisées.

  • Versions Apache/PHP masquées.

  • Secrets isolés : fichiers .env.local et config/jwt/*.pem
    exclus du dépôt Git.


════════════════════════════════════════════════════════════════════
📁 9. STRUCTURE DU PROJET
════════════════════════════════════════════════════════════════════

Car-Palace/
├── config/
│   ├── jwt/                   🔑 Clés RSA pour JWT
│   ├── packages/              ⚙️ Configuration par bundle
│   └── routes.yaml
├── docker/
│   ├── entrypoint.sh          🐳 Script de démarrage
│   └── vhost.conf             ⚙️ Config Apache
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/        🧩 Composants réutilisables
│       ├── context/           🔄 Contextes React
│       ├── pages/
│       │   ├── admin/         🛡️ Espace administrateur
│       │   ├── auth/          🔐 Login, Register
│       │   ├── pieces/        🔧 Catalogue, Détail, Vendre, Modifier
│       │   └── users/         👤 MesPieces, MesMessages, Messagerie
│       └── services/          📡 Appels API
├── migrations/                🗄️ Migrations Doctrine
├── public/                    🌐 Point d'entrée web
├── src/
│   ├── Controller/            🎮 Contrôleurs
│   ├── DataFixtures/          🌱 Jeux de données de test
│   ├── Document/              🍃 Documents MongoDB
│   ├── Entity/                📦 Entités Doctrine
│   └── Repository/
├── tests/                     🧪 Tests PHPUnit
├── Dockerfile                 🐳 Conteneur Backend
├── composer.json
├── package.json
├── render.yaml                ⚙️ IaC Render
└── README.md


════════════════════════════════════════════════════════════════════
👤 10. AUTEUR
════════════════════════════════════════════════════════════════════

  🎓 Matteo Ventura

  • Titre Professionnel DWWM — Session 2026
  • École : CEF
  • 🐙 GitHub : https://github.com/MacFly-99
  • 🌐 Application : https://car-palace-frontend.vercel.app


════════════════════════════════════════════════════════════════════
📄 LICENCE
════════════════════════════════════════════════════════════════════

Projet réalisé dans le cadre d'une formation.
Usage pédagogique uniquement.


════════════════════════════════════════════════════════════════════
💡 Développé avec passion pour le Titre Professionnel DWWM
════════════════════════════════════════════════════════════════════