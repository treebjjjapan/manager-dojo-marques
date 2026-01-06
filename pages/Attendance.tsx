
import React, { useState, useEffect } from 'react';
import { db } from '../db.ts';
import { Attendance, Student } from '../types.ts';

const AttendancePage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    setAttendances(db.getAttendance().sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
    setStudents(db.getStudents());
  }, []);

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Removido';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 uppercase">Histórico de Presença</h1>
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Tempo Real</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Turma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendances.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900 uppercase text-xs">{getStudentName(a.studentId)}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {new Date(a.dateTime).toLocaleDateString('pt-BR')} {new Date(a.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${a.origin === 'TOTEM' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {a.origin}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-black uppercase">{a.class}</td>
                </tr>
              ))}
              {attendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic uppercase text-[10px] tracking-widest font-bold">Nenhuma presença registrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
