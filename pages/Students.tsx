
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db.ts';
import { Student, Belt } from '../types.ts';

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
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL('image/jpeg');
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
      return photo;
    }
    return '';
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
      notes: formData.get('notes') as string,
      photo: photo,
      lastGraduationUpdate: new Date().toISOString(),
      graduationHistory: editingStudent?.graduationHistory || []
    };

    const newStudents = editingStudent 
      ? students.map(s => s.id === editingStudent.id ? student : s)
      : [...students, student];

    setStudents(newStudents);
    db.saveStudents(newStudents);
    setShowModal(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Alunos</h1>
        <button 
          onClick={() => { setEditingStudent(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
        >
          <span>➕</span> Novo Aluno
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="w-full bg-white border border-slate-200 rounded-3xl px-14 py-5 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none shadow-sm text-lg font-semibold"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[24px] bg-slate-50 flex-shrink-0 overflow-hidden relative border border-slate-100">
                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-10">👤</span>}
                <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-4 border-white ${s.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 truncate leading-tight uppercase text-sm">{s.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{s.phone || 'Sem contato'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black border uppercase bg-slate-900 text-white">
                    {s.belt}
                  </span>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-full">{s.stripes} Graus</span>
                </div>
              </div>
              <button onClick={() => { setEditingStudent(s); setShowModal(true); }} className="absolute top-4 right-4 p-2 text-slate-200 hover:text-blue-600 transition-colors">✏️</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h2>
              <button onClick={() => { setShowModal(false); setEditingStudent(null); setIsCapturing(false); }} className="text-3xl text-slate-300 hover:text-red-500 transition-colors">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-36 h-36 rounded-[32px] bg-slate-50 overflow-hidden mb-4 border-2 border-dashed border-slate-200 relative group flex items-center justify-center">
                  {isCapturing ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : editingStudent?.photo ? (
                    <img src={editingStudent.photo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-5">👤</span>
                  )}
                </div>
                {!isCapturing ? (
                  <button type="button" onClick={startCamera} className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-6 py-2 rounded-full hover:bg-blue-100 uppercase transition-all">📸 TIRAR FOTO</button>
                ) : (
                  <button type="button" onClick={() => {
                    const photo = capturePhoto();
                    if (editingStudent) setEditingStudent({...editingStudent, photo});
                    else setEditingStudent({ name: '', belt: belts[0], stripes: 0, status: 'ACTIVE', photo } as Student);
                  }} className="text-[10px] font-black tracking-widest text-white bg-green-600 px-6 py-2 rounded-full uppercase">✨ CAPTURAR</button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
                  <input name="name" required defaultValue={editingStudent?.name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Telefone</label>
                    <input name="phone" defaultValue={editingStudent?.phone} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Data Nasc.</label>
                    <input name="birthDate" type="date" defaultValue={editingStudent?.birthDate} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Faixa</label>
                    <select name="belt" defaultValue={editingStudent?.belt} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black uppercase text-xs focus:ring-4 focus:ring-blue-100 outline-none appearance-none">
                      {belts.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Graus</label>
                    <select name="stripes" defaultValue={editingStudent?.stripes} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black text-xs focus:ring-4 focus:ring-blue-100 outline-none">
                      {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} Graus</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Status</label>
                  <select name="status" defaultValue={editingStudent?.status} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black text-xs">
                    <option value="ACTIVE">ATIVO / TREINANDO</option>
                    <option value="INACTIVE">INATIVO / AFASTADO</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">SALVAR ALUNO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
