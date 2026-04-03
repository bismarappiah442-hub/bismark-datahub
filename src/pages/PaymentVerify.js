import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PaymentVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { updateWallet } = useAuth();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const ref = params.get('reference') || params.get('trxref');
    if (!ref) { navigate('/'); return; }

    axios.get(`${API}/paystack/verify/${ref}`)
      .then(r => {
        updateWallet(r.data.newBalance);
        toast.success(`GH₵ ${r.data.amount.toFixed(2)} added to your wallet!`);
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(() => {
        toast.error('Payment verification failed');
        setStatus('failed');
        setTimeout(() => navigate('/'), 2500);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'inherit' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: status === 'success' ? 'var(--green-light)' : status === 'failed' ? 'var(--red-light)' : 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
        {status === 'verifying' ? '⏳' : status === 'success' ? '✅' : '❌'}
      </div>
      <p style={{ fontWeight: 600, fontSize: 16 }}>
        {status === 'verifying' ? 'Verifying payment…' : status === 'success' ? 'Payment successful!' : 'Payment failed'}
      </p>
      <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Redirecting you back…</p>
    </div>
  );
}
