const DEFAULT_ITEMS = [
  {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    label: 'Organisation Video',
    type: 'video',
    src: 'videos/Organisation.mp4',
    repoPath: 'videos/Organisation.mp4',
    x: 58,
    y: 41
  }
];

let items = [];
let dragState = null;

async function initData() {
  const saved = localStorage.getItem('fh2_hotspots');
  if (saved) {
    items = JSON.parse(saved);
    render();
    return;
  }
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error();
    items = await res.json();
  } catch {
    items = structuredClone(DEFAULT_ITEMS);
  }
  persist();
  render();
}

function persist() {
  localStorage.setItem('fh2_hotspots', JSON.stringify(items));
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function pointerToPercent(event, stage) {
  const rect = stage.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
  return { x, y };
}

function startDrag(event, itemId) {
  dragState = { itemId };
  event.preventDefault();
}

function onDrag(event) {
  if (!dragState) return;
  const stage = document.getElementById('editorStage');
  const coords = pointerToPercent(event, stage);
  const item = items.find(i => i.id === dragState.itemId);
  if (!item) return;
  item.x = Number(coords.x.toFixed(2));
  item.y = Number(coords.y.toFixed(2));
  persist();
  render();
}

function endDrag() {
  dragState = null;
}

function createMarker(item) {
  const btn = document.createElement('button');
  btn.className = `hotspot ${item.type}`;
  btn.style.left = `${item.x}%`;
  btn.style.top = `${item.y}%`;
  btn.dataset.label = item.label;
  btn.title = 'Drag to move';
  btn.addEventListener('mousedown', e => startDrag(e, item.id));
  return btn;
}

function updateField(id, field, value) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  if (field === 'x' || field === 'y') value = Number(value);
  item[field] = value;
  persist();
  render();
}

function deleteItem(id) {
  items = items.filter(i => i.id !== id);
  persist();
  render();
}

function addItem(type) {
  items.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    label: type === 'video' ? 'New Video' : 'New Image',
    type,
    src: type === 'video' ? 'videos/example.mp4' : 'images/example.jpg',
    repoPath: type === 'video' ? 'videos/example.mp4' : 'images/example.jpg',
    x: 50,
    y: 50
  });
  persist();
  render();
}

function exportJson() {
  const clean = items.map(({ id, label, type, src, repoPath, x, y }) => ({ id, label, type, src, repoPath, x, y }));
  const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  items = structuredClone(DEFAULT_ITEMS);
  persist();
  render();
}

function renderEditorList() {
  const list = document.getElementById('editorList');
  list.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'edit-card';
    card.innerHTML = `
      <label>Label</label>
      <input value="${item.label}" data-field="label" />
      <label>Type</label>
      <select data-field="type">
        <option value="image" ${item.type === 'image' ? 'selected' : ''}>Image</option>
        <option value="video" ${item.type === 'video' ? 'selected' : ''}>Video</option>
      </select>
      <label>File URL or repo path</label>
      <input value="${item.src}" data-field="src" />
      <label>Suggested repo path</label>
      <input value="${item.repoPath || ''}" data-field="repoPath" />
      <label>X position (%)</label>
      <input type="number" min="0" max="100" step="0.1" value="${item.x}" data-field="x" />
      <label>Y position (%)</label>
      <input type="number" min="0" max="100" step="0.1" value="${item.y}" data-field="y" />
      <div class="edit-actions">
        <button class="small-btn" data-copy="true">Center</button>
        <button class="small-btn danger" data-delete="true">Delete</button>
      </div>
    `;

    card.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', e => updateField(item.id, e.target.dataset.field, e.target.value));
    });
    card.querySelector('[data-copy="true"]').addEventListener('click', () => {
      updateField(item.id, 'x', 50);
      updateField(item.id, 'y', 50);
    });
    card.querySelector('[data-delete="true"]').addEventListener('click', () => deleteItem(item.id));
    list.appendChild(card);
  });
}

function render() {
  const layer = document.getElementById('editorHotspotLayer');
  layer.innerHTML = '';
  items.forEach(item => layer.appendChild(createMarker(item)));
  renderEditorList();
}

document.addEventListener('mousemove', onDrag);
document.addEventListener('mouseup', endDrag);
document.getElementById('addImageBtn').addEventListener('click', () => addItem('image'));
document.getElementById('addVideoBtn').addEventListener('click', () => addItem('video'));
document.getElementById('exportBtn').addEventListener('click', exportJson);
document.getElementById('resetBtn').addEventListener('click', resetDemo);

initData();
