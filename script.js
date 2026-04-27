const DEMO_DATA = [
  {
    id: 'organisation-video',
    label: 'Organisation Video',
    type: 'video',
    src: 'videos/Organisation.mp4',
    x: 58,
    y: 41
  }
];

async function loadData() {
  try {
    const saved = localStorage.getItem('fh2_hotspots');
    if (saved) return JSON.parse(saved);
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No data.json yet');
    return await res.json();
  } catch {
    return DEMO_DATA;
  }
}

function createHotspot(item, onClick) {
  const btn = document.createElement('button');
  btn.className = `hotspot ${item.type}`;
  btn.style.left = `${item.x}%`;
  btn.style.top = `${item.y}%`;
  btn.dataset.label = item.label;
  btn.title = item.label;
  btn.addEventListener('click', () => onClick(item));
  return btn;
}

function openModal(item) {
  const modal = document.getElementById('mediaModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');
  title.textContent = item.label;
  content.innerHTML = '';

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.src = item.src;
    content.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.label;
    content.appendChild(img);
  }

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = item.repoPath ? `Suggested repo path: ${item.repoPath}` : 'Replace demo URLs with files from your GitHub repo for the public site.';
  content.appendChild(note);

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('mediaModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = '';
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function renderList(items) {
  const list = document.getElementById('itemList');
  list.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <strong>${item.label}</strong>
      <p class="note">${item.type.toUpperCase()} • ${item.repoPath || item.src}</p>
    `;
    const btn = document.createElement('button');
    btn.className = 'primary-btn';
    btn.textContent = item.type === 'video' ? 'Play' : 'Open';
    btn.addEventListener('click', () => openModal(item));
    card.appendChild(btn);
    list.appendChild(card);
  });
}

(async function init() {
  const items = await loadData();
  const layer = document.getElementById('hotspotLayer');
  items.forEach(item => layer.appendChild(createHotspot(item, openModal)));
  renderList(items);

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.querySelector('[data-close="true"]').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();
