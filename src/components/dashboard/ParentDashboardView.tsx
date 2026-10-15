import React, { useState } from 'react';
import { 
  HeartHandshake, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  UserX, 
  Clock, 
  MessageSquare, 
  Send, 
  Bell, 
  Award, 
  Sparkles, 
  FileText,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getEmulationRank } from '../../utils/emulation';

interface ParentDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    students, 
    attendanceRecords, 
    announcements, 
    markAnnouncementAsRead, 
    createLeaveRequest 
  } = useApp();

  // Find the child student linked to this parent
  const childStudent = students.find(s => s.id === currentUser.studentId) || students[0];

  // Attendance stats for child
  const childAttendance = attendanceRecords.filter(a => a.studentId === childStudent.id);
  const absentCount = childAttendance.filter(a => a.status === 'ABSENT_CP' || a.status === 'ABSENT_KP').length;
  const lateCount = childAttendance.filter(a => a.status === 'LATE').length;
  const todayRecord = childAttendance.find(a => a.date === new Date().toISOString().split('T')[0]);

  // Leave modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Quick message to teacher state
  const [quickMsg, setQuickMsg] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);

  const handleSendLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    createLeaveRequest({
      studentId: childStudent.id,
      studentName: childStudent.fullName,
      requestedBy: 'PARENT',
      requesterName: `${currentUser.fullName} (${childStudent.parentRelationship || 'Phụ huynh'})`,
      requesterPhone: currentUser.phone || childStudent.parentPhone,
      fromDate: leaveDate,
      toDate: leaveDate,
      reason: leaveReason,
    });
    setLeaveSuccess(true);
    setTimeout(() => {
      setLeaveSuccess(false);
      setShowLeaveModal(false);
      setLeaveReason('');
    }, 1500);
  };

  const handleSendQuickMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsg.trim()) return;
    setMsgSuccess(true);
    setTimeout(() => {
      setMsgSuccess(false);
      setQuickMsg('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Parent Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-400 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  👨‍👩‍👧 Cổng Thông Tin Phụ Huynh
                </span>
                <span className="bg-white/10 text-white text-xs px-2.5 py-0.5 rounded-full">
                  Lớp 12A2
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.fullName}</h1>
              <p className="text-xs text-emerald-100 mt-0.5">
                Phụ huynh học sinh: <strong className="text-white underline">{childStudent.fullName}</strong> (Tổ {childStudent.teamId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeaveModal(true)}
              id="btn-parent-leave"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Xin phép nghỉ học</span>
            </button>
            <button
              onClick={() => onNavigate('connection')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs border border-white/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Nhắn tin GVCN</span>
            </button>
          </div>
        </div>
      </div>

      {/* 👨‍🎓 3. THÔNG TIN CỦA CON (Hồ sơ, Điểm danh, Điểm thi đua, Nhận xét) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Điểm danh hôm nay */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">📅 Chuyên cần hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-black text-emerald-700">
              {todayRecord?.status === 'ABSENT_CP' ? 'Vắng có phép' : todayRecord?.status === 'ABSENT_KP' ? 'Vắng không phép' : todayRecord?.status === 'LATE' ? 'Đi học muộn' : 'Có mặt tại lớp'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tổng số buổi vắng: <strong>{absentCount}</strong> • Đi trễ: <strong>{lateCount}</strong>
          </p>
        </div>

        {/* Điểm thi đua rèn luyện */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🏆 Điểm Thi Đua</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-blue-700">{childStudent.currentScore}</span>
              <span className="text-xs text-slate-500">/ 100đ gốc</span>
            </div>
            {(() => {
              const rank = getEmulationRank(childStudent.currentScore);
              return (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${rank.badgeClass}`}>
                  <span>{rank.emoji}</span>
                  <span>{rank.rank}</span>
                </span>
              );
            })()}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Thang điểm 100: &gt;85 Tốt • &gt;70 Khá • ≥50 Đạt • &lt;50 Yếu
          </p>
        </div>

        {/* Nghề Trung cấp */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🛠️ Nghề Trung Cấp</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-900 text-sm">{childStudent.vocationalCourse}</div>
          <p className="text-xs text-slate-500 mt-2">
            Học song song văn hóa & nghề tại Trung tâm GDNN-GDTX An Nhơn.
          </p>
        </div>

      </div>

      {/* 2-COLUMN MAIN: Nhận xét của cô GVCN + Tin nhắn trao đổi + Thông báo lớp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Nhận xét cô giáo + Thông báo cần xác nhận đã xem */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Nhận xét của GVCN Võ Thị Thúy Hào */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Cô Võ Thị Thúy Hào"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Nhận Xét Của Giáo Viên Chủ Nhiệm</h3>
                  <p className="text-xs text-blue-700 font-medium">Cô Võ Thị Thúy Hào • Lớp 12A2</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                Tuần hiện tại
              </span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed italic">
              "{childStudent.notes || `Em ${childStudent.fullName} trong tuần qua đi học chuyên cần, tích cực tham gia các hoạt động xây dựng tập thể lớp 12A2. Gia đình tiếp tục động viên em ôn tập bài vở đều đặn nhé!`}"
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Hotline GVCN: 0983 556 789</span>
              </span>
              <button
                onClick={() => onNavigate('connection')}
                className="text-blue-600 font-bold hover:underline"
              >
                Gửi phản hồi cho cô →
              </button>
            </div>
          </div>

          {/* Thông báo mới từ lớp & Nút "Xác nhận đã đọc thông báo" */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Thông Báo Lớp 12A2 Dành Cho Phụ Huynh
                </h3>
              </div>
              <span className="text-xs text-slate-500">{announcements.length} thông báo</span>
            </div>

            <div className="space-y-4">
              {announcements.map(ann => {
                const hasRead = ann.readBy.includes(currentUser.id);
                return (
                  <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>

                    {ann.attachments && ann.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ann.attachments.map((att, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
                            📎 {att.name} ({att.size})
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400">Gửi bởi: {ann.author}</span>
                      
                      {hasRead ? (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã xác nhận đọc</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => markAnnouncementAsRead(ann.id)}
                          className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Xác nhận đã đọc</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Trao đổi nhanh với GVCN & Đơn xin nghỉ học */}
        <div className="space-y-6">
          
          {/* Quick Message Box to Homeroom Teacher */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Trao Đổi Nhanh Với Cô Hào</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gửi ý kiến hoặc trao đổi trực tiếp với cô giáo chủ nhiệm về tình hình học tập của con.
            </p>

            {msgSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                ✓ Tin nhắn đã được gửi đến cô giáo chủ nhiệm!
              </div>
            ) : (
              <form onSubmit={handleSendQuickMsg} className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Kính gửi cô giáo chủ nhiệm Võ Thị Thúy Hào..."
                  value={quickMsg}
                  onChange={e => setQuickMsg(e.target.value)}
                  required
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Tin Nhắn Cho Cô</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Leave Application Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
              <span>✉️</span>
              <span>Đơn Xin Nghỉ Học Cho Con</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Báo vắng trực tuyến giúp GVCN cập nhật chuyên cần và không bị tính vắng không phép.
            </p>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Soạn Đơn Xin Phép</span>
            </button>
          </div>

        </div>

      </div>

      {/* LEAVE REQUEST MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-1">Đơn Xin Nghỉ Học Cho Học Sinh</h3>
            <p className="text-xs text-slate-500 mb-4">
              Học sinh: <strong>{childStudent.fullName}</strong> • Lớp 12A2 (GVCN: Võ Thị Thúy Hào)
            </p>

            {leaveSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ✓ Đã gửi đơn xin phép thành công! Cô giáo sẽ phản hồi sớm.
              </div>
            ) : (
              <form onSubmit={handleSendLeave} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày xin nghỉ:</label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={e => setLeaveDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lý do xin phép:</label>
                  <textarea
                    rows={3}
                    placeholder="Kính gửi cô giáo, vì cháu bị ốm/gia đình có việc bận nên xin phép cô cho cháu nghỉ..."
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
                  >
                    Gửi Đơn Cho GVCN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
