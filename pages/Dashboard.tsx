
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Student, MonthlyFee } from '../types';

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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
        <p className="text-slate-500">Visão geral da TREE BRAZILIAN JIU JITSU</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Alunos Ativos</span>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">Sincronizado</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{activeStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Receita Mensal (Faturado)</span>
            <span className="text-green-500 text-xl">¥</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">¥ {revenueThisMonth.toLocaleString('ja-JP')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Inadimplentes</span>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Atenção</span>
          </div>
          <p className="text-3xl font-extrabold text-red-600 mt-2">{overdueFees}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🥋</span> Próximas Graduações
          </h3>
          <div className="space-y-3">
            {students.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                    {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span>👤</span>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">{s.belt} - {s.stripes} Graus</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-400">
                  Há 2 meses
                </div>
              </div>
            ))}
            {students.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum aluno cadastrado.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>⏱️</span> Horários do Dia
          </h3>
          <div className="space-y-3">
             {db.getSettings().schedules.map(sch => (
               <div key={sch.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg font-mono text-xs font-bold">
                      {sch.time}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{sch.className}</p>
                      <p className="text-xs text-blue-600 font-medium">{sch.dayOfWeek}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Tatame 01</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
