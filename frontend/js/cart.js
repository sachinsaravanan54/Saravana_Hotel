/* ====== cart.js — Cart & Order page ====== */

const FOOD_IMAGES = {
  'Idly': '../images/food_idly.png',
  'Dosa': '../images/food_dosa.png',
  'Parotta': '../images/food_parotta.png',
  'Poori': '../images/food_poori.png',
  'Pongal': '../images/food_pongal.png',
  'Vada': '../images/food_vada.png',
  'Chappathi': '../images/food_chappathi.png',
  'Full Meals': '../images/food_meals.png'
};

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const cart = getCart();
  const cartLayout = document.getElementById('cartLayout');
  const emptyCart = document.getElementById('emptyCart');
  const cartItemsList = document.getElementById('cartItemsList');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  if (cart.length === 0) {
    if (cartLayout) cartLayout.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    return;
  }

  if (cartLayout) cartLayout.style.display = 'grid';
  if (emptyCart) emptyCart.style.display = 'none';

  if (cartItemsList) {
    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item" id="cart-row-${item.name.replace(/\s/g,'_')}">
        <img class="cart-item-img"
          src="${FOOD_IMAGES[item.name] || '../images/food_idly.png'}"
          alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-unit">₹${item.price} each</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-selector">
            <button class="qty-btn" onclick="adjustQty('${item.name}', -1)">−</button>
            <span class="qty-display" id="cqty-${item.name.replace(/\s/g,'_')}">${item.quantity}</span>
            <button class="qty-btn" onclick="adjustQty('${item.name}', 1)">+</button>
          </div>
          <span class="cart-item-total" id="ctotal-${item.name.replace(/\s/g,'_')}">₹${item.price * item.quantity}</span>
          <button class="remove-item-btn" title="Remove" onclick="handleRemove('${item.name}')">✕</button>
        </div>
      </div>
    `).join('');
  }

  updateTotals();
}

function adjustQty(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    handleRemove(name);
    return;
  }

  updateCartQty(name, newQty);

  // Update DOM without full re-render
  const key = name.replace(/\s/g, '_');
  const qtyEl = document.getElementById(`cqty-${key}`);
  const totalEl = document.getElementById(`ctotal-${key}`);
  if (qtyEl) qtyEl.textContent = newQty;
  if (totalEl) totalEl.textContent = `₹${item.price * newQty}`;
  updateTotals();
}

function handleRemove(name) {
  removeFromCart(name);
  const key = name.replace(/\s/g, '_');
  const row = document.getElementById(`cart-row-${key}`);
  if (row) {
    row.style.transition = 'opacity 0.3s, transform 0.3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-16px)';
    setTimeout(() => renderCart(), 300);
  } else {
    renderCart();
  }
  showToast(`${name} removed`, 'info');
}

function updateTotals() {
  const total = getCartTotal();
  const subtotalEl = document.getElementById('subtotalAmt');
  const grandEl = document.getElementById('grandTotal');
  if (subtotalEl) subtotalEl.textContent = `₹${total}`;
  if (grandEl) grandEl.textContent = `₹${total}`;
}

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const customerName = document.getElementById('customerName')?.value.trim() || 'Guest';
  const tableNumber = document.getElementById('tableNumber')?.value.trim() || '';
  const mobileNumber = document.getElementById('mobileNumber')?.value.trim() || '';
  const total = getCartTotal();

  const placeBtn = document.getElementById('placeOrderBtn');
  if (placeBtn) {
    placeBtn.disabled = true;
    placeBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px"></span> Placing Order...';
  }

  const orderData = {
    customerName,
    tableNumber,
    mobileNumber,
    items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
    total
  };

  try {
    const result = await placeOrderAPI(orderData);

    // Save last order for thank you page
    localStorage.setItem('saravana_last_order', JSON.stringify({
      ...orderData,
      orderId: result.orderId
    }));

    clearCart();
    window.location.href = 'thankyou.html';
  } catch (err) {
    console.error(err);

    // Offline fallback — still show thank you
    localStorage.setItem('saravana_last_order', JSON.stringify({
      ...orderData,
      orderId: Date.now().toString()
    }));
    clearCart();
    window.location.href = 'thankyou.html';
  }
}
