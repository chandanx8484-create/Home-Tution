
import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import { STATUS_COLORS, STATUS_ICONS } from '../constants';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  onMark: (records: AttendanceRecord[]) => void;
}

const DailyAttendance: React.FC<Props> = ({ students, attendance, onMark }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({});

  // Sort students by roll number for the list
  const sortedStudents = [...students].sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));

  useEffect(() => {
    const dayRecords = attendance.filter(r => r.date === selectedDate);
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      const match = dayRecords.find(r => r.studentId === s.id);
      initial[s.id] = match ? match.status : 'present';
    });
    setLocalStatuses(initial);
  }, [selectedDate, students, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const records: AttendanceRecord[] = students.map(s => ({
      date: selectedDate,
      studentId: s.id,
      status: localStatuses[s.id] || 'present'
    }));
    onMark(records);
    alert(`Attendance for ${selectedDate} saved successfully!`);
  };

  const callParent = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const sendAbsenceWhatsApp = (student: Student) => {
    const msg = `*SCHOLARS POINT ALERT* ⚠️\n\nDear Parent, your child *${student.name}* (Roll: ${student.rollNumber}) is *ABSENT* today (${selectedDate}).\n\nIf you have a reason, please inform us. Regular attendance is important for progress.\n\n— Scholars Point Classes —`;
    const text = encodeURIComponent(msg);
    const cleanPhone = student.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-calendar-check text-[#1a365d]"></i> Mark Daily Roll
          </h2>
          <p className="text-sm text-slate-500 font-medium italic">Scholars Point Classes • 2026 Session</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            min="2026-01-01"
            max="2026-12-31"
            className="border-2 border-slate-100 p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d] bg-white font-bold text-slate-700"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="bg-[#1a365d] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg active:scale-95"
          >
            Save Records
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs text-slate-500 uppercase font-bold tracking-widest">
          <span>{students.length} Registered Students</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Absent</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {sortedStudents.map(student => {
            const isAbsent = localStatuses[student.id] === 'absent';
            return (
              <div key={student.id} className={`p-5 flex flex-col transition-all duration-300 ${isAbsent ? 'bg-red-50/50' : 'hover:bg-blue-50/30'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f8fafc] border border-slate-200 rounded-lg flex items-center justify-center font-black text-[#b22222] text-sm">
                      {student.rollNumber.toString().padStart(3, '0')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{student.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-tighter">Grade: {student.grade}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                          localStatuses[student.id] === status
                            ? STATUS_COLORS[status] + " border-transparent scale-105 shadow-md"
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                        }`}
                      >
                        {STATUS_ICONS[status]}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Absent Quick Actions */}
                {isAbsent && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-red-100 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Urgent: Notify Parent</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => callParent(student.phone)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition active:scale-95"
                      >
                        <i className="fas fa-phone-alt"></i> Call Now
                      </button>
                      <button 
                        onClick={() => sendAbsenceWhatsApp(student)}
                        className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-green-600 transition active:scale-95"
                      >
                        <i className="fab fa-whatsapp"></i> WhatsApp Alert
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {students.length === 0 && (
            <div className="p-16 text-center">
              <i className="fas fa-users-slash text-4xl text-slate-200 mb-4 block"></i>
              <p className="text-slate-400 font-medium">Please add students in the directory first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;
