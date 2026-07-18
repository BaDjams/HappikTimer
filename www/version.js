// Version de l'application.
// À chaque évolution : incrémenter APP_VERSION et ajouter une entrée en tête du CHANGELOG.
// Le workflow GitHub Actions lit APP_VERSION pour renseigner le versionName de l'APK.
const APP_VERSION = "1.3.0";

const CHANGELOG = [
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
