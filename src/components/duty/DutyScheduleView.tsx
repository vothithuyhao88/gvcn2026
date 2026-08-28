import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  Sparkles, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DutyScheduleView: React.FC = () => {
  const { dutySchedule, updateDutySchedule, currentUser, students } = useApp();

  const canEdit = currentUser.role === 'GVCN' || currentUser.position?.includes('LỚP PHÓ LAO ĐỘNG');

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  const handleOpenEdit = (schedule: typeof dutySchedule[0]) => {
    setEditingDay(schedule.dayOfWeek);
    setTaskInput(schedule.tasks.join(', '));
    setNotesInput(schedule.notes || '');
  };

  const handleSaveEdit = (dayOfWeek: string) => {
    const tasks = taskInput.split(',').map(t => t.trim()).filter(Boolean);
    updateDutySchedule(dayOfWeek, tasks, notesInput);
    setEditingDay(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Phân Công Lao Động & Vệ Sinh Lớp Học</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Lịch Trực Nhật Lớp 11A3 (Thứ 2 – Thứ 7)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý và giám sát bởi Lớp phó Lao động & Nề nếp (Trần Minh Khang) và GVCN Võ Thị Thúy Hào
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Vệ sinh sạch sẽ • Tiết kiệm điện nước</span>
        </div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dutySchedule.map(item => {
          const isEditing = editingDay === item.dayOfWeek;
          const teamMembers = students.filter(s => s.teamId === item.teamId);

          return (
            <div 
              key={item.dayOfWeek}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{item.dayOfWeek}</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      Tổ {item.teamId}
                    </span>
                  </div>
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                      title="Chỉnh sửa nhiệm vụ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-600 mb-3">
                  <strong>Tổ trưởng phụ trách:</strong> {item.assignedLeader}
                </div>

                {isEditing ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Các nhiệm vụ (cách nhau bởi dấu phẩy):</label>
                      <input
                        type="text"
                        value={taskInput}
                        onChange={e => setTaskInput(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Ghi chú lưu ý:</label>
                      <input
                        type="text"
                        value={notesInput}
                        onChange={e => setNotesInput(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-2">
                      <button
                        onClick={() => setEditingDay(null)}
                        className="px-3 py-1 bg-slate-100 rounded-lg font-semibold"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.dayOfWeek)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-900 mb-1 text-[11px] uppercase">Nhiệm vụ trực nhật:</div>
                    {item.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.notes && !isEditing && (
                  <div className="mt-3 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    ⚠️ {item.notes}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Số thành viên: {teamMembers.length} bạn</span>
                <span className="text-emerald-700 font-semibold">Tự giác & trách nhiệm</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 uppercase">Quy định trực nhật & vệ sinh 11A3:</h4>
        <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
          <li>Tổ trực nhật có mặt trước giờ học 15 phút để lau bảng, quét lớp và đổ rác.</li>
          <li>Cuối buổi học: Kiểm tra đóng cửa sổ, tắt tất cả quạt trần, đèn chiếu sáng và tắt máy chiếu.</li>
          <li>Nếu lớp dơ hoặc quên tắt thiết bị điện sẽ bị trừ <strong className="text-rose-700">10 điểm thi đua</strong> theo quy chuẩn.</li>
        </ul>
      </div>

    </div>
  );
};
