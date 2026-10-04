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

Lors du déploiement sur Railway, j'ai rencontré un problème classique : les dossiers var/ de Symfony sont exclus du versioning (gitignorés), ce qui faisait échouer la commande de permissions du Dockerfile. J'ai résolu en créant explicitement ces dossiers dans le Dockerfile avant d'appliquer les permissions.

J'ai rencontré un conflit de modules Apache (MPM) lors du déploiement Docker : deux modules multi-processus étaient chargés simultanément. J'ai résolu en désactivant explicitement les MPM concurrents via a2dismod dans le Dockerfile, en ne gardant que mpm_prefork, qui est le MPM recommandé pour PHP avec mod_php.

Le déploiement sur Railway utilise le serveur PHP intégré (via le mode CLI de PHP) au lieu d'Apache, car ce dernier présentait un conflit de modules MPM dans l'environnement Docker. En production réelle sur un hébergeur mutualisé (OVH, o2switch), j'utiliserais Apache ou Nginx avec les configurations adaptées.

Lors du déploiement Docker, j'ai dû retirer l'option --no-scripts de la commande composer install, car Symfony Runtime a besoin d'exécuter un script post-install pour générer autoload_runtime.php. Sans ce fichier, l'application ne démarre pas.

Le déploiement Docker de Symfony m'a demandé d'adapter la configuration : les scripts post-install de Composer (Symfony Flex) ne fonctionnaient pas dans un contexte root sans l'utilitaire symfony-cmd. J'ai désactivé ces scripts automatiques et les ai remplacés par des commandes PHP directes dans le Dockerfile.