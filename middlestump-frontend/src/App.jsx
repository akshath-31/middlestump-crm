import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { Campaign } from './pages/Campaign';
import { Campaigns } from './pages/Campaigns';
import { Shoppers } from './pages/Shoppers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/campaign" replace />} />
        <Route path="dashboard" element={<Overview />} />
        <Route path="campaign" element={<Campaign />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="shoppers" element={<Shoppers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
