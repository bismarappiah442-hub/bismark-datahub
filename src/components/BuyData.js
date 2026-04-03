import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, API } from '../context/AuthContext';
import styles from './BuyData.module.css';

const NETWORKS = [
  { id: 'mtn', label: 'MTN', color: '#FFCC00', bg: '#FFFDE6' },
  { id: 'vodafone', label: 'Vodafone', color: '#E60000', bg: '#FFF0F0' },
  { id: 'airteltigo', label: 'AirtelTigo', color: '#0066CC', bg: '#EEF4FF' },
];

const PAY_METHODS = [
  { id: 'momo', label: 'MTN MoMo' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'paystack', label: 'Paystack' },
];

export default function BuyData() {
  const { user, updateWallet } = useAuth();
  const [bundles, setBundles] = useState({});
  const [network, setNetwork] = useState('mtn');
  const [selected, setSelected] = useState(null);
  const [phone, setPhone] = useState('');
  const [payMethod, setPayMethod] = useState('momo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${API}/bundles`).then(r => setBundles(r.data)).catch(() => {});
  }, []);

  const currentBundles = bundles[network] || [];

  const handleBuy = async () => {
    if (!selected) return;
    if (!phone.trim()) { toast.error('Enter recipient phone number'); return; }
    if (payMethod === 'wallet' && user.walletBalance < selected.price) {
      toast.error('Insufficient wallet balance. Please top up first.');
      return;
    }

    // Paystack: redirect to payment page
    if (payMethod === 'paystack') {
      try {
        const r = await axios.post(`${API}/paystack/initialize`, { amount: selected.price, type: 'bundle_purchase' });
        window.location.href = r.data.data.authorization_url;
      } catch { toast.error('Could not initiate payment'); }
      return;
    }

    setLoading(true);
    try {
      const r = await axios.post(`${API}/bundles/purchase`, {
        network, bundleId: selected.id, recipientPhone: phone, paymentMethod: payMethod
      });
      if (payMethod === 'wallet') updateWallet(r.data.newWalletBalance);
      setSuccess({ bundle: selected, phone, network });
      setSelected(null);
      setPhone('');
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className={styles.successCard}>
      <div className={styles.successIcon}>✓</div>
      <h2>Bundle sent!</h2>
      <p>{success.bundle.data} {success.network.toUpperCase()} data sent to <strong>{success.phone}</strong></p>
      <p className={styles.successSub}>Valid for {success.bundle.validity}</p>
      <button className="btn btn-primary" onClick={() => setSuccess(null)}>Buy another</button>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <p className="section-title">Select network</p>
        <div className={styles.networkRow}>
          {NETWORKS.map(n => (
            <button
              key={n.id}
              className={`${styles.netBtn} ${network === n.id ? styles.netActive : ''}`}
              style={network === n.id ? { borderColor: n.color, background: n.bg } : {}}
              onClick={() => { setNetwork(n.id); setSelected(null); }}
            >
              <span className={styles.netDot} style={{ background: n.color }} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className="section-title">Choose a bundle</p>
        <div className={styles.bundleGrid}>
          {currentBundles.map(b => (
            <div
              key={b.id}
              className={`${styles.bundleCard} ${selected?.id === b.id ? styles.bundleSelected : ''}`}
              onClick={() => setSelected(b)}
            >
              {b.popular && <span className="badge badge-green" style={{ marginBottom: 6, display: 'block' }}>Popular</span>}
              <div className={styles.bundleData}>{b.data}</div>
              <div className={styles.bundleValidity}>{b.validity}</div>
              <div className={styles.bundlePrice}>GH₵ {b.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className="section-title">Recipient number</p>
        <input
          type="tel" className="input-field" placeholder="e.g. 0241234567"
          value={phone} onChange={e => setPhone(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <p className="section-title">Payment method</p>
        <div className={styles.payRow}>
          {PAY_METHODS.map(m => (
            <button
              key={m.id}
              className={`${styles.payBtn} ${payMethod === m.id ? styles.payActive : ''}`}
              onClick={() => setPayMethod(m.id)}
            >
              {m.label}
              {m.id === 'wallet' && <span className={styles.walletHint}> · GH₵ {(user?.walletBalance || 0).toFixed(2)}</span>}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        style={{ marginTop: 8, padding: '14px', fontSize: 15 }}
        disabled={!selected || loading}
        onClick={handleBuy}
      >
        {loading ? 'Processing…' : selected ? `Buy ${selected.data} · GH₵ ${selected.price.toFixed(2)}` : 'Select a bundle to continue'}
      </button>
    </div>
  );
}
