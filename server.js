const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bundleRoutes = require('./routes/bundles');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const paystackRoutes = require('./routes/paystack');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/paystack', paystackRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'DataHub GH' }));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 10000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
