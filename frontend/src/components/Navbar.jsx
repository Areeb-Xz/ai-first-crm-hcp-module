import React from 'react';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>HCP Interaction Module</div>
      <div style={styles.tabs}>
        {['form', 'chat', 'history'].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'form' ? 'Log Interaction' : tab === 'chat' ? 'Chat' : 'History'}
          </button>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: '60px', background: '#0f172a',
    fontFamily: 'Inter, sans-serif',
  },
  brand: { color: '#fff', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em' },
  tabs: { display: 'flex', gap: '8px' },
  tab: {
    background: 'transparent', border: 'none', color: '#94a3b8',
    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
  },
  activeTab: { background: '#1e40af', color: '#fff' },
};

export default Navbar;