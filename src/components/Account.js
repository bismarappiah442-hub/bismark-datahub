import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './Account.module.css';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <div>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{initials}</div>
        <div>
          <p className={styles.name}>{user?.fullName}</p>
          <p className={styles.email}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Phone</span>
          <span className={styles.infoVal}>{user?.phone || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Wallet balance</span>
          <span className={styles.infoVal}>GH₵ {(user?.walletBalance || 0).toFixed(2)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Account status</span>
          <span className="badge badge-green">Active</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-outline btn-full" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => toast('Coming soon — change password')}>
          🔑 Change password
        </button>
        <button className="btn btn-outline btn-full" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => toast('Coming soon — notifications')}>
          🔔 Notification settings
        </button>
        <button
          className="btn btn-full"
          style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid #F0997B', justifyContent: 'flex-start', gap: 10 }}
          onClick={handleLogout}
        >
          🚪 Sign out
        </button>
      </div>
    </div>
  );
}
