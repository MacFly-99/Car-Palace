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

J'ai créé un Document MongoDB Message avec les annotations ODM (#[MongoDB\Document]), équivalent d'une entité Doctrine pour une base NoSQL. Contrairement au SQL, MongoDB ne nécessite pas de schéma strict — les documents peuvent avoir des champs variables, ce qui est idéal pour une messagerie.