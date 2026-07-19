// Version de l'application.
// À chaque évolution : incrémenter APP_VERSION et ajouter une entrée en tête du CHANGELOG.
// Le workflow GitHub Actions lit APP_VERSION pour renseigner le versionName de l'APK.
const APP_VERSION = "1.6.0";

const CHANGELOG = [
  {
    v: "1.6.0",
    notes: [
      "Mode Expert débloqué : les prises imposées des vraies pancartes de la salle, avec des points à gagner sur chaque piste",
      "Les packs d'épreuves sont maintenant des fichiers séparés (packs/*.json), prêts à être partagés",
      "Nouvelles pistes : Face to Face et Dièdre ; « Cubes » retrouve son vrai nom « Kubrik »",
    ],
  },
  {
    v: "1.5.0",
    notes: [
      "L'application s'appelle maintenant Happy Time !",
      "Nouveau logo, plus simple",
      "Les salles deviennent des « packs d'épreuves » : escalade aujourd'hui, n'importe quel défi chronométré demain",
    ],
  },
  {
    v: "1.4.0",
    notes: [
      "Menu d'activité : course solo ou Versus 1 contre 1",
      "Mode Versus en écran partagé : mêmes 10 pistes dans un ordre différent, chacun son chrono et sa pause",
      "Modes Enfant (règles actuelles), Adulte (tout jusqu'en haut) — Expert bientôt",
      "Choix de la salle (Hapik SQY pour l'instant, d'autres pourront être ajoutées)",
      "Le nombre de noms de pistes révélés (🙈) est compté dans les scores",
    ],
  },
  {
    v: "1.3.0",
    notes: [
      "Version web installable (PWA) : sur iPhone, ouvrir le site dans Safari puis « Ajouter à l'écran d'accueil »",
      "Fonctionne hors-ligne une fois chargée (pratique à la salle !)",
      "Déploiement automatique sur GitHub Pages à chaque mise à jour",
      "Icône de l'application",
    ],
  },
  {
    v: "1.2.0",
    notes: [
      "Bouton pause pendant la course (piste occupée, pause pipi...)",
      "Export / import des scores en JSON depuis le mode admin",
      "Numéro de version et changelog visibles dans le mode admin",
      "Signature stable de l'APK : les mises à jour gardent les scores",
    ],
  },
  {
    v: "1.1.0",
    notes: [
      "Bouton « Je trouve pas ! » qui révèle le nom de la piste",
      "Mode admin du classement : suppression des scores de test",
    ],
  },
  {
    v: "1.0.0",
    notes: [
      "Première version : course de 10 pistes avec indices, chrono et classement",
    ],
  },
];
