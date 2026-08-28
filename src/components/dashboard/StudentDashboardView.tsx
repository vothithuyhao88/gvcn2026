import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  BookOpen, 
  Send, 
  Star, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Sparkles,
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getEmulationRank, EMULATION_RANK_LEGEND } from '../../utils/emulation';

interface StudentDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    students, 
    dutySchedule, 
    announcements, 
    submissions, 
    createLeaveRequest 
  } = useApp();

  const currentStudent = students.find(s => s.id === currentUser.studentId) || students[0];
  const position = currentUser.position || 'THÀNH VIÊN';
  const isTeamLeader = position.includes('TỔ TRƯỞNG');
  const isClassPresident = position === 'LỚP TRƯỞNG' || position === 'LỚP PHÓ HỌC TẬP';
  const isDisciplineLead = position === 'LỚP PHÓ LAO ĐỘNG - NỀ NẾP';

  // Team members
  const teamMembers = students.filter(s => s.teamId === currentStudent.teamId);
  const teamAvgScore = Math.round(teamMembers.reduce((acc, cur) => acc + cur.currentScore, 0) / (teamMembers.length || 1));

  // Rank calculation
  const sortedStudents = [...students].sort((a, b) => b.currentScore - a.currentScore);
  const studentRank = sortedStudents.findIndex(s => s.id === currentStudent.id) + 1;

  // Leave form modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  const handleSendLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    createLeaveRequest({
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      requestedBy: 'STUDENT',
      requesterName: `${currentStudent.fullName} (Học sinh)`,
      requesterPhone: currentStudent.phone,
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

  // Recent score entries for this student from approved submissions
  const studentEntries = submissions
    .flatMap(s => s.entries)
    .filter(e => e.studentId === currentStudent.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Student Welcome Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentStudent.avatar}
              alt={currentStudent.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {position}
                </span>
                <span className="bg-white/10 text-white text-xs px-2.5 py-0.5 rounded-full">
                  Tổ {currentStudent.teamId} • Lớp 11A3
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentStudent.fullName}</h1>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>Mã HS: {currentStudent.code}</span>
                <span>•</span>
                <span>Nghề: {currentStudent.vocationalCourse}</span>
              </p>
            </div>
          </div>

          {/* Score & Rank Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl text-center min-w-[95px]">
              <div className="text-[10px] font-bold text-amber-300 uppercase">Điểm Thi Đua</div>
              <div className="text-2xl sm:text-3xl font-black text-white">{currentStudent.currentScore}</div>
              <div className="text-[10px] text-slate-300 font-medium">Khởi điểm 100đ</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl text-center min-w-[95px]">
              <div className="text-[10px] font-bold text-blue-300 uppercase">Xếp Loại</div>
              {(() => {
                const rankInfo = getEmulationRank(currentStudent.currentScore);
                return (
                  <>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
                      <span>{rankInfo.emoji}</span>
                      <span>{rankInfo.rank}</span>
                    </div>
                    <div className="text-[10px] text-slate-200 font-medium">{rankInfo.description}</div>
                  </>
                );
              })()}
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl text-center min-w-[90px]">
              <div className="text-[10px] font-bold text-emerald-300 uppercase">Hạng Lớp</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">#{studentRank}</div>
              <div className="text-[10px] text-slate-300 font-medium">/ 35 bạn</div>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL OFFICER QUICK PANELS */}
      {isTeamLeader && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              ⭐
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-100">Dành riêng cho Tổ Trưởng Tổ {currentStudent.teamId}</div>
              <h3 className="text-lg font-black text-white">Chấm điểm thi đua thành viên trong tổ tuần này</h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Bạn quản lý {teamMembers.length} thành viên thuộc Tổ {currentStudent.teamId}. Hãy chấm điểm theo quy định và bấm "Gửi GVCN" để cô duyệt.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('team_scoring')}
            className="bg-white text-slate-900 hover:bg-amber-50 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Vào Bảng Chấm Tổ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isClassPresident && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              👑
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-200">Giao diện Ban Cán Sự Lớp (Lớp Trưởng / Lớp Phó)</div>
              <h3 className="text-lg font-black text-white">Theo dõi toàn diện nề nếp & Nhắc nhở bài tập</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Xem sĩ số 35 bạn, theo dõi chuyên cần hôm nay và chuẩn bị nội dung tổng kết tuần trình Cô Võ Thị Thúy Hào.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('leaderboard')}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Bảng xếp hạng
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs border border-white/20 transition cursor-pointer"
            >
              Sĩ số hôm nay
            </button>
          </div>
        </div>
      )}

      {isDisciplineLead && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              🧹
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">Lớp Phó Lao Động & Nề Nếp</div>
              <h3 className="text-lg font-black text-white">Theo dõi trực nhật và nề nếp lớp 11A3</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Kiểm tra vệ sinh phòng học, phân công trực nhật theo ngày và tắt các thiết bị quạt/điện khi tan học.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('duty_schedule')}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Lịch Trực Nhật</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Score History + Team Info + Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Emulation Score Logs for this Student */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Nhật Ký Điểm Thi Đua Cá Nhân</h3>
                  <p className="text-xs text-slate-500">Các lần cộng/trừ điểm theo thang quy định đã được GVCN duyệt</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('emulation')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Tra cứu thang điểm
              </button>
            </div>

            {studentEntries.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Điểm thi đua khởi điểm: 100 điểm</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Chưa có ghi nhận vi phạm hay điểm trừ nào. Tiếp tục phát huy nhé!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {studentEntries.map(entry => (
                  <div 
                    key={entry.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      entry.pointsDelta > 0 
                        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950' 
                        : 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{entry.criteriaTitle}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {entry.notes || 'Ghi nhận trong tuần'} • Người chấm: {entry.recordedBy}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Ngày: {entry.date} • Tuần {entry.week}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black ${entry.pointsDelta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta}
                      </span>
                      <span className="text-[10px] text-slate-500 block">điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Members List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Thành Viên Tổ {currentStudent.teamId} ({teamMembers.length} bạn)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điểm thi đua trung bình của tổ: <strong className="text-indigo-700 font-bold">{teamAvgScore}đ/hs</strong>
                </p>
              </div>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full self-start sm:self-auto">
                Tổ {currentStudent.teamId}
              </span>
            </div>

            {/* Quy chuẩn xếp loại thi đua thang điểm 100 */}
            <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quy chuẩn Thang 100đ:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-medium text-[11px]">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  &gt; 85đ: Tốt 🌟
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                  &gt; 70đ: Khá 👍
                </span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                  ≥ 50đ: Đạt 👌
                </span>
                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold">
                  &lt; 50đ: Yếu ⚠️
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {teamMembers.map(member => {
                const rank = getEmulationRank(member.currentScore);
                const isMe = member.id === currentStudent.id;
                return (
                  <div 
                    key={member.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      isMe 
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-200' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={member.avatar} alt={member.fullName} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                          <span className="truncate">{member.fullName}</span>
                          {isMe && <span className="text-[10px] text-blue-600 font-semibold shrink-0">(Tôi)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{member.position}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-black text-slate-900">{member.currentScore} đ</div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border mt-0.5 ${rank.badgeClass}`}>
                        <span>{rank.emoji}</span>
                        <span>{rank.rank}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Duty Schedule + Leave Application Button + Announcements */}
        <div className="space-y-6">
          
          {/* Quick Leave Application Button */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
              <span>✉️</span>
              <span>Báo Vắng / Xin Phép Nghỉ</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Nếu bạn bị ốm hoặc có việc bận gia đình, hãy nộp đơn xin phép trực tuyến để cô giáo Võ Thị Thúy Hào duyệt.
            </p>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Đơn Xin Phép Trực Tuyến</span>
            </button>
          </div>

          {/* Duty Schedule Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧹</span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Lịch Trực Nhật Tuần</h3>
              </div>
              <button 
                onClick={() => onNavigate('duty_schedule')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Xem chi tiết
              </button>
            </div>

            <div className="space-y-2">
              {dutySchedule.slice(0, 4).map(d => {
                const isMyTeam = d.teamId === currentStudent.teamId;
                return (
                  <div 
                    key={d.dayOfWeek}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                      isMyTeam ? 'bg-amber-50 border-amber-200 font-bold text-amber-950' : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{d.dayOfWeek}:</span> Tổ {d.teamId}
                      {isMyTeam && <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md">Tổ bạn</span>}
                    </div>
                    <span className="text-[10px] text-slate-500">{d.assignedLeader}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Class Moments Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>📸</span>
                <span>Khoảnh Khắc 11A3</span>
              </h3>
              <button 
                onClick={() => onNavigate('moments')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Xem album
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80" 
              alt="Khoảnh khắc 11A3" 
              className="w-full h-32 object-cover rounded-2xl"
            />
            <p className="text-xs text-slate-700 font-medium mt-2">
              Lớp 11A3 ngày tựu trường năm học 2026 - 2027 ✨
            </p>
          </div>

        </div>

      </div>

      {/* LEAVE REQUEST MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-1">Đơn Xin Phép Nghỉ Học Trực Tuyến</h3>
            <p className="text-xs text-slate-500 mb-4">Gửi đến GVCN: Cô Võ Thị Thúy Hào (Lớp 11A3)</p>

            {leaveSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ✓ Đã gửi đơn thành công! Cô giáo sẽ xem và duyệt sớm.
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
                    placeholder="Nhập lý do chi tiết (Ví dụ: Em bị sốt đi khám bệnh, hoặc gia đình có việc bận...)"
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
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                  >
                    Gửi Đơn Cho Cô
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
