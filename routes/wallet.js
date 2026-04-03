const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/wallet/balance
router.get('/balance', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ balance: user.walletBalance });
});

// POST /api/wallet/topup - called after Paystack webhook confirms payment
router.post('/topup', authMiddleware, async (req, res) => {
  try {
    const { amount, paystackRef } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(req.user._id);
    user.walletBalance += parseFloat(amount);
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'wallet_topup',
      amount,
      paymentMethod: 'paystack',
      paystackRef,
      status: 'success'
    });

    res.json({ success: true, newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
