// ---------- DONNÉES ----------

// Salles disponibles. Pour ajouter une salle : dupliquer l'objet avec ses pistes et indices.
// noMarker: pas de marqueur sur la piste => objectif forcément "jusqu'en haut"
const SITES = [
  {
    id: "sqy",
    name: "Hapik SQY",
    routes: [
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
    ],
  },
];

const MODES = {
  enfant: { emoji: "🐣", label: "Enfant", desc: "2 pistes jusqu'en haut, le reste jusqu'au marqueur" },
  adulte: { emoji: "💪", label: "Adulte", desc: "toutes les pistes jusqu'en haut !" },
  expert: { emoji: "🤘", label: "Expert", desc: "bientôt disponible...", disabled: true },
};

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
const SITE_KEY = "happik-site";
const ENCOURAGEMENTS = ["Bravo !", "Super !", "Génial !", "Quelle fusée !", "Incroyable !", "Continue comme ça !", "Trop fort !", "Wahou !"];
const EMOJIS = ["🎉", "⭐", "🔥", "💪", "🚀", "🤩", "👏", "🏅"];

// ---------- ÉTAT ----------

let currentSiteId = localStorage.getItem(SITE_KEY) || "sqy";
let activity = "solo";        // "solo" | "versus"
let selectedMode = "enfant";  // mode en cours de sélection à la création du personnage
let playerMode = "enfant";    // mode du joueur solo
let nickname = "";
let vsSetup = [];             // joueurs du duel en cours de création [{nickname, mode}]

let runRoutes = [];           // [{name, clue, top}]
let currentIndex = 0;
let routeStart = 0;
let runStart = 0;
let routeTimes = [];          // secondes par piste
let revealedFlags = [];       // true si le nom a été révélé sur cette piste
let revealsCount = 0;
let revealedThisRoute = false;
let timerInterval = null;
let lastRunId = null;
let leaderboardOrigin = "home";
let adminMode = false;
let pausedAt = 0;

let vs = null;                // état du duel en cours
let vsInterval = null;

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

function getSite() {
  return SITES.find(s => s.id === currentSiteId) || SITES[0];
}

// ---------- SALLE ----------

function openSitePicker() {
  const box = document.getElementById("site-list");
  box.innerHTML = "";
  SITES.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "site-btn" + (s.id === currentSiteId ? " selected" : "");
    btn.textContent = "📍 " + s.name + (s.id === currentSiteId ? "  ✓" : "");
    btn.onclick = () => {
      currentSiteId = s.id;
      localStorage.setItem(SITE_KEY, s.id);
      updateSiteLabel();
      showScreen("screen-home");
    };
    box.appendChild(btn);
  });
  showScreen("screen-site");
}

function updateSiteLabel() {
  document.getElementById("site-label").textContent = "📍 " + getSite().name;
}

// ---------- CRÉATION DU PERSONNAGE ----------

function makeNickname() {
  const animal = pick(ANIMALS);
  const adj = pick(ADJECTIVES);
  return animal.n + " " + (animal.f ? adj.f : adj.m);
}

function chooseActivity(a) {
  activity = a;
  vsSetup = [];
  goToNickname();
}

function goToNickname() {
  selectedMode = "enfant";
  updateModeChips();
  updateNicknameTitle();
  rollNicknames();
  showScreen("screen-nickname");
}

function updateNicknameTitle() {
  const t = document.getElementById("nickname-title");
  t.textContent = activity === "versus"
    ? "⚔️ Joueur " + (vsSetup.length + 1) + " : ton surnom !"
    : "Choisis ton surnom !";
}

function selectMode(m) {
  if (MODES[m].disabled) return;
  selectedMode = m;
  updateModeChips();
}

function updateModeChips() {
  document.querySelectorAll(".mode-chip").forEach(c =>
    c.classList.toggle("selected", c.dataset.mode === selectedMode)
  );
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
    btn.onclick = () => pickNickname(name);
    box.appendChild(btn);
  }
}

function pickNickname(name) {
  if (activity === "versus") {
    vsSetup.push({ nickname: name, mode: selectedMode });
    if (vsSetup.length < 2) {
      selectedMode = "enfant";
      updateModeChips();
      updateNicknameTitle();
      rollNicknames();
    } else {
      showVsReady();
    }
    return;
  }
  nickname = name;
  playerMode = selectedMode;
  document.getElementById("ready-nickname").textContent = nickname;
  document.getElementById("ready-mode").textContent = MODES[playerMode].emoji + " Mode " + MODES[playerMode].label;
  document.getElementById("ready-explain").innerHTML =
    "Tu vas faire <strong>10 pistes</strong> (" + MODES[playerMode].desc + ").<br>" +
    "À chaque indice, trouve la bonne piste,<br>grimpe jusqu'à l'objectif,<br>puis reviens toucher l'écran ! 🏃💨";
  showScreen("screen-ready");
}

// ---------- COURSE SOLO ----------

function buildRun(mode) {
  const selected = shuffle(getSite().routes).slice(0, NB_ROUTES);
  let topSet;
  if (mode === "adulte") {
    topSet = new Set(selected.map(r => r.name));
  } else {
    // Choix des pistes "jusqu'en haut" : celles sans marqueur d'abord (obligatoire)
    const noMarker = selected.filter(r => r.noMarker);
    const withMarker = shuffle(selected.filter(r => !r.noMarker));
    topSet = new Set(noMarker.map(r => r.name));
    for (const r of withMarker) {
      if (topSet.size >= NB_TOP) break;
      topSet.add(r.name);
    }
  }
  return selected.map(r => ({
    name: r.name,
    clue: r.clue,
    top: topSet.has(r.name),
  }));
}

function startRun() {
  runRoutes = buildRun(playerMode);
  currentIndex = 0;
  routeTimes = [];
  revealedFlags = [];
  revealsCount = 0;
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
  revealedThisRoute = false;
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
  if (!revealedThisRoute) {
    revealedThisRoute = true;
    revealsCount++;
  }
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
  revealedFlags.push(revealedThisRoute);

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

function pauseRun() {
  clearInterval(timerInterval);
  timerInterval = null;
  pausedAt = Date.now();
  showScreen("screen-pause");
}

function resumeRun() {
  // décale les points de départ pour que la pause ne compte pas dans les chronos
  const delta = Date.now() - pausedAt;
  routeStart += delta;
  runStart += delta;
  timerInterval = setInterval(updateTimers, 100);
  updateTimers();
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
    mode: playerMode,
    site: currentSiteId,
    total,
    reveals: revealsCount,
    date: new Date().toISOString(),
    routes: runRoutes.map((r, i) => ({ name: r.name, top: r.top, time: routeTimes[i], revealed: revealedFlags[i] })),
  };
  lastRunId = entry.id;
  const lb = loadLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => a.total - b.total);
  saveLeaderboard(lb);

  document.getElementById("result-nickname").textContent = nickname;
  document.getElementById("result-mode").textContent = MODES[playerMode].emoji + " " + MODES[playerMode].label;
  document.getElementById("result-total").textContent = fmtTotal(total) + " min";
  const siteLb = lb.filter(e => (e.site || "sqy") === currentSiteId);
  const rank = siteLb.findIndex(e => e.id === entry.id) + 1;
  const rankMsg = rank === 1
    ? "🥇 MEILLEUR TEMPS ! Tu es 1er du classement !"
    : "Tu es " + rank + "e sur " + siteLb.length + " au classement !";
  document.getElementById("result-rank").textContent = rankMsg;
  document.getElementById("result-reveals").textContent = revealsCount > 0
    ? "🙈 Nom de piste révélé " + revealsCount + " fois"
    : "🧠 Aucun nom révélé, bravo !";

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
      '<span class="detail-name">' + r.name + (r.revealed ? " 🙈" : "") +
      '<br><span class="detail-obj">' + (r.top ? "🚩 jusqu'en haut" : "🎯 jusqu'au marqueur") + '</span></span>' +
      '<span class="detail-time">' + fmtRoute(r.time) + '</span>';
    box.appendChild(row);
  });

  showScreen("screen-results");
}

// ---------- VERSUS ----------

function showVsReady() {
  [0, 1].forEach(i => {
    document.getElementById("vs-ready-name-" + i).textContent = vsSetup[i].nickname;
    document.getElementById("vs-ready-mode-" + i).textContent =
      MODES[vsSetup[i].mode].emoji + " " + MODES[vsSetup[i].mode].label;
  });
  showScreen("screen-vs-ready");
}

function startVersus() {
  // Mêmes 10 défis pour les deux joueurs (sélection + objectifs communs),
  // mais chacun les reçoit dans un ordre différent.
  // En mode adulte, les objectifs du joueur passent tous "jusqu'en haut".
  const base = buildRun("enfant");
  vs = {
    players: vsSetup.map(p => ({
      nickname: p.nickname,
      mode: p.mode,
      routes: shuffle(base).map(r => ({ ...r, top: p.mode === "adulte" ? true : r.top })),
      idx: 0,
      times: [],
      revealed: [],
      reveals: 0,
      routeStart: 0,
      paused: false,
      pausedAt: 0,
      revealedThisRoute: false,
      done: false,
      total: 0,
    })),
  };
  [0, 1].forEach(i => {
    document.getElementById("vs-name-" + i).textContent = vs.players[i].nickname;
    document.getElementById("vs-timer-" + i).textContent = "0.0";
    document.getElementById("vs-finish-" + i).classList.add("hidden");
    document.getElementById("vs-pause-" + i).classList.add("hidden");
  });
  showScreen("screen-versus");
  runVsCountdown();
}

function runVsCountdown() {
  const overlay = document.getElementById("vs-countdown");
  const num = document.getElementById("vs-count-num");
  const seq = ["3", "2", "1", "GO !"];
  let k = 0;
  overlay.classList.remove("hidden");
  num.textContent = seq[0];
  const int = setInterval(() => {
    k++;
    if (k < seq.length) {
      num.textContent = seq[k];
      return;
    }
    clearInterval(int);
    overlay.classList.add("hidden");
    vsBegin();
  }, 900);
}

function vsBegin() {
  [0, 1].forEach(i => vsShowRoute(i));
  if (vsInterval) clearInterval(vsInterval);
  vsInterval = setInterval(updateVsTimers, 100);
}

function vsShowRoute(i) {
  const p = vs.players[i];
  const r = p.routes[p.idx];
  document.getElementById("vs-prog-" + i).textContent = (p.idx + 1) + "/" + NB_ROUTES;
  document.getElementById("vs-clue-" + i).textContent = r.clue;
  const obj = document.getElementById("vs-obj-" + i);
  if (r.top) {
    obj.textContent = "🚩 jusqu'en haut !";
    obj.className = "vs-obj top";
  } else {
    obj.textContent = "🎯 jusqu'au marqueur";
    obj.className = "vs-obj marker";
  }
  p.revealedThisRoute = false;
  document.getElementById("vs-reveal-" + i).disabled = false;
  p.routeStart = Date.now();
}

function updateVsTimers() {
  vs.players.forEach((p, i) => {
    if (p.done || p.paused) return;
    document.getElementById("vs-timer-" + i).textContent = ((Date.now() - p.routeStart) / 1000).toFixed(1);
  });
}

function vsDone(i) {
  const p = vs.players[i];
  if (p.done || p.paused) return;
  p.times.push((Date.now() - p.routeStart) / 1000);
  p.revealed.push(p.revealedThisRoute);
  p.idx++;
  if (p.idx >= NB_ROUTES) {
    p.done = true;
    p.total = p.times.reduce((a, b) => a + b, 0);
    const other = vs.players[1 - i];
    const fin = document.getElementById("vs-finish-" + i);
    fin.innerHTML =
      '<div class="vs-finish-emoji">🏁</div>' +
      '<div class="vs-finish-total">' + fmtTotal(p.total) + '</div>' +
      (other.done ? "" : '<div class="vs-finish-wait">En attente de l\'autre grimpeur...</div>');
    fin.classList.remove("hidden");
    if (other.done) {
      clearInterval(vsInterval);
      vsInterval = null;
      setTimeout(showVsResults, 1200);
    }
  } else {
    vsShowRoute(i);
  }
}

function vsReveal(i) {
  const p = vs.players[i];
  if (p.done || p.paused || p.revealedThisRoute) return;
  p.revealedThisRoute = true;
  p.reveals++;
  document.getElementById("vs-clue-" + i).textContent = "👉 « " + p.routes[p.idx].name + " »";
  document.getElementById("vs-reveal-" + i).disabled = true;
}

function vsPause(i) {
  const p = vs.players[i];
  if (p.done || p.paused) return;
  p.paused = true;
  p.pausedAt = Date.now();
  document.getElementById("vs-pause-" + i).classList.remove("hidden");
}

function vsResume(i) {
  const p = vs.players[i];
  if (!p.paused) return;
  p.routeStart += Date.now() - p.pausedAt;
  p.paused = false;
  document.getElementById("vs-pause-" + i).classList.add("hidden");
}

function abandonVersus() {
  if (!confirm("Arrêter le duel ?")) return;
  if (vsInterval) clearInterval(vsInterval);
  vsInterval = null;
  vs = null;
  showScreen("screen-home");
}

function showVsResults() {
  const [a, b] = vs.players;
  let title;
  if (a.total < b.total) title = "🏆 " + a.nickname + " gagne !";
  else if (b.total < a.total) title = "🏆 " + b.nickname + " gagne !";
  else title = "🤝 Égalité parfaite !";
  document.getElementById("vs-result-title").textContent = title;

  const cards = document.getElementById("vs-result-cards");
  cards.innerHTML = "";
  const best = Math.min(a.total, b.total);
  vs.players.forEach(p => {
    const card = document.createElement("div");
    card.className = "vs-card" + (p.total === best ? " winner" : "");
    card.innerHTML =
      '<div class="vs-card-name">' + (p.total === best ? "👑 " : "") + p.nickname + '</div>' +
      '<div class="vs-card-mode">' + MODES[p.mode].emoji + " " + MODES[p.mode].label + '</div>' +
      '<div class="vs-card-total">' + fmtTotal(p.total) + '</div>' +
      '<div class="vs-card-reveals">🙈 ' + p.reveals + " nom(s) révélé(s)</div>";
    cards.appendChild(card);
  });

  document.getElementById("vs-det-h1").textContent = a.nickname;
  document.getElementById("vs-det-h2").textContent = b.nickname;
  const det = document.getElementById("vs-result-details");
  det.innerHTML = "";
  a.routes.forEach((r, i) => {
    const j = b.routes.findIndex(x => x.name === r.name);
    const ta = a.times[i];
    const tb = b.times[j];
    const row = document.createElement("div");
    row.className = "detail-row vs-detail-row";
    row.innerHTML =
      '<span class="detail-name">' + r.name + '</span>' +
      '<span class="vs-t' + (ta <= tb ? " best" : "") + '">' + fmtRoute(ta) + (a.revealed[i] ? " 🙈" : "") + '</span>' +
      '<span class="vs-t' + (tb <= ta ? " best" : "") + '">' + fmtRoute(tb) + (b.revealed[j] ? " 🙈" : "") + '</span>';
    det.appendChild(row);
  });

  showScreen("screen-vs-results");
}

function vsRematch() {
  vsSetup = vs.players.map(p => ({ nickname: p.nickname, mode: p.mode }));
  startVersus();
}

// ---------- CLASSEMENT ----------

function showLeaderboard(origin) {
  leaderboardOrigin = origin;
  adminMode = false;
  renderLeaderboard();
  showScreen("screen-leaderboard");
}

function renderLeaderboard() {
  const lb = loadLeaderboard().filter(e => (e.site || "sqy") === currentSiteId);
  const box = document.getElementById("leaderboard-list");
  box.innerHTML = "";
  document.getElementById("lb-site").textContent = "📍 " + getSite().name;
  document.getElementById("btn-admin").classList.toggle("active", adminMode);
  document.getElementById("admin-hint").classList.toggle("hidden", !adminMode);
  document.getElementById("admin-tools").classList.toggle("hidden", !adminMode);

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
    const modeEmoji = MODES[e.mode || "enfant"].emoji;
    const reveals = e.reveals ? ' <span class="lb-reveals">🙈' + e.reveals + '</span>' : "";
    row.innerHTML =
      '<span class="lb-rank">' + (medals[i] || (i + 1)) + '</span>' +
      '<span class="lb-info"><span class="lb-name">' + modeEmoji + " " + e.nickname + '</span>' + reveals +
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

// ---------- EXPORT / IMPORT ----------

function openModal(title, hint, text, actions) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-hint").textContent = hint;
  const ta = document.getElementById("modal-text");
  ta.value = text;
  ta.readOnly = actions.some(a => a.readonly);
  const box = document.getElementById("modal-actions");
  box.innerHTML = "";
  for (const a of actions) {
    const btn = document.createElement("button");
    btn.className = "btn btn-small " + a.cls;
    btn.textContent = a.label;
    btn.onclick = a.fn;
    box.appendChild(btn);
  }
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function exportLeaderboard() {
  const data = {
    app: "happik-runner",
    version: APP_VERSION,
    exported: new Date().toISOString(),
    leaderboard: loadLeaderboard(),
  };
  const json = JSON.stringify(data, null, 2);
  const fname = "happik-scores-" + new Date().toISOString().slice(0, 10) + ".json";

  const actions = [
    { label: "📋 Copier", cls: "btn-blue", readonly: true, fn: () => copyExport(json) },
  ];
  if (navigator.share) {
    actions.push({ label: "📤 Partager", cls: "btn-green", readonly: true, fn: () => shareExport(json, fname) });
  }
  openModal("📤 Export des scores", "Copie ce texte et garde-le précieusement (mail, notes...). Tu pourras le réimporter plus tard.", json, actions);
}

async function copyExport(json) {
  try {
    await navigator.clipboard.writeText(json);
    alert("Scores copiés dans le presse-papier !");
  } catch {
    // repli : sélection manuelle
    const ta = document.getElementById("modal-text");
    ta.focus();
    ta.select();
    alert("Copie automatique impossible : le texte est sélectionné, copie-le manuellement.");
  }
}

async function shareExport(json, fname) {
  try {
    const file = new File([json], fname, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: fname });
      return;
    }
    await navigator.share({ title: fname, text: json });
  } catch {
    // partage annulé ou non supporté : la modale reste ouverte pour copier
  }
}

function openImport() {
  openModal(
    "📥 Importer des scores",
    "Colle ici le contenu d'un export JSON puis touche Importer. Les scores s'ajoutent sans écraser ceux déjà présents.",
    "",
    [{ label: "✅ Importer", cls: "btn-green", fn: doImport }]
  );
}

function doImport() {
  const txt = document.getElementById("modal-text").value.trim();
  let list;
  try {
    const parsed = JSON.parse(txt);
    list = Array.isArray(parsed) ? parsed : parsed.leaderboard;
    if (!Array.isArray(list)) throw new Error();
  } catch {
    alert("Contenu invalide : colle le texte complet d'un export de scores (.json).");
    return;
  }
  const valid = list.filter(e =>
    e && typeof e.id === "number" && typeof e.nickname === "string" &&
    typeof e.total === "number" && typeof e.date === "string"
  );
  const lb = loadLeaderboard();
  const ids = new Set(lb.map(e => e.id));
  const added = valid.filter(e => !ids.has(e.id));
  if (added.length === 0) {
    alert(valid.length === 0 ? "Aucun score valide trouvé dans ce texte." : "Rien à importer : ces scores sont déjà dans le classement.");
    return;
  }
  lb.push(...added);
  lb.sort((a, b) => a.total - b.total);
  saveLeaderboard(lb);
  closeModal();
  renderLeaderboard();
  alert(added.length + " score(s) importé(s) !");
}

// ---------- VERSION ----------

function renderVersionInfo() {
  document.getElementById("version-num").textContent = APP_VERSION;
  const box = document.getElementById("changelog");
  box.innerHTML = "";
  CHANGELOG.forEach(c => {
    const entry = document.createElement("div");
    entry.className = "changelog-entry";
    entry.innerHTML =
      '<span class="changelog-v">v' + c.v + '</span>' +
      '<ul>' + c.notes.map(n => "<li>" + n + "</li>").join("") + '</ul>';
    box.appendChild(entry);
  });
}

renderVersionInfo();
updateSiteLabel();
