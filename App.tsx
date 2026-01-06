
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Financial from './pages/Financial';
import Attendance from './pages/Attendance';
import Graduation from './pages/Graduation';
import Totem from './pages/Totem';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tree_bjj_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('tree_bjj_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tree_bjj_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Routes>
        {/* Modo Totem é independente de layout */}
        <Route path="/totem" element={<Totem />} />
        
        {/* Layout do Painel */}
        <Route path="/*" element={
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header user={user} />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/alunos" element={<Students />} />
                  <Route path="/financeiro" element={<Financial />} />
                  <Route path="/presenca" element={<Attendance />} />
                  <Route path="/graduacao" element={<Graduation />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
