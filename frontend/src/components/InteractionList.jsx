import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions } from '../store/interactionsSlice';

function InteractionList() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.interactions);

  useEffect(() => { dispatch(fetchInteractions()); }, [dispatch]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.topRow}>
        <h2 style={styles.heading}>Interaction History</h2>
        <button style={styles.refreshBtn} onClick={() => dispatch(fetchInteractions())}>
          Refresh
        </button>
      </div>
      {status === 'loading' && <p style={styles.msg}>Loading...</p>}
      {status !== 'loading' && items.length === 0 && <p style={styles.msg}>No interactions logged yet.</p>}
      <div style={styles.list}>
        {[...items].reverse().map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.name}>{item.hcp_name}</span>
              <span style={styles.channel}>{item.channel || 'N/A'}</span>
            </div>
            {item.specialty && <p style={styles.meta}>{item.specialty}</p>}
            {item.raw_notes && <p style={styles.notes}>{item.raw_notes}</p>}
            {item.llm_summary && (
              <div style={styles.summary}>
                <strong>AI Summary:</strong> {item.llm_summary}
              </div>
            )}
            <p style={styles.date}>{new Date(item.interaction_datetime).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '720px', margin: '40px auto', fontFamily: 'Inter, sans-serif' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '20px', fontWeight: 600, color: '#0f172a' },
  refreshBtn: {
    padding: '7px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, sans-serif',
    cursor: 'pointer', color: '#374151',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  name: { fontWeight: 600, fontSize: '15px', color: '#111827' },
  channel: { fontSize: '12px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 10px', borderRadius: '99px' },
  meta: { fontSize: '13px', color: '#6b7280', marginBottom: '6px' },
  notes: { fontSize: '14px', color: '#374151', marginBottom: '8px' },
  summary: { fontSize: '13px', color: '#065f46', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' },
  date: { fontSize: '12px', color: '#9ca3af' },
  msg: { fontFamily: 'Inter, sans-serif', color: '#6b7280', textAlign: 'center', marginTop: '60px' },
};

export default InteractionList;