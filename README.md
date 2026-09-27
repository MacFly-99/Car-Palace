En développement, j'utilise symfony server:start --no-tls pour éviter les problèmes de certificats auto-signés. En production, le serveur sera protégé par un vrai certificat SSL fourni par l'hébergeur ou Let's Encrypt.




Dans la partie frontend, on trouve le dossier pages/ pour les différentes pages de l'application, services/ pour les appels API, context/ pour les Contextes React, et components/ pour les composants réutilisables.

J'ai réorganisé mon dossier pages/ en sous-modules : admin/ pour l'espace d'administration, auth/ pour l'authentification, pieces/ pour tout ce qui touche aux pièces, et users/ pour l'espace personnel de l'utilisateur. Cette séparation par domaine métier facilite la navigation et la maintenance.

Pour le fichier de routing "App.jsx", j'ai organisé les imports et les routes par domaine métier avec des commentaires de section. Cela permet de naviguer rapidement dans le code et de comprendre l'architecture de l'application en un coup d'œil