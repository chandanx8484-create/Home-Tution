
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Student, AttendanceRecord, FeeRecord } from './types';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import DailyAttendance from './components/DailyAttendance';
import MonthlyReport from './components/MonthlyReport';
import FeesManagement from './components/FeesManagement';
import BirthdayHub from './components/BirthdayHub';
import BackupCenter from './components/BackupCenter';

const STORAGE_KEY = 'scholars_point_attendance_2026_v2';

const NavLink: React.FC<{ to: string; label: string; icon: string }> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-[#1a365d] text-white shadow-lg shadow-blue-100' 
          : 'text-slate-500 hover:bg-blue-50 hover:text-[#1a365d]'
      }`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="font-semibold">{label}</span>
    </Link>
  );
};

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { students, attendance, fees } = JSON.parse(saved);
      
      // Auto-assign roll numbers if they are missing from saved data
      let currentMax = 0;
      const migratedStudents = (students || []).map((s: any) => {
        const roll = s.rollNumber || ++currentMax;
        if (roll > currentMax) currentMax = roll;
        return {
          ...s,
          rollNumber: roll,
          archived: s.archived || false
        };
      });

      setStudents(migratedStudents);
      setAttendance(attendance || []);
      setFees(fees || []);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ students, attendance, fees }));
  }, [students, attendance, fees]);

  const handleAddStudent = (student: Student) => {
    const nextRoll = students.length > 0 ? Math.max(...students.map(s => s.rollNumber || 0)) + 1 : 1;
    setStudents(prev => [...prev, { ...student, rollNumber: nextRoll, archived: false }]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Move to Archive? Student will be removed from daily lists, but all attendance/fee HISTORY will be saved.")) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, archived: true } : s));
    }
  };

  const handleRestoreStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, archived: false } : s));
  };

  const handleMarkAttendance = (records: AttendanceRecord[]) => {
    setAttendance(prev => {
      const attendanceMap = new Map();
      prev.forEach(r => attendanceMap.set(`${r.date}-${r.studentId}`, r));
      records.forEach(r => attendanceMap.set(`${r.date}-${r.studentId}`, r));
      return Array.from(attendanceMap.values());
    });
  };

  const handleUpdateFee = (record: FeeRecord) => {
    setFees(prev => {
      const filtered = prev.filter(f => f.id !== record.id);
      return [...filtered, record];
    });
  };

  const handleImportData = (data: any) => {
    if (data.students) setStudents(data.students);
    if (data.attendance) setAttendance(data.attendance);
    if (data.fees) setFees(data.fees);
  };

  const activeStudents = students.filter(s => !s.archived);

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col sticky top-0 h-auto md:h-screen z-50">
          <div className="flex flex-col items-center mb-10 px-2 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-3xl text-indigo-900 border-2 border-slate-200 shadow-inner">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase leading-none">
                Scholars Point
              </h1>
              <p className="text-[#b22222] font-bold text-sm tracking-widest mt-1 uppercase">Classes</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-tighter mt-1 italic border-t border-slate-100 pt-1">
                — READ. LEARN. GROW. —
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto">
            <NavLink to="/" label="Dashboard" icon="fa-th-large" />
            <NavLink to="/attendance" label="Daily Attendance" icon="fa-calendar-check" />
            <NavLink to="/report" label="Monthly Analytics" icon="fa-chart-pie" />
            <NavLink to="/fees" label="Fees Tracker" icon="fa-wallet" />
            <NavLink to="/birthdays" label="Birthday Hub" icon="fa-cake-candles" />
            <NavLink to="/students" label="Student Directory" icon="fa-users" />
            <NavLink to="/backup" label="Backup Center" icon="fa-shield-halved" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Current Session</p>
              <p className="text-sm text-[#1a365d] font-bold">Academic Year 2026</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
          <header className="flex justify-between items-center mb-8">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Portal Hub</h2>
              <p className="text-slate-500 font-medium text-sm">Managing Excellence • 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{new Date().toDateString()}</p>
                <p className="text-xs text-[#b22222] font-semibold tracking-widest uppercase">Open Portal</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-1.5 overflow-hidden ring-2 ring-slate-50">
                <i className="fas fa-user-check text-[#1a365d] text-xl"></i>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard students={activeStudents} attendance={attendance} fees={fees} />} />
              <Route path="/attendance" element={<DailyAttendance students={activeStudents} attendance={attendance} onMark={handleMarkAttendance} />} />
              <Route path="/report" element={<MonthlyReport students={activeStudents} attendance={attendance} onMark={handleMarkAttendance} />} />
              <Route path="/fees" element={<FeesManagement students={activeStudents} fees={fees} onUpdateFee={handleUpdateFee} />} />
              <Route path="/birthdays" element={<BirthdayHub students={activeStudents} />} />
              <Route path="/students" element={<StudentManagement students={students} onAdd={handleAddStudent} onUpdate={handleUpdateStudent} onDelete={handleDeleteStudent} onRestore={handleRestoreStudent} />} />
              <Route path="/backup" element={<BackupCenter students={students} attendance={attendance} fees={fees} onImport={handleImportData} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
