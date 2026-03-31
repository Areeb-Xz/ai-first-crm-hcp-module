import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createInteraction } from '../store/interactionsSlice';

function InteractionForm() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ hcp_name: '', specialty: '', channel: '', raw_notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const channels = ['In-Person', 'Email', 'Phone', 'Video Call'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hcp_name.trim()) return;
    dispatch(createInteraction(form)).then(() => {
      setForm({ hcp_name: '', specialty: '', channel: '', raw_notes: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    });
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Log HCP Interaction</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>HCP Name *</label>
            <input
              name="hcp_name" value={form.hcp_name} onChange={handleChange}
              placeholder="Dr. Jane Smith" style={styles.input} required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Specialty</label>
            <input
              name="specialty" value={form.specialty} onChange={handleChange}
              placeholder="Cardiology" style={styles.input}
            />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Channel</label>
          <select name="channel" value={form.channel} onChange={handleChange} style={styles.input}>
            <option value="">Select channel</option>
            {channels.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Interaction Notes</label>
          <textarea
            name="raw_notes" value={form.raw_notes} onChange={handleChange}
            placeholder="Describe the interaction in detail..." style={{ ...styles.input, height: '120px', resize: 'vertical' }}
          />
        </div>
        <button type="submit" style={styles.btn}>Save Interaction</button>
        {submitted && <p style={styles.success}>Interaction saved successfully.</p>}
      </form>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '720px', margin: '40px auto', fontFamily: 'Inter, sans-serif' },
  heading: { fontSize: '20px', fontWeight: 600, color: '#0f172a', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#374151' },
  input: {
    padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
    fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  btn: {
    padding: '11px 24px', background: '#1d4ed8', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start',
  },
  success: { color: '#16a34a', fontSize: '14px', marginTop: '4px' },
};

export default InteractionForm;