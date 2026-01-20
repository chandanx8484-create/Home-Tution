
import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import { MONTHS, STATUS_COLORS } from '../constants';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  onMark: (records: AttendanceRecord[]) => void;
}

const MonthlyReport: React.FC<Props> = ({ students, attendance, onMark }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [holidayMode, setHolidayMode] = useState(false);
  const [selectedHolidayDay, setSelectedHolidayDay] = useState<number>(new Date().getDate());
  
  const year = 2026;

  const today = new Date();
  const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === year;
  const currentDay = today.getDate();

  const daysInMonth = useMemo(() => {
    return new Date(year, selectedMonth + 1, 0).getDate();
  }, [selectedMonth]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getAttendanceForDay = (studentId: string, day: number) => {
    const dateStr = `${year}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return attendance.find(r => r.studentId === studentId && r.date === dateStr);
  };

  const handleCellClick = (studentId: string, day: number) => {
    const dateStr = `${year}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const existing = getAttendanceForDay(studentId, day);
    
    // Cycle statuses: Present -> Absent -> Late -> Excused -> Holiday -> Present
    const statusMap: Record<AttendanceStatus, AttendanceStatus> = {
      'present': 'absent',
      'absent': 'late',
      'late': 'excused',
      'excused': 'holiday',
      'holiday': 'present'
    };
    
    const nextStatus: AttendanceStatus = existing ? statusMap[existing.status] : 'present';
    
    onMark([{
      date: dateStr,
      studentId: studentId,
      status: nextStatus
    }]);
  };

  const markGlobalHoliday = () => {
    if (!confirm(`Mark Day ${selectedHolidayDay} as Global Holiday for all students?`)) return;
    
    const dateStr = `${year}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedHolidayDay.toString().padStart(2, '0')}`;
    const records: AttendanceRecord[] = students.map(s => ({
      date: dateStr,
      studentId: s.id,
      status: 'holiday'
    }));
    
    onMark(records);
    setHolidayMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-chart-line text-indigo-600"></i> Monthly Tracker 2026
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Toggle status by clicking cells below
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setHolidayMode(!holidayMode)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 transition-all border-2 ${holidayMode ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-purple-600 border-purple-100 hover:border-purple-200'}`}
          >
            <i className="fas fa-mug-hot"></i> {holidayMode ? 'Cancel Holiday Mode' : 'Holiday Button'}
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Month:</label>
            <select
              className="border-2 border-slate-100 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-slate-700"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {MONTHS.map((month, idx) => (
                <option key={month} value={idx}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {holidayMode && (
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-calendar-plus"></i>
            </div>
            <div>
              <p className="text-xs font-black text-purple-900 uppercase">Global Holiday Marking</p>
              <p className="text-[10px] text-purple-600 font-medium">This will mark all students as 'Holiday' for the selected date.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={selectedHolidayDay}
              onChange={(e) => setSelectedHolidayDay(parseInt(e.target.value))}
              className="p-2 border border-purple-200 rounded-lg text-sm font-bold bg-white outline-none"
            >
              {daysArray.map(d => <option key={d} value={d}>Day {d}</option>)}
            </select>
            <button 
              onClick={markGlobalHoliday}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase shadow-lg shadow-purple-900/20 hover:bg-purple-700 active:scale-95 transition"
            >
              Mark Class Holiday
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-4 border-r sticky left-0 bg-slate-50 z-20 w-48 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-400 uppercase tracking-widest">Student Name</span>
                    <span className="text-[8px] text-indigo-500 font-bold">{students.length} Total</span>
                  </div>
                </th>
                {daysArray.map(day => (
                  <th 
                    key={day} 
                    className={`px-0 py-3 text-center min-w-[2.2rem] border-r relative ${isCurrentMonth && currentDay === day ? 'bg-indigo-50' : ''}`}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className={`flex flex-col items-center justify-center ${hoveredDay === day ? 'scale-110' : ''} transition-transform`}>
                      <span className={`font-black ${isCurrentMonth && currentDay === day ? 'text-indigo-600' : 'text-slate-500'}`}>{day}</span>
                      {isCurrentMonth && currentDay === day && <div className="w-1 h-1 bg-indigo-500 rounded-full mt-0.5 animate-pulse"></div>}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 font-black text-center bg-slate-100 text-slate-600 sticky right-0 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] uppercase tracking-tighter">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => {
                const monthAttendance = attendance.filter(r => 
                  r.studentId === student.id && 
                  r.date.startsWith(`${year}-${(selectedMonth + 1).toString().padStart(2, '0')}`)
                );
                const presentCount = monthAttendance.filter(r => r.status === 'present').length;
                const lateCount = monthAttendance.filter(r => r.status === 'late').length;
                const totalDaysMarked = monthAttendance.length;
                // Holidays don't count towards the average/score usually, they are neutral.
                const percent = totalDaysMarked > 0 ? Math.round((presentCount + (lateCount * 0.5)) / totalDaysMarked * 100) : 0;

                return (
                  <tr key={student.id} className="hover:bg-indigo-50/20 transition group">
                    <td className="px-4 py-3 border-r sticky left-0 bg-white z-10 font-bold whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-indigo-50/50">
                      <p className="text-[#1a365d] text-xs truncate max-w-[140px]">{student.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{student.grade}</p>
                    </td>
                    {daysArray.map(day => {
                      const rec = getAttendanceForDay(student.id, day);
                      let colorClass = "bg-slate-50";
                      let textColor = "text-slate-200";
                      
                      if (rec) {
                        if (rec.status === 'present') { colorClass = "bg-green-500 hover:bg-green-600 shadow-sm"; textColor = "text-white"; }
                        else if (rec.status === 'absent') { colorClass = "bg-red-500 hover:bg-red-600 shadow-sm"; textColor = "text-white"; }
                        else if (rec.status === 'late') { colorClass = "bg-yellow-400 hover:bg-yellow-500 shadow-sm"; textColor = "text-slate-900"; }
                        else if (rec.status === 'excused') { colorClass = "bg-blue-400 hover:bg-blue-500 shadow-sm"; textColor = "text-white"; }
                        else if (rec.status === 'holiday') { colorClass = "bg-purple-600 hover:bg-purple-700 shadow-sm"; textColor = "text-white"; }
                      }

                      return (
                        <td key={day} className={`p-0 border-r text-center group/cell ${isCurrentMonth && currentDay === day ? 'bg-indigo-50/30' : ''}`}>
                          <button 
                            onClick={() => handleCellClick(student.id, day)}
                            className={`w-full h-10 ${colorClass} transition-all duration-150 flex items-center justify-center font-black ${textColor} cursor-pointer hover:z-10`}
                            title={`${student.name} - Day ${day}: ${rec ? rec.status : 'Not marked'}`}
                          >
                            <span className="opacity-0 group-hover/cell:opacity-100 transition-opacity">
                              {rec ? rec.status.charAt(0).toUpperCase() : '+'}
                            </span>
                            {!rec ? '' : (
                               <span className="group-hover/cell:hidden">
                                 {rec.status.charAt(0).toUpperCase()}
                               </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center font-black sticky right-0 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-indigo-50/50">
                      <div className={`text-sm ${percent > 85 ? 'text-green-600' : percent > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                        {percent}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="flex flex-col p-4 rounded-2xl border-2 border-green-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-black">P</div>
            <span className="font-bold text-slate-700">Present</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">Student attended class.</p>
        </div>
        <div className="flex flex-col p-4 rounded-2xl border-2 border-red-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-black">A</div>
            <span className="font-bold text-slate-700">Absent</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">Student missed class.</p>
        </div>
        <div className="flex flex-col p-4 rounded-2xl border-2 border-yellow-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 text-xs font-black">L</div>
            <span className="font-bold text-slate-700">Late</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">Arrived after start time.</p>
        </div>
        <div className="flex flex-col p-4 rounded-2xl border-2 border-blue-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center text-white text-xs font-black">E</div>
            <span className="font-bold text-slate-700">Excused</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">Informed absence.</p>
        </div>
        <div className="flex flex-col p-4 rounded-2xl border-2 border-purple-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-black">H</div>
            <span className="font-bold text-slate-700">Holiday</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">Center was closed.</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
