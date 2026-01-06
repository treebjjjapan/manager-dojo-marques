
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
    alert('Configurações salvas com sucesso!');
  };

  const addPlan = () => {
    const newPlan: Plan = { id: Date.now().toString(), name: 'Novo Plano', price: 0 };
    setSettings({ ...settings, plans: [...settings.plans, newPlan] });
  };

  const removePlan = (id: string) => {
    setSettings({ ...settings, plans: settings.plans.filter(p => p.id !== id) });
  };

  const addSchedule = () => {
    const newSch: Schedule = { id: Date.now().toString(), dayOfWeek: 'Segunda', time: '00:00', className: 'Nova Aula' };
    setSettings({ ...settings, schedules: [...settings.schedules, newSch] });
  };

  const removeSchedule = (id: string) => {
    setSettings({ ...settings, schedules: settings.schedules.filter(s => s.id !== id) });
  };

  const addBelt = () => {
    const beltName = prompt('Nome da nova faixa (ex: CINZA):');
    if (beltName) {
      setSettings({ ...settings, belts: [...settings.belts, beltName.toUpperCase()] });
    }
  };

  const removeBelt = (index: number) => {
    const newBelts = settings.belts.filter((_, i) => i !== index);
    setSettings({ ...settings, belts: newBelts });
  };

  const handleExport = () => {
    const token = db.exportSyncToken();
    setSyncToken(token);
    setShowQR(true);
    // Tenta copiar para o clipboard se possível
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
        // Ignora erros de leitura constantes
      });
    }, 100);
  };

  const handleImport = () => {
    if (!syncToken) {
      alert("Insira ou escaneie um token primeiro.");
      return;
    }
    if (window.confirm("Isso apagará todos os dados locais para sincronizar com o novo dispositivo. Continuar?")) {
      if (db.importSyncToken(syncToken)) {
        alert('Sincronização realizada! Reiniciando...');
        window.location.reload();
      } else {
        alert('Token inválido ou muito grande para o processamento.');
      }
    }
  };

  const TabButton: React.FC<{ id: typeof activeTab; label: string; icon: string }> = ({ id, label, icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border ${
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
        <p className="text-slate-500 text-sm">Administração central da TREE BRAZILIAN JIU JITSU</p>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
        <TabButton id="GENERAL" label="GERAL" icon="⚙️" />
        <TabButton id="PLANS" label="PLANOS" icon="💰" />
        <TabButton id="SCHEDULES" label="HORÁRIOS" icon="⏱️" />
        <TabButton id="GRADUATION" label="GRADUAÇÃO" icon="🥋" />
        <TabButton id="SYNC" label="NUVEM" icon="☁️" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {activeTab === 'GENERAL' && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Unidade</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
                  value={settings.academyName}
                  onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <div>
                  <p className="font-black text-slate-900 uppercase text-xs tracking-tight">Check-in de Inadimplentes</p>
                  <p className="text-xs text-slate-500">Permitir que alunos com mensalidade vencida usem o totem.</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg text-blue-600"
                  checked={settings.allowCheckinWithOverdue}
                  onChange={(e) => setSettings({ ...settings, allowCheckinWithOverdue: e.target.checked })}
                />
              </div>
            </div>
          )}

          {activeTab === 'PLANS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Tabela de Preços (¥)</h3>
                <button onClick={addPlan} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">ADICIONAR PLANO</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.plans.map((plan, idx) => (
                  <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <input 
                        className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold"
                        value={plan.name}
                        onChange={(e) => {
                          const newList = [...settings.plans];
                          newList[idx].name = e.target.value;
                          setSettings({ ...settings, plans: newList });
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-black">¥</span>
                        <input 
                          type="number"
                          className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-black"
                          value={plan.price}
                          onChange={(e) => {
                            const newList = [...settings.plans];
                            newList[idx].price = parseInt(e.target.value) || 0;
                            setSettings({ ...settings, plans: newList });
                          }}
                        />
                      </div>
                    </div>
                    <button onClick={() => removePlan(plan.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SCHEDULES' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Grade de Horários</h3>
                <button onClick={addSchedule} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">ADICIONAR AULA</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {settings.schedules.map((sch, idx) => (
                  <div key={sch.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <select 
                        className="bg-white border border-slate-100 rounded-lg px-2 py-2 text-[10px] font-bold"
                        value={sch.dayOfWeek}
                        onChange={(e) => {
                          const newList = [...settings.schedules];
                          newList[idx].dayOfWeek = e.target.value;
                          setSettings({ ...settings, schedules: newList });
                        }}
                      >
                        {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input 
                        type="time"
                        className="bg-white border border-slate-100 rounded-lg px-2 py-2 text-[10px] font-bold"
                        value={sch.time}
                        onChange={(e) => {
                          const newList = [...settings.schedules];
                          newList[idx].time = e.target.value;
                          setSettings({ ...settings, schedules: newList });
                        }}
                      />
                      <input 
                        className="bg-white border border-slate-100 rounded-lg px-2 py-2 text-[10px] font-bold"
                        placeholder="Nome da Aula"
                        value={sch.className}
                        onChange={(e) => {
                          const newList = [...settings.schedules];
                          newList[idx].className = e.target.value;
                          setSettings({ ...settings, schedules: newList });
                        }}
                      />
                    </div>
                    <button onClick={() => removeSchedule(sch.id)} className="p-2 text-red-300 hover:text-red-500">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'GRADUATION' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Sistema de Faixas</h3>
                <button onClick={addBelt} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">ADICIONAR FAIXA</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.belts.map((belt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">{belt}</span>
                    <button onClick={() => removeBelt(idx)} className="text-slate-400 hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SYNC' && (
            <div className="max-w-md mx-auto space-y-8 text-center py-6">
              <div className="space-y-2">
                <span className="text-5xl">📱↔️💻</span>
                <h2 className="text-lg font-black text-slate-900 uppercase mt-4">Sincronização Nuvem</h2>
                <p className="text-xs text-slate-500 leading-relaxed">Transfira dados entre PC e iPad via QR Code ou Token.</p>
              </div>

              {showQR && (
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex flex-col items-center animate-in fade-in zoom-in">
                  <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
                    <QRCodeSVG value={syncToken} size={256} level="L" includeMargin={true} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Escaneie este código no outro aparelho</p>
                  <button onClick={() => setShowQR(false)} className="text-blue-600 font-black text-[10px] uppercase">Fechar QR Code</button>
                </div>
              )}

              {isScanning && (
                <div className="fixed inset-0 bg-slate-900/95 z-[100] p-6 flex flex-col items-center justify-center">
                  <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden bg-black border-4 border-blue-600 shadow-2xl"></div>
                  <button onClick={() => setIsScanning(false)} className="mt-8 px-8 py-4 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest">Cancelar Leitura</button>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleExport} className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-lg transition-all">GERAR QR CODE</button>
                   <button onClick={startScanner} className="py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700 shadow-lg transition-all">ESCANEARE QR</button>
                </div>

                <div className="relative pt-6">
                   <div className="absolute inset-x-0 top-3 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase text-slate-300"><span className="bg-white px-4">OU VIA TEXTO</span></div>
                </div>

                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[10px] h-32 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Cole aqui o token de outro aparelho se o QR não funcionar..."
                  value={syncToken}
                  onChange={(e) => setSyncToken(e.target.value)}
                />
                
                <button onClick={handleImport} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">IMPORTAR DADOS AGORA</button>
                
                <p className="text-[9px] text-slate-400 font-bold uppercase italic">Dica: QR Codes funcionam melhor com poucos alunos. Para bases grandes com muitas fotos, prefira o Token de Texto.</p>
              </div>
            </div>
          )}

          {activeTab !== 'SYNC' && (
            <div className="mt-12 pt-8 border-t border-slate-100">
              <button 
                onClick={handleSave}
                className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl active:scale-[0.98] transition-all"
              >
                SALVAR CONFIGURAÇÕES
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
