
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Student, Belt } from '../types';

const Graduation: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editing, setEditing] = useState<Student | null>(null);

  useEffect(() => {
    setStudents(db.getStudents().filter(s => s.status === 'ACTIVE'));
  }, []);

  const updateGraduation = (studentId: string, belt: Belt, stripes: number) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          belt,
          stripes,
          lastGraduationUpdate: new Date().toISOString(),
          graduationHistory: [
            ...s.graduationHistory,
            {
              date: new Date().toISOString(),
              belt,
              stripes,
              author: 'Admin'
            }
          ]
        };
      }
      return s;
    });
    setStudents(updated);
    db.saveStudents(updated);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Graduação</h1>
        <p className="text-xs text-slate-500">Mantenha os graus e faixas atualizados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-2xl opacity-10">🥋</span>}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Desde {new Date(s.lastGraduationUpdate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-black uppercase border shadow-sm ${
                s.belt === 'BRANCA' ? 'bg-white text-slate-900 border-slate-200' :
                s.belt === 'AZUL' ? 'bg-blue-600 text-white border-blue-500' :
                s.belt === 'ROXA' ? 'bg-purple-600 text-white border-purple-500' :
                s.belt === 'MARROM' ? 'bg-amber-800 text-white border-amber-700' :
                'bg-slate-900 text-white border-slate-950'
              }`}>
                {s.belt}
              </span>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-6 rounded-sm ${i < s.stripes ? 'bg-black border border-slate-400' : 'bg-slate-100'}`}></div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setEditing(s)}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              PROMOVER ALUNO
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Promover Aluno</h2>
              <p className="text-sm text-slate-500 mb-6">{editing.name}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nova Faixa</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                    defaultValue={editing.belt}
                    id="newBelt"
                  >
                    {['BRANCA', 'AZUL', 'ROXA', 'MARROM', 'PRETA'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Novos Graus</label>
                   <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                    defaultValue={editing.stripes}
                    id="newStripes"
                  >
                    {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} Graus</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                 <button onClick={() => setEditing(null)} className="flex-1 py-4 text-slate-500 font-bold">Cancelar</button>
                 <button 
                    onClick={() => {
                      const belt = (document.getElementById('newBelt') as HTMLSelectElement).value as Belt;
                      const stripes = parseInt((document.getElementById('newStripes') as HTMLSelectElement).value);
                      updateGraduation(editing.id, belt, stripes);
                    }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-900/10"
                  >
                    CONFIRMAR
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Graduation;
