/* ====== menu.js — Menu page ====== */

const MENU_ITEMS = [
  {
    id: 1,
    name: 'Idly',
    price: 30,
    category: 'breakfast',
    catLabel: '🌅 Breakfast',
    desc: 'Soft steamed rice cakes served with sambar and fresh coconut chutney. A timeless South Indian breakfast.',
    image: './images/food_idly.png'
  },
  {
    id: 2,
    name: 'Dosa',
    price: 50,
    category: 'breakfast',
    catLabel: '🌅 Breakfast',
    desc: 'Crispy golden masala dosa with spiced potato filling, served with sambar and chutneys.',
    image: './images/food_dosa.png'
  },
  {
    id: 3,
    name: 'Parotta',
    price: 40,
    category: 'tiffin',
    catLabel: '🫓 Tiffin',
    desc: 'Flaky, layered Kerala-style parotta served with rich vegetable kurma or egg curry.',
    image: './images/food_parotta.png'
  },
  {
    id: 4,
    name: 'Poori',
    price: 45,
    category: 'tiffin',
    catLabel: '🫓 Tiffin',
    desc: 'Puffy golden fried bread served with spiced potato masala. A family favourite!',
    image: './images/food_poori.png'
  },
  {
    id: 5,
    name: 'Pongal',
    price: 60,
    category: 'breakfast',
    catLabel: '🌅 Breakfast',
    desc: 'Creamy ven pongal tempered with ghee, cashews, black pepper, and curry leaves. Pure comfort food.',
    image: './images/food_pongal.png'
  },
  {
    id: 6,
    name: 'Vada',
    price: 15,
    category: 'breakfast',
    catLabel: '🌅 Breakfast',
    desc: 'Crispy medu vada — lentil donuts with a crunchy exterior and soft inside, with sambar & chutney.',
    image: './images/food_vada.png'
  },
  {
    id: 7,
    name: 'Chappathi',
    price: 50,
    category: 'tiffin',
    catLabel: '🫓 Tiffin',
    desc: 'Soft whole wheat chapati served with flavourful vegetable curry. Light and nutritious.',
    image: './images/food_chappathi.png'
  },
  {
    id: 8,
    name: 'Full Meals',
    price: 120,
    category: 'meals',
    catLabel: '🍛 Meals',
    desc: 'Grand South Indian feast on a banana leaf — rice, sambar, rasam, curries, papad, pickle & payasam.',
    image: './images/food_meals.png'
  }
];

let currentFilter = 'all';
let itemQtys = {}; // Track qty per item on menu page

document.addEventListener('DOMContentLoaded', () => {
  renderMenu(MENU_ITEMS);
  initFilterTabs();
  updateFloatingCart();
});

function initFilterTabs() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.cat;
      const filtered = currentFilter === 'all'
        ? MENU_ITEMS
        : MENU_ITEMS.filter(i => i.category === currentFilter);
      renderMenu(filtered);
    });
  });
}

function renderMenu(items) {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🍽️</div>
      <h3>No items in this category</h3>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const qty = itemQtys[item.id] || 1;
    const inCart = getCart().find(c => c.name === item.name);
    return `
      <div class="menu-card" id="card-${item.id}">
        <div class="menu-card-img-wrap">
          <img class="menu-card-img" src="${item.image}" alt="${item.name}" loading="lazy" />
          <span class="menu-card-cat">${item.catLabel}</span>
        </div>
        <div class="menu-card-body">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-desc">${item.desc}</div>
          <div class="menu-card-footer">
            <div class="menu-price">₹${item.price}</div>
          </div>
          <div class="menu-controls">
            <div class="qty-selector">
              <button class="qty-btn" onclick="changeItemQty(${item.id}, -1)">−</button>
              <span class="qty-display" id="qty-${item.id}">${qty}</span>
              <button class="qty-btn" onclick="changeItemQty(${item.id}, 1)">+</button>
            </div>
            <button class="add-cart-btn ${inCart ? 'added' : ''}"
              id="addBtn-${item.id}"
              onclick="handleAddToCart(${item.id})">
              ${inCart ? '✓ Added' : '+ Add to Cart'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function changeItemQty(id, delta) {
  const current = itemQtys[id] || 1;
  const newQty = Math.max(1, current + delta);
  itemQtys[id] = newQty;
  const el = document.getElementById(`qty-${id}`);
  if (el) el.textContent = newQty;
}

function handleAddToCart(id) {
  const item = MENU_ITEMS.find(i => i.id === id);
  if (!item) return;
  const qty = itemQtys[id] || 1;

  addToCart({ name: item.name, price: item.price, image: item.image, quantity: qty });

  // Update button
  const btn = document.getElementById(`addBtn-${id}`);
  if (btn) {
    btn.classList.add('added');
    btn.textContent = '✓ Added';
  }

  showToast(`${qty}x ${item.name} added to cart!`, 'success');
  updateFloatingCart();
}

function updateFloatingCart() {
  const cart = getCart();
  const floatingCart = document.getElementById('floatingCart');
  const fcItemCount = document.getElementById('fcItemCount');
  const fcTotal = document.getElementById('fcTotal');

  if (cart.length > 0) {
    floatingCart.style.display = 'flex';
    const count = getCartCount();
    const total = getCartTotal();
    if (fcItemCount) fcItemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    if (fcTotal) fcTotal.textContent = `₹${total}`;
  } else {
    if (floatingCart) floatingCart.style.display = 'none';
  }
}
