# Compte avec moi

Petite app pour aider les enfants (5 à 8 ans) à compter et à calculer, sœur de « Lis avec moi » (même look, mêmes boutons).
Elle s'installe sur iPad et iPhone depuis Safari : **Partager → Sur l'écran d'accueil**.

- Jusqu'à 6 profils, sans mot de passe.
- Six jeux : 🍎 Compter, 🔢 La suite, ➕ Plus, ➖ Moins, 🤔 Plus ou moins ? (trouver le signe), 🎲 Mélange (additions et soustractions mélangées) ; niveau « jusqu'à 5, 10, 20 ou 100 ».
- Des séries de 5 à 50 calculs, sans chrono.
- L'enfant répond seul en touchant la bonne réponse ; après une erreur, la bonne réponse s'affiche en vert.
- En touchant le cadre, l'app lit le calcul à voix haute.
- Les résultats et le graphique des progrès (par jeu et par niveau) restent sur l'appareil.

## Fichiers

- `index.html`, `sw.js`, `manifest.webmanifest`, `version.json`, `icone-*.png` : l'app en ligne (GitHub Pages).
- `source/apercu.html` : la version de travail ; `source/build.py` produit les fichiers ci-dessus (`python3 source/build.py`).

## Synchroniser l'iPad et l'iPhone

Comme pour « Lis avec moi », avec un petit script Google (`source/synchro.gs`, aussi sur le site : `synchro.gs.txt`)
installé dans un **nouveau** Google Sheet privé (pas celui de « Lis avec moi »).
Les étapes sont expliquées dans **Espace parents → Synchroniser l'iPad et l'iPhone**.
