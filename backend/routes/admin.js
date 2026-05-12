const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();

function getOrderModel() {
  if (mongoose.connection.readyState === 1) {
    return require('../models/Order');
  }
  return null;
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true, token: 'admin_authenticated' });
  }
  res.status(401).json({ error: 'Invalid password' });
});

// PATCH /api/admin/orders/:id — Update order status
router.patch('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const Order = getOrderModel();

    if (Order) {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json(order);
    } else {
      // Memory fallback
      const order = global.memoryOrders.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      order.status = status;
      return res.json(order);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/admin/orders/:id — Delete order
router.delete('/orders/:id', async (req, res) => {
  try {
    const Order = getOrderModel();

    if (Order) {
      await Order.findByIdAndDelete(req.params.id);
      return res.json({ success: true });
    } else {
      global.memoryOrders = global.memoryOrders.filter(o => o._id !== req.params.id);
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
