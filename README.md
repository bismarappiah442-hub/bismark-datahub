# DataHub GH — Data Bundle Website

A full-stack web app for buying MTN, Vodafone, and AirtelTigo data bundles in Ghana.
Supports wallet top-up, Paystack payments, MTN MoMo, and transaction history.

---

## Project Structure

```
datahub-gh/
├── backend/          ← Node.js + Express API
│   ├── models/       ← MongoDB models (User, Transaction)
│   ├── routes/       ← API routes (auth, bundles, wallet, paystack)
│   ├── middleware/   ← JWT auth middleware
│   ├── server.js     ← Entry point
│   └── .env.example  ← Copy to .env and fill in values
│
└── frontend/         ← React app
    └── src/
        ├── pages/    ← Login, Register, Dashboard, PaymentVerify
        ├── components/ ← BuyData, History, Wallet, Account
        └── context/  ← AuthContext (global user state)
```

---

## Setup Instructions

### 1. MongoDB (free)
1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a free cluster → click "Connect" → get your connection string
3. It looks like: `mongodb+srv://user:pass@cluster.mongodb.net/datahub-gh`

### 2. Paystack (Ghana payments)
1. Go to https://paystack.com and create a free account
2. From your dashboard → Settings → API Keys
3. Copy your **Secret Key** (sk_live_...) and **Public Key** (pk_live_...)

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, PAYSTACK keys in .env

npm install
npm run dev        # development
npm start          # production
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL to your backend URL
# Set REACT_APP_PAYSTACK_PUBLIC_KEY

npm install
npm start          # development
npm run build      # production build (creates /build folder)
```

---

## Deployment (Free Hosting)

### Backend → Render.com (free)
1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo → select the `backend/` folder
4. Set environment variables from your `.env` file
5. Deploy — you'll get a URL like `https://datahub-gh-api.onrender.com`

### Frontend → Vercel (free)
1. Go to https://vercel.com → New Project → Import from GitHub
2. Set Root Directory to `frontend/`
3. Add environment variables:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
   - `REACT_APP_PAYSTACK_PUBLIC_KEY` = your Paystack public key
4. Deploy — you'll get a URL like `https://datahub-gh.vercel.app`

### Final step: Update CORS
In your backend `.env`, set:
```
CLIENT_URL=https://datahub-gh.vercel.app
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Sign in |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/bundles | No | Get all bundle prices |
| POST | /api/bundles/purchase | Yes | Buy a bundle |
| GET | /api/wallet/balance | Yes | Get wallet balance |
| POST | /api/wallet/topup | Yes | Add funds to wallet |
| GET | /api/transactions | Yes | Transaction history |
| POST | /api/paystack/initialize | Yes | Start Paystack payment |
| GET | /api/paystack/verify/:ref | Yes | Verify payment |
| POST | /api/paystack/webhook | No | Paystack webhook |

---

## Paystack Webhook Setup
1. In your Paystack dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-backend.onrender.com/api/paystack/webhook`
3. This automatically credits wallet after successful payments

---

## Next Steps (Optional Upgrades)
- [ ] Add SMS notifications (Twilio or Arkesel)
- [ ] Admin dashboard to manage pricing
- [ ] Referral/loyalty points system
- [ ] Bundle auto-renewal
- [ ] Connect real network APIs for automatic bundle delivery
