import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import InteractionForm from '../components/InteractionForm';
import ChatInterface from '../components/ChatInterface';
import InteractionList from '../components/InteractionList';

function LogInteractionPage() {
  const [activeTab, setActiveTab] = useState('form');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ padding: '0 24px' }}>
        {activeTab === 'form' && <InteractionForm />}
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'history' && <InteractionList />}
      </div>
    </div>
  );
}

export default LogInteractionPage;