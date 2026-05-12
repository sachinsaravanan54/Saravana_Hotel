const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const twilio = require('twilio');

// Initialize Twilio (only if keys are present)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio SMS Client Initialized');
  } catch (err) {
    console.warn('⚠️ Twilio initialization failed:', err.message);
  }
}

// Helper to send order SMS
async function sendOrderSMS(mobileNumber, orderId, items, total, customerName) {
  if (!mobileNumber) return;
  
  const itemListText = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
  const messageBody = `Hi ${customerName || 'Customer'}, your order #${String(orderId).slice(-6).toUpperCase()} from Sri Saravana Hotel is confirmed! 🍛\n\nItems: ${itemListText}\nTotal: ₹${total}\n\nThank you for ordering!`;

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const toPhone = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: toPhone
      });
      console.log(`💬 SMS automatically sent to ${toPhone}`);
    } catch (err) {
      console.error(`❌ Failed to send SMS to ${mobileNumber}:`, err.message);
    }
  } else {
    console.log(`\n[MOCK SMS] Would send to ${mobileNumber}:`);
    console.log(`"${messageBody}"`);
    console.log(`(Configure TWILIO variables in .env to send real SMS)\n`);
  }
}

function getOrderModel() {
  if (mongoose.connection.readyState === 1) {
    return require('../models/Order');
  }
  return null;
}

// POST /api/orders — Place a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, tableNumber, mobileNumber, items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const Order = getOrderModel();

    if (Order) {
      // MongoDB mode
      const order = new Order({ customerName, tableNumber, mobileNumber, items, total });
      await order.save();
      
      // Fire off SMS async (doesn't block response)
      sendOrderSMS(mobileNumber, order._id, items, total, customerName);
      
      return res.status(201).json({ success: true, orderId: order._id, order });
    } else {
      // Memory fallback mode
      const order = {
        _id: Date.now().toString(),
        customerName: customerName || 'Guest',
        tableNumber: tableNumber || '',
        mobileNumber: mobileNumber || '',
        items,
        total,
        status: 'pending',
        createdAt: new Date()
      };
      global.memoryOrders.push(order);
      
      // Fire off SMS async
      sendOrderSMS(mobileNumber, order._id, items, total, customerName);
      
      return res.status(201).json({ success: true, orderId: order._id, order });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders — Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const Order = getOrderModel();
    if (Order) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.json([...global.memoryOrders].reverse());
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
