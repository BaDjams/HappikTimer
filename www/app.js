// ---------- DONNÉES ----------

// Pistes Hapik SQY avec leurs indices.
// noMarker: pas de marqueur sur la piste => objectif forcément "jusqu'en haut"
const ROUTES = [
  { name: "Chevrons",        clue: "Suis les flèches qui pointent vers le ciel !" },
  { name: "Champions",       clue: "Le mur des footballeurs, à toi de marquer un but ! ⚽" },
  { name: "Vortex",          clue: "La grande tornade rouge qui tourbillonne ! 🌪" },
  { name: "Jeux Olympiques", clue: "Les anneaux des plus grands champions du monde ! 🥇" },
  { name: "Sprint",          clue: "La piste de vitesse, la plus haute de toutes ! ⚡" },
  { name: "Réseaux",         clue: "Le mur connecté, comme Internet ! 🌐" },
  { name: "Tourbillon Sud",  clue: "Un tourbillon venu tout droit du sud... 🧭" },
  { name: "Bambou",          clue: "La plante préférée des pandas ! 🐼", noMarker: true },
  { name: "Casse-tête",      clue: "Le mur qui fait chauffer le cerveau ! 🧩" },
  { name: "Hapik",           clue: "Le mur qui porte le nom de la salle !" },
  { name: "Cubes",           clue: "Des carrés, des blocs... empilés partout ! 🟦" },
  { name: "Rando",           clue: "Accroche-toi aux cordes suspendues ! 🪢" },
  { name: "Piolet",          clue: "L'outil pointu des alpinistes sur la glace ! ⛏" },
  { name: "Geek",            clue: "Des chiffres verts comme dans un ordinateur ! 👾" },
  { name: "Géoloco",         clue: "Où es-tu ? Le mur du GPS te guide ! 📍" },
  { name: "Shining",         clue: "Le mur qui brille de mille diamants ! 💎" },
  { name: "Constellations",  clue: "Les étoiles dessinées dans le ciel ! ✨" },
];

const ANIMALS = [
  { n: "Caribou", f: false }, { n: "Fourmi", f: true },  { n: "Panda", f: false },
  { n: "Tigre", f: false },   { n: "Girafe", f: true },  { n: "Koala", f: false },
  { n: "Panthère", f: true }, { n: "Gecko", f: false },  { n: "Aigle", f: false },
  { n: "Loutre", f: true },   { n: "Yéti", f: false },   { n: "Chamois", f: false },
  { n: "Araignée", f: true }, { n: "Fusée", f: true },   { n: "Marmotte", f: true },
  { n: "Lynx", f: false },    { n: "Gorille", f: false },{ n: "Libellule", f: true },
];

const ADJECTIVES = [
  { m: "vif", f: "vive" },           { m: "balèze", f: "balèze" },
  { m: "turbo", f: "turbo" },        { m: "fou", f: "folle" },
  { m: "rapide", f: "rapide" },      { m: "musclé", f: "musclée" },
  { m: "éclair", f: "éclair" },      { m: "agile", f: "agile" },
  { m: "féroce", f: "féroce" },      { m: "bondissant", f: "bondissante" },
  { m: "invincible", f: "invincible" }, { m: "supersonique", f: "supersonique" },
  { m: "malin", f: "maligne" },      { m: "costaud", f: "costaude" },
  { m: "fulgurant", f: "fulgurante" },
];

const NB_ROUTES = 10;
const NB_TOP = 2;
const LB_KEY = "happik-leaderboard";
const ENCOURAGEMENTS = ["Bravo !", "Super !", "Génial !", "Quelle fusée !", "Incroyable !", "Continue comme ça !", "Trop fort !", "Wahou !"];
const EMOJIS = ["🎉", "⭐", "🔥", "💪", "🚀", "🤩", "👏", "🏅"];

// ---------- ÉTAT ----------

let nickname = "";
let runRoutes = [];       // [{name, clue, objective}]
let currentIndex = 0;
let routeStart = 0;
let runStart = 0;
let routeTimes = [];      // secondes par piste
let timerInterval = null;
let lastRunId = null;
let leaderboardOrigin = "home";
let adminMode = false;

// ---------- OUTILS ----------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmtRoute(sec) {
  return sec.toFixed(1) + " s";
}

function fmtTotal(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- SURNOMS ----------

function makeNickname() {
  const animal = pick(ANIMALS);
  const adj = pick(ADJECTIVES);
  return animal.n + " " + (animal.f ? adj.f : adj.m);
}

function rollNicknames() {
  const box = document.getElementById("nickname-choices");
  box.innerHTML = "";
  const seen = new Set();
  while (seen.size < 3) seen.add(makeNickname());
  for (const name of seen) {
    const btn = document.createElement("button");
    btn.className = "nickname-btn";
    btn.textContent = name;
    btn.onclick = () => {
      nickname = name;
      document.getElementById("ready-nickname").textContent = nickname;
      showScreen("screen-ready");
    };
    box.appendChild(btn);
  }
}

function goToNickname() {
  rollNicknames();
  showScreen("screen-nickname");
}

// ---------- COURSE ----------

function buildRun() {
  const selected = shuffle(ROUTES).slice(0, NB_ROUTES);
  // Choix des pistes "jusqu'en haut" : celles sans marqueur d'abord (obligatoire)
  const noMarker = selected.filter(r => r.noMarker);
  const withMarker = shuffle(selected.filter(r => !r.noMarker));
  const topSet = new Set(noMarker.map(r => r.name));
  for (const r of withMarker) {
    if (topSet.size >= NB_TOP) break;
    topSet.add(r.name);
  }
  return selected.map(r => ({
    name: r.name,
    clue: r.clue,
    top: topSet.has(r.name),
  }));
}

function startRun() {
  runRoutes = buildRun();
  currentIndex = 0;
  routeTimes = [];
  runStart = Date.now();
  showRoute();
  showScreen("screen-run");
}

function showRoute() {
  const route = runRoutes[currentIndex];
  document.getElementById("run-progress").textContent = "Piste " + (currentIndex + 1) + "/" + NB_ROUTES;
  document.getElementById("clue-text").textContent = route.clue;
  const badge = document.getElementById("objective-badge");
  if (route.top) {
    badge.textContent = "🚩 Objectif : JUSQU'EN HAUT !";
    badge.className = "objective-badge top";
  } else {
    badge.textContent = "🎯 Objectif : jusqu'au marqueur";
    badge.className = "objective-badge marker";
  }
  // réinitialise le bouton "je trouve pas"
  document.getElementById("route-reveal").classList.add("hidden");
  document.getElementById("btn-reveal").classList.remove("hidden");

  // relance l'animation de la carte indice
  const card = document.getElementById("clue-card");
  card.style.animation = "none";
  void card.offsetWidth;
  card.style.animation = "";

  routeStart = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimers, 100);
  updateTimers();
}

function updateTimers() {
  const routeSec = (Date.now() - routeStart) / 1000;
  document.getElementById("route-timer").textContent = routeSec.toFixed(1);
  document.getElementById("run-total-timer").textContent = fmtTotal((Date.now() - runStart) / 1000);
}

function revealRoute() {
  const reveal = document.getElementById("route-reveal");
  reveal.textContent = "👉 C'est la piste « " + runRoutes[currentIndex].name + " » !";
  reveal.classList.remove("hidden");
  document.getElementById("btn-reveal").classList.add("hidden");
}

function routeDone() {
  clearInterval(timerInterval);
  timerInterval = null;
  const sec = (Date.now() - routeStart) / 1000;
  routeTimes.push(sec);

  if (currentIndex + 1 >= NB_ROUTES) {
    finishRun();
    return;
  }

  document.getElementById("transition-emoji").textContent = pick(EMOJIS);
  document.getElementById("transition-text").textContent = pick(ENCOURAGEMENTS);
  document.getElementById("transition-time").textContent = fmtRoute(sec);
  showScreen("screen-transition");
}

function nextRoute() {
  currentIndex++;
  showRoute();
  showScreen("screen-run");
}

function abandonRun() {
  if (!confirm("Abandonner la course ?")) return;
  clearInterval(timerInterval);
  timerInterval = null;
  showScreen("screen-home");
}

// ---------- RÉSULTATS ----------

function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LB_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLeaderboard(lb) {
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}

function finishRun() {
  const total = routeTimes.reduce((a, b) => a + b, 0);
  const entry = {
    id: Date.now(),
    nickname,
    total,
    date: new Date().toISOString(),
    routes: runRoutes.map((r, i) => ({ name: r.name, top: r.top, time: routeTimes[i] })),
  };
  lastRunId = entry.id;
  const lb = loadLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => a.total - b.total);
  saveLeaderboard(lb);

  document.getElementById("result-nickname").textContent = nickname;
  document.getElementById("result-total").textContent = fmtTotal(total) + " min";
  const rank = lb.findIndex(e => e.id === entry.id) + 1;
  const rankMsg = rank === 1
    ? "🥇 MEILLEUR TEMPS ! Tu es 1er du classement !"
    : "Tu es " + rank + "e sur " + lb.length + " au classement !";
  document.getElementById("result-rank").textContent = rankMsg;

  const box = document.getElementById("result-details");
  box.innerHTML = "";
  const max = Math.max(...routeTimes);
  const min = Math.min(...routeTimes);
  entry.routes.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "detail-row";
    if (routeTimes.length > 1) {
      if (r.time === max) row.classList.add("slowest");
      else if (r.time === min) row.classList.add("fastest");
    }
    row.innerHTML =
      '<span class="detail-num">' + (i + 1) + '</span>' +
      '<span class="detail-name">' + r.name +
      '<br><span class="detail-obj">' + (r.top ? "🚩 jusqu'en haut" : "🎯 jusqu'au marqueur") + '</span></span>' +
      '<span class="detail-time">' + fmtRoute(r.time) + '</span>';
    box.appendChild(row);
  });

  showScreen("screen-results");
}

// ---------- CLASSEMENT ----------

function showLeaderboard(origin) {
  leaderboardOrigin = origin;
  adminMode = false;
  renderLeaderboard();
  showScreen("screen-leaderboard");
}

function renderLeaderboard() {
  const lb = loadLeaderboard();
  const box = document.getElementById("leaderboard-list");
  box.innerHTML = "";
  document.getElementById("btn-admin").classList.toggle("active", adminMode);
  document.getElementById("admin-hint").classList.toggle("hidden", !adminMode);

  if (lb.length === 0) {
    box.innerHTML = '<p class="lb-empty">Aucune course pour le moment.<br>À toi de jouer ! 🧗</p>';
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  // en mode admin, on montre tout pour pouvoir nettoyer
  const shown = adminMode ? lb : lb.slice(0, 20);
  shown.forEach((e, i) => {
    const row = document.createElement("div");
    row.className = "lb-row" + (e.id === lastRunId ? " highlight" : "");
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    row.innerHTML =
      '<span class="lb-rank">' + (medals[i] || (i + 1)) + '</span>' +
      '<span class="lb-info"><span class="lb-name">' + e.nickname + '</span>' +
      '<br><span class="lb-date">' + dateStr + '</span></span>' +
      '<span class="lb-time">' + fmtTotal(e.total) + '</span>';
    if (adminMode) {
      const del = document.createElement("button");
      del.className = "lb-delete";
      del.textContent = "🗑";
      del.onclick = () => deleteEntry(e.id);
      row.appendChild(del);
    }
    box.appendChild(row);
  });
}

function toggleAdmin() {
  adminMode = !adminMode;
  renderLeaderboard();
}

function deleteEntry(id) {
  const lb = loadLeaderboard();
  const entry = lb.find(e => e.id === id);
  if (!entry) return;
  if (!confirm("Supprimer « " + entry.nickname + " — " + fmtTotal(entry.total) + " » du classement ?")) return;
  saveLeaderboard(lb.filter(e => e.id !== id));
  renderLeaderboard();
}

function leaderboardBack() {
  showScreen(leaderboardOrigin === "results" ? "screen-results" : "screen-home");
}
