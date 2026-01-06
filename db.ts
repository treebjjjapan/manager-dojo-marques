
import { Student, MonthlyFee, Attendance, AppSettings, SyncData } from './types.ts';

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
  belts: ['BRANCA', 'AZUL', 'ROXA', 'MARROM', 'PRETA'],
  plans: [
    { id: '1', name: 'Plano Adulto', price: 10000 },
    { id: '2', name: 'Plano Kids', price: 8000 }
  ],
  schedules: [
    { id: '1', dayOfWeek: 'Segunda', time: '19:00', className: 'Jiu-Jitsu Adulto' },
    { id: '2', dayOfWeek: 'Terça', time: '18:00', className: 'Jiu-Jitsu Kids' }
  ]
};

const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Erro ao ler ${key}:`, e);
    return fallback;
  }
};

export const db = {
  getStudents: (): Student[] => safeParse(DB_KEYS.STUDENTS, []),
  saveStudents: (data: Student[]) => localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(data)),
  
  getFees: (): MonthlyFee[] => safeParse(DB_KEYS.FEES, []),
  saveFees: (data: MonthlyFee[]) => localStorage.setItem(DB_KEYS.FEES, JSON.stringify(data)),
  
  getAttendance: (): Attendance[] => safeParse(DB_KEYS.ATTENDANCE, []),
  saveAttendance: (data: Attendance[]) => localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify(data)),
  
  getSettings: (): AppSettings => safeParse(DB_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (data: AppSettings) => localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data)),

  exportSyncToken: (): string => {
    const data: SyncData = {
      students: db.getStudents(),
      monthlyFees: db.getFees(),
      attendances: db.getAttendance(),
      settings: db.getSettings(),
      version: 1,
      timestamp: Date.now()
    };
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  },

  importSyncToken: (token: string): boolean => {
    try {
      const decoded = decodeURIComponent(atob(token).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      const data: SyncData = JSON.parse(decoded);
      if (data.students) db.saveStudents(data.students);
      if (data.monthlyFees) db.saveFees(data.monthlyFees);
      if (data.attendances) db.saveAttendance(data.attendances);
      if (data.settings) db.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error("Erro ao importar token:", e);
      return false;
    }
  }
};
