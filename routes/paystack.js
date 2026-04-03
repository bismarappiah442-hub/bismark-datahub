const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const paystackHeaders = { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' };

// POST /api/paystack/initialize - start a payment
router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    const { amount, type } = req.body; // amount in GHS, type: 'wallet_topup' | 'bundle_purchase'
    const amountKobo = Math.round(amount * 100); // Paystack uses pesewas (GHS * 100)

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: req.user.email,
      amount: amountKobo,
      currency: 'GHS',
      metadata: { userId: req.user._id.toString(), type },
      callback_url: `${process.env.CLIENT_URL}/payment/verify`
    }, { headers: paystackHeaders });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Paystack error', error: err.response?.data || err.message });
  }
});

// GET /api/paystack/verify/:reference - verify after redirect
router.get('/verify/:reference', authMiddleware, async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, { headers: paystackHeaders });
    const data = response.data.data;

    if (data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const amount = data.amount / 100; // convert pesewas back to GHS
    const userId = data.metadata?.userId;

    // Top up wallet if that was the intent
    if (data.metadata?.type === 'wallet_topup') {
      const user = await User.findById(userId);
      user.walletBalance += amount;
      await user.save();
      await Transaction.create({
        user: userId, type: 'wallet_topup', amount,
        paymentMethod: 'paystack', paystackRef: reference, status: 'success'
      });
    }

    res.json({ success: true, amount, reference });
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
});

// POST /api/paystack/webhook - Paystack sends events here
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const crypto = require('crypto');
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.body).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.sendStatus(400);

  const event = JSON.parse(req.body);
  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;
    const amountGHS = amount / 100;
    if (metadata?.type === 'wallet_topup') {
      const user = await User.findById(metadata.userId);
      if (user) { user.walletBalance += amountGHS; await user.save(); }
      await Transaction.findOneAndUpdate({ paystackRef: reference }, { status: 'success' }, { upsert: false });
    }
  }
  res.sendStatus(200);
});

module.exports = router;
