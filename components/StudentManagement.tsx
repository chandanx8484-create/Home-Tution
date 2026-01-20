
import React, { useState, useRef } from 'react';
import { Student } from '../types';

interface Props {
  students: Student[];
  onAdd: (s: Student) => void;
  onUpdate: (s: Student) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const StudentManagement: React.FC<Props> = ({ students, onAdd, onUpdate, onDelete, onRestore }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [phone, setPhone] = useState('');
  const [fee, setFee] = useState('');
  const [feeDay, setFeeDay] = useState('5');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Communication Modal State
  const [msgModal, setMsgModal] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
  const [idCardModal, setIdCardModal] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
  const [customMsg, setCustomMsg] = useState('');

  // Sort students by roll number
  const sortedStudents = [...students].sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));
  const activeStudents = sortedStudents.filter(s => !s.archived);
  const archivedStudents = sortedStudents.filter(s => s.archived);

  const resetForm = () => {
    setName(''); setGrade(''); setPhone(''); setFee(''); setFeeDay('5'); setDob(''); setPhoto(undefined); setEditingId(null);
  };

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setGrade(student.grade);
    setPhone(student.phone);
    setFee(student.monthlyFee.toString());
    setFeeDay(student.feeDay.toString());
    setDob(student.dob || '');
    setPhoto(student.photo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera.");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !grade) return;
    const studentData: Student = {
      id: editingId || Date.now().toString(),
      rollNumber: editingId ? (students.find(s => s.id === editingId)?.rollNumber || 0) : 0, 
      name, grade, phone, dob, monthlyFee: parseFloat(fee) || 0, feeDay: parseInt(feeDay) || 5,
      photo,
      enrollmentDate: editingId ? (students.find(s => s.id === editingId)?.enrollmentDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      archived: false
    };
    if (editingId) { onUpdate(studentData); } else { onAdd(studentData); }
    resetForm();
  };

  const sendWhatsApp = (student: Student, message: string) => {
    const text = encodeURIComponent(message);
    const cleanPhone = student.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  const sendIDCardDetails = (s: Student) => {
    const rollDisplay = s.rollNumber.toString().padStart(3, '0');
    const msg = `*SCHOLARS POINT - DIGITAL ID CARD* 🪪\n\n*Name:* ${s.name}\n*Roll No:* ${rollDisplay}\n*Grade:* ${s.grade}\n*Enrollment:* ${s.enrollmentDate}\n*Session:* 2026\n\nThis is a verified digital identification for Scholars Point Classes.\n\n— READ. LEARN. GROW. —`;
    sendWhatsApp(s, msg);
  };

  const templates = [
    { title: "Complaint: Absence", text: (s: Student) => `*Scholars Point Classes Alert* ⚠️\n\nDear Parent, your child *${s.name}* (Roll No: ${s.rollNumber}) was absent today without prior notice. Please ensure regular attendance for better results.` },
    { title: "Complaint: Behavior", text: (s: Student) => `*Scholars Point Classes Update* 📝\n\nDear Parent, we noticed some behavioral issues with *${s.name}* in class today. Requesting you to have a talk with them regarding discipline.` },
    { title: "Performance: Low", text: (s: Student) => `*Scholars Point Classes Report* 📉\n\nDear Parent, *${s.name}* is struggling with the current topics. We suggest extra practice at home.` },
    { title: "Performance: Excellent", text: (s: Student) => `*Scholars Point Classes Appreciation* 🌟\n\nDear Parent, *${s.name}* performed exceptionally well in today's class. Keep up the encouragement!` }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Camera Modal */}
      {cameraActive && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black">
          <div className="relative w-full max-w-md aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                <i className="fas fa-times"></i>
              </button>
              <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center border-4 border-white shadow-xl active:scale-90 transition">
                <i className="fas fa-camera text-2xl"></i>
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {msgModal.isOpen && msgModal.student && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border-t-8 border-indigo-600">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">Message Parent</h3>
                <p className="text-sm text-slate-500">To: <span className="font-bold text-slate-900">{msgModal.student.name}</span></p>
              </div>
              <button onClick={() => setMsgModal({ isOpen: false, student: null })} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t, idx) => (
                  <button key={idx} onClick={() => sendWhatsApp(msgModal.student!, t.text(msgModal.student!))} className="text-left p-3 text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition text-slate-700">
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Message</label>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32" placeholder="Type your message here..." value={customMsg} onChange={(e) => setCustomMsg(e.target.value)}></textarea>
              <button onClick={() => sendWhatsApp(msgModal.student!, customMsg)} disabled={!customMsg} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                <i className="fab fa-whatsapp"></i> Send Custom Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID CARD MODAL */}
      {idCardModal.isOpen && idCardModal.student && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-sm w-full">
            <div id="student-id-card" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-[#1a365d] relative aspect-[3/4.5]">
              <div className="bg-[#1a365d] h-32 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 rounded-full -ml-16 -mb-16"></div>
                <div className="z-10 bg-white p-2.5 rounded-2xl shadow-lg border-2 border-slate-100 mb-1">
                  <i className="fas fa-graduation-cap text-[#1a365d] text-2xl"></i>
                </div>
                <h2 className="z-10 text-white font-black uppercase tracking-tighter text-lg leading-none">Scholars Point</h2>
                <p className="z-10 text-red-500 font-black text-[8px] tracking-[0.3em] uppercase mt-1">Academic Session 2026</p>
              </div>
              <div className="p-8 flex flex-col items-center">
                <div className="w-28 h-28 bg-slate-50 rounded-full border-4 border-slate-100 flex items-center justify-center shadow-inner mb-6 relative overflow-hidden">
                  {idCardModal.student.photo ? (
                    <img src={idCardModal.student.photo} className="w-full h-full object-cover" alt="Student" />
                  ) : (
                    <i className="fas fa-user text-slate-200 text-5xl"></i>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <i className="fas fa-check text-white text-[10px]"></i>
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#1a365d] mb-1 text-center leading-tight">{idCardModal.student.name}</h3>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                  Student • {idCardModal.student.grade}
                </span>
                <div className="w-full space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Roll Number</span>
                    <span className="text-sm font-black text-[#b22222] uppercase">{idCardModal.student.rollNumber.toString().padStart(3, '0')}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollment</span>
                    <span className="text-xs font-bold text-slate-800">{idCardModal.student.enrollmentDate}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full mt-auto">
                   <div className="w-12 h-12 opacity-30">
                     <i className="fas fa-qrcode text-4xl"></i>
                   </div>
                   <div className="text-right">
                     <p className="text-[7px] text-slate-400 font-black uppercase italic leading-none">Authorized Signatory</p>
                     <p className="text-[10px] text-[#1a365d] font-black mt-1">Scholars Point Hub</p>
                   </div>
                </div>
              </div>
              <div className="absolute top-4 left-0 bg-red-600 text-white text-[7px] font-black px-3 py-1 rounded-r-full shadow-lg uppercase tracking-widest">
                Class Of 2026
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => sendIDCardDetails(idCardModal.student!)} className="bg-[#25D366] text-white py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl">
                <i className="fab fa-whatsapp"></i> Share ID to Parent
              </button>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm">
                  <i className="fas fa-print mr-2"></i> Print Card
                </button>
                <button onClick={() => setIdCardModal({ isOpen: false, student: null })} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm">
                  Close Preview
                </button>
              </div>
              <p className="text-center text-white/60 text-[10px] font-medium">Tip: Take a screenshot to send as an image.</p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className={`p-6 rounded-xl shadow-md border transition-all duration-300 ${editingId ? 'bg-amber-50 border-amber-200 ring-4 ring-amber-100' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${editingId ? 'text-amber-700' : 'text-[#1a365d]'}`}>
            <i className={`fas ${editingId ? 'fa-user-edit' : 'fa-user-plus'}`}></i>
            {editingId ? 'Update Student Profile' : 'Register New Student'}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-white px-3 py-1 rounded-full border border-amber-200 shadow-sm">Cancel Edit</button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-3">
               <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner relative group">
                  {photo ? (
                    <img src={photo} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <i className="fas fa-image text-slate-300 text-3xl"></i>
                  )}
                  {photo && (
                    <button onClick={() => setPhoto(undefined)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <i className="fas fa-times"></i>
                    </button>
                  )}
               </div>
               <div className="flex flex-col w-full gap-2">
                 <button type="button" onClick={startCamera} className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2">
                   <i className="fas fa-camera"></i> Open Camera
                 </button>
                 <label className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 transition flex items-center justify-center gap-2 cursor-pointer">
                   <i className="fas fa-upload"></i> Upload Photo
                   <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                 </label>
               </div>
            </div>

            {/* Fields Section */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Student Name</label>
                <input type="text" placeholder="Ex: Rahul" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d]" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Grade</label>
                <input type="text" placeholder="Ex: 10th" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d]" value={grade} onChange={(e) => setGrade(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date of Birth</label>
                <input type="date" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d] bg-white" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone</label>
                <input type="tel" placeholder="Mobile" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d]" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fee (₹)</label>
                <input type="number" placeholder="Amt" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d]" value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fee Day</label>
                <input type="number" min="1" max="31" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#1a365d]" value={feeDay} onChange={(e) => setFeeDay(e.target.value)} />
              </div>
              <div className="flex items-end">
                <button type="submit" className={`w-full text-white p-2.5 rounded-lg font-bold shadow-lg h-[42px] transition-all active:scale-95 ${editingId ? 'bg-amber-600' : 'bg-[#1a365d]'}`}>
                  {editingId ? 'Update Student Profile' : 'Complete Registration'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200">
        <button onClick={() => setShowArchived(false)} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${!showArchived ? 'border-[#1a365d] text-[#1a365d]' : 'border-transparent text-slate-400'}`}>Active ({activeStudents.length})</button>
        <button onClick={() => setShowArchived(true)} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${showArchived ? 'border-[#b22222] text-[#b22222]' : 'border-transparent text-slate-400'}`}>History ({archivedStudents.length})</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Roll No</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Grade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Birthday</th>
                {!showArchived && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>}
                {showArchived && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Restore</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(showArchived ? archivedStudents : activeStudents).map(student => (
                <tr key={student.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-[#b22222] text-xs">
                    {student.rollNumber.toString().padStart(3, '0')}
                  </td>
                  <td className="px-6 py-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden">
                        {student.photo ? (
                          <img src={student.photo} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <i className="fas fa-user text-slate-300 text-lg"></i>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1a365d]">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-bold uppercase">{student.grade}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!showArchived ? (
                        <>
                          <button onClick={() => setIdCardModal({ isOpen: true, student })} className="w-9 h-9 flex items-center justify-center text-[#1a365d] hover:bg-blue-50 rounded-full transition" title="Digital ID Card">
                            <i className="fas fa-id-card-alt text-lg"></i>
                          </button>
                          <button onClick={() => setMsgModal({ isOpen: true, student })} className="w-9 h-9 flex items-center justify-center text-[#25D366] hover:bg-green-50 rounded-full transition" title="Message Parent">
                            <i className="fab fa-whatsapp text-lg"></i>
                          </button>
                          <button onClick={() => handleEditClick(student)} className="w-9 h-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-full transition">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => onDelete(student.id)} className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full transition">
                            <i className="fas fa-archive"></i>
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onRestore(student.id)} className="text-green-600 font-bold text-xs hover:underline flex items-center gap-1"><i className="fas fa-undo"></i> Restore</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
