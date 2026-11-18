import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Projects from './components/Projects';
import Materials from './components/Materials';
import Equipment from './components/Equipment';
import Workers from './components/Workers';
import Workspace from './components/Workspace';
import Payments from './components/Payments';

export default function App() {
  const { activeTab } = useApp();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {activeTab === 'home' && <Home />}
        {activeTab === 'login' && <Login />}
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'materials' && <Materials />}
        {activeTab === 'equipment' && <Equipment />}
        {activeTab === 'workers' && <Workers />}
        {activeTab === 'workspace' && <Workspace />}
        {activeTab === 'payments' && <Payments />}
      </main>
    </div>
  );
}
