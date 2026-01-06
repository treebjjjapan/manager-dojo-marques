
import React, { useState } from 'react';
import { db } from '../db';
import { AppSettings, Plan, Schedule } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [syncToken, setSyncToken] = useState('');
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SYNC'>('GENERAL');

  const handleSave = () => {
    db.saveSettings(settings);
    alert('Configurações salvas!');
  };

  const handleExport = () => {
    const token = db.exportSyncToken();
    setSyncToken(token);
    navigator.clipboard.writeText(token);
    alert('Código de Sincronização copiado! Cole este código em outro dispositivo para sincronizar os dados.');
  };

  const handleImport = () => {
    const confirm = window.confirm("ATENÇÃO: Importar dados irá substituir TODOS os registros deste aparelho. Deseja continuar?");
    if (confirm) {
      const success = db.importSyncToken(syncToken);
      if (success) {
        alert('Sincronização concluída com sucesso! Recarregando...');
        window.location.reload();
      } else {
        alert('Erro: Token de sincronização inválido.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Ajustes da Academia</h1>
        <p className="text-slate-500">Configure sua TREE BJJ e gerencie a sincronização.</p>
      </div>

      <div className="flex bg-slate-200 p-1 rounded-2xl w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab('GENERAL')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'GENERAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          GERAL
        </button>
        <button 
          onClick={() => setActiveTab('SYNC')}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'SYNC' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
        >
          NUVEM & SINCRONIZAÇÃO
        </button>
      </div>

      {activeTab === 'GENERAL' ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Unidade / Academia</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.academyName}
                onChange={(e) => setSettings({...settings, academyName: e.target.value})}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div>
                <p className="font-bold text-slate-900">Permitir Check-in de Devedores</p>
                <p className="text-xs text-slate-500">Alunos com mensalidade vencida podem fazer check-in no totem.</p>
              </div>
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500"
                checked={settings.allowCheckinWithOverdue}
                onChange={(e) => setSettings({...settings, allowCheckinWithOverdue: e.target.checked})}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Planos e Valores (Yen ¥)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.plans.map((plan, idx) => (
                  <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
                    <input 
                      className="bg-transparent font-bold text-slate-900 border-none outline-none p-0"
                      value={plan.name}
                      onChange={(e) => {
                        const newPlans = [...settings.plans];
                        newPlans[idx].name = e.target.value;
                        setSettings({...settings, plans: newPlans});
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">¥</span>
                      <input 
                        type="number"
                        className="bg-transparent font-black text-slate-900 border-none outline-none p-0 w-full"
                        value={plan.price}
                        onChange={(e) => {
                          const newPlans = [...settings.plans];
                          newPlans[idx].price = parseInt(e.target.value) || 0;
                          setSettings({...settings, plans: newPlans});
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
            >
              SALVAR CONFIGURAÇÕES
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-center max-w-lg mx-auto">
          <div className="space-y-2">
            <span className="text-5xl">☁️</span>
            <h2 className="text-xl font-black text-slate-900 uppercase">Sincronização em Nuvem</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Use o token abaixo para mover os dados entre seu PC e seu iPad. Gere o código em um aparelho e cole no outro.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleExport}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10"
            >
              GERAR CÓDIGO (EXPORTAR)
            </button>
            
            <div className="relative">
              <label className="block text-left text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Cole aqui para sincronizar:</label>
              <textarea 
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 font-mono text-[10px] h-32 outline-none focus:border-blue-500"
                placeholder="Insira o código de sincronização aqui..."
                value={syncToken}
                onChange={(e) => setSyncToken(e.target.value)}
              />
            </div>

            <button 
              onClick={handleImport}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
            >
              IMPORTAR E SINCRONIZAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
