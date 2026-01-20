
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

  const downloadJSON = () => {
    setIsExporting(true);
    const data = {
      students,
      attendance,
      fees,
      backupDate: new Date().toISOString(),
      appVersion: "2026.1.0",
      className: "Scholars Point"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScholarsPoint_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Caution: This will replace all CURRENT data with the data from the backup file. Continue?")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && Array.isArray(json.students)) {
          onImport(json);
          alert("Data successfully restored from backup!");
        } else {
          alert("Error: Invalid backup file format.");
        }
      } catch (err) {
        alert("Error: Could not read backup file.");
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    if (students.length === 0) {
      alert("No students to export!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll No,Name,Grade,Phone,DOB,Enrollment Date,Monthly Fee\n";

    students.forEach(s => {
      const row = [
        s.rollNumber,
        `"${s.name}"`,
        `"${s.grade}"`,
        s.phone,
        s.dob || "N/A",
        s.enrollmentDate,
        s.monthlyFee
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Directory_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-3xl shadow-inner border border-indigo-100">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Security & Backup Hub</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1 italic">Keep your Scholars Point data safe & persistent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cloud Backup Tool */}
        <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-indigo-600 overflow-hidden flex flex-col">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Manual Cloud Backup</h3>
              <p className="text-sm text-slate-500 font-medium">Download your entire database as a secure file. You can upload this file on any device to restore your data.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={downloadJSON}
                disabled={isExporting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 hover:bg-slate-800 active:scale-95 transition"
              >
                {isExporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-arrow-down"></i>}
                Download Data Backup
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-95 transition border border-slate-200"
              >
                <i className="fas fa-cloud-arrow-up"></i>
                Restore from File
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleImport}
              />
            </div>
          </div>
          <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">
              Last Backup Recommended: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Excel Export Tool */}
        <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-emerald-500 overflow-hidden flex flex-col">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Excel / CSV Reports</h3>
              <p className="text-sm text-slate-500 font-medium">Convert your student directory and records into Excel-compatible sheets for printing or offline storage.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={exportToCSV}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 active:scale-95 transition"
              >
                <i className="fas fa-file-excel"></i>
                Export Student List (Excel)
              </button>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <i className="fas fa-info-circle text-emerald-600 text-xl"></i>
                <p className="text-[10px] font-bold text-emerald-800 leading-tight uppercase">
                  Tip: CSV files can be opened in MS Excel, Google Sheets, or Apple Numbers.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto p-4 bg-emerald-50/50 border-t border-emerald-100">
             <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-center">
              Total Records: {students.length} Students • {attendance.length} Attendance Hits
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex items-start gap-5">
         <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 text-xl flex-shrink-0">
           <i className="fas fa-triangle-exclamation"></i>
         </div>
         <div>
           <h4 className="font-black text-amber-800 uppercase tracking-tight">Why do I need backups?</h4>
           <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
             This application stores data in your browser's **Local Storage**. If you clear your browser history or "Clear All Data", you might lose your records. Always download a **Manual Cloud Backup** once a week and keep it in your Google Drive or email for 100% safety.
           </p>
         </div>
      </div>

      <div className="text-center opacity-30 pointer-events-none">
        <i className="fas fa-graduation-cap text-6xl text-slate-300"></i>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Scholars Point Secure Infrastructure</p>
      </div>
    </div>
  );
};

export default BackupCenter;
