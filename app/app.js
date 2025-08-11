const $ = (id) => document.getElementById(id);

function setText(id, text) { $(id).textContent = text; }
function log(msg) { const el = $('log'); el.textContent += `\n${new Date().toISOString()} — ${msg}`; el.scrollTop = el.scrollHeight; }

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
});

