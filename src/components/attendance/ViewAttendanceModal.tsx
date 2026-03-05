import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Session } from '../../types';

interface AttendanceRecord {
  id: number;
  name: string;
  degree: string;
  present: number;
}

export const ViewAttendanceModal = ({ 
  session,
  onClose 
}: { 
  session: Session;
  onClose: () => void; 
}) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sessions/attendance/${session.id}`)
      .then(res => res.json())
      .then(data => {
        setAttendance(data);
      })
      .catch(err => console.error("Error fetching attendance:", err))
      .finally(() => setLoading(false));
  }, [session]);

  const presentMembers = attendance.filter(a => a.present === 1);
  const absentMembers = attendance.filter(a => a.present === 0);

  return (
    <div className="modal-container">
      <div className="modal-overlay" onClick={onClose} />
      <Card 
        className="w-full max-w-2xl relative z-10 max-h-full overflow-y-auto" 
        title={`Presenças: ${session.title}`} 
        subtitle={`${session.date} • ${session.type} • ${session.degree}`}
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
          <X size={20} className="text-slate-400" />
        </button>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lodge-green"></div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Presentes ({presentMembers.length})</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presentMembers.length > 0 ? presentMembers.map(m => (
                  <div key={m.id} className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{m.degree}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic col-span-2">Nenhum membro marcado como presente.</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <XCircle size={18} className="text-rose-500" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ausentes ({absentMembers.length})</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {absentMembers.length > 0 ? absentMembers.map(m => (
                  <div key={m.id} className="flex items-center space-x-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-600 font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{m.degree}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic col-span-2">Nenhum membro marcado como ausente.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
