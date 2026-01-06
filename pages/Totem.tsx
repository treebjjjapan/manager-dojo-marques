
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db.ts';
import { Student, Attendance, AppSettings } from '../types.ts';

const Totem: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<{name: string, time: string} | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPass, setExitPass] = useState('');
  const [viewMode, setViewMode] = useState<'NAME' | 'PHOTO'>('NAME');

  useEffect(() => {
    setStudents(db.getStudents().filter(s => s.status === 'ACTIVE'));
    // Auto-close success message
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleCheckin = (student: Student) => {
    const fees = db.getFees().filter(f => f.studentId === student.id);
    const isOverdue = fees.some(f => f.status === 'OVERDUE');

    if (isOverdue && !settings.allowCheckinWithOverdue) {
      alert(`⚠️ Atenção: ${student.name}, sua mensalidade está vencida. Favor regularizar na recepção.`);
      return;
    }

    const now = new Date();
    const newAttendance: Attendance = {
      id: Date.now().toString(),
      studentId: student.id,
      dateTime: now.toISOString(),
      origin: 'TOTEM',
      class: 'Treino'
    };

    const currentAttendance = db.getAttendance();
    db.saveAttendance([...currentAttendance, newAttendance]);

    setSuccessMsg({
      name: student.name.split(' ')[0],
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    setSearch('');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExit = () => {
    if (exitPass === 'tree123') { // Senha padrão para o MVP
      navigate('/');
    } else {
      alert("Senha incorreta");
      setExitPass('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden flex flex-col no-scrollbar select-none">
      {/* Header do Totem */}
      <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xl">T</div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight uppercase">{settings.academyName}</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Painel de Check-in</p>
          </div>
        </div>
        
        {/* Toggle de Modo de Visualização */}
        <div className="hidden md:flex bg-slate-900/50 p-1 rounded-2xl border border-slate-700">
          <button 
            onClick={() => setViewMode('NAME')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === 'NAME' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            NOME
          </button>
          <button 
            onClick={() => setViewMode('PHOTO')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === 'PHOTO' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            FOTOS
          </button>
        </div>

        <div className="text-right">
          <p className="text-white font-mono text-2xl font-bold tracking-tighter">
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-400 text-xs font-bold uppercase">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-6">
        
        {/* Barra de Pesquisa / Modo Mobile Toggle */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 shadow-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder={viewMode === 'NAME' ? "Digite seu nome para treinar..." : "Filtrar fotos por nome..."}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-16 py-6 text-2xl font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">🔍</span>
            </div>
          </div>
          
          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex bg-white/5 p-1 rounded-2xl">
            <button onClick={() => setViewMode('NAME')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest ${viewMode === 'NAME' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>BUSCA POR NOME</button>
            <button onClick={() => setViewMode('PHOTO')} className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest ${viewMode === 'PHOTO' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>BUSCA POR FOTO</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
          {viewMode === 'NAME' ? (
            // Lista de Nomes (Original)
            search.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
                {filteredStudents.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleCheckin(s)}
                    className="bg-slate-800 border border-slate-700 p-4 rounded-3xl flex items-center gap-4 hover:bg-blue-600 hover:border-blue-500 active:scale-95 transition-all text-left group"
                  >
                    <div className="w-16 h-16 bg-slate-700 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-slate-600 group-hover:border-blue-400">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-2xl opacity-20">🥋</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-white truncate group-hover:text-white uppercase">{s.name}</p>
                      <p className="text-[10px] text-slate-400 group-hover:text-blue-200 font-bold uppercase">{s.belt}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
                <div className="text-8xl">🥋</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Bom Treino!</h3>
                <p className="text-lg">Digite seu nome acima para confirmar presença</p>
              </div>
            )
          ) : (
            // Grade de Fotos
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-24">
              {filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleCheckin(s)}
                  className="bg-slate-800 border border-slate-700 rounded-[32px] overflow-hidden group hover:border-blue-500 active:scale-95 transition-all relative aspect-square"
                >
                  <div className="w-full h-full">
                    {s.photo ? (
                      <img src={s.photo} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center text-slate-500">
                        <span className="text-4xl">🥋</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover:from-blue-900 transition-all"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{s.name.split(' ')[0]}</p>
                    <div className={`mt-1 h-1 w-8 mx-auto rounded-full ${
                      s.belt === 'BRANCA' ? 'bg-white' :
                      s.belt === 'AZUL' ? 'bg-blue-600' :
                      s.belt === 'ROXA' ? 'bg-purple-600' :
                      s.belt === 'MARROM' ? 'bg-amber-800' : 'bg-black'
                    }`}></div>
                  </div>
                </button>
              ))}
              {filteredStudents.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500">
                   <p className="text-lg font-bold uppercase">Nenhum aluno encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botões Flutuantes / Atalhos Rápidos Totem */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
         <button 
           onClick={() => setViewMode(v => v === 'NAME' ? 'PHOTO' : 'NAME')}
           className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:bg-blue-700 transition-all"
         >
           {viewMode === 'NAME' ? '📷 VER FOTOS' : '⌨️ BUSCA POR NOME'}
         </button>
      </div>

      {/* Success Notification Overlay */}
      {successMsg && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6 animate-in fade-in zoom-in duration-300">
           <div className="bg-green-600 text-white rounded-[40px] p-12 shadow-[0_0_100px_rgba(34,197,94,0.4)] flex flex-col items-center text-center max-w-md w-full border-4 border-green-400">
              <span className="text-8xl mb-6">✅</span>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Check-in Feito!</h2>
              <p className="text-2xl font-bold text-green-100 mb-4">{successMsg.name}</p>
              <p className="text-lg font-mono bg-green-700 px-6 py-2 rounded-full font-bold">ÀS {successMsg.time}</p>
              <p className="mt-8 text-sm font-bold uppercase tracking-widest text-green-200">Oss! Vá para o tatame.</p>
           </div>
        </div>
      )}

      {/* Botão invisível para sair */}
      <button 
        onClick={() => setShowExitModal(true)}
        className="fixed bottom-4 right-4 w-12 h-12 opacity-5 hover:opacity-100 transition-opacity flex items-center justify-center bg-white/10 rounded-full"
      >
        ⚙️
      </button>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-[110] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Sair do Modo Totem</h3>
            <p className="text-slate-500 text-sm mb-6">Digite a senha de administração para retornar ao painel.</p>
            <input 
              type="password" 
              className="w-full bg-slate-100 border-2 border-slate-200 p-4 rounded-xl mb-4 outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
              value={exitPass}
              onChange={(e) => setExitPass(e.target.value)}
              placeholder="Senha"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowExitModal(false)} className="flex-1 p-4 font-bold text-slate-500">Cancelar</button>
              <button onClick={handleExit} className="flex-1 p-4 font-bold bg-slate-900 text-white rounded-xl">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Totem;
