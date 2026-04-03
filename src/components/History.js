import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../context/AuthContext';
import styles from './History.module.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TX_ICONS = {
  bundle_purchase: '📶',
  wallet_topup: '💳',
  wallet_debit: '💰',
};

export default function History() {
  const [data, setData] = useState({ transactions: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/transactions?page=${page}&limit=20`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className={styles.empty}>Loading transactions…</div>;

  if (!data.transactions.length) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>📋</div>
      <p>No transactions yet</p>
      <p className={styles.emptySub}>Your purchase history will appear here</p>
    </div>
  );

  return (
    <div>
      <div className={styles.header}>
        <p className="section-title" style={{ marginBottom: 0 }}>
          {data.total} transaction{data.total !== 1 ? 's' : ''}
        </p>
      </div>
      <div className={styles.list}>
        {data.transactions.map(tx => (
          <div key={tx._id} className={styles.item}>
            <div className={styles.icon}>{TX_ICONS[tx.type] || '💳'}</div>
            <div className={styles.info}>
              <div className={styles.title}>
                {tx.type === 'bundle_purchase'
                  ? `${tx.bundleData} ${tx.network?.toUpperCase()} Bundle`
                  : tx.type === 'wallet_topup' ? 'Wallet Top-up' : 'Wallet Debit'}
              </div>
              {tx.recipientPhone && <div className={styles.sub}>To: {tx.recipientPhone}</div>}
              <div className={styles.date}>{formatDate(tx.createdAt)}</div>
            </div>
            <div className={styles.right}>
              <span className={`${styles.amount} ${tx.type === 'wallet_topup' ? styles.credit : styles.debit}`}>
                {tx.type === 'wallet_topup' ? '+' : '-'}GH₵ {tx.amount.toFixed(2)}
              </span>
              <span className={`badge ${tx.status === 'success' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.pages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Page {page} of {data.pages}</span>
          <button className="btn btn-outline" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
