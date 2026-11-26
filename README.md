# Valovoc

Petite interface responsive en français pour une communauté Valorant : salons chill, vocal chill, rankup, swift et zone privée admin/modo.

## Lancer

Ouvre `index.html` dans un navigateur, ou sers le dossier avec un serveur statique (par exemple `python -m http.server 8000`).

## État actuel

C’est un prototype front-end : l’interface des salons est interactive, et les messages du salon chill sont conservés localement dans le navigateur. Ils ne sont pas envoyés aux autres membres. Le bouton vocal explique la dépendance au serveur ; il n’active ni ne transmet le micro.

La zone admin/modo est masquée aux visiteurs et affiche une page d’accès réservé si on tente d’y accéder. Pour accorder l’accès au propriétaire et aux modos nommés, il faudra ajouter une authentification côté serveur, stocker les rôles côté serveur et vérifier les permissions sur chaque requête. Le navigateur ne doit jamais pouvoir s’attribuer lui-même le rôle propriétaire/modérateur. `window.VALOVOC_SESSION` dans `app.js` est seulement un point d’intégration d’une session fournie par un serveur de confiance — ne pas le définir directement dans le HTML public.

Le chat partagé nécessite une API et une base de données ; le vocal nécessite WebRTC et un service de signalisation (et généralement un serveur TURN). Ne publie pas de secrets ou de mots de passe dans le dépôt.
