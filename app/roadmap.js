// The platinum roadmap: six stages in the order to earn them, built from the
// official trophy descriptions. Each stage lists its trophies with the count
// already earned, so the roadmap doubles as a second progress view.
export function renderRoadmap(doc, earned, onOpenTrophy) {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const stage of doc.roadmap) {
    const items = doc.trophies.filter((t) => t.stage === stage.stage);
    const done = items.filter((t) => earned.has(t.name)).length;
    const li = document.createElement('li');
    li.className = 'roadmap-stage';

    const head = document.createElement('div');
    head.className = 'roadmap-head';
    const title = document.createElement('h3');
    title.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const count = document.createElement('span');
    count.className = 'roadmap-count';
    count.textContent = `${done} of ${items.length} earned`;
    head.append(title, count);

    const what = document.createElement('p');
    what.className = 'roadmap-what';
    what.textContent = stage.what;

    const list = document.createElement('ul');
    list.className = 'roadmap-trophies';
    for (const t of items) {
      const row = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'roadmap-trophy' + (earned.has(t.name) ? ' earned' : '');
      btn.addEventListener('click', () => onOpenTrophy(t.id));
      const mark = document.createElement('span');
      mark.className = 'roadmap-mark';
      mark.textContent = earned.has(t.name) ? '✓' : '○';
      const label = document.createElement('span');
      label.textContent = `${t.name} — ${t.grade}`;
      const flag = document.createElement('span');
      flag.className = 'roadmap-flag';
      flag.textContent = t.missable ? ' · possibly missable' : '';
      btn.append(mark, label, flag);
      row.append(btn);
      list.append(row);
    }

    li.append(head, what, list);
    host.append(li);
  }
}
