# Compte avec moi

Petite app pour aider les enfants (5 à 8 ans) à compter et à calculer, sœur de « Lis avec moi » (même look, mêmes boutons).
Elle s'installe sur iPad et iPhone depuis Safari : **Partager → Sur l'écran d'accueil**.

- Jusqu'à 6 profils, sans mot de passe.
- Six jeux : 🍎 Compter (objets ou dominos), 🔢 La suite, 🧮 Plus et moins (additions et soustractions mélangées), 🤔 Le bon signe (trouver + ou −), ⚖️ Comparer (<, = ou >, avec des nombres ou des dominos), 🎲 Mélange (un peu de tout) ; niveau « jusqu'à 5, 10, 20 ou 100 ».
- Des séries de 5 à 50 calculs, sans chrono.
- L'enfant répond seul en touchant la bonne réponse ; après une erreur, la bonne réponse s'affiche en vert.
- En touchant le cadre, l'app lit le calcul à voix haute.
- Les résultats et le graphique des progrès (par jeu et par niveau) restent sur l'appareil.

## Édition néerlandaise « Tel met mij »

Une deuxième édition, entièrement en néerlandais, est à l'adresse `/nl/`, pour la partager avec d'autres parents.
Elle est produite par `build.py` à partir du même code : chaque changement s'applique aux deux éditions. Elle n'a pas de synchronisation.

## Fichiers

- `index.html`, `sw.js`, `manifest.webmanifest`, `version.json`, `icone-*.png` : l'app en ligne (GitHub Pages).
- `nl/` : l'édition néerlandaise (mêmes fichiers).
- `source/apercu.html` : la version de travail ; `source/build.py` produit les fichiers ci-dessus (`python3 source/build.py`).

## Synchroniser l'iPad et l'iPhone

Comme pour « Lis avec moi », avec un petit script Google (`source/synchro.gs`, aussi sur le site : `synchro.gs.txt`)
qui peut écrire dans le même Google Sheet que « Lis avec moi » : ses données vont dans des onglets séparés « Maths - Profils », « Maths - Resultats » et « Maths - Supprimes ».
Les étapes sont expliquées dans **Espace parents → Synchroniser l'iPad et l'iPhone**.
