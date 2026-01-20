
import React, { useState } from 'react';
import { Student, FeeRecord, PaymentStatus } from '../types';
import { MONTHS, FEE_STATUS_COLORS } from '../constants';

interface Props {
  students: Student[];
  fees: FeeRecord[];
  onUpdateFee: (record: FeeRecord) => void;
}

const FeesManagement: React.FC<Props> = ({ students, fees, onUpdateFee }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [pinModal, setPinModal] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const year = 2026;

  const SECURITY_PIN = "8433";

  const handleMarkPaid = (student: Student) => {
    setPinModal({ isOpen: true, student });
    setEnteredPin('');
    setPinError(false);
  };

  const handleMarkPending = (student: Student) => {
    processPayment(student, 'pending');
  };

  const handleMarkUnpaid = (student: Student) => {
    if (confirm(`Reset ${student.name}'s status to Unpaid?`)) {
      processPayment(student, 'unpaid');
    }
  };

  const processPayment = (student: Student, status: PaymentStatus) => {
    const existing = fees.find(f => f.studentId === student.id && f.month === selectedMonth && f.year === year);
    onUpdateFee({
      id: existing?.id || `${student.id}-${selectedMonth}-${year}`,
      studentId: student.id,
      month: selectedMonth,
      year: year,
      amount: student.monthlyFee || 0,
      status: status,
      paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  const verifyAndProceed = () => {
    if (enteredPin === SECURITY_PIN) {
      if (pinModal.student) {
        processPayment(pinModal.student, 'paid');
        setPinModal({ isOpen: false, student: null });
      }
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
      setEnteredPin('');
    }
  };

  const sendWhatsApp = (student: Student, type: 'reminder' | 'thanks', status: string = 'unpaid') => {
    if (!student.phone) {
      alert("No phone number found!");
      return;
    }
    const monthName = MONTHS[selectedMonth];
    const message = type === 'reminder' 
      ? `*Fee Reminder:* Dear Parent, fee for *${student.name}* (${monthName} 2026) is *${status.toUpperCase()}*. Amount: ₹${student.monthlyFee}. Please pay soon.`
      : `*Fee Receipt:* Thank you! Received ₹${student.monthlyFee} for ${student.name} (${monthName} 2026).`;
    
    const text = encodeURIComponent(message);
    const cleanPhone = student.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  // Calculations
  const filteredFees = fees.filter(f => f.month === selectedMonth && f.year === year);
  const totalCollected = filteredFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = students.reduce((sum, s) => {
    const record = fees.find(f => f.studentId === s.id && f.month === selectedMonth && f.year === year);
    return (!record || record.status !== 'paid') ? sum + (s.monthlyFee || 0) : sum;
  }, 0);

  const displayStudents = showPendingOnly 
    ? students.filter(s => {
        const record = fees.find(f => f.studentId === s.id && f.month === selectedMonth && f.year === year);
        return !record || record.status !== 'paid';
      })
    : students;

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Received</p>
          <p className="text-lg font-black text-emerald-600">₹{totalCollected}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
          <p className="text-lg font-black text-red-600">₹{totalPending}</p>
        </div>
        <div className="hidden md:flex bg-white p-4 rounded-2xl border border-slate-200 flex-col items-center text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Month</p>
          <p className="text-lg font-black text-slate-800">{MONTHS[selectedMonth]}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <select
          className="flex-1 border-2 border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#1a365d] bg-white font-black text-xs text-slate-700"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {MONTHS.map((m, idx) => <option key={m} value={idx}>{m} 2026</option>)}
        </select>
        <button 
          onClick={() => setShowPendingOnly(!showPendingOnly)}
          className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${showPendingOnly ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' : 'bg-slate-50 text-slate-500 border-2 border-slate-100'}`}
        >
          {showPendingOnly ? 'Showing Due' : 'Filter Unpaid'}
        </button>
      </div>

      {/* PIN Modal */}
      {pinModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full border-t-8 border-green-600">
            <h3 className="text-xl font-black text-slate-800 text-center mb-6">Security Check</h3>
            <input
              type="password"
              maxLength={4}
              autoFocus
              className="w-full text-center text-4xl tracking-widest font-black p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl mb-6"
              placeholder="****"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
            />
            <div className="flex gap-3">
              <button onClick={() => setPinModal({ isOpen: false, student: null })} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
              <button onClick={verifyAndProceed} className="flex-1 py-4 rounded-2xl font-black bg-green-600 text-white shadow-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="space-y-3">
        {displayStudents.map(student => {
          const record = fees.find(f => f.studentId === student.id && f.month === selectedMonth && f.year === year);
          const status = record?.status || 'unpaid';
          
          return (
            <div key={student.id} className={`bg-white p-4 rounded-2xl border transition-all ${status === 'paid' ? 'opacity-60 border-slate-100' : 'border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-[10px] text-slate-400">{student.rollNumber}</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{student.name}</h4>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${FEE_STATUS_COLORS[status]}`}>
                      {status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#1a365d]">₹{student.monthlyFee}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Due: {student.feeDay}th</p>
                </div>
              </div>

              <div className="flex gap-2">
                {status !== 'paid' ? (
                  <>
                    <button 
                      onClick={() => handleMarkPending(student)}
                      className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase border-2 transition-all ${status === 'pending' ? 'bg-amber-500 text-white border-transparent' : 'bg-white text-amber-500 border-amber-100'}`}
                    >
                      <i className="fas fa-hourglass-half"></i> Pending
                    </button>
                    <button 
                      onClick={() => handleMarkPaid(student)}
                      className="flex-1 h-12 rounded-xl bg-white text-green-600 border-2 border-green-100 flex items-center justify-center gap-2 font-black text-[10px] uppercase"
                    >
                      <i className="fas fa-check"></i> Mark Paid
                    </button>
                    <button 
                      onClick={() => sendWhatsApp(student, 'reminder', status)}
                      className="w-12 h-12 bg-[#b22222] text-white rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <i className="fab fa-whatsapp"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-center text-green-600 font-black text-[10px] uppercase gap-2 bg-green-50 rounded-xl">
                      <i className="fas fa-check-double"></i> Received Successfully
                    </div>
                    <button onClick={() => sendWhatsApp(student, 'thanks')} className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-md">
                      <i className="fab fa-whatsapp"></i>
                    </button>
                    <button onClick={() => handleMarkUnpaid(student)} className="w-12 h-12 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center border border-slate-100">
                      <i className="fas fa-rotate-left text-xs"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeesManagement;
