
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'holiday';
export type PaymentStatus = 'paid' | 'unpaid' | 'pending';

export interface Student {
  id: string;
  rollNumber: number; // Sequential ID (1, 2, 3...)
  name: string;
  grade: string;
  phone: string;
  dob?: string; // Date of Birth (YYYY-MM-DD)
  enrollmentDate: string;
  monthlyFee: number;
  feeDay: number; // Day of the month (1-31)
  archived?: boolean; 
  photo?: string; // Base64 encoded image string
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: number; // 0-11
  year: number;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
}

export interface AppState {
  students: Student[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
}
