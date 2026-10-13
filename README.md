En développement, j'utilise symfony server:start --no-tls pour éviter les problèmes de certificats auto-signés. En production, le serveur sera protégé par un vrai certificat SSL fourni par l'hébergeur ou Let's Encrypt.

Dans la partie frontend, on trouve le dossier pages/ pour les différentes pages de l'application, services/ pour les appels API, context/ pour les Contextes React, et components/ pour les composants réutilisables.

J'ai réorganisé mon dossier pages/ en sous-modules : admin/ pour l'espace d'administration, auth/ pour l'authentification, pieces/ pour tout ce qui touche aux pièces, et users/ pour l'espace personnel de l'utilisateur. Cette séparation par domaine métier facilite la navigation et la maintenance.

Pour le fichier de routing "App.jsx", j'ai organisé les imports et les routes par domaine métier avec des commentaires de section. Cela permet de naviguer rapidement dans le code et de comprendre l'architecture de l'application en un coup d'œil.

Le tableau de bord administrateur offre une vue agrégée du chiffre d'affaires. En cliquant dessus, un modal affiche la répartition par statut de commande sous forme de barres de progression, calculée dynamiquement à partir des données retournées par l'API Symfony.

Quand on utilise inversedBy dans Doctrine, la propriété inverse DOIT exister dans l'entité cible. Sinon, ça génère des erreurs de sérialisation.
Pour éviter ce genre de problème, on peut :
- soit déclarer les deux côtés de la relation (avec $ligneCommandes dans Piece).
- soit utiliser une relation unidirectionnelle (juste ManyToOne sans inversedBy).
J'ai choisi la 2ème solution (plus simple, suffisante pour mon projet).

Mon application est complète : catalogue avec filtres, authentification JWT, CRUD complet sur les pièces, espace administrateur avec gestion des utilisateurs/pièces/commandes/avis, système d'avis public, et messagerie interne basée sur MongoDB pour démontrer ma maîtrise du SQL et du NoSQL.

J'ai implémenté une barre de filtres intelligente qui se réduit automatiquement au scroll pour libérer de l'espace visuel sur le catalogue, tout en restant accessible. L'utilisateur peut la ré-étendre d'un simple clic sur la barre de recherche. Les filtres actifs sont signalés par un badge sur l'icône de recherche.

J'ai créé un Document MongoDB Message avec les annotations ODM (#[MongoDB\Document]), équivalent d'une entité Doctrine pour une base NoSQL. Contrairement au SQL, MongoDB ne nécessite pas de schéma strict — les documents peuvent avoir des champs variables, ce qui est idéal pour une messagerie.

J'ai ajouté un système de notification en temps quasi-réel qui interroge périodiquement l'API pour compter les messages non lus. Le badge s'affiche uniquement s'il y a au moins un message non lu, et disparaît dès que la conversation est consultée.
J'utilise un système de polling toutes les 10 secondes pour rafraîchir le compteur de messages non lus. C'est un compromis entre réactivité et charge serveur. En production, je remplacerais ce système par Mercure (WebSocket) qui permet du vrai temps réel sans polling.

Pour la partie test, j'ai désactivé l'audit de sécurité de Composer pour ce projet car certaines dépendances de développement (notamment celles utilisées par PHPUnit) déclenchent des alertes de sécurité non applicables à mon usage.

J'ai écrit 17 tests unitaires avec PHPUnit couvrant les principales entités du domaine métier : Utilisateur (rôles), Piece (attributs, relations), Marque (relation avec Modèle), Categorie (relation avec Piece). Ces tests garantissent que la logique métier fonctionne correctement, indépendamment de la couche HTTP ou de la base de données.

J'ai configuré une séparation stricte entre les variables d'environnement versionnées (.env) et les secrets locaux (.env.local, ignoré par Git). Cela évite toute fuite de credentials dans le dépôt public.

J'ai utilisé plusieurs approches de déploiement : d'abord une tentative sur Railway qui a rencontré plusieurs obstacles techniques (extensions PHP, advisories Composer, bundles conditionnels), puis une migration vers Aiven qui a permis un déploiement propre en beaucoup moins de temps.

Aiven au lieu de Railway pour MySQL car Aiven propose MySQL managé avec SSL natif. Plus stable que Railway qui a eu des problèmes de connexion publique/interne. De plus, le fichier config/certs/aiven-ca.pem force la connexion SSL ce qui offre une sécurité renforcée.


Pour faire le deploiement de la base de donnees je suis passe par la creation de plusieurs fichiers :

1. Dockerfile : c'est le plan de construction du conteneur backend Symfony : 
- il définit l'environnement (PHP 8.2 + extensions,etc...).
- il installe Composer puis lance composer install (avec les bonnes options).
- il copie le code source dans /var/www/html.
- il configure Apache (activation du module rewrite, vhost dédié).
- il expose le port imposé par Render.
- il définit la commande de démarrage (CMD ou via l'entrypoint).
Rôle clé : c'est la recette qui transforme le code en image Docker prête à tourner.

2. config/packages/doctrine_ssl.php : c'est LA solution élégante : un fichier PHP de config Doctrine qui injecte les options SSL directement. On configure SSL côté code.

3. docker/entrypoint.sh : un script qui s'exécute au démarrage du conteneur. Il fait migrations + fixtures + démarrage Apache.Beaucoup plus fiable que d'essayer de tout faire dans le Dockerfile.

4. docker/vhost.conf : une config Apache dédiée (au lieu du serveur PHP intégré). Point d'entrée public/ propre, meilleure gestion des routes Symfony.

5. render.yaml : un fichier d'infrastructure-as-code pour Render. Permet de redéployer facilement avec la même config.

6. frontend/vercel.json : config spécifique pour le frontend sur Vercel. Pour gérer les rewrites SPA (React Router) et les headers.

7. .dockerignore : exclusion des fichiers inutiles