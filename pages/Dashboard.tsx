
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { Student, MonthlyFee } from '../types.ts';

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<MonthlyFee[]>([]);

  useEffect(() => {
    setStudents(db.getStudents());
    setFees(db.getFees());
  }, []);

  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  const overdueFees = fees.filter(f => f.status === 'OVERDUE').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const revenueThisMonth = fees
    .filter(f => {
      const d = new Date(f.paymentDate || '');
      return f.status === 'PAID' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Dashboard</h1>
        <p className="text-slate-500 text-sm italic">TREE BRAZILIAN JIU JITSU</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Alunos Ativos</span>
            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter">On-line</span>
          </div>
          <p className="text-4xl font-black text-slate-900 mt-2">{activeStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Receita do Mês</span>
            <span className="text-blue-600 font-black">¥</span>
          </div>
          <p className="text-4xl font-black text-slate-900 mt-2">¥ {revenueThisMonth.toLocaleString('ja-JP')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Atrasados</span>
            <span className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-full font-black uppercase">Alerta</span>
          </div>
          <p className="text-4xl font-black text-red-600 mt-2">{overdueFees}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <span className="bg-slate-900 text-white p-2 rounded-xl">🥋</span> Próximas Graduações
          </h3>
          <div className="space-y-3">
            {students.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                    {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">{s.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{s.belt} • {s.stripes} GRAUS</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-300 group-hover:text-blue-600">VER</div>
              </div>
            ))}
            {students.length === 0 && <p className="text-sm text-slate-400 italic text-center py-8">Nenhum aluno cadastrado.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <span className="bg-blue-600 text-white p-2 rounded-xl">⏱️</span> Agenda de Hoje
          </h3>
          <div className="space-y-3">
             {db.getSettings().schedules.map(sch => (
               <div key={sch.id} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded-xl font-mono text-xs font-black">
                      {sch.time}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase leading-none">{sch.className}</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">{sch.dayOfWeek}</p>
                    </div>
                  </div>
               </div>
             ))}
             {db.getSettings().schedules.length === 0 && <p className="text-sm text-slate-400 italic text-center py-8">Nenhum horário configurado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
