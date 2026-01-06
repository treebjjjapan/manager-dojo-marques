
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types.ts';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navItems = [
    { path: '/', label: 'Início', icon: '🏠' },
    { path: '/alunos', label: 'Alunos', icon: '👥' },
    { path: '/financeiro', label: 'Financeiro', icon: '💰' },
    { path: '/presenca', label: 'Presença', icon: '📅' },
    { path: '/graduacao', label: 'Graduação', icon: '🥋' },
    { path: '/configuracoes', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight uppercase">
            TREE <span className="text-blue-400">BJJ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Brazilian Jiu Jitsu</p>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-400 rounded-lg transition-all text-sm font-medium"
          >
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
