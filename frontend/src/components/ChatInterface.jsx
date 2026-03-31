import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addUserMessage } from '../store/chatSlice';

function ChatInterface() {
  const dispatch = useDispatch();
  const { messages, status } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || status === 'loading') return;
    dispatch(addUserMessage(text));
    dispatch(sendChatMessage(text));
    setInput('');
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Chat with AI Agent</h2>
      <p style={styles.hint}>Try: "Log interaction with Dr. Smith, cardiologist, in-person: discussed new trial data."</p>
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>Start a conversation to log or query interactions.</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
            {msg.content}
          </div>
        ))}
        {status === 'loading' && <div style={{ ...styles.bubble, ...styles.aiBubble }}>Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputRow}>
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Type a message... (Enter to send)"
          style={styles.textarea} rows={2}
        />
        <button onClick={handleSend} style={styles.sendBtn} disabled={status === 'loading'}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '720px', margin: '40px auto', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' },
  heading: { fontSize: '20px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' },
  hint: { fontSize: '13px', color: '#6b7280', marginBottom: '16px' },
  messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', marginBottom: '16px' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: '60px', fontSize: '14px' },
  bubble: { maxWidth: '85%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word' },
  userBubble: { background: '#1d4ed8', color: '#fff', alignSelf: 'flex-end', borderBottomRightRadius: '3px' },
  aiBubble: { background: '#f1f5f9', color: '#0f172a', alignSelf: 'flex-start', borderBottomLeftRadius: '3px' },
  inputRow: { display: 'flex', gap: '10px', alignItems: 'flex-end' },
  textarea: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none' },
  sendBtn: { padding: '10px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
};

export default ChatInterface;