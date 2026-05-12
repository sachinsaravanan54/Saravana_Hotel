/* ====== admin.js — Admin Dashboard ====== */

let currentTab = 'live';
let allOrders = [];
let refreshInterval;
let countdown = 10;

// ====== LOGIN ======
async function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  const errorEl = document.getElementById('loginError');

  if (!pass) {
    errorEl.textContent = 'Please enter the password.';
    return;
  }

  try {
    const { ok } = await adminLoginAPI(pass);
    if (ok) {
      sessionStorage.setItem('admin_auth', 'true');
      showDashboard();
    } else {
      errorEl.textContent = '❌ Incorrect password. Try again.';
      document.getElementById('adminPass').value = '';
    }
  } catch (err) {
    // Server offline — allow with correct hardcoded password for demo
    if (pass === 'Sachin54') {
      sessionStorage.setItem('admin_auth', 'true');
      showDashboard();
    } else {
      errorEl.textContent = '❌ Incorrect password.';
    }
  }
}

function adminLogout() {
  sessionStorage.removeItem('admin_auth');
  clearInterval(refreshInterval);
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('adminWrapper').style.display = 'none';
  document.getElementById('adminPass').value = '';
  document.getElementById('loginError').textContent = '';
}

function showDashboard() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('adminWrapper').style.display = 'flex';
  loadOrders();
  startAutoRefresh();
}

// ====== AUTO REFRESH ======
function startAutoRefresh() {
  clearInterval(refreshInterval);
  countdown = 10;
  refreshInterval = setInterval(() => {
    countdown--;
    const el = document.getElementById('refreshTimer');
    if (el) el.textContent = `${countdown}s`;
    if (countdown <= 0) {
      loadOrders();
      countdown = 10;
    }
  }, 1000);
}

// ====== TABS ======
function showTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tab === 'live' ? 'btnLive' : 'btnHistory').classList.add('active');

  const tabTitle = document.getElementById('tabTitle');
  const tabSub = document.getElementById('tabSub');
  if (tabTitle) tabTitle.textContent = tab === 'live' ? 'Live Orders' : 'Order History';
  if (tabSub) tabSub.textContent = tab === 'live'
    ? 'Orders refresh automatically every 10 seconds'
    : 'All completed and past orders';

  renderOrders();
}

// ====== FETCH ORDERS ======
async function loadOrders() {
  try {
    allOrders = await fetchOrdersAPI();
  } catch (err) {
    console.warn('Could not fetch orders from server. Showing demo data.');
    // Demo data when server is offline
    if (allOrders.length === 0) {
      allOrders = [];
    }
  }
  renderOrders();
  updateStats();
}

function renderOrders() {
  const loading = document.getElementById('loadingOrders');
  const empty = document.getElementById('ordersEmpty');
  const tableWrap = document.getElementById('ordersTableWrap');
  const tbody = document.getElementById('ordersTableBody');

  if (loading) loading.style.display = 'none';

  let filtered = currentTab === 'live'
    ? allOrders.filter(o => o.status !== 'completed')
    : allOrders.filter(o => o.status === 'completed');

  // Update live count badge
  const liveCount = document.getElementById('liveCount');
  if (liveCount) liveCount.textContent = allOrders.filter(o => o.status !== 'completed').length;

  if (filtered.length === 0) {
    if (empty) empty.style.display = 'block';
    if (tableWrap) tableWrap.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (tableWrap) tableWrap.style.display = 'block';

  if (tbody) {
    tbody.innerHTML = filtered.map(order => {
      const itemTags = order.items.map(i =>
        `<span class="order-item-tag">${i.quantity}× ${i.name}</span>`
      ).join('');

      const time = new Date(order.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short'
      });

      const statusMap = {
        pending: { label: '⏳ Pending', cls: 'status-pending' },
        preparing: { label: '🍳 Preparing', cls: 'status-preparing' },
        completed: { label: '✅ Done', cls: 'status-completed' }
      };
      const { label, cls } = statusMap[order.status] || statusMap.pending;

      const shortId = String(order._id).slice(-6).toUpperCase();

      const messageBtn = order.mobileNumber ? `<a href="https://wa.me/91${order.mobileNumber}?text=Hi ${order.customerName || 'Customer'}, your order %23${shortId} from Sri Saravana Hotel is currently ${order.status}." target="_blank" class="act-btn" style="background: rgba(37, 211, 102, 0.1); color: #25D366; text-decoration: none; display: inline-flex; align-items: center;">💬 Msg</a>` : '';

      const actionBtns = order.status !== 'completed' ? `
        ${order.status === 'pending' ? `<button class="act-btn act-btn-prepare" onclick="changeStatus('${order._id}', 'preparing')">🍳 Prepare</button>` : ''}
        <button class="act-btn act-btn-complete" onclick="changeStatus('${order._id}', 'completed')">✅ Done</button>
        ${messageBtn}
      ` : `
        <button class="act-btn act-btn-delete" onclick="deleteOrder('${order._id}')">🗑️ Delete</button>
        ${messageBtn}
      `;

      return `
        <tr>
          <td><span class="order-id-cell">#${shortId}</span></td>
          <td>
            ${order.customerName || 'Guest'}
            ${order.mobileNumber ? `<br><small style="color:var(--text-light)">📞 ${order.mobileNumber}</small>` : ''}
            ${order.tableNumber ? `<br><small style="color:var(--text-light)">${order.tableNumber}</small>` : ''}
          </td>
          <td class="order-items-cell">${itemTags}</td>
          <td class="order-total-cell">₹${order.total}</td>
          <td class="order-time">${time}<br>${date}</td>
          <td><span class="status-badge ${cls}">${label}</span></td>
          <td><div class="action-btns">${actionBtns}</div></td>
        </tr>`;
    }).join('');
  }
}

function updateStats() {
  const pending = allOrders.filter(o => o.status === 'pending').length;
  const preparing = allOrders.filter(o => o.status === 'preparing').length;
  const completed = allOrders.filter(o => o.status === 'completed').length;
  const revenue = allOrders.reduce((sum, o) => sum + o.total, 0);

  const s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  s('statPending', pending);
  s('statPreparing', preparing);
  s('statCompleted', completed);
  s('statRevenue', `₹${revenue}`);
}

async function changeStatus(id, status) {
  try {
    await updateOrderStatusAPI(id, status);
    const order = allOrders.find(o => o._id === id);
    if (order) order.status = status;
    renderOrders();
    updateStats();
    showToast(`Order marked as ${status}`, 'success');
  } catch (err) {
    // Offline fallback
    const order = allOrders.find(o => o._id === id);
    if (order) order.status = status;
    renderOrders();
    updateStats();
    showToast(`Order marked as ${status}`, 'success');
  }
}

async function deleteOrder(id) {
  if (!confirm('Delete this order? This cannot be undone.')) return;
  try {
    await deleteOrderAPI(id);
  } catch {}
  allOrders = allOrders.filter(o => o._id !== id);
  renderOrders();
  updateStats();
  showToast('Order deleted', 'info');
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('admin_auth') === 'true') {
    showDashboard();
  }
});
