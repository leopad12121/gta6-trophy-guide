// GTA VI trophy guide and tracker: a checklist of the 55 official trophies
// with a guide and sources for each, filters, a spoiler setting, a platinum
// roadmap and progress saved in the browser. Static files only — the only
// thing it fetches is its own data/trophies.json, and it makes no other
// network request.
import { loadEarned, saveEarned, loadSpoilersHidden, saveSpoilersHidden, exportEarned, importEarned } from './storage.js';
import { renderRoadmap } from './roadmap.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = loadEarned();
let spoilerHidden = loadSpoilersHidden();
let kindFilter = 'all';
let gradeFilter = 'all';
let earnedFilter = 'all';
let query = '';
let selectedId = null;

const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCounts = document.getElementById('gradeCounts');
const listMeta = document.getElementById('listMeta');
const emptyState = document.getElementById('emptyState');
const spoilerBox = document.getElementById('spoiler');

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

// A story trophy is spoiled when its name or description would give away the
// plot; while the spoiler setting is on and it is not earned yet, the list
// and the detail panel show a placeholder instead.
function isSpoiled(t) {
  return spoilerHidden && t.kind === 'story' && !earned.has(t.name);
}

function matchesFilters(t) {
  if (kindFilter === 'story' && t.kind !== 'story') return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'collectibles' && t.kind !== 'collectibles') return false;
  if (kindFilter === 'activities' && t.kind !== 'activities') return false;
  if (kindFilter === 'online') return false; // all 55 trophies are offline
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (earnedFilter === 'earned' && !earned.has(t.name)) return false;
  if (earnedFilter === 'remaining' && earned.has(t.name)) return false;
  if (query) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.group}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function gradeBadge(grade) {
  const s = document.createElement('span');
  s.className = `grade grade-${grade}`;
  s.textContent = gradeLabel(grade);
  return s;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressText.textContent = `${done} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.name)).length;
    return `${got}/${inGrade.length} ${g}`;
  });
  gradeCounts.textContent = parts.join(' · ');
}

function renderList() {
  const visible = trophies.filter(matchesFilters);
  rowsEl.replaceChildren();
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (earned.has(t.name) ? ' is-earned' : '') + (t.id === selectedId ? ' is-selected' : '');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${isSpoiled(t) ? 'hidden story trophy' : t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned(earned);
      renderAll();
    });

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'trophy-main';
    main.addEventListener('click', () => selectTrophy(t.id, true));

    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = isSpoiled(t) ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = isSpoiled(t) ? 'Earn it in the game to reveal its name and description.' : t.description;
    main.append(name, desc);

    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.append(gradeBadge(t.grade));
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'tag tag-hidden';
      h.textContent = 'Hidden';
      meta.append(h);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag tag-missable';
      m.textContent = 'Possibly missable';
      meta.append(m);
    }

    li.append(box, main, meta);
    rowsEl.append(li);
  }
  emptyState.hidden = visible.length !== 0;
  listMeta.textContent = kindFilter === 'online'
    ? 'No online trophies: all 55 are earned offline in story mode (PlayStation FAQ via GTABase).'
    : `Showing ${visible.length} of ${trophies.length} trophies.`;
}

function renderDetail() {
  const t = selectedId == null ? null : byId.get(selectedId);
  detailEl.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its guide and sources.';
    detailEl.append(p);
    return;
  }
  const spoiled = isSpoiled(t);

  const head = document.createElement('div');
  head.className = 'detail-head';
  const title = document.createElement('h2');
  title.textContent = spoiled ? 'Hidden story trophy' : t.name;
  head.append(title, gradeBadge(t.grade));
  detailEl.append(head);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = spoiled ? 'This trophy is hidden on PlayStation until earned. Turn off “Hide story spoilers” above, or earn it in the game, to see it.' : `Official description: “${t.description}”`;
  detailEl.append(desc);

  const facts = document.createElement('dl');
  facts.className = 'detail-facts';
  const factRows = [
    ['Grade', gradeLabel(t.grade)],
    ['Kind', t.kind === 'story' ? 'Story' : t.kind === 'collectibles' ? 'Collectibles' : 'Activities'],
    ['Hidden on PS5', t.hidden ? 'Yes — hidden until earned' : 'No — visible from the start'],
    ['Missable', t.missable ? 'Possibly — see the guide' : 'No'],
    ['Roadmap stage', `Stage ${t.stage} — ${doc.roadmap[t.stage - 1].title}`],
  ];
  for (const [k, v] of factRows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    facts.append(dt, dd);
  }
  detailEl.append(facts);

  if (spoiled) return;

  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'How to earn it';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  detailEl.append(guideTitle, guide);

  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'detail-sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    srcList.append(li);
  }
  const note = document.createElement('li');
  note.textContent = 'Official names, descriptions and grades: the PS5 trophy list as published on PSNProfiles and Exophase.';
  srcList.append(note);
  detailEl.append(srcTitle, srcList);

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'detail-clear';
  clear.textContent = 'Close guide';
  clear.addEventListener('click', () => selectTrophy(null, true));
  detailEl.append(clear);
}

function selectTrophy(id, updateHash) {
  selectedId = id;
  if (updateHash) {
    const url = new URL(location.href);
    if (id == null) url.hash = '';
    else url.hash = `trophy=${id}`;
    history.replaceState(null, '', url);
  }
  renderList();
  renderDetail();
}

function openRoadmap() {
  document.getElementById('checklistView').hidden = true;
  document.getElementById('roadmapView').hidden = false;
  document.getElementById('tabChecklist').classList.remove('active');
  document.getElementById('tabRoadmap').classList.add('active');
  renderRoadmap(doc, earned, (id) => {
    openChecklist();
    selectTrophy(id, true);
    document.getElementById('detail').scrollIntoView({ block: 'nearest' });
  });
}

function openChecklist() {
  document.getElementById('roadmapView').hidden = true;
  document.getElementById('checklistView').hidden = false;
  document.getElementById('tabRoadmap').classList.remove('active');
  document.getElementById('tabChecklist').classList.add('active');
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  if (!document.getElementById('roadmapView').hidden) {
    renderRoadmap(doc, earned, (id) => {
      openChecklist();
      selectTrophy(id, true);
    });
  }
}

// Controls
document.getElementById('kindChips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-kind]');
  if (!btn) return;
  kindFilter = btn.dataset.kind;
  for (const b of document.querySelectorAll('#kindChips .chip')) b.classList.toggle('active', b === btn);
  renderList();
});
document.getElementById('grade').addEventListener('change', (e) => { gradeFilter = e.target.value; renderList(); });
document.getElementById('earnedFilter').addEventListener('change', (e) => { earnedFilter = e.target.value; renderList(); });
document.getElementById('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderList(); });
spoilerBox.checked = spoilerHidden;
spoilerBox.addEventListener('change', () => {
  spoilerHidden = spoilerBox.checked;
  saveSpoilersHidden(spoilerHidden);
  renderAll();
});
document.getElementById('export').addEventListener('click', () => exportEarned(earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const result = await importEarned(file, trophies.map((t) => t.name));
    earned = result.earned;
    saveEarned(earned);
    renderAll();
    alert(`Imported ${result.kept} earned trophies${result.dropped ? ` (${result.dropped} names were not on the list and were skipped)` : ''}.`);
  } catch (err) {
    alert(err.message);
  }
  e.target.value = '';
});
document.getElementById('tabChecklist').addEventListener('click', openChecklist);
document.getElementById('tabRoadmap').addEventListener('click', openRoadmap);
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open-trophy]');
  if (!btn) return;
  openChecklist();
  selectTrophy(Number(btn.dataset.openTrophy), true);
  document.getElementById('detail').scrollIntoView({ block: 'nearest' });
});

// Deep link: #trophy=<id> opens that trophy's guide, #view=roadmap opens the roadmap.
const hash = new URLSearchParams(location.hash.slice(1));
if (hash.get('view') === 'roadmap') openRoadmap();
const linked = Number(hash.get('trophy'));
if (byId.has(linked)) selectTrophy(linked, false);

renderAll();
