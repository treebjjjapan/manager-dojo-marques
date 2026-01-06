
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { Student, Belt } from '../types';

const BELTS: Belt[] = ['BRANCA', 'AZUL', 'ROXA', 'MARROM', 'PRETA'];

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setStudents(db.getStudents());
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
      
      // Parar stream
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
    const photo = editingStudent?.photo || ''; // No MVP, mantemos a foto anterior ou capturamos nova manualmente

    const student: Student = {
      id: editingStudent?.id || Date.now().toString(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      birthDate: formData.get('birthDate') as string,
      belt: (formData.get('belt') as Belt) || 'BRANCA',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alunos</h1>
        <button 
          onClick={() => { setEditingStudent(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <span>➕</span> Novo Aluno
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">🔍</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(s => (
          <div 
            key={s.id} 
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-200">
                {s.photo ? (
                  <img src={s.photo} className="w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">👤</span>
                )}
                <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${s.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
                <p className="text-xs text-slate-500 truncate">{s.phone || 'Sem contato'}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border uppercase ${
                    s.belt === 'BRANCA' ? 'bg-white border-slate-300 text-slate-600' :
                    s.belt === 'AZUL' ? 'bg-blue-600 border-blue-600 text-white' :
                    s.belt === 'ROXA' ? 'bg-purple-600 border-purple-600 text-white' :
                    s.belt === 'MARROM' ? 'bg-amber-800 border-amber-800 text-white' :
                    'bg-slate-900 border-slate-900 text-white'
                  }`}>
                    {s.belt}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{s.stripes} Graus</span>
                </div>
              </div>
              <button 
                onClick={() => { setEditingStudent(s); setShowModal(true); }}
                className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h2>
              <button onClick={() => { setShowModal(false); setEditingStudent(null); setIsCapturing(false); }} className="text-2xl text-slate-400 hover:text-red-500 transition-colors">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden mb-3 border-2 border-dashed border-slate-300 relative group">
                  {isCapturing ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : editingStudent?.photo ? (
                    <img src={editingStudent.photo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">👤</span>
                  )}
                </div>
                {!isCapturing ? (
                  <button type="button" onClick={startCamera} className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                    TIRAR FOTO
                  </button>
                ) : (
                  <button type="button" onClick={() => {
                    const photo = capturePhoto();
                    if (editingStudent) setEditingStudent({...editingStudent, photo});
                    else setEditingStudent({ name: '', belt: 'BRANCA', stripes: 0, status: 'ACTIVE', photo } as Student);
                  }} className="text-xs font-bold text-white bg-green-600 px-4 py-2 rounded-full">
                    CAPTURAR AGORA
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
                  <input name="name" required defaultValue={editingStudent?.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg" placeholder="Digite o nome..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Telefone/WhatsApp</label>
                    <input name="phone" defaultValue={editingStudent?.phone} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data Nasc.</label>
                    <input name="birthDate" type="date" defaultValue={editingStudent?.birthDate} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Graduação</label>
                    <select name="belt" defaultValue={editingStudent?.belt} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                      {BELTS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Graus</label>
                    <select name="stripes" defaultValue={editingStudent?.stripes} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                      {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} Graus</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select name="status" defaultValue={editingStudent?.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="ACTIVE">ATIVO</option>
                    <option value="INACTIVE">INATIVO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observações</label>
                  <textarea name="notes" defaultValue={editingStudent?.notes} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Problemas de joelho..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10">Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
