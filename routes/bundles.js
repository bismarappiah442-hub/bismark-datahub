const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const axios = require('axios');

const BUNDLES = {
  mtn: [
    { id: 'mtn-500mb', data: '500MB', validity: '1 day', price: 3.50 },
    { id: 'mtn-1gb', data: '1GB', validity: '7 days', price: 5.00, popular: true },
    { id: 'mtn-2gb', data: '2GB', validity: '30 days', price: 9.00 },
    { id: 'mtn-5gb', data: '5GB', validity: '30 days', price: 20.00 },
    { id: 'mtn-10gb', data: '10GB', validity: '30 days', price: 35.00 },
    { id: 'mtn-20gb', data: '20GB', validity: '30 days', price: 60.00 },
  ],
  vodafone: [
    { id: 'voda-300mb', data: '300MB', validity: '1 day', price: 2.00 },
    { id: 'voda-1.5gb', data: '1.5GB', validity: '7 days', price: 6.00, popular: true },
    { id: 'voda-3gb', data: '3GB', validity: '30 days', price: 11.00 },
    { id: 'voda-6gb', data: '6GB', validity: '30 days', price: 22.00 },
    { id: 'voda-12gb', data: '12GB', validity: '30 days', price: 38.00 },
    { id: 'voda-25gb', data: '25GB', validity: '30 days', price: 65.00 },
  ],
  airteltigo: [
    { id: 'at-400mb', data: '400MB', validity: '1 day', price: 2.50 },
    { id: 'at-1gb', data: '1GB', validity: '7 days', price: 4.50, popular: true },
    { id: 'at-2.5gb', data: '2.5GB', validity: '30 days', price: 10.00 },
    { id: 'at-5gb', data: '5GB', validity: '30 days', price: 18.00 },
    { id: 'at-10gb', data: '10GB', validity: '30 days', price: 32.00 },
    { id: 'at-20gb', data: '20GB', validity: '30 days', price: 55.00 },
  ]
};

// GET /api/bundles - return all bundle catalog
router.get('/', (req, res) => res.json(BUNDLES));

// POST /api/bundles/purchase
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { network, bundleId, recipientPhone, paymentMethod } = req.body;
    if (!network || !bundleId || !recipientPhone || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bundle = BUNDLES[network]?.find(b => b.id === bundleId);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    const user = await User.findById(req.user._id);

    // Wallet payment - deduct immediately
    if (paymentMethod === 'wallet') {
      if (user.walletBalance < bundle.price) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      user.walletBalance -= bundle.price;
      await user.save();
    }

    // Create transaction record
    const tx = await Transaction.create({
      user: user._id,
      type: 'bundle_purchase',
      network,
      bundleData: bundle.data,
      bundleValidity: bundle.validity,
      recipientPhone,
      amount: bundle.price,
      paymentMethod,
      status: paymentMethod === 'wallet' ? 'success' : 'pending',
    });

    // TODO: For MoMo/Paystack, payment confirmation webhook sets status to 'success'
    // and triggers actual bundle delivery via network API

    res.json({
      success: true,
      message: paymentMethod === 'wallet'
        ? `${bundle.data} bundle sent to ${recipientPhone}!`
        : 'Payment initiated. Bundle will be sent once payment is confirmed.',
      transaction: tx,
      newWalletBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
