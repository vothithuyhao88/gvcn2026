import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Sparkles,
  Users,
  Info,
  Calendar,
  Check,
  X,
  RefreshCw,
  Zap,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getEmulationRank, EMULATION_RANK_LEGEND } from '../../utils/emulation';
import { ACADEMIC_WEEKS, getAcademicWeek } from '../../data/academicCalendar';

export const TeamScoringView: React.FC = () => {
  const { 
    currentUser, 
    students, 
    criteria, 
    submissions, 
    addScoreEntryToSubmission, 
    deleteScoreEntry,
    applyTeamScoringNow,
    submitTeamScoresToTeacher, 
    approveTeamSubmission, 
    rejectTeamSubmission 
  } = useApp();

  // Active week
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  
  // Role checking
  const isGVCN = currentUser.role === 'GVCN';
  const userTeamId = currentUser.teamId || 1;
  const [selectedTeamId, setSelectedTeamId] = useState<number>(userTeamId);

  // Sync selectedTeamId if user changes (e.g. demo switch)
  useEffect(() => {
    if (!isGVCN) {
      setSelectedTeamId(userTeamId);
    }
  }, [currentUser, isGVCN, userTeamId]);

  // The actual teamId being operated on: strictly locked for Team Leader / Student
  const effectiveTeamId = isGVCN ? selectedTeamId : userTeamId;

  // Active team submission
  const currentSubmission = submissions.find(s => s.week === selectedWeek && s.teamId === effectiveTeamId);

  // Form state for adding score entry
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>(criteria[0]?.id || '');
  const [entryNotes, setEntryNotes] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customDelta, setCustomDelta] = useState<number>(criteria[0]?.points || 3);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  // Team members of ONLY the active team (Strictly filtered by effectiveTeamId)
  const teamMembers = students.filter(s => s.teamId === effectiveTeamId);
  const teamAvgScore = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((acc, cur) => acc + cur.currentScore, 0) / teamMembers.length)
    : 0;

  // Update customDelta when criteria changes
  const handleCriteriaChange = (criteriaId: string) => {
    setSelectedCriteriaId(criteriaId);
    const found = criteria.find(c => c.id === criteriaId);
    if (found) {
      setCustomDelta(found.points);
    }
  };

  // Add entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert(`Vui lòng chọn học sinh trong Tổ ${effectiveTeamId} để chấm điểm!`);
      return;
    }
    const student = students.find(s => s.id === selectedStudentId && s.teamId === effectiveTeamId);
    const crit = criteria.find(c => c.id === selectedCriteriaId);
    if (!student || !crit) {
      alert('Học sinh không thuộc danh sách tổ của bạn!');
      return;
    }

    addScoreEntryToSubmission(effectiveTeamId, selectedWeek, {
      studentId: student.id,
      studentName: student.fullName,
      criteriaId: crit.id,
      criteriaTitle: crit.title,
      pointsDelta: customDelta,
      date: entryDate,
      recordedBy: `${currentUser.fullName} (${currentUser.position || 'Tổ Trưởng'})`,
      notes: entryNotes,
    });

    setEntryNotes('');
    setShowUpdateSuccess(true);
    setTimeout(() => setShowUpdateSuccess(false), 2500);
  };

  // Explicitly recalculate and update team ranking
  const handleRecalculateTeam = () => {
    applyTeamScoringNow(effectiveTeamId, selectedWeek);
    setShowUpdateSuccess(true);
    setTimeout(() => setShowUpdateSuccess(false), 3000);
  };

  // Send to Teacher
  const handleSubmitToGVCN = () => {
    if (!currentSubmission || currentSubmission.entries.length === 0) {
      alert('Bảng chấm chưa có ghi nhận nào! Vui lòng nhập điểm trước khi gửi.');
      return;
    }
    submitTeamScoresToTeacher(effectiveTeamId, selectedWeek);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Chấm Điểm & Xếp Loại Thi Đua Tổ • Năm Học 2026–2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            {isGVCN ? (
              <span>Kiểm Tra & Phê Duyệt Điểm Thi Đua 4 Tổ</span>
            ) : (
              <span>Bảng Chấm Thi Đua & Xếp Loại Tổ {effectiveTeamId}</span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thang điểm 100: <strong>&gt; 85đ: Tốt • &gt; 70đ: Khá • ≥ 50đ: Đạt • &lt; 50đ: Yếu</strong>
          </p>
        </div>

        {/* Week and Team selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <span className="text-xs font-bold text-slate-700 px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Tuần:</span>
            </span>
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-1.5 outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              <optgroup label="HỌC KỲ I (18 TUẦN: 07/09/2026 – 10/01/2027)">
                {ACADEMIC_WEEKS.filter(w => w.semester === 1).map(w => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.label} ({w.shortDateRange}) {w.theme ? `• ${w.theme}` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="HỌC KỲ II (17 TUẦN: 11/01/2027 – 23/05/2027)">
                {ACADEMIC_WEEKS.filter(w => w.semester === 2).map(w => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.label} ({w.shortDateRange}) {w.theme ? `• ${w.theme}` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* If GVCN, allow selecting which team to inspect */}
          {isGVCN ? (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[1, 2, 3, 4].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTeamId(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedTeamId === t ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tổ {t}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-800">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tổ của bạn: Tổ {effectiveTeamId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Role notice for Team Leader */}
      {!isGVCN && (
        <div className="bg-indigo-50 border-2 border-indigo-300/80 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ⭐
            </div>
            <div>
              <div className="font-bold text-indigo-950 text-sm">
                Bạn đang chấm điểm với tư cách: {currentUser.fullName} ({currentUser.position || 'Tổ Trưởng'})
              </div>
              <div className="text-indigo-800 text-[11px] mt-0.5">
                Hệ thống chỉ hiển thị danh sách <strong>{teamMembers.length} thành viên thuộc Tổ {effectiveTeamId}</strong>. Bạn chịu trách nhiệm chấm điểm nề nếp cho các thành viên trong tổ mình và gửi GVCN phê duyệt.
              </div>
            </div>
          </div>
          <span className="text-[11px] font-black bg-indigo-200/90 text-indigo-900 px-3 py-1 rounded-full uppercase self-end sm:self-center">
            Tổ {effectiveTeamId} (Chỉ định)
          </span>
        </div>
      )}

      {/* 4-TIER RANKING SCALE CRITERIA BANNER */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Thang Điểm 100 & Tiêu Chuẩn Xếp Loại Thành Viên Lớp 12A2
            </h3>
          </div>
          <button
            onClick={handleRecalculateTeam}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cập nhật lại thang điểm & xếp loại</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMULATION_RANK_LEGEND.map(item => (
            <div 
              key={item.rank}
              className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between shadow-xs transition hover:translate-y-[-1px] ${
                item.rank === 'Tốt'
                  ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                  : item.rank === 'Khá'
                  ? 'border-blue-300 bg-blue-50/70 text-blue-950'
                  : item.rank === 'Đạt'
                  ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                  : 'border-rose-300 bg-rose-50/70 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-xs ${item.tagColor}`}>
                  Loại {item.rank}
                </span>
                <span className="font-black text-xs bg-white/80 px-2 py-0.5 rounded-md border border-current/15">{item.condition}</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed opacity-90">{item.desc}</p>
            </div>
          ))}
        </div>

        {showUpdateSuccess && (
          <div className="mt-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đã cập nhật thang điểm và xếp loại mới nhất cho tất cả thành viên trong tổ!</span>
          </div>
        )}
      </div>

      {/* LIVE MEMBERS OF THIS TEAM (UPDATED REAL-TIME) */}
      <div className="bg-gradient-to-b from-indigo-50/30 via-white to-white rounded-3xl border-2 border-indigo-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Users className="w-4 h-4" />
              </span>
              <span>Danh Sách & Xếp Loại Thành Viên Tổ {effectiveTeamId} ({teamMembers.length} bạn)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Điểm trung bình Tổ {effectiveTeamId}: <strong className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">{teamAvgScore}đ/hs</strong> • Điểm khởi điểm mỗi bạn: <strong className="text-slate-700">100đ</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculateTeam}
              id="btn-update-team-scores"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md ring-2 ring-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Cập Nhật Xếp Loại Tổ</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {teamMembers.map(member => {
            const rank = getEmulationRank(member.currentScore);
            const memberEntries = (currentSubmission?.entries || []).filter(e => e.studentId === member.id);
            const memberDelta = memberEntries.reduce((sum, e) => sum + e.pointsDelta, 0);

            const borderClass = member.currentScore > 85 
              ? 'border-2 border-emerald-300 bg-emerald-50/30 hover:border-emerald-400' 
              : member.currentScore > 70 
              ? 'border-2 border-blue-300 bg-blue-50/30 hover:border-blue-400' 
              : member.currentScore >= 50 
              ? 'border-2 border-amber-300 bg-amber-50/30 hover:border-amber-400' 
              : 'border-2 border-rose-300 bg-rose-50/30 hover:border-rose-400';

            return (
              <div 
                key={member.id}
                className={`p-3.5 rounded-2xl transition hover:shadow-md flex flex-col justify-between ${borderClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <img src={member.avatar} alt={member.fullName} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs" />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{member.fullName}</div>
                    <div className="text-[10px] text-slate-600 font-medium truncate">{member.position}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{member.code}</div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Điểm hiện tại:</div>
                    <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                      <span>{member.currentScore} đ</span>
                      {memberDelta !== 0 && (
                        <span className={`text-[10px] font-bold ${memberDelta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          ({memberDelta > 0 ? `+${memberDelta}` : memberDelta})
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${rank.badgeClass}`}>
                    <span>{rank.emoji}</span>
                    <span>{rank.rank}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Status Indicator Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
        !currentSubmission || currentSubmission.status === 'DRAFT'
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : currentSubmission.status === 'PENDING'
          ? 'bg-blue-50/90 border-blue-300 text-blue-950'
          : currentSubmission.status === 'APPROVED'
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/90 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white border border-current/20 flex items-center justify-center text-2xl shadow-xs shrink-0">
            {!currentSubmission || currentSubmission.status === 'DRAFT' ? '📝' : currentSubmission.status === 'PENDING' ? '⏳' : currentSubmission.status === 'APPROVED' ? '✅' : '❌'}
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider opacity-80">
              Trạng thái bảng chấm Tổ {effectiveTeamId} (Tuần {selectedWeek}):
            </div>
            <div className="font-black text-sm sm:text-base mt-0.5">
              {!currentSubmission || currentSubmission.status === 'DRAFT'
                ? 'Bản nháp • Tổ trưởng chấm điểm xong sẽ cập nhật điểm & xếp loại thành viên'
                : currentSubmission.status === 'PENDING'
                ? 'Đã gửi cô giáo chủ nhiệm Võ Thị Thúy Hào • Đang chờ duyệt'
                : currentSubmission.status === 'APPROVED'
                ? `Đã được GVCN Võ Thị Thúy Hào phê duyệt thành công`
                : `GVCN yêu cầu kiểm tra lại (${currentSubmission.teacherFeedback})`}
            </div>
          </div>
        </div>

        {/* Action button based on status and role */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* If Team leader and Draft -> Submit button */}
          {(!isGVCN || currentUser.position?.includes('TỔ TRƯỞNG')) && (!currentSubmission || currentSubmission.status === 'DRAFT' || currentSubmission.status === 'REJECTED') && (
            <button
              onClick={handleSubmitToGVCN}
              id="btn-submit-scores-to-teacher"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md ring-2 ring-blue-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Bảng Chấm Cho Cô Hào</span>
            </button>
          )}

          {/* If GVCN and Pending -> Approve / Reject buttons */}
          {isGVCN && currentSubmission && currentSubmission.status === 'PENDING' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => approveTeamSubmission(currentSubmission.id, 'Đã kiểm tra và phê duyệt điểm thi đua tuần.')}
                id="btn-approve-submission"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md ring-2 ring-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Duyệt & Áp Dụng Điểm</span>
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Nhập lý do yêu cầu tổ trưởng chấm lại:') || 'Cần kiểm tra lại các trường hợp trừ điểm';
                  rejectTeamSubmission(currentSubmission.id, reason);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Yêu Cầu Chấm Lại</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2 COLUMNS: LEFT (Add score entry form + criteria guide), RIGHT (List of recorded entries for this team) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 Col): Scoring Form based on Criteria - NỔI BẬT KHUNG VIỀN & BACKGROUND */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-blue-50/80 via-white to-white rounded-3xl border-2 border-blue-400 p-6 shadow-md ring-4 ring-blue-100/60">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm text-base font-black">
                  ✍️
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                    Chấm Điểm Thành Viên Tổ {effectiveTeamId}
                  </h3>
                  <p className="text-[11px] text-blue-700 font-semibold">Khu vực dành cho Tổ trưởng</p>
                </div>
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                Tổ {effectiveTeamId}
              </span>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4 text-xs">
              
              {/* 1. Chọn thành viên trong tổ */}
              <div className="bg-white/80 p-3 rounded-2xl border-2 border-blue-200/90 shadow-2xs">
                <label className="block font-black text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>1. Chọn học sinh trong Tổ {effectiveTeamId}:</span>
                  <span className="text-[10px] font-bold text-blue-600">({teamMembers.length} bạn)</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-blue-50/50 border-2 border-blue-300 focus:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-hidden font-bold text-slate-900 transition cursor-pointer"
                >
                  <option value="">-- Bấm chọn học sinh trong tổ --</option>
                  {teamMembers.map(m => {
                    const r = getEmulationRank(m.currentScore);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.position}) - Hiện tại: {m.currentScore}đ [{r.rank}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Chọn tiêu chí chấm từ bảng quy định */}
              <div className="bg-white/80 p-3 rounded-2xl border-2 border-blue-200/90 shadow-2xs">
                <label className="block font-black text-slate-800 mb-1.5">
                  2. Chọn tiêu chí chấm (Thang điểm chuẩn 12A2):
                </label>
                <select
                  value={selectedCriteriaId}
                  onChange={e => handleCriteriaChange(e.target.value)}
                  className="w-full p-2.5 bg-blue-50/50 border-2 border-blue-300 focus:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-hidden text-slate-900 font-semibold transition cursor-pointer"
                >
                  <optgroup label="🌟 Tiêu chí Cộng điểm (Khen thưởng)">
                    {criteria.filter(c => c.category === 'CỘNG').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code}. {c.title} (+{c.points}đ)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="⚠️ Tiêu chí Trừ điểm (Vi phạm)">
                    {criteria.filter(c => c.category === 'TRỪ').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code}. {c.title} ({c.points}đ)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* 3. Điểm số và ngày vi phạm */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 p-3 rounded-2xl border-2 border-blue-200/90 shadow-2xs">
                  <label className="block font-black text-slate-800 mb-1">Điểm áp dụng:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customDelta}
                      onChange={e => setCustomDelta(Number(e.target.value))}
                      className={`w-full p-2.5 bg-blue-50/50 border-2 rounded-xl font-black text-base focus:ring-2 focus:ring-blue-400 outline-hidden ${
                        customDelta > 0 ? 'border-emerald-400 text-emerald-800' : 'border-rose-400 text-rose-800'
                      }`}
                    />
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-2xl border-2 border-blue-200/90 shadow-2xs">
                  <label className="block font-black text-slate-800 mb-1">Ngày ghi nhận:</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full p-2.5 bg-blue-50/50 border-2 border-blue-300 focus:border-blue-600 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-400 outline-hidden"
                  />
                </div>
              </div>

              {/* 4. Ghi chú chi tiết */}
              <div className="bg-white/80 p-3 rounded-2xl border-2 border-blue-200/90 shadow-2xs">
                <label className="block font-black text-slate-800 mb-1">Ghi chú cụ thể (Tiết học / Môn học / Lỗi):</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Tiết 2 môn Toán, phát biểu bài đúng được thầy khen..."
                  value={entryNotes}
                  onChange={e => setEntryNotes(e.target.value)}
                  className="w-full p-2.5 bg-blue-50/50 border-2 border-blue-300 focus:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-hidden text-slate-800 font-medium"
                />
              </div>

              <button
                type="submit"
                id="btn-add-score-entry"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-3 rounded-2xl shadow-md ring-2 ring-blue-300 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm & Cập Nhật Điểm Thành Viên</span>
              </button>
            </form>
          </div>

          {/* Quick Criteria Reference Card - NỔI BẬT */}
          <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-3xl border-2 border-blue-200 p-5 text-xs text-slate-700 shadow-xs">
            <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span className="p-1 bg-blue-600 text-white rounded-lg">
                <Info className="w-3.5 h-3.5" />
              </span>
              <span>Ghi nhớ bảng quy định 12A2</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed font-medium">
              <li>Phát biểu xây dựng bài đúng: <strong className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md font-bold">+3 điểm</strong></li>
              <li>Không thuộc bài: <strong className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md font-bold">-5 điểm</strong></li>
              <li>Đi học trễ: <strong className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md font-bold">-10 điểm</strong></li>
              <li>Vắng không phép: <strong className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md font-bold">-30 điểm</strong> (Có phép: -3đ)</li>
              <li>Bị ghi sổ đầu bài: <strong className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md font-bold">-20 điểm</strong></li>
              <li>Dùng ĐT trong giờ bị ghi sổ: <strong className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md font-bold">-50 điểm</strong></li>
              <li>Vô lễ với giáo viên/nhân viên: <strong className="text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-md font-bold">-50 điểm</strong></li>
            </ul>
          </div>
        </div>

        {/* Right Column (2 Cols): Table of entries recorded in this submission */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Danh Sách Lượt Chấm Điểm • Tổ {effectiveTeamId} (Tuần {selectedWeek})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng số: <strong className="text-blue-700 font-bold">{currentSubmission?.entries.length || 0}</strong> lượt ghi nhận
                </p>
              </div>

              {currentSubmission && currentSubmission.entries.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
                    Người chấm: {currentSubmission.teamLeaderName}
                  </span>
                </div>
              )}
            </div>

            {!currentSubmission || currentSubmission.entries.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">Chưa có lượt chấm nào trong Tuần {selectedWeek}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Sử dụng biểu mẫu bên trái để ghi nhận điểm phát biểu, thuộc bài hoặc các lỗi vi phạm nề nếp của các bạn trong tổ.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentSubmission.entries.map((entry, idx) => (
                  <div 
                    key={entry.id}
                    className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition hover:shadow-sm ${
                      entry.pointsDelta > 0 
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                        : 'bg-rose-50/80 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs border ${
                        entry.pointsDelta > 0 
                          ? 'bg-emerald-200 border-emerald-300 text-emerald-900' 
                          : 'bg-rose-200 border-rose-300 text-rose-900'
                      }`}>
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{entry.studentName}</span>
                          <span className="text-[10px] text-slate-500 font-semibold bg-white/70 px-2 py-0.5 rounded-md border border-current/10">({entry.date})</span>
                        </div>
                        <div className="text-xs font-bold mt-0.5 text-slate-800">{entry.criteriaTitle}</div>
                        {entry.notes && (
                          <div className="text-[11px] text-slate-600 mt-1 italic bg-white/60 p-1.5 rounded-lg border border-current/10">
                            Ghi chú: "{entry.notes}"
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-medium mt-1">
                          Người chấm: <span className="font-bold text-slate-700">{entry.recordedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className={`text-xl font-black ${entry.pointsDelta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta} đ
                        </span>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                          {entry.status === 'APPROVED' ? '✓ Đã duyệt' : 'Chờ GVCN duyệt'}
                        </div>
                      </div>

                      {/* Delete button if draft */}
                      {(!currentSubmission.status || currentSubmission.status === 'DRAFT' || currentSubmission.status === 'REJECTED' || isGVCN) && (
                        <button
                          onClick={() => deleteScoreEntry(effectiveTeamId, selectedWeek, entry.id)}
                          title="Xóa lượt chấm này"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl border border-transparent hover:border-rose-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
