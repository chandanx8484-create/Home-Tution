
import React from 'react';
import { Student } from '../types';

interface Props {
  students: Student[];
}

const BirthdayHub: React.FC<Props> = ({ students }) => {
  const adminNumbers = ["8454047703", "9326352170"];
  const today = new Date();
  
  const getBdayInfo = (student: Student) => {
    if (!student.dob) return null;
    const [y, m, d] = student.dob.split('-').map(Number);
    return { month: m, day: d };
  };

  const isBdayToday = (student: Student) => {
    const info = getBdayInfo(student);
    if (!info) return false;
    return info.month === today.getMonth() + 1 && info.day === today.getDate();
  };

  const isBdayTomorrow = (student: Student) => {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const info = getBdayInfo(student);
    if (!info) return false;
    return info.month === tomorrow.getMonth() + 1 && info.day === tomorrow.getDate();
  };

  const isBdayThisMonth = (student: Student) => {
    const info = getBdayInfo(student);
    if (!info) return false;
    return info.month === today.getMonth() + 1 && info.day > today.getDate();
  };

  const todayBdays = students.filter(isBdayToday);
  const tomorrowBdays = students.filter(isBdayTomorrow);
  const upcomingBdays = students.filter(isBdayThisMonth).sort((a, b) => {
    const dayA = getBdayInfo(a)?.day || 0;
    const dayB = getBdayInfo(b)?.day || 0;
    return dayA - dayB;
  });

  const sendAdminAlert = (targetPhone: string) => {
    if (tomorrowBdays.length === 0) {
      alert("No birthdays tomorrow to alert about!");
      return;
    }

    const bdayList = tomorrowBdays.map(s => `• ${s.name} (Roll: ${s.rollNumber})`).join('\n');
    const msg = `*SCHOLARS POINT BIRTHDAY ALERT* 🎂\n\nHello Admin,\n\nTomorrow (${new Date(new Date().getTime() + 86400000).toDateString()}) is the birthday of the following student(s):\n\n${bdayList}\n\nKindly prepare the celebrations or greetings accordingly.\n\n— SP Hub Automated Alert —`;
    
    const text = encodeURIComponent(msg);
    window.open(`https://wa.me/91${targetPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Birthday Hub</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1 italic">Making memories at Scholars Point</p>
        </div>
        <div className="z-10 flex flex-col gap-2 w-full md:w-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">Notify Class Admins</p>
          <div className="flex gap-2">
            {adminNumbers.map(num => (
              <button 
                key={num}
                onClick={() => sendAdminAlert(num)}
                className="flex-1 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 hover:bg-green-600 active:scale-95 transition"
              >
                <i className="fab fa-whatsapp"></i> Alert {num.slice(-4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TODAY */}
        <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-rose-500 overflow-hidden flex flex-col h-full">
           <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-black text-rose-600 uppercase tracking-widest text-sm">Today's Party 🍰</h3>
              <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black">{todayBdays.length}</span>
           </div>
           <div className="p-6 flex-1 space-y-4">
              {todayBdays.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-cookie-bite text-slate-100 text-4xl mb-2"></i>
                  <p className="text-xs text-slate-400 font-bold uppercase">No birthdays today</p>
                </div>
              ) : (
                todayBdays.map(s => (
                  <div key={s.id} className="flex items-center gap-4 group">
                    <div className="w-14 h-14 rounded-full border-4 border-rose-100 overflow-hidden shadow-inner group-hover:scale-110 transition">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><i className="fas fa-user"></i></div>}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg leading-none">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Grade: {s.grade} • Roll: {s.rollNumber}</p>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* TOMORROW */}
        <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-indigo-500 overflow-hidden flex flex-col h-full">
           <div className="p-6 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-black text-indigo-600 uppercase tracking-widest text-sm">Tomorrow's Alert 🎁</h3>
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">{tomorrowBdays.length}</span>
           </div>
           <div className="p-6 flex-1 space-y-4">
              {tomorrowBdays.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-calendar-day text-slate-100 text-4xl mb-2"></i>
                  <p className="text-xs text-slate-400 font-bold uppercase">Nothing for tomorrow</p>
                </div>
              ) : (
                tomorrowBdays.map(s => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-4 border-indigo-100 overflow-hidden shadow-inner">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><i className="fas fa-user"></i></div>}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg leading-none">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Grade: {s.grade} • Roll: {s.rollNumber}</p>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* THIS MONTH */}
        <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-amber-400 overflow-hidden flex flex-col h-full">
           <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
              <h3 className="font-black text-amber-600 uppercase tracking-widest text-sm">Later this Month 🎈</h3>
              <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">{upcomingBdays.length}</span>
           </div>
           <div className="p-6 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
              {upcomingBdays.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-calendar-check text-slate-100 text-4xl mb-2"></i>
                  <p className="text-xs text-slate-400 font-bold uppercase">No more this month</p>
                </div>
              ) : (
                upcomingBdays.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white">
                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white flex items-center justify-center text-[10px] text-slate-300"><i className="fas fa-user"></i></div>}
                      </div>
                      <span className="font-black text-slate-700 text-xs">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-amber-50 uppercase">
                      {new Date(s.dob!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayHub;
