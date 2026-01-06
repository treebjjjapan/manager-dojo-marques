
import { Student, MonthlyFee, Attendance, AppSettings, SyncData } from './types';

const DB_KEYS = {
  STUDENTS: 'tree_bjj_students',
  FEES: 'tree_bjj_fees',
  ATTENDANCE: 'tree_bjj_attendance',
  SETTINGS: 'tree_bjj_settings',
  USER: 'tree_bjj_user'
};

const DEFAULT_SETTINGS: AppSettings = {
  academyName: "TREE BRAZILIAN JIU JITSU",
  allowCheckinWithOverdue: true,
  plans: [
    { id: '1', name: 'Plano Adulto', price: 10000 },
    { id: '2', name: 'Plano Kids', price: 8000 }
  ],
  schedules: [
    { id: '1', dayOfWeek: 'Segunda', time: '19:00', className: 'Jiu-Jitsu Adulto' },
    { id: '2', dayOfWeek: 'Terça', time: '18:00', className: 'Jiu-Jitsu Kids' }
  ]
};

export const db = {
  getStudents: (): Student[] => JSON.parse(localStorage.getItem(DB_KEYS.STUDENTS) || '[]'),
  saveStudents: (data: Student[]) => localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(data)),
  
  getFees: (): MonthlyFee[] => JSON.parse(localStorage.getItem(DB_KEYS.FEES) || '[]'),
  saveFees: (data: MonthlyFee[]) => localStorage.setItem(DB_KEYS.FEES, JSON.stringify(data)),
  
  getAttendance: (): Attendance[] => JSON.parse(localStorage.getItem(DB_KEYS.ATTENDANCE) || '[]'),
  saveAttendance: (data: Attendance[]) => localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify(data)),
  
  getSettings: (): AppSettings => JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS)),
  saveSettings: (data: AppSettings) => localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data)),

  // Sincronização
  exportSyncToken: (): string => {
    const data: SyncData = {
      students: db.getStudents(),
      monthlyFees: db.getFees(),
      attendances: db.getAttendance(),
      settings: db.getSettings(),
      version: 1,
      timestamp: Date.now()
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  },

  importSyncToken: (token: string): boolean => {
    try {
      const decoded = decodeURIComponent(escape(atob(token)));
      const data: SyncData = JSON.parse(decoded);
      if (data.students) db.saveStudents(data.students);
      if (data.monthlyFees) db.saveFees(data.monthlyFees);
      if (data.attendances) db.saveAttendance(data.attendances);
      if (data.settings) db.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error("Erro ao importar token", e);
      return false;
    }
  }
};
