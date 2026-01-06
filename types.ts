
export type UserRole = 'ADMIN' | 'RECEPTION' | 'TEACHER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type Belt = 'BRANCA' | 'AZUL' | 'ROXA' | 'MARROM' | 'PRETA';

export interface GraduationHistory {
  date: string;
  belt: Belt;
  stripes: number;
  author: string;
}

export interface Student {
  id: string;
  name: string;
  photo?: string;
  phone?: string;
  birthDate?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  belt: Belt;
  stripes: number; // 0-4
  lastGraduationUpdate: string;
  graduationHistory: GraduationHistory[];
}

export interface Plan {
  id: string;
  name: string;
  price: number; // Em Yen (¥)
}

export type PaymentMethod = 'PIX' | 'CASH' | 'CARD';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface MonthlyFee {
  id: string;
  studentId: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  dateTime: string;
  origin: 'TOTEM' | 'MANUAL';
  class: string;
}

export interface Schedule {
  id: string;
  dayOfWeek: string;
  time: string;
  className: string;
}

export interface AppSettings {
  academyName: string;
  plans: Plan[];
  schedules: Schedule[];
  allowCheckinWithOverdue: boolean;
}

export interface SyncData {
  students: Student[];
  monthlyFees: MonthlyFee[];
  attendances: Attendance[];
  settings: AppSettings;
  version: number;
  timestamp: number;
}
