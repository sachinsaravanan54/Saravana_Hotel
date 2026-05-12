/* ============================================
   common.js — Shared utilities for all pages
   Cart state, API calls, navbar, toast
============================================ */

const API_BASE = 'http://localhost:5000/api';

// ====== CART STORAGE ======
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('saravana_cart')) || [];
  } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('saravana_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.name === item.name);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  saveCart(cart);
}

function removeFromCart(name) {
  const cart = getCart().filter(i => i.name !== name);
  saveCart(cart);
}

function updateCartQty(name, qty) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity = qty;
    if (item.quantity <= 0) return removeFromCart(name);
  }
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('#cartBadge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ====== API CALLS ======
async function placeOrderAPI(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Order failed');
  return res.json();
}

async function fetchOrdersAPI() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

async function updateOrderStatusAPI(id, status) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

async function deleteOrderAPI(id) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

async function adminLoginAPI(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  return { ok: res.ok, data: await res.json() };
}

// ====== NAVBAR ======
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks && navLinks.classList.toggle('open');
}

// ====== SCROLL ANIMATIONS ======
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
    // Skip hero elements (they have their own animation)
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
}

// ====== TOAST NOTIFICATIONS ======
let toastTimeout;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || '📢'}</span> ${message}`;
  toast.className = `toast ${type} show`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ====== INIT ON LOAD ======
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  updateCartBadge();
});
