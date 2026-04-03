const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['bundle_purchase', 'wallet_topup', 'wallet_debit'], required: true },
  network: { type: String, enum: ['mtn', 'vodafone', 'airteltigo'], },
  bundleData: String,
  bundleValidity: String,
  recipientPhone: String,
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['momo', 'wallet', 'paystack'] },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paystackRef: String,
  externalRef: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
