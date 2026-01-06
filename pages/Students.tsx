
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db.ts';
import { Student } from '../types.ts';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [belts, setBelts] = useState<string[]>(db.getSettings().belts);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setStudents(db.getStudents());
    setBelts(db.getSettings().belts);
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera", err);
      setIsCapturing(false);
      alert("Câmera não disponível. Verifique as permissões.");
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      // Reduzir resolução da foto para garantir que o Sync Token via QR Code funcione
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, 160, 160);
      const photo = canvas.toDataURL('image/jpeg', 0.4); 
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
      return photo;
    }
    return '';
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente EXCLUIR o aluno "${name.toUpperCase()}"? Todos os registros serão apagados.`)) {
      const newStudents = students.filter(s => s.id !== id);
      setStudents(newStudents);
      db.saveStudents(newStudents);
      
      const allFees = db.getFees();
      db.saveFees(allFees.filter(f => f.studentId !== id));
      
      const allAttendance = db.getAttendance();
      db.saveAttendance(allAttendance.filter(a => a.studentId !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photo = editingStudent?.photo || ''; 

    const student: Student = {
      id: editingStudent?.id || Date.now().toString(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      birthDate: formData.get('birthDate') as string,
      belt: (formData.get('belt') as string) || (belts[0] || 'BRANCA'),
      stripes: parseInt(formData.get('stripes') as string) || 0,
      status: (formData.get('status') as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      photo: photo,
      lastGraduationUpdate: editingStudent?.lastGraduationUpdate || new Date().toISOString(),
      graduationHistory: editingStudent?.graduationHistory || []
    };

    const newStudents = editingStudent && students.some(s => s.id === editingStudent.id)
      ? students.map(s => s.id === editingStudent.id ? student : s)
      : [...students, student];

    setStudents(newStudents);
    db.saveStudents(newStudents);
    setShowModal(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Alunos</h1>
        <button 
          onClick={() => { setEditingStudent(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all text-[10px] uppercase tracking-widest"
        >
          Novo Aluno
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full bg-white border border-slate-200 rounded-3xl px-12 py-4 focus:ring-4 focus:ring-blue-50 outline-none shadow-sm font-semibold"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2">🔍</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden relative border border-slate-100 flex-shrink-0">
                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-xl opacity-20">👤</span>}
                <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${s.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 truncate uppercase text-xs leading-none">{s.name}</h3>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-slate-900 text-white">{s.belt}</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{s.stripes} Graus</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingStudent(s); setShowModal(true); }} className="p-2 text-slate-300 hover:text-blue-600">✏️</button>
                <button onClick={() => handleDelete(s.id, s.name)} className="p-2 text-slate-300 hover:text-red-500">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h2>
              <button onClick={() => { setShowModal(false); setEditingStudent(null); setIsCapturing(false); }} className="text-2xl text-slate-300 font-black">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 overflow-hidden mb-3 border-2 border-dashed border-slate-200 relative flex items-center justify-center">
                  {isCapturing ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : editingStudent?.photo ? (
                    <img src={editingStudent.photo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-5 font-black">👤</span>
                  )}
                </div>
                {!isCapturing ? (
                  <button type="button" onClick={startCamera} className="text-[9px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase">📸 Foto</button>
                ) : (
                  <button type="button" onClick={() => {
                    const photo = capturePhoto();
                    if (editingStudent) setEditingStudent({...editingStudent, photo});
                    else setEditingStudent({ name: '', belt: belts[0], stripes: 0, status: 'ACTIVE', photo } as Student);
                  }} className="text-[9px] font-black text-white bg-green-600 px-4 py-1.5 rounded-full uppercase">✨ Capturar</button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
                  <input name="name" required defaultValue={editingStudent?.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:bg-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Faixa</label>
                    <select name="belt" defaultValue={editingStudent?.belt} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black uppercase text-[10px]">
                      {belts.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Graus</label>
                    <select name="stripes" defaultValue={editingStudent?.stripes} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-[10px]">
                      {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} Graus</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Salvar Aluno</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
