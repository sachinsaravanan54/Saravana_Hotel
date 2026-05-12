# 🍛 Sri Saravana Hotel — Restaurant Website

A complete full-stack South Indian restaurant website with online ordering and admin dashboard.

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm install
node server.js
```

Open your browser at: **http://localhost:5000**

### 2. Optional: Connect MongoDB

Edit `backend/.env` and set your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/saravana_hotel
```

Without MongoDB, orders are stored in memory (cleared on server restart).

---

## 📄 Pages

| Page | URL |
|------|-----|
| 🏠 Home / Landing | http://localhost:5000 |
| 🍽️ Menu | http://localhost:5000/menu |
| 🛒 Cart | http://localhost:5000/cart |
| ✅ Thank You | http://localhost:5000/thankyou |
| 🔐 Admin Dashboard | http://localhost:5000/admin |

**Admin Password:** `admin123`

---

## 🍽️ Menu Items

| Item | Price |
|------|-------|
| Idly | ₹30 |
| Dosa | ₹50 |
| Parotta | ₹40 |
| Poori | ₹45 |
| Pongal | ₹60 |
| Vada | ₹15 |
| Chappathi | ₹50 |
| Full Meals | ₹120 |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose) with in-memory fallback
- **Fonts:** Google Fonts (Playfair Display + Poppins)

## 📁 Project Structure

```
Task 1/
├── frontend/
│   ├── index.html       # Landing page
│   ├── menu.html        # Menu with food cards
│   ├── cart.html        # Cart & order
│   ├── thankyou.html    # Order confirmation
│   ├── admin.html       # Admin dashboard
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── images/          # Food images
└── backend/
    ├── server.js        # Express server
    ├── routes/          # API routes
    ├── models/          # MongoDB schemas
    └── .env             # Config
```
