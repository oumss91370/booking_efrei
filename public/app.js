const state = {
  token: null,
  email: null,
};

const $ = (id) => document.getElementById(id);
const api = (path) => fetch(path, {
  headers: state.token ? { 'Authorization': `Bearer ${state.token}` } : {},
});
const apiJson = (path, method = 'GET', body) => fetch(path, {
  method,
  headers: {
    'Content-Type': 'application/json',
    ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {}),
  },
  body: body ? JSON.stringify(body) : undefined,
});

function saveAuth() {
  if (state.token) localStorage.setItem('eb_token', state.token);
  if (state.email) localStorage.setItem('eb_email', state.email);
}
function loadAuth() {
  state.token = localStorage.getItem('eb_token');
  state.email = localStorage.getItem('eb_email');
}

function setAuthState() {
  $('auth-state').textContent = state.token ? 'Connecté' : 'Non connecté';
  $('user-email').textContent = state.email ? `(${state.email})` : '';
}

async function onRegister(e) {
  e.preventDefault();
  const email = $('reg-email').value.trim();
  const username = $('reg-username').value.trim();
  const password = $('reg-password').value;
  const r = await apiJson('/api/auth/register', 'POST', { email, username, password });
  const j = await r.json().catch(()=>({}));
  $('reg-msg').textContent = r.ok ? 'Compte créé.' : (j.message || 'Erreur');
  if (r.ok) {
    state.token = j.token;
    state.email = j.user?.email || email;
    saveAuth(); setAuthState();
  }
}

async function onLogin(e) {
  e.preventDefault();
  const email = $('login-email').value.trim();
  const password = $('login-password').value;
  const r = await apiJson('/api/auth/login', 'POST', { email, password });
  const j = await r.json().catch(()=>({}));
  if (r.ok) {
    state.token = j.token;
    state.email = j.user?.email || email;
    $('login-msg').textContent = 'Connecté.';
    saveAuth(); setAuthState();
  } else {
    $('login-msg').textContent = j.message || 'Erreur';
  }
}

function onLogout() {
  state.token = null; state.email = null;
  localStorage.removeItem('eb_token');
  localStorage.removeItem('eb_email');
  setAuthState();
}

function renderRooms(list) {
  const c = $('rooms-list');
  c.innerHTML = '';
  list.forEach(r => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<div><strong>${r.name}</strong> <span class="muted">#${r.id}</span><br/>Capacité: ${r.capacity} · Équipements: ${(r.amenities||[]).join(', ')}</div>
    <button data-room-id="${r.id}" class="btn-use-room">Utiliser id</button>`;
    c.appendChild(div);
  });
  c.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.btn-use-room');
    if (btn) {
      const id = btn.getAttribute('data-room-id');
      $('booking-room-id').value = id;
    }
  }, { once: true });
}

async function listRooms() {
  const r = await api('/api/rooms');
  const j = await r.json();
  $('rooms-out').textContent = JSON.stringify(j, null, 2);
  renderRooms(j);
}

async function listAvailable() {
  let startInput = $('avail-start').value;
  let endInput = $('avail-end').value;
  let start = startInput ? new Date(startInput).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString();
  let end = endInput ? new Date(endInput).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const url = `/api/rooms/available?start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}`;
  const r = await api(url);
  const j = await r.json();
  $('rooms-out').textContent = JSON.stringify(j, null, 2);
  renderRooms(j);
}

async function createRoom(e) {
  e.preventDefault();
  const name = $('room-name').value.trim();
  const capacity = Number($('room-capacity').value);
  const amenities = $('room-amenities').value.split(',').map(s => s.trim()).filter(Boolean);
  const r = await apiJson('/api/rooms', 'POST', { name, capacity, amenities });
  const j = await r.json().catch(()=>({}));
  $('room-msg').textContent = r.ok ? `Salle créée id=${j.id}` : (j.message || 'Erreur');
  if (r.ok) listRooms();
}

async function createBooking(e) {
  e.preventDefault();
  const room_id = Number($('booking-room-id').value);
  const startVal = $('booking-start').value; const endVal = $('booking-end').value;
  if (!startVal || !endVal) { $('booking-msg').textContent = 'Dates requises'; return; }
  const start_time = new Date(startVal).toISOString();
  const end_time = new Date(endVal).toISOString();
  const r = await apiJson('/api/bookings', 'POST', { room_id, start_time, end_time });
  const j = await r.json().catch(()=>({}));
  $('booking-msg').textContent = r.ok ? `Réservation id=${j.id}` : (j.message || 'Erreur');
  if (r.ok) listMine();
}

function renderBookings(list) {
  const c = $('bookings-list');
  c.innerHTML = '';
  list.forEach(b => {
    const div = document.createElement('div');
    div.className = 'item';
    const st = new Date(b.start_time).toLocaleString();
    const et = new Date(b.end_time).toLocaleString();
    const roomName = b.room_name || b.rooms?.name || b.room_id;
    div.innerHTML = `<div><strong>Booking #${b.id}</strong> · Salle: ${roomName}<br/><span class="muted">${st} → ${et}</span></div>
    <button data-booking-id="${b.id}" class="btn-cancel-booking">Annuler</button>`;
    c.appendChild(div);
  });
  c.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.btn-cancel-booking');
    if (btn) {
      const id = btn.getAttribute('data-booking-id');
      const r = await apiJson(`/api/bookings/${id}`, 'DELETE');
      if (r.ok) {
        listMine();
      } else {
        const j = await r.json().catch(()=>({}));
        alert(j.message || 'Erreur annulation');
      }
    }
  }, { once: true });
}

async function listMine() {
  const r = await api('/api/bookings/mine');
  const j = await r.json();
  renderBookings(j);
}

function initDefaults() {
  // Set default availability to next 1h window
  const now = new Date();
  const start = new Date(now.getTime() + 60*60*1000);
  const end = new Date(now.getTime() + 2*60*60*1000);
  $('avail-start').value = start.toISOString().slice(0,16);
  $('avail-end').value = end.toISOString().slice(0,16);
  $('booking-start').value = start.toISOString().slice(0,16);
  $('booking-end').value = end.toISOString().slice(0,16);
}

function init() {
  loadAuth();
  setAuthState();
  initDefaults();
  // Tabs
  function showTab(name) {
    const pages = document.querySelectorAll('.page');
    const tabs = document.querySelectorAll('.tab');
    pages.forEach(p => p.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    const page = document.getElementById(`page-${name}`);
    const tab = document.querySelector(`.tab[data-tab="${name}"]`);
    if (page) page.classList.add('active');
    if (tab) tab.classList.add('active');
  }
  function applyHash() {
    const name = (location.hash.replace('#','') || 'auth');
    showTab(name);
  }
  document.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const name = el.getAttribute('data-tab');
      history.pushState({}, '', `#${name}`);
      showTab(name);
    });
  });
  window.addEventListener('popstate', applyHash);
  applyHash();
  $('form-register').addEventListener('submit', onRegister);
  $('form-login').addEventListener('submit', onLogin);
  $('btn-logout').addEventListener('click', onLogout);

  $('btn-rooms').addEventListener('click', listRooms);
  $('btn-rooms-available').addEventListener('click', listAvailable);
  $('form-create-room').addEventListener('submit', createRoom);

  $('form-create-booking').addEventListener('submit', createBooking);
  $('btn-mine').addEventListener('click', listMine);
}

document.addEventListener('DOMContentLoaded', init);
