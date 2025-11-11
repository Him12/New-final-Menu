// orders.js
const API_BASE = (window.AppConfig && window.AppConfig.API_BASE) || ""; // set same as menu-api.js
const RESTAURANT = (new URLSearchParams(window.location.search)).get('restaurant') || '12345';
document.getElementById('restId').textContent = RESTAURANT;

const ordersRoot = document.getElementById('ordersRoot');
const refreshBtn = document.getElementById('refreshBtn');
const autoPollCheckbox = document.getElementById('autoPoll');

async function fetchOrders() {
  try {
    const url = `${API_BASE || ''}/api/orders?restaurant_number=${encodeURIComponent(RESTAURANT)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`${res.status} ${t}`);
    }
    const json = await res.json();
    if (!json.success) throw new Error(JSON.stringify(json));
    renderOrders(json.orders || []);
  } catch (err) {
    console.error('fetchOrders error', err);
    ordersRoot.innerHTML = `<div style="color:crimson">Failed to fetch orders: ${err.message}</div>`;
  }
}

function renderOrders(list) {
  if (!list || list.length === 0) {
    ordersRoot.innerHTML = '<div style="grid-column:1/-1">No orders yet</div>';
    return;
  }

  ordersRoot.innerHTML = list.map(orderCardHtml).join('');
  // attach listeners
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', onActionClick);
  });
}

function orderCardHtml(o){
  // format items pretty
  let itemsHtml = '';
  try {
    const items = o.items || [];
    if (typeof items === 'string') items = JSON.parse(items);
    itemsHtml = (items.length ? items.map(it => `<div>${it.qty||1}× ${it.name || it.id || ''} <small style="color:#666">₹${it.price||''}</small></div>`) : '<div style="color:#666">No items</div>');
  } catch(e) {
    itemsHtml = `<div style="color:crimson">Invalid items: ${e.message}</div>`;
  }

  const placed = o.placed_at ? new Date(o.placed_at).toLocaleString() : (o.created_at ? new Date(o.created_at).toLocaleString() : '');
  return `
    <div class="card" data-id="${o.id}">
      <div class="meta">
        <div><strong>Order #${o.id}</strong> <small style="color:#666">Table: ${o.table_no || o.table_number || o.table || '—'}</small></div>
        <div class="status">${o.status || 'pending'}</div>
      </div>
      <div style="margin-top:8px">${itemsHtml}</div>
      <div style="margin-top:8px;font-weight:700">Total: ₹${o.total || '0.00'}</div>
      <div style="margin-top:10px;display:flex;align-items:center;">
        <button class="btn-action" data-action="in_progress">Start</button>
        <button class="btn-action" data-action="served">Serve</button>
        <button class="btn-action" data-action="completed">Complete</button>
        <button class="btn-action btn-danger" data-action="cancel">Cancel</button>
        <div style="margin-left:auto;color:#666;font-size:12px">${placed}</div>
      </div>
    </div>
  `;
}

async function onActionClick(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const card = btn.closest('.card');
  const id = card.dataset.id;

  let statusValue = null;
  if (action === 'in_progress') statusValue = 'in_progress';
  if (action === 'served') statusValue = 'served';
  if (action === 'completed') statusValue = 'completed';
  if (action === 'cancel') statusValue = 'cancelled';

  if (!statusValue) return;

  btn.disabled = true;
  try {
    const res = await fetch(`${API_BASE || ''}/api/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusValue })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(JSON.stringify(json));
    // optimistically refresh
    await fetchOrders();
  } catch (err) {
    console.error('update order error', err);
    alert('Failed to update order: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

// manual refresh
refreshBtn.addEventListener('click', fetchOrders);

// poll every 5s if enabled
let pollTimer = null;
function startPoll(){
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(()=> {
    if (autoPollCheckbox.checked) fetchOrders();
  }, 5000);
}
autoPollCheckbox.addEventListener('change', startPoll);

// initial load
fetchOrders();
startPoll();
