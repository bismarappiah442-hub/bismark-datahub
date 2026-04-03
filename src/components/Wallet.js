import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API } from '../context/AuthContext';
import styles from './Wallet.module.css';

const TOPUP_AMOUNTS = [10, 20, 50, 100, 200];

export default function Wallet() {
  const { user } = useAuth();
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  const topUp = async (amount) => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/paystack/initialize`, { amount, type: 'wallet_topup' });
      window.location.href = r.data.data.authorization_url;
    } catch {
      toast.error('Could not initiate top-up');
    } finally {
      setLoading(false);
    }
  };

  const handleCustom = () => {
    const amt = parseFloat(custom);
    if (!amt || amt < 1) { toast.error('Enter a valid amount (min GH₵ 1)'); return; }
    topUp(amt);
  };

  return (
    <div>
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>Available balance</p>
        <p className={styles.balance}>GH₵ {(user?.walletBalance || 0).toFixed(2)}</p>
        <p className={styles.balanceSub}>Use your wallet to pay for data bundles instantly</p>
      </div>

      <p className="section-title" style={{ marginTop: '1.5rem' }}>Quick top-up</p>
      <div className={styles.amountGrid}>
        {TOPUP_AMOUNTS.map(amt => (
          <button
            key={amt}
            className={styles.amountBtn}
            onClick={() => topUp(amt)}
            disabled={loading}
          >
            <span className={styles.amountVal}>GH₵ {amt}</span>
            <span className={styles.amountSub}>via Paystack</span>
          </button>
        ))}
      </div>

      <p className="section-title" style={{ marginTop: '1.5rem' }}>Custom amount</p>
      <div className={styles.customRow}>
        <div className={styles.inputWrap}>
          <span className={styles.prefix}>GH₵</span>
          <input
            type="number" min="1" className={styles.customInput}
            placeholder="Enter amount" value={custom}
            onChange={e => setCustom(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleCustom} disabled={loading}>
          {loading ? '…' : 'Top up'}
        </button>
      </div>

      <div className={styles.infoBox}>
        <p>💳 Payments are processed securely via <strong>Paystack</strong>. You can pay with MTN MoMo, Vodafone Cash, bank card, or USSD.</p>
      </div>
    </div>
  );
}
