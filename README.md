# ⏱ Happy Time

Des défis chronométrés, seul ou à deux, organisés en **packs d'épreuves**.
Disponible en **APK Android** et en **application web (PWA)** pour iPhone et tout navigateur.

Le premier pack disponible est un pack d'escalade (pistes de la salle Hapik SQY), mais le
concept est ouvert : un pack peut contenir n'importe quelle série d'épreuves à faire au
chrono — parcours d'obstacles, défis en plein air, chasse au trésor... À terme, l'idée est
de permettre à une communauté de créer et partager ses propres packs.

## Le jeu

1. Choisis ton **pack d'épreuves** (🎒 en bas de l'accueil).
2. Choisis ton activité : **course solo** ou **Versus 1 contre 1** (écran partagé, chacun son chrono).
3. Crée ton personnage : un **surnom** rigolo (animal + adjectif) et un **mode** :
   - 🐣 **Enfant** : 2 épreuves « jusqu'en haut », le reste « jusqu'au marqueur »
   - 💪 **Adulte** : tout « jusqu'en haut »
   - 🤘 **Expert** : bientôt !
4. Pour chaque épreuve, un **indice** s'affiche. Le chrono tourne : trouve l'épreuve,
   accomplis l'objectif, puis reviens **toucher l'écran**. Bouton 🙈 « Je trouve pas ! » si
   besoin (c'est compté !), pause ⏸ possible.
5. À la fin : temps total au **classement** (par pack), détail épreuve par épreuve.

## Version web (iPhone, iPad, navigateur)

L'application est déployée automatiquement sur GitHub Pages :

**https://badjams.github.io/HappikTimer/**

Sur iPhone : ouvrir le lien dans **Safari** → bouton Partager → **« Sur l'écran d'accueil »**.
L'app s'installe comme une vraie application (plein écran, icône, fonctionne hors-ligne) et les
scores sont conservés durablement. Chaque appareil a son propre classement : utiliser
l'export/import JSON du mode admin (⚙️) pour transférer des scores entre appareils.

## Télécharger l'APK

L'APK est compilé automatiquement par GitHub Actions :

- Onglet **Actions** → dernier run **Build APK** → artifact `happy-time-apk`
- Ou dans **Releases** (pour les builds de la branche `main`)

Sur le téléphone : autoriser l'installation d'applications de sources inconnues, puis ouvrir `happy-time.apk`.

## Développement

Application web (HTML/CSS/JS dans `www/`) enveloppée avec [Capacitor](https://capacitorjs.com).

```bash
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
```

Le classement est stocké localement sur l'appareil (localStorage).
Pour ajouter un pack d'épreuves : un objet dans `PACKS` (`www/app.js`) avec un id, un nom
et la liste des épreuves (nom + indice).
