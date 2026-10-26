# 🚗 Car Palace

> Plateforme d'achat et de revente de pièces détachées automobiles entre particuliers.

---

## 📋 Sommaire

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

---

## 🎯 Présentation

Car Palace est une plateforme web permettant l'achat et la revente de pièces détachées automobiles entre particuliers.

Elle a été développée minutieusement avec pour objectifs :

- ✅ Mettre en œuvre une **architecture full-stack découplée** (API REST + SPA).
- ✅ Démontrer la maîtrise conjointe de **bases de données SQL et NoSQL**.
- ✅ Assurer une **sécurité de niveau production** (JWT, rate limiting, security headers, SSL).

---

## ✨ Fonctionnalités

### 👤 Visiteur (non authentifié)

- Consulter le catalogue de pièces
- Rechercher une pièce par mots-clés
- Filtrer par marque, catégorie, état et prix
- Consulter la fiche détaillée d'une pièce et ses avis

### 👥 Utilisateur connecté (ROLE_USER)

- Toutes les fonctionnalités du visiteur
- Publier, modifier et supprimer ses annonces
- Contacter un vendeur via une messagerie interne
- Laisser un avis (note 5 étoiles + titre + description)
- Suivre l'état de ses commandes

### 🛡️ Administrateur (ROLE_ADMIN)

- Accéder à un tableau de bord avec statistiques (CA, utilisateurs, pièces, avis)
- Gérer les utilisateurs (changement de rôle, suppression)
- Modérer les pièces, commandes et avis
- Consulter le détail du chiffre d'affaires par statut

---

## 🛠️ Stack technique

### ⚙️ Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| PHP | 8.2 | Langage serveur |
| Symfony | 7.4 | Framework backend |
| API Platform | 4.x | API REST |
| Doctrine ORM | 3.x | Mapping objet-relationnel (MySQL) |
| Doctrine ODM | 2.x | Mapping objet-document (MongoDB) |
| Lexik JWT | 3.x | Authentification JWT |
| Nelmio CORS | 2.x | Gestion des requêtes cross-origin |
| MySQL | 8.4 | Base de données relationnelle (Aiven) |
| MongoDB Atlas | Cloud | Base de données NoSQL (messagerie) |

---

### 🎨 Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18 | Bibliothèque UI |
| Vite | 5.x | Bundler et dev server |
| React Router | 6.x | Routage côté client |
| Axios | 1.x | Client HTTP |
| Tailwind CSS | 4.x | Framework CSS |

### 🧰 Outils

- **Git + GitHub** : versioning
- **Docker** : conteneurisation backend
- **Postman** : tests API
- **PHPUnit** : tests unitaires
- **MongoDB Compass** : exploration NoSQL
- **Figma** : maquettes

---

## 🏗️ Architecture

L'application suit une **architecture full-stack découplée** :

### 🔄 Flux utilisateur

1. **Utilisateur** (navigateur web)
2. ↓ HTTPS
3. **Vercel** héberge le **frontend React**
4. ↓ API REST (HTTPS + JWT)
5. **Render** héberge le **backend Symfony** (conteneur Docker)
6. ↓ Requêtes SQL et NoSQL
7. **MySQL (Aiven)** pour les données métier + **MongoDB Atlas** pour la messagerie

### 📦 Composants et responsabilités

| Composant | Rôle |
|-----------|------|
| 🎨 **Frontend React** (Vercel) | Interface utilisateur, routage SPA, appels API |
| 🐘 **Backend Symfony** (Render) | API REST, logique métier, authentification JWT |
| 🗄️ **MySQL (Aiven)** | Données métier (utilisateurs, pièces, commandes, avis) |
| 🍃 **MongoDB Atlas** | Messagerie interne (documents JSON) |

### 💡 Principes

- **Découplage total** : le frontend et le backend sont indépendants.
- **Communication REST** : uniquement via des appels HTTP sécurisés par JWT.
- **Double base de données** : SQL pour les données relationnelles, NoSQL pour les messages.
- **Déploiement séparé** : chaque composant est déployé indépendamment (Vercel, Render, Aiven, Atlas).

---

## 🚀 Installation locale

### 📋 Prérequis

- PHP 8.2+
- Composer 2.x
- Node.js 20+ et npm
- MySQL 8 (XAMPP, MAMP, etc.)
- MongoDB Atlas (compte gratuit)
- Extension PHP mongodb activée

### 🔧 Étapes

**1️⃣ Cloner le dépôt**

    git clone https://github.com/MacFly-99/Car-Palace.git
    cd Car-Palace

**2️⃣ Installer les dépendances backend**

    composer install

**3️⃣ Créer le fichier .env.local avec vos secrets**

    MONGODB_URI=mongodb+srv://...
    JWT_PASSPHRASE=votre_passphrase

**4️⃣ Créer la base de données MySQL**

    php bin/console doctrine:database:create

**5️⃣ Lancer les migrations**

    php bin/console doctrine:migrations:migrate

**6️⃣ Charger les données de test**

    php bin/console doctrine:fixtures:load

**7️⃣ Générer les clés JWT**

    php bin/console lexik:jwt:generate-keypair

**8️⃣ Lancer le serveur Symfony**

    symfony server:start --no-tls

**9️⃣ Installer et lancer le frontend (dans un autre terminal)**

    cd frontend
    npm install
    npm run dev

### 🌐 Accès

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000/api

### 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👑 Administrateur | admin@car-palace.fr | password123 |
| 👤 Utilisateur | user_test@car-palace.fr | password123 |

---

## 🌐 Déploiement

### 📦 Composants en production

| Composant | Plateforme | URL |
|-----------|-----------|-----|
| 🎨 Frontend | Vercel | https://car-palace-frontend.vercel.app |
| 🐘 Backend API | Render | https://car-palace-api.onrender.com |
| 🗄️ Base SQL | Aiven | MySQL 8.4.11 (cloud) |
| 🍃 Base NoSQL | MongoDB Atlas | Cloud |

### ⚙️ Procédure simplifiée

1. **Backend** : déployé via un Dockerfile sur Render (conteneur PHP 8.2 + Apache + extensions MongoDB).
2. **Frontend** : déployé automatiquement sur Vercel à chaque git push sur main.
3. **Base SQL** : provisionnée sur Aiven avec SSL obligatoire (certificat CA).
4. **Sécurité** : SSL MySQL, JWT 4h, rate limiting, security headers.

---

## 🧪 Tests

### 🔬 Tests unitaires (PHPUnit)

Commande :

    php bin/phpunit

Résultat attendu : **OK (16 tests, 24 assertions)**

### 📮 Tests d'intégration (Postman)

Une collection Postman complète est disponible avec 20 tests couvrant :

- Authentification (login admin + user)
- CRUD complet sur les pièces
- Routes admin (stats, gestion utilisateurs, pièces, commandes, avis)
- Tests de sécurité (401, 403, 429)
- Messagerie MongoDB

---

## 🔒 Sécurité

### 🛡️ Mesures en place

- **Authentification JWT** (Lexik) avec durée de vie réduite à 4h en production.
- **Rate limiting** sur login et inscription (5 tentatives / 15 min).
- **Hachage des mots de passe** avec Bcrypt.
- **Contrôle d'accès** par rôles (ROLE_USER / ROLE_ADMIN) côté serveur et côté client.
- **Vérification du propriétaire** : un utilisateur ne peut modifier que ses propres ressources.
- **Connexion MySQL SSL** (certificat CA Aiven).
- **Security Headers** : CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **CORS strict** : seules les URLs de production sont autorisées.
- **Versions Apache/PHP masquées**.
- **Secrets isolés** : fichiers `.env.local` et `config/jwt/*.pem` exclus du dépôt Git.

---

## 📁 Structure du projet

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

---

## 👤 Auteur

**🎓 Matteo Ventura**

- Année 2026
- 🐙 GitHub : [@MacFly-99](https://github.com/MacFly-99)
- 🌐 Application : [car-palace-frontend.vercel.app](https://car-palace-frontend.vercel.app)

---

## 📄 Licence

Projet propriétaire. Usage pédagogique uniquement.