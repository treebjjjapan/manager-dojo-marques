
import React from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-2 md:hidden">
        <span className="text-lg font-bold text-slate-900">TREE BJJ</span>
      </div>
      <div className="hidden md:block">
        <h2 className="text-sm font-medium text-slate-500">Sistema de Gestão</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/totem')}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
        >
          <span>🖥️</span>
          <span className="hidden sm:inline">ABRIR TOTEM</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
