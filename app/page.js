'use client';

import React from 'react';
import Navbar from './components/navbar';

import TradingViewChart from './components/chart_components/UnderyingChart';
import UnderlyingDynamicChart from './components/chart_objects/underlying_dynamic';

export default function Home() {
  return (
    <>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h1>Welcome to the Home Page</h1>
              <p>Explore the market and analytics using the navigation bar above.</p>
          </div>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
              <TradingViewChart />
          </div>
    </>
);
}
