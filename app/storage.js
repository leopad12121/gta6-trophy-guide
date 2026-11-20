// Progress storage for the GTA VI trophy tracker: earned trophies live in
// localStorage, and can be exported to a file and imported back. The file
// format is a JSON array of trophy names, so it is easy to read and to move
// between browsers. Import only accepts names from the official list.
const EARNED_KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoilers-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

export function loadSpoilersHidden() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoilersHidden(hidden) {
  localStorage.setItem(SPOILER_KEY, hidden ? '1' : '0');
}

// Download the earned set as a JSON file the import below can read back.
export function exportEarned(earned) {
  const blob = new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort() }, null, 2)],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Read an exported file and return the earned names it holds, keeping only
// names that are on the official list. Throws a readable error on bad input.
export async function importEarned(file, validNames) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    throw new Error('That file does not hold a list of trophy names.');
  }
  const valid = new Set(validNames);
  const kept = names.filter((n) => typeof n === 'string' && valid.has(n));
  const dropped = names.length - kept.length;
  return { earned: new Set(kept), kept: kept.length, dropped };
}
