
import React, { useState } from 'react';
import { Student, AttendanceRecord, FeeRecord } from '../types';
import { getAttendanceInsights } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { MONTHS } from '../constants';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
}

const Dashboard: React.FC<Props> = ({ students, attendance, fees }) => {
  const [insight, setInsight] = useState<string>("Click 'Analyze Health' to check center performance...");
  const [loading, setLoading] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const currentMonth = new Date().getMonth();
  const currentYear = 2026;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Attendance logic
  const todayAttendance = attendance.filter(r => r.date === todayStr);
  const presentToday = todayAttendance.filter(r => r.status === 'present').length;
  const absentToday = todayAttendance.filter(r => r.status === 'absent').length;
  
  const absentStudents = students.filter(s => 
    todayAttendance.some(r => r.studentId === s.id && r.status === 'absent')
  );

  // Fees logic for recovery panel
  const currentMonthFees = fees.filter(f => f.month === currentMonth && f.year === currentYear);
  const collectedThisMonth = currentMonthFees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
  
  const pendingFeesStudents = students.filter(s => {
    const record = currentMonthFees.find(f => f.studentId === s.id);
    return !record || record.status !== 'paid';
  });

  // Birthday logic
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const bdaysToday = students.filter(s => s.dob && s.dob.split('-')[1] === (today.getMonth()+1).toString().padStart(2, '0') && s.dob.split('-')[2] === today.getDate().toString().padStart(2, '0'));
  
  const handleGenerateInsight = async () => {
    setLoading(true);
    const res = await getAttendanceInsights(students, attendance, fees);
    setInsight(res);
    setLoading(false);
  };

  const callParent = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const sendWhatsApp = (student: Student, message: string) => {
    const text = encodeURIComponent(message);
    const cleanPhone = student.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Stats - Android Style Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1a365d] text-lg">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Total Students</p>
            <h3 className="text-xl md:text-2xl font-black text-[#1a365d]">{students.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-lg">
            <i className="fas fa-check-circle"></i>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Today Present</p>
            <h3 className="text-xl md:text-2xl font-black text-green-600">{presentToday}</h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 text-lg">
            <i className="fas fa-times-circle"></i>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Today Absent</p>
            <h3 className="text-xl md:text-2xl font-black text-red-600">{absentToday}</h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-lg">
            <i className="fas fa-wallet"></i>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Month Fees</p>
            <h3 className="text-xl md:text-2xl font-black text-emerald-600">₹{collectedThisMonth}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ACTION PANEL 1: ABSENTEES */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-red-50/30">
            <h2 className="text-md font-black text-red-600 flex items-center gap-2 uppercase tracking-tight">
              <i className="fas fa-phone-slash"></i> Missing Today ({absentStudents.length})
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[350px] space-y-3 scrollbar-hide">
            {absentStudents.length === 0 ? (
              <div className="text-center py-10 opacity-30">
                <i className="fas fa-user-check text-4xl mb-2 text-green-500"></i>
                <p className="text-[10px] font-black uppercase">No absentees today</p>
              </div>
            ) : (
              absentStudents.map(s => (
                <div key={s.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-red-600">{s.rollNumber}</div>
                    <p className="font-bold text-slate-800 text-xs">{s.name}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => callParent(s.phone)} className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md active:scale-90 transition"><i className="fas fa-phone-alt text-xs"></i></button>
                    <button onClick={() => sendWhatsApp(s, `*Notice:* ${s.name} is ABSENT today. Please inform reason.`)} className="w-10 h-10 bg-[#25D366] text-white rounded-lg flex items-center justify-center shadow-md active:scale-90 transition"><i className="fab fa-whatsapp text-sm"></i></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTION PANEL 2: PENDING FEES (NEW REQUESTED) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-amber-50/30">
            <h2 className="text-md font-black text-amber-600 flex items-center gap-2 uppercase tracking-tight">
              <i className="fas fa-hand-holding-dollar"></i> Pending Fees ({pendingFeesStudents.length})
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[350px] space-y-3 scrollbar-hide">
            {pendingFeesStudents.length === 0 ? (
              <div className="text-center py-10 opacity-30">
                <i className="fas fa-check-double text-4xl mb-2 text-emerald-500"></i>
                <p className="text-[10px] font-black uppercase">All fees collected!</p>
              </div>
            ) : (
              pendingFeesStudents.map(s => {
                const record = currentMonthFees.find(f => f.studentId === s.id);
                const isPromised = record?.status === 'pending';
                return (
                  <div key={s.id} className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${isPromised ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-amber-600">{s.rollNumber}</div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{s.name}</p>
                        <p className={`text-[8px] font-black uppercase ${isPromised ? 'text-amber-600' : 'text-slate-400'}`}>₹{s.monthlyFee} • {isPromised ? 'Promised' : 'Unpaid'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => sendWhatsApp(s, `*Fee Reminder:* Dear Parent, monthly fee for ${s.name} (${MONTHS[currentMonth]}) is due. Amount: ₹${s.monthlyFee}. Kindly pay soon.`)} 
                      className="w-10 h-10 bg-[#b22222] text-white rounded-lg flex items-center justify-center shadow-md active:scale-90 transition"
                    >
                      <i className="fab fa-whatsapp text-sm"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Link to="/fees" className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center justify-center gap-2">
              Manage All Fees <i className="fas fa-chevron-right"></i>
            </Link>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-[#1a365d] to-[#1e4e8c] rounded-2xl shadow-xl p-6 text-white h-full flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest"><i className="fas fa-robot text-red-400"></i> AI Analyst</h2>
            <button onClick={handleGenerateInsight} disabled={loading || students.length === 0} className="bg-[#b22222] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Analyze Hub"}
            </button>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 overflow-y-auto scrollbar-hide">
            <p className="text-[11px] font-medium leading-relaxed whitespace-pre-wrap">{insight}</p>
          </div>
        </div>
      </div>
      
      {/* Broadcast Hub Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-md font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <i className="fab fa-whatsapp text-[#25D366]"></i> Bulk Notices
          </h2>
          <button onClick={() => {
            const activePhones = students.filter(s => s.phone && !s.archived).map(s => s.phone);
            navigator.clipboard.writeText(activePhones.join(', '));
            alert("All phone numbers copied!");
          }} className="text-[8px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            Copy All Contacts
          </button>
        </div>
        <div className="p-5 space-y-4">
          <textarea 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 h-24" 
            placeholder="Type general announcement for all parents..." 
            value={broadcastMsg} 
            onChange={(e) => setBroadcastMsg(e.target.value)} 
          />
          <div className="flex flex-wrap gap-2">
            {students.slice(0, 10).map(s => (
              <button key={s.id} onClick={() => sendWhatsApp(s, broadcastMsg)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-[#25D366] transition text-[10px] font-bold text-slate-600">
                {s.name}
              </button>
            ))}
            {students.length > 10 && <span className="text-[10px] text-slate-400 font-bold self-center">+ {students.length - 10} more</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
