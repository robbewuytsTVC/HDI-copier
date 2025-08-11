const $ = (id) => document.getElementById(id);

function setText(id, text) { $(id).textContent = text; }
function log(msg) { const el = $('log'); el.textContent += `\n${new Date().toISOString()} — ${msg}`; el.scrollTop = el.scrollHeight; }

// Local storage helpers
const STORAGE_KEY = 'hdi-data-copier-schemas-v1';
const PRESETS_KEY = 'hdi-data-copier-presets-v1';
function loadSavedSchemas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveSchemas(sourceSchema, targetSchema) {
  const data = loadSavedSchemas();
  const add = (arr = [], val) => {
    if (!val) return arr || [];
    const next = [val, ...(arr || []).filter(v => v !== val)];
    return next.slice(0, 10);
  };
  const next = {
    sources: add(data.sources, sourceSchema),
    targets: add(data.targets, targetSchema),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  populateDatalists();
}
function populateDatalists() {
  const data = loadSavedSchemas();
  const srcList = $('sourceSchemaList');
  const tgtList = $('targetSchemaList');
  if (!srcList || !tgtList) return;
  srcList.innerHTML = '';
  tgtList.innerHTML = '';
  (data.sources || []).forEach(v => {
    const o = document.createElement('option'); o.value = v; srcList.appendChild(o);
  });
  (data.targets || []).forEach(v => {
    const o = document.createElement('option'); o.value = v; tgtList.appendChild(o);
  });
}

// Presets helpers
function loadPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}'); } catch { return {}; }
}
function savePreset(name, sourceSchema, targetSchema, differentEnv) {
  if (!name) throw new Error('Preset name required');
  const presets = loadPresets();
  presets[name] = { sourceSchema, targetSchema, differentEnv: !!differentEnv };
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  populatePresetSelect();
}
function deletePreset(name) {
  const presets = loadPresets();
  delete presets[name];
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  populatePresetSelect();
}
function populatePresetSelect() {
  const sel = $('presetSelect');
  if (!sel) return;
  const presets = loadPresets();
  const names = Object.keys(presets).sort((a,b) => a.localeCompare(b));
  sel.innerHTML = '';
  names.forEach(n => {
    const opt = document.createElement('option'); opt.value = n; opt.textContent = n; sel.appendChild(opt);
  });
}

async function loadTables() {
  const sourceSchema = $('sourceSchema').value.trim();
  const targetSchema = $('targetSchema').value.trim();
  if (!sourceSchema || !targetSchema) {
    alert('Provide source and target schema');
    return;
  }
  const btn = $('btnLoad');
  btn.disabled = true; setText('status', 'Loading...'); setText('count', '');
  $('tables').innerHTML = '';
  try {
    const isDiff = document.getElementById('differentEnv').checked;
    const endpoint = isDiff ? 'compareTablesDiffEnv' : 'compareSchemas';
    const url = `/odata/v4/copy/${endpoint}(sourceSchema='${encodeURIComponent(sourceSchema)}',targetSchema='${encodeURIComponent(targetSchema)}')`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    const tables = json.value?.presentTables ?? json.presentTables ?? [];
    const container = $('tables');
    for (const t of tables) {
      const id = `t_${t}`;
      const wrapper = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = t; cb.id = id;
      const text = document.createTextNode(` ${t}`);
      wrapper.appendChild(cb); wrapper.appendChild(text);
      container.appendChild(wrapper);
    }
    $('btnCopy').disabled = tables.length === 0;
    setText('count', `${tables.length} tables`);
    setText('status', 'Loaded');
    log(`Loaded ${tables.length} tables`);
  } catch (e) {
    setText('status', 'Error');
    log(`Error loading tables: ${e.message}`);
    alert(e.message);
  } finally {
    btn.disabled = false;
  }
}

function getSelectedTables() {
  return Array.from(document.querySelectorAll('#tables input[type="checkbox"]:checked')).map(el => el.value);
}

function selectAll(select) {
  const boxes = Array.from(document.querySelectorAll('#tables input[type="checkbox"]'));
  for (const b of boxes) b.checked = select;
}

async function copySelected() {
  const sourceSchema = $('sourceSchema').value.trim();
  const targetSchema = $('targetSchema').value.trim();
  const tables = getSelectedTables();
  if (!sourceSchema || !targetSchema) { alert('Provide source and target schema'); return; }
  if (tables.length === 0) { alert('Select at least one table'); return; }
  const btn = $('btnCopy');
  btn.disabled = true; setText('copyStatus', 'Copying...');
  try {
    const isDiff = document.getElementById('differentEnv').checked;
    const endpoint = isDiff ? '/odata/v4/copy/copySelectedTablesDifferentEnv' : '/odata/v4/copy/copySelectedTables';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sourceSchema, targetSchema, tables })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || res.statusText);
    const rows = (json.value ?? json).reduce((acc, r) => acc + (r.rows || 0), 0);
    setText('copyStatus', 'Done');
    log(`Copied ${tables.length} tables; ${rows} total rows`);
  } catch (e) {
    setText('copyStatus', 'Error');
    log(`Copy failed: ${e.message}`);
    alert(e.message);
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('btnLoad').addEventListener('click', loadTables);
  $('btnCopy').addEventListener('click', copySelected);
  $('btnSelectAll').addEventListener('click', () => selectAll(true));
  $('btnClear').addEventListener('click', () => selectAll(false));
  // Save schemas
  const save = () => saveSchemas($('sourceSchema').value.trim(), $('targetSchema').value.trim());
  $('btnSaveSchemas')?.addEventListener('click', save);
  $('btnClearSchemas')?.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); populateDatalists(); });
  // Presets
  $('btnSavePreset')?.addEventListener('click', () => {
    const name = $('presetName').value.trim();
    try {
      savePreset(name, $('sourceSchema').value.trim(), $('targetSchema').value.trim(), $('differentEnv').checked);
      log(`Saved preset '${name}'`);
    } catch (e) { alert(e.message); }
  });
  $('btnDeletePreset')?.addEventListener('click', () => {
    const sel = $('presetSelect');
    const name = sel?.value;
    if (!name) { alert('Select a preset to delete'); return; }
    deletePreset(name);
    log(`Deleted preset '${name}'`);
  });
  $('btnApplyPreset')?.addEventListener('click', () => {
    const sel = $('presetSelect');
    const name = sel?.value;
    if (!name) { alert('Select a preset to apply'); return; }
    const p = loadPresets()[name];
    if (!p) { alert('Preset not found'); return; }
    $('sourceSchema').value = p.sourceSchema || '';
    $('targetSchema').value = p.targetSchema || '';
    $('differentEnv').checked = !!p.differentEnv;
    log(`Applied preset '${name}'`);
  });
  populatePresetSelect();
  populateDatalists();
  // Prefill with last used
  const last = loadSavedSchemas();
  if (last.sources?.[0]) $('sourceSchema').value = last.sources[0];
  if (last.targets?.[0]) $('targetSchema').value = last.targets[0];
});

