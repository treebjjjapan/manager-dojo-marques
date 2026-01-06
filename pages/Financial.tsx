
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { MonthlyFee, Student, Plan, PaymentMethod } from '../types.ts';

const Financial: React.FC = () => {
  const [fees, setFees] = useState<MonthlyFee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'PAID'>('ALL');

  useEffect(() => {
    setFees(db.getFees());
    setStudents(db.getStudents());
  }, []);

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'N/A';

  const handleReceive = (fee: MonthlyFee, method: PaymentMethod) => {
    const updated = fees.map(f => f.id === fee.id ? {
      ...f,
      status: 'PAID' as const,
      paymentDate: new Date().toISOString(),
      paymentMethod: method
    } : f);
    setFees(updated);
    db.saveFees(updated);
  };

  const filteredFees = fees.filter(f => {
    if (filter === 'OVERDUE') return f.status === 'OVERDUE';
    if (filter === 'PAID') return f.status === 'PAID';
    return true;
  }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const totalReceived = fees
    .filter(f => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = fees
    .filter(f => f.status === 'OVERDUE')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 uppercase">Financeiro</h1>
        <div className="flex gap-2">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>TODOS</button>
          <button onClick={() => setFilter('PAID')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'PAID' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>PAGOS</button>
          <button onClick={() => setFilter('OVERDUE')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'OVERDUE' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>VENCIDOS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 p-6 rounded-3xl">
          <span className="text-green-600 text-[10px] font-black uppercase tracking-widest">Total Recebido (Histórico)</span>
          <p className="text-3xl font-black text-green-900 mt-1">¥ {totalReceived.toLocaleString('ja-JP')}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl">
          <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">Pendente / Vencido</span>
          <p className="text-3xl font-black text-red-900 mt-1">¥ {totalPending.toLocaleString('ja-JP')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFees.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{getStudentName(f.studentId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {new Date(f.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">¥ {f.amount.toLocaleString('ja-JP')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                      f.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                      f.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {f.status === 'PAID' ? 'PAGO' : f.status === 'OVERDUE' ? 'VENCIDO' : 'A VENCER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {f.status !== 'PAID' && (
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleReceive(f, 'CASH')} className="p-2 bg-slate-100 hover:bg-green-600 hover:text-white rounded-lg transition-all text-xs font-bold">💵</button>
                        <button onClick={() => handleReceive(f, 'PIX')} className="p-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-bold">📱</button>
                        <button onClick={() => handleReceive(f, 'CARD')} className="p-2 bg-slate-100 hover:bg-purple-600 hover:text-white rounded-lg transition-all text-xs font-bold">💳</button>
                      </div>
                    )}
                    {f.status === 'PAID' && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{f.paymentMethod} • {new Date(f.paymentDate || '').toLocaleDateString('pt-BR')}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic uppercase text-[10px] tracking-widest font-bold">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financial;
