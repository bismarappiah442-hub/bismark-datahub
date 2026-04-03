import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BuyData from '../components/BuyData';
import History from '../components/History';
import Wallet from '../components/Wallet';
import Account from '../components/Account';
import styles from './Dashboard.module.css';

const TABS = [
  { id: 'buy', label: 'Buy Data', icon: '📶' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'wallet', label: 'Wallet', icon: '💰' },
  { id: 'account', label: 'Account', icon: '👤' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>BD</span>
            <span className={styles.logoText}>Bismark DataHub</span>
          </div>
          <div className={styles.walletChip} onClick={() => setActiveTab('wallet')}>
            <span className={styles.walletDot} />
            <span>GH₵ {(user?.walletBalance || 0).toFixed(2)}</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.navBtn} ${activeTab === t.id ? styles.navActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        {activeTab === 'buy' && <BuyData />}
        {activeTab === 'history' && <History />}
        {activeTab === 'wallet' && <Wallet onTopUpSuccess={() => {}} />}
        {activeTab === 'account' && <Account />}
      </main>
    </div>
  );
}
