
import React, { useRef, useState } from 'react';
import { Student, AttendanceRecord, FeeRecord } from '../types';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  onImport: (data: any) => void;
}

const BackupCenter: React.FC<Props> = ({ students, attendance, fees, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const downloadJSON = () => {
    setIsExporting(true);
    const data = {
      students,
      attendance,
      fees,
      backupDate: new Date().toISOString(),
      appVersion: "2026.Web.1",
      className: "Scholars Point"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Caution: This will replace all CURRENT data. Continue?")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students) {
          onImport(json);
          alert("Data Restored Successfully!");
        }
      } catch (err) {
        alert("Invalid File!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-[#1a365d] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight">Public Cloud Center</h2>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">Free Server & Data Security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-sm mb-4">Manual Cloud Backup</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">Download your data once a week. You can upload this file on any phone or laptop to see your records.</p>
          <div className="space-y-3">
            <button onClick={downloadJSON} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-3">
              <i className="fas fa-download"></i> Download Backup
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 flex items-center justify-center gap-3">
              <i className="fas fa-upload"></i> Restore Data
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          </div>
        </div>

        {/* Deployment Guide Card */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase text-sm mb-4">Publish as Website</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">Make this app a public link (e.g. scholars-point.vercel.app) for free.</p>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"
          >
            <i className="fas fa-globe"></i> {showGuide ? "Close Instructions" : "How to Publish Free"}
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-6 animate-in slide-in-from-top duration-300">
          <h4 className="text-xl font-black text-emerald-400">Step-by-Step Hosting Guide (Free)</h4>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-emerald-400 flex-shrink-0">1</div>
              <p className="text-sm">Visit <span className="text-emerald-400 font-bold">Vercel.com</span> ya <span className="text-emerald-400 font-bold">Netlify.com</span> aur ek free account banayein.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-emerald-400 flex-shrink-0">2</div>
              <p className="text-sm">Is code ko <span className="text-emerald-400 font-bold">GitHub</span> pe upload karein (Public repository banayein).</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-emerald-400 flex-shrink-0">3</div>
              <p className="text-sm">Vercel pe "Import Project" par click karein aur apna GitHub repo select karein.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-emerald-400 flex-shrink-0">4</div>
              <p className="text-sm">Bas! 1 minute mein aapki website live ho jayegi. Link share karein aur use karein!</p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Pro Tip:</p>
            <p className="text-xs mt-1">Public hosting pe data aapke browser mein save hota hai. Sync ke liye hamesha **JSON Backup** ka use karein.</p>
          </div>
        </div>
      )}

      {/* Safety Alert */}
      <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex items-start gap-4">
        <i className="fas fa-shield-virus text-amber-600 text-2xl"></i>
        <div>
          <h5 className="font-black text-amber-800 uppercase text-xs">Security Note</h5>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Aapka student data browser ke "Local Storage" mein rehta hai. Iska matlab hai ki data kisi server par store nahi ho raha (Privacy Safe), lekin browser clear karne par data ud sakta hai. **Download Backup** button ka use zaroor karein.</p>
        </div>
      </div>
    </div>
  );
};

export default BackupCenter;
