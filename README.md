# 🧗 Happik Runner

Application de course d'escalade pour les salles **Hapik** (pistes de Hapik SQY).
Disponible en **APK Android** et en **application web (PWA)** pour iPhone et tout navigateur.

## Le jeu

1. L'enfant choisit un **surnom** rigolo (animal + adjectif : « Caribou vif », « Fourmi balèze »...).
2. Il appuie sur **Démarrer le parcours** : l'app génère **10 pistes** au hasard.
3. Pour chaque piste, un **indice** s'affiche (« La grande tornade rouge... » → Vortex) avec un objectif :
   - 🎯 **jusqu'au marqueur** (8 pistes)
   - 🚩 **jusqu'en haut** (2 pistes)
4. Le chrono démarre dès que l'indice est révélé. L'enfant trouve la piste, grimpe jusqu'à l'objectif (sous la surveillance d'un adulte), puis revient **toucher l'écran**.
5. À la fin, son temps total est inscrit au **classement** (surnom, temps, date), avec le détail du temps de chaque piste pour repérer celles qui posent problème.

## Version web (iPhone, iPad, navigateur)

L'application est déployée automatiquement sur GitHub Pages :

**https://badjams.github.io/HappikTimer/**

Sur iPhone : ouvrir le lien dans **Safari** → bouton Partager → **« Sur l'écran d'accueil »**.
L'app s'installe comme une vraie application (plein écran, icône, fonctionne hors-ligne) et les
scores sont conservés durablement. Chaque appareil a son propre classement : utiliser
l'export/import JSON du mode admin (⚙️) pour transférer des scores entre appareils.

## Télécharger l'APK

L'APK est compilé automatiquement par GitHub Actions :

- Onglet **Actions** → dernier run **Build APK** → artifact `happik-runner-apk`
- Ou dans **Releases** (pour les builds de la branche `main`)

Sur le téléphone : autoriser l'installation d'applications de sources inconnues, puis ouvrir `happik-runner.apk`.

## Développement

Application web (HTML/CSS/JS dans `www/`) enveloppée avec [Capacitor](https://capacitorjs.com).

```bash
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
```

Le classement est stocké localement sur l'appareil (localStorage).
