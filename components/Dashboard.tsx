
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
  
  const todayAttendance = attendance.filter(r => r.date === todayStr);
  const presentToday = todayAttendance.filter(r => r.status === 'present').length;
  const absentToday = todayAttendance.filter(r => r.status === 'absent').length;
  
  const absentStudents = students.filter(s => 
    todayAttendance.some(r => r.studentId === s.id && r.status === 'absent')
  );

  const currentMonthFees = fees.filter(f => f.month === currentMonth && f.year === currentYear);
  const collectedThisMonth = currentMonthFees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
  
  const pendingFeesStudents = students.filter(s => {
    const record = currentMonthFees.find(f => f.studentId === s.id);
    return !record || record.status !== 'paid';
  });

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
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#1a365d] text-2xl shadow-inner">
            <i className="fas fa-house-chimney-user"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Portal Overview</h2>
            <p className="text-indigo-600 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">Scholars Point Classes • 2026</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/attendance" className="bg-[#1a365d] text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10">Take Roll Call</Link>
          <Link to="/fees" className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10">Quick Fees</Link>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Students</p>
          <h3 className="text-2xl font-black text-slate-800">{students.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Present</p>
          <h3 className="text-2xl font-black text-green-600">{presentToday}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Absent</p>
          <h3 className="text-2xl font-black text-red-600">{absentToday}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center text-center">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Collection</p>
          <h3 className="text-2xl font-black text-emerald-600">₹{collectedThisMonth}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Fees Table - Critical Requested Update */}
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden flex flex-col shadow-xl">
          <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center">
            <h2 className="text-sm font-black text-amber-700 flex items-center gap-2 uppercase tracking-tight">
              <i className="fas fa-money-bill-transfer"></i> Pending Fees Recovery
            </h2>
            <Link to="/fees" className="text-[8px] font-black text-amber-700 bg-white border border-amber-200 px-3 py-1.5 rounded-full uppercase tracking-widest">Manage All</Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[350px] space-y-3 scrollbar-hide">
            {pendingFeesStudents.length === 0 ? (
              <div className="text-center py-16 opacity-30">
                <i className="fas fa-shield-heart text-4xl mb-2 text-emerald-500"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">No Dues Outstanding!</p>
              </div>
            ) : (
              pendingFeesStudents.map(s => {
                const record = currentMonthFees.find(f => f.studentId === s.id);
                const isPromised = record?.status === 'pending';
                return (
                  <div key={s.id} className={`p-4 border rounded-2xl flex items-center justify-between gap-3 ${isPromised ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-amber-600 shadow-sm">{s.rollNumber}</div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{s.name}</p>
                        <p className={`text-[9px] font-bold uppercase ${isPromised ? 'text-amber-600' : 'text-slate-400'}`}>Amount: ₹{s.monthlyFee} • {isPromised ? 'Promised' : 'Unpaid'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => sendWhatsApp(s, `*Fee Alert:* Dear Parent, monthly fee for ${s.name} is outstanding. Amount: ₹${s.monthlyFee}. Kindly pay soon. - Scholars Point.`)} 
                      className="w-12 h-12 bg-[#b22222] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition"
                    >
                      <i className="fab fa-whatsapp text-xl"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-slate-900 rounded-[2rem] shadow-xl p-8 text-white flex flex-col h-full border-b-8 border-indigo-600">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.3em] text-indigo-400"><i className="fas fa-robot"></i> AI Health Check</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Performance Intelligence</p>
            </div>
            <button onClick={handleGenerateInsight} disabled={loading || students.length === 0} className="bg-[#b22222] hover:bg-red-700 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Run Analysis"}
            </button>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 overflow-y-auto scrollbar-hide max-h-[250px]">
            <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap text-slate-200">{insight}</p>
          </div>
        </div>
      </div>

      {/* Broadcast Center */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <i className="fab fa-whatsapp text-[#25D366] text-xl"></i> Class-Wide Notices
          </h2>
          <button onClick={() => {
            const activePhones = students.filter(s => s.phone && !s.archived).map(s => s.phone);
            navigator.clipboard.writeText(activePhones.join(', '));
            alert("Contacts copied to clipboard!");
          }} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl uppercase border border-indigo-100">
            Export Phone List
          </button>
        </div>
        <div className="p-6 space-y-4">
          <textarea 
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm outline-none focus:ring-4 focus:ring-indigo-100 h-24 transition-all" 
            placeholder="Type a notice for all students... (e.g. Test on Sunday at 10AM)" 
            value={broadcastMsg} 
            onChange={(e) => setBroadcastMsg(e.target.value)} 
          />
          <div className="flex flex-wrap gap-2">
            {students.slice(0, 8).map(s => (
              <button key={s.id} onClick={() => sendWhatsApp(s, broadcastMsg)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-[10px] font-black text-slate-600 uppercase">
                {s.name}
              </button>
            ))}
            {students.length > 8 && <span className="text-[10px] text-slate-400 font-bold self-center px-2">+ {students.length - 8} more</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
