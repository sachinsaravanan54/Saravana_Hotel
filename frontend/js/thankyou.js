/* ====== thankyou.js — Thank you page ====== */

document.addEventListener('DOMContentLoaded', () => {
  loadOrderRecap();
  spawnConfetti();
});

function loadOrderRecap() {
  const recap = document.getElementById('orderRecap');
  if (!recap) return;

  let order;
  try {
    order = JSON.parse(localStorage.getItem('saravana_last_order'));
  } catch { order = null; }

  if (!order || !order.items || order.items.length === 0) {
    recap.innerHTML = '<p style="color:var(--text-mid); font-size:0.88rem;">No order details available.</p>';
    return;
  }

  const itemsHTML = order.items.map(item => `
    <div class="recap-item">
      <span>${item.quantity}× ${item.name}</span>
      <span>₹${item.price * item.quantity}</span>
    </div>
  `).join('');

  const name = order.customerName && order.customerName !== 'Guest'
    ? `<p style="margin-bottom:8px; font-size:0.84rem; color:var(--text-mid)">👤 ${order.customerName}${order.tableNumber ? ' · ' + order.tableNumber : ''}</p>`
    : '';

  recap.innerHTML = `
    ${name}
    <h3>🧾 Your Order</h3>
    ${itemsHTML}
    <div class="recap-total">
      <span>Total Paid</span>
      <span>₹${order.total}</span>
    </div>
  `;

  // Clear from storage
  localStorage.removeItem('saravana_last_order');
}

function spawnConfetti() {
  const container = document.getElementById('foodConfetti');
  if (!container) return;

  const emojis = ['🍛', '🍽️', '✨', '🎉', '🌟', '🥘', '🫓', '🎊', '⭐', '💫'];
  const count = 20;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-item';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `-40px`;
      el.style.animationDuration = `${2 + Math.random() * 3}s`;
      el.style.animationDelay = `${Math.random() * 0.5}s`;
      container.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }, i * 150);
  }
}
