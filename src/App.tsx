import React from 'react';
import { Layout } from './components/Layout';
import { TradeSimulator } from './components/TradeSimulator';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Layout>
        <TradeSimulator />
      </Layout>
    </div>
  );
}

export default App;