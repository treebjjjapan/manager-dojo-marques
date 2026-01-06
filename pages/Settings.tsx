
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { AppSettings, Plan, Schedule } from '../types.ts';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [syncToken, setSyncToken] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PLANS' | 'SCHEDULES' | 'GRADUATION' | 'SYNC'>('GENERAL');
  const [isScanning, setIsScanning] = useState(false);

  const handleSave = () => {
    db.saveSettings(settings);
    alert('Configurações salvas!');
  };

  const handleExport = () => {
    const token = db.exportSyncToken();
    setSyncToken(token);
    setShowQR(true);
    try {
      navigator.clipboard.writeText(token);
    } catch(e) {}
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        setSyncToken(decodedText);
        scanner.clear();
        setIsScanning(false);
      }, (error) => {
        // Erro silencioso durante leitura
      });
    }, 100);
  };

  const handleImport = () => {
    if (!syncToken) {
      alert("Token vazio.");
      return;
    }
    if (window.confirm("Isso substituirá todos os dados locais. Deseja continuar?")) {
      if (db.importSyncToken(syncToken)) {
        alert('Sincronização concluída!');
        window.location.reload();
      } else {
        alert('Erro: Token inválido ou base de dados muito grande para QR Code.');
      }
    }
  };

  const TabButton: React.FC<{ id: typeof activeTab; label: string; icon: string }> = ({ id, label, icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border whitespace-nowrap ${
        activeTab === id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Configurações</h1>
        <p className="text-slate-500 text-sm">TREE BRAZILIAN JIU JITSU</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        <TabButton id="GENERAL" label="GERAL" icon="⚙️" />
        <TabButton id="PLANS" label="PLANOS" icon="💰" />
        <TabButton id="SCHEDULES" label="HORÁRIOS" icon="⏱️" />
        <TabButton id="GRADUATION" label="GRADUAÇÃO" icon="🥋" />
        <TabButton id="SYNC" label="NUVEM" icon="☁️" />
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {activeTab === 'GENERAL' && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Unidade</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
                  value={settings.academyName}
                  onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'PLANS' && (
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-4">Planos Mensais (¥)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.plans.map((plan, idx) => (
                  <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <input className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold" value={plan.name} onChange={(e) => {
                        const newList = [...settings.plans];
                        newList[idx].name = e.target.value;
                        setSettings({ ...settings, plans: newList });
                      }} />
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-black">¥</span>
                        <input type="number" className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-black" value={plan.price} onChange={(e) => {
                          const newList = [...settings.plans];
                          newList[idx].price = parseInt(e.target.value) || 0;
                          setSettings({ ...settings, plans: newList });
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SYNC' && (
            <div className="max-w-md mx-auto space-y-8 text-center py-6">
              <div className="space-y-2">
                <span className="text-5xl">☁️</span>
                <h2 className="text-lg font-black text-slate-900 uppercase mt-4 tracking-tighter">Sincronização QR Code</h2>
                <p className="text-xs text-slate-500">Transfira dados entre aparelhos instantaneamente.</p>
              </div>

              {showQR && (
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex flex-col items-center animate-in fade-in zoom-in">
                  <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
                    <QRCodeSVG value={syncToken} size={220} level="L" />
                  </div>
                  <button onClick={() => setShowQR(false)} className="text-blue-600 font-black text-[10px] uppercase">Fechar QR</button>
                </div>
              )}

              {isScanning && (
                <div className="fixed inset-0 bg-slate-900/95 z-[100] p-6 flex flex-col items-center justify-center">
                  <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden bg-black border-4 border-blue-600"></div>
                  <button onClick={() => setIsScanning(false)} className="mt-8 px-8 py-4 bg-white text-slate-900 rounded-full font-black uppercase">Fechar</button>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleExport} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700">GERAR QR</button>
                   <button onClick={startScanner} className="py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700">LER QR</button>
                </div>

                <div className="relative pt-6">
                   <div className="absolute inset-x-0 top-3 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase text-slate-300"><span className="bg-white px-4">TOKEN MANUAL</span></div>
                </div>

                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[9px] h-32 outline-none"
                  placeholder="Cole o token aqui..."
                  value={syncToken}
                  onChange={(e) => setSyncToken(e.target.value)}
                />
                
                <button onClick={handleImport} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">SINCRONIZAR AGORA</button>
              </div>
            </div>
          )}

          {activeTab !== 'SYNC' && (
            <div className="mt-12 pt-8 border-t border-slate-100">
              <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">SALVAR ALTERAÇÕES</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
