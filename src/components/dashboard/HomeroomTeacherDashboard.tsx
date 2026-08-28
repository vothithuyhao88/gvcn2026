import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Award, 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  Phone,
  MessageCircle,
  Clock,
  TrendingUp,
  ShieldAlert,
  CalendarDays,
  ExternalLink,
  BookOpen,
  Send,
  X,
  Check,
  Search,
  Filter,
  Flame,
  Info,
  Quote,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getEmulationRank } from '../../utils/emulation';
import { 
  ACADEMIC_YEAR, 
  ACADEMIC_MILESTONES, 
  ACADEMIC_WEEKS, 
  getCurrentAcademicWeek,
  SEMESTER_1_WEEKS,
  SEMESTER_2_WEEKS,
  TOTAL_ACADEMIC_WEEKS
} from '../../data/academicCalendar';
import { Student } from '../../types';
import { ClassLogo } from '../common/ClassLogo';
import { INSPIRATIONAL_STUDY_QUOTES } from '../../data/quotes';
import { AccountProvisionModal } from '../settings/AccountProvisionModal';

interface HomeroomTeacherDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAiAssistant?: () => void;
}

export const HomeroomTeacherDashboard: React.FC<HomeroomTeacherDashboardProps> = ({ 
  onNavigate, 
  onOpenAiAssistant 
}) => {
  const { 
    students, 
    attendanceRecords, 
    submissions, 
    announcements, 
    leaveRequests,
    diaries,
    addDiary 
  } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const currentWeek = getCurrentAcademicWeek();

  // State for Modals
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [contactStudent, setContactStudent] = useState<Student | null>(null);
  const [contactType, setContactType] = useState<'CALL' | 'SMS'>('CALL');
  const [smsContent, setSmsContent] = useState('');
  const [copiedSms, setCopiedSms] = useState(false);

  const [diaryModalStudent, setDiaryModalStudent] = useState<Student | null>(null);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryAction, setDiaryAction] = useState('');
  const [diarySuccess, setDiarySuccess] = useState(false);

  // Inspirational Study Quote state
  const [quoteIdx, setQuoteIdx] = useState(0);
  const currentQuote = INSPIRATIONAL_STUDY_QUOTES[quoteIdx] || INSPIRATIONAL_STUDY_QUOTES[0];

  const handleNextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % INSPIRATIONAL_STUDY_QUOTES.length);
  };

  // Attendance stats for today
  const todayAttendance = attendanceRecords.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
  const absentCpCount = todayAttendance.filter(a => a.status === 'ABSENT_CP').length;
  const absentKpCount = todayAttendance.filter(a => a.status === 'ABSENT_KP').length;
  const lateCount = todayAttendance.filter(a => a.status === 'LATE').length;
  const totalAbsent = absentCpCount + absentKpCount;

  // 1. TOP 5 HIGHEST SCORE STUDENTS (Vinh danh)
  const sortedStudentsDesc = [...students].sort((a, b) => b.currentScore - a.currentScore);
  const top5Highest = sortedStudentsDesc.slice(0, 5);

  // 2. TOP 5 LOWEST SCORE STUDENTS (Cần quan tâm, liên hệ PH & xử lý)
  const sortedStudentsAsc = [...students].sort((a, b) => a.currentScore - b.currentScore);
  const top5Lowest = sortedStudentsAsc.slice(0, 5);

  // 3. TEAM EMULATION SUMMARY (Tổ 1, 2, 3, 4)
  const teamScores = [1, 2, 3, 4].map(teamId => {
    const teamMembers = students.filter(s => s.teamId === teamId);
    const avgScore = teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((acc, cur) => acc + cur.currentScore, 0) / teamMembers.length)
      : 0;
    const leader = teamMembers.find(s => s.position.includes(`TỔ TRƯỞNG TỔ ${teamId}`)) || teamMembers[0];
    const goodCount = teamMembers.filter(s => s.currentScore > 85).length;
    const attentionCount = teamMembers.filter(s => s.currentScore < 90).length;

    return { 
      teamId, 
      memberCount: teamMembers.length, 
      avgScore, 
      leaderName: leader?.fullName || 'Chưa phân công',
      goodCount,
      attentionCount
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const bestTeam = teamScores[0];

  // 4. TODAY'S VIOLATING & ATTENTION STUDENTS
  // Combine today's attendance issues (late/absent) and minus score submissions entries
  const todayIssues: {
    student: Student;
    type: 'ABSENT_KP' | 'ABSENT_CP' | 'LATE' | 'MINUS_POINT' | 'ATTENTION';
    title: string;
    description: string;
    time: string;
  }[] = [];

  // Check attendance today
  todayAttendance.forEach(rec => {
    const student = students.find(s => s.id === rec.studentId);
    if (!student) return;

    if (rec.status === 'ABSENT_KP') {
      todayIssues.push({
        student,
        type: 'ABSENT_KP',
        title: 'Vắng Không Phép',
        description: 'Chưa có đơn xin phép từ phụ huynh hoặc liên lạc báo trước.',
        time: 'Buổi sáng'
      });
    } else if (rec.status === 'LATE') {
      todayIssues.push({
        student,
        type: 'LATE',
        title: 'Đi Học Muộn',
        description: rec.notes || 'Đến lớp sau hiệu lệnh trống 15 phút.',
        time: '07h15'
      });
    } else if (rec.status === 'ABSENT_CP') {
      todayIssues.push({
        student,
        type: 'ABSENT_CP',
        title: 'Nghỉ Có Phép',
        description: rec.notes || 'Gia đình đã gửi đơn xin phép GVCN.',
        time: 'Buổi sáng'
      });
    }
  });

  // If there are few issues recorded today, add other attention students needing follow-up
  if (todayIssues.length < 2) {
    const needAttention = students.filter(s => s.currentScore < 90 || s.attentionFlag).slice(0, 3);
    needAttention.forEach(st => {
      if (!todayIssues.some(ti => ti.student.id === st.id)) {
        todayIssues.push({
          student: st,
          type: 'ATTENTION',
          title: 'Điểm rèn luyện thấp',
          description: st.notes || `Điểm hiện tại: ${st.currentScore}đ. Cần GVCN phối hợp PH nhắc nhở nề nếp.`,
          time: 'Hôm nay'
        });
      }
    });
  }

  // Pending items for Reminder Center
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING');
  const totalAttentionCount = students.filter(s => s.currentScore < 90 || s.attentionFlag).length;

  const handleOpenAi = () => {
    if (onOpenAiAssistant) {
      onOpenAiAssistant();
    } else {
      onNavigate('ai-assistant');
    }
  };

  const handleOpenContactModal = (student: Student, type: 'CALL' | 'SMS') => {
    setContactStudent(student);
    setContactType(type);
    setCopiedSms(false);
    setSmsContent(
      `Kính gửi phụ huynh em ${student.fullName} (Lớp 11A3 - Trung tâm GDNN-GDTX An Nhơn). Cô Võ Thị Thúy Hào (GVCN) trân trọng thông báo về tình hình rèn luyện và nề nếp của em: Điểm thi đua hiện tại ${student.currentScore}đ. Kính đề nghị Quý Phụ huynh phối hợp cùng nhà trường đôn đốc em đi học chuyên cần và chuẩn bị bài vở đầy đủ. Trân trọng!`
    );
  };

  const handleOpenDiaryModal = (student: Student, defaultReason = '') => {
    setDiaryModalStudent(student);
    setDiaryTitle(`Xử lý nề nếp học sinh ${student.fullName} (Tổ ${student.teamId})`);
    setDiaryContent(defaultReason || `Trao đổi với phụ huynh em ${student.fullName} (${student.parentRelationship}: ${student.parentName} - ${student.parentPhone}) về vấn đề nề nếp và học tập.`);
    setDiaryAction(`Phụ huynh cam kết nhắc nhở, phân công Tổ trưởng ${student.teamId} theo dõi và báo cáo GVCN.`);
    setDiarySuccess(false);
  };

  const handleSaveDiary = () => {
    if (!diaryModalStudent || !diaryTitle.trim()) return;
    addDiary({
      date: today,
      title: diaryTitle,
      category: 'Nề nếp',
      content: diaryContent,
      involvedStudents: [diaryModalStudent.fullName],
      actionTaken: diaryAction,
    });
    setDiarySuccess(true);
    setTimeout(() => {
      setDiarySuccess(false);
      setDiaryModalStudent(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. ACADEMIC YEAR 2026-2027 BANNER (35 WEEKS / HK1: 18 WEEKS / HK2: 17 WEEKS) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="shrink-0 hidden sm:block">
              <ClassLogo size="lg" withBorder={true} withGlow={true} />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Năm Học 2026 – 2027</span>
                </span>
                <span className="bg-blue-800/80 text-blue-200 border border-blue-700/60 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                  Tổng 35 tuần thực học (Bắt đầu 07/09/2026)
                </span>
                <span className="bg-rose-500/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  ĐOÀN KẾT VÀ CHIA SẺ
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Lớp 11A3 • GVCN Cô Võ Thị Thúy Hào</span>
              </h1>

              {/* Châm ngôn & Ca dao tục ngữ khuyến khích tinh thần học tập */}
              <div className="flex items-center gap-2.5 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 max-w-3xl shadow-xs group">
                <Quote className="w-4 h-4 text-amber-300 shrink-0 opacity-90" />
                <div className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed flex-1 italic">
                  <span>"{currentQuote.quote}"</span>
                  {currentQuote.authorOrSource && (
                    <span className="text-[11px] text-amber-300 font-bold not-italic ml-2 inline-block">
                      — {currentQuote.authorOrSource}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNextQuote}
                  title="Bấm để đổi câu danh ngôn / ca dao tục ngữ khác"
                  className="p-1.5 hover:bg-white/20 rounded-xl text-amber-300 hover:text-white transition shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="hidden sm:inline">Đổi câu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Academic Timeline Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAccountModal(true)}
              id="btn-dashboard-account-provision"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border border-amber-300/40 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              title="Cài đặt và cấp tài khoản cho Ban cán sự, Học sinh và Phụ huynh theo Mã HS"
            >
              <KeyRound className="w-4 h-4" />
              <span>Cài Đặt Cấp Tài Khoản (Mã HS)</span>
            </button>

            <button
              onClick={() => setShowCalendarModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Tra Cứu Lịch 35 Tuần</span>
            </button>

            <button
              onClick={handleOpenAi}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trợ Lý AI Soạn Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* Mini progress bar of 35 weeks */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Tuần Hiện Tại</span>
            <span className="font-black text-amber-300 text-sm">Tuần 1 (07/09 – 13/09)</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Học Kỳ I</span>
            <span className="font-bold text-blue-200 text-sm">18 Tuần Thực Học</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Nghỉ Tết Đinh Mùi</span>
            <span className="font-bold text-rose-300 text-sm">02 Tuần (01/02 – 14/02)</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Học Kỳ II</span>
            <span className="font-bold text-emerald-300 text-sm">17 Tuần Thực Học</span>
          </div>
        </div>
      </div>

      {/* 2. CORE STAT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Sĩ số */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-center hover:shadow-md transition cursor-pointer group"
        >
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Sĩ số lớp</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-900 tracking-tight">{students.length}</span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 font-medium">4 Tổ • 25 Nam (Hàn) - 16 Nữ (Kế toán)</span>
        </div>

        {/* Metric 2: Có mặt */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-emerald-50/70 rounded-2xl shadow-xs border border-emerald-200/80 p-5 flex flex-col justify-center hover:shadow-md transition cursor-pointer group"
        >
          <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Có mặt hôm nay</span>
            <UserCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-600 tracking-tight">{presentCount || 39}</span>
            <span className="text-xs text-emerald-800 font-bold">/ {students.length}</span>
          </div>
          <span className="text-xs text-emerald-700 font-medium mt-2">
            Tỉ lệ chuyên cần: {Math.round(((presentCount || 39) / students.length) * 100)}%
          </span>
        </div>

        {/* Metric 3: Vi phạm / Vắng hôm nay */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-rose-50/70 rounded-2xl shadow-xs border border-rose-200/80 p-5 flex flex-col justify-center hover:shadow-md transition cursor-pointer group"
        >
          <span className="text-rose-800 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Vắng & Vi phạm</span>
            <UserX className="w-4 h-4 text-rose-600 group-hover:scale-110 transition" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-rose-600 tracking-tight">{todayIssues.length.toString().padStart(2, '0')}</span>
            <span className="text-xs text-rose-800 font-medium">trường hợp</span>
          </div>
          <span className="text-xs text-rose-700 font-medium mt-2">
            {absentKpCount > 0 ? `${absentKpCount} vắng KP, ` : ''}{lateCount > 0 ? `${lateCount} đi trễ, ` : ''}Cần xử lý kịp thời
          </span>
        </div>

        {/* Metric 4: Bảng chấm 4 tổ */}
        <div 
          onClick={() => onNavigate('team-scoring')}
          className="bg-amber-50/70 rounded-2xl shadow-xs border border-amber-200/80 p-5 flex flex-col justify-center hover:shadow-md transition cursor-pointer group"
        >
          <span className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Bảng chấm 4 tổ</span>
            <Award className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-600 tracking-tight">
              {pendingSubmissions.length.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-amber-800 font-medium">chờ duyệt</span>
          </div>
          <span className="text-xs text-amber-700 font-medium mt-2">
            Tổ xuất sắc nhất: <strong>Tổ {bestTeam.teamId} ({bestTeam.avgScore}đ)</strong>
          </span>
        </div>

      </div>

      {/* 3. ĐIỂM TRUNG BÌNH TỪNG TỔ (TỔ 1, TỔ 2, TỔ 3, TỔ 4) */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Bảng Tổng Hợp Điểm Thi Đua 4 Tổ</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Điểm Trung Bình Từng Tổ (Thang Điểm 100)
            </h2>
            <p className="text-xs text-slate-500">
              Cập nhật trực tiếp từ bảng chấm thi đua tuần và sổ ghi nhận nề nếp hàng ngày
            </p>
          </div>

          <button
            onClick={() => onNavigate('team-scoring')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Chi tiết bảng chấm điểm 4 tổ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamScores.map((team, idx) => {
            const isWinner = idx === 0;
            return (
              <div
                key={team.teamId}
                onClick={() => onNavigate('team-scoring')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isWinner 
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-300 shadow-xs' 
                    : 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-blue-300'
                }`}
              >
                {isWinner && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3 text-red-600 fill-current" />
                    <span>Dẫn đầu</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-400 text-slate-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-800' :
                      idx === 2 ? 'bg-orange-300 text-slate-800' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <h3 className="font-black text-slate-900 text-base">TỔ {team.teamId}</h3>
                  </div>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-indigo-900">{team.avgScore}</span>
                    <span className="text-xs text-slate-500 font-bold">điểm TB/hs</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Tổ trưởng: <strong className="text-slate-900">{team.leaderName}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Sĩ số</span>
                    <span className="font-bold text-slate-800">{team.memberCount} bạn</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Xếp loại Tốt</span>
                    <span className="font-bold text-emerald-700">{team.goodCount} bạn</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN COMPARISON: TOP 5 CAO NHẤT VS TOP 5 THẤP NHẤT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOP 5 CAO NHẤT (Vinh Danh) */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Gương Mẫu & Tích Cực</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Top 5 Học Sinh Điểm TB Cao Nhất Lớp
                </h3>
              </div>
              <button
                onClick={() => onNavigate('leaderboard')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Bảng vinh danh</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {top5Highest.map((st, idx) => {
                const rankInfo = getEmulationRank(st.currentScore);
                return (
                  <div 
                    key={st.id}
                    className="p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                        idx === 1 ? 'bg-slate-300 text-slate-900' :
                        idx === 2 ? 'bg-orange-300 text-slate-900' :
                        'bg-emerald-200 text-emerald-900'
                      }`}>
                        {idx + 1}
                      </div>

                      <img 
                        src={st.avatar} 
                        alt={st.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                      />

                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{st.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {st.code} • Tổ {st.teamId} • <span className="font-semibold text-slate-700">{st.position}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-700">{st.currentScore} đ</span>
                      <span className="block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5">
                        {rankInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Được cộng điểm phát biểu, học nghề và nề nếp gương mẫu</span>
            <span className="font-bold text-emerald-700">&gt; 100 điểm rèn luyện</span>
          </div>
        </div>

        {/* TOP 5 THẤP NHẤT (CẦN QUAN TÂM & LIÊN HỆ PHỤ HUYNH) */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Cần Theo Dõi & Hỗ Trợ Kịp Thời</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Top 5 Học Sinh Điểm TB Thấp Nhất (Cần Liên Hệ PH)
                </h3>
              </div>
              <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                5 học sinh
              </span>
            </div>

            <div className="space-y-2.5">
              {top5Lowest.map((st, idx) => {
                const rankInfo = getEmulationRank(st.currentScore);
                return (
                  <div 
                    key={st.id}
                    className="p-3 bg-rose-50/40 hover:bg-rose-50 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>

                      <img 
                        src={st.avatar} 
                        alt={st.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                      />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{st.fullName}</p>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                            {st.currentScore} đ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Tổ {st.teamId} • PH: <strong>{st.parentName}</strong> ({st.parentRelationship} - {st.parentPhone})
                        </p>
                      </div>
                    </div>

                    {/* Quick action buttons for GVCN */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleOpenContactModal(st, 'CALL')}
                        title="Gọi điện cho Phụ huynh"
                        className="px-2.5 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi PH</span>
                      </button>

                      <button
                        onClick={() => handleOpenContactModal(st, 'SMS')}
                        title="Soạn tin nhắn gửi Phụ huynh"
                        className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Nhắn PH</span>
                      </button>

                      <button
                        onClick={() => handleOpenDiaryModal(st, `Học sinh ${st.fullName} có điểm rèn luyện thấp (${st.currentScore}đ), cần GVCN trao đổi biện pháp xử lý với gia đình.`)}
                        title="Nhập nhật ký chủ nhiệm xử lý"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>GVCN chủ động liên hệ để tránh học sinh bị xếp loại Yếu cuối kỳ</span>
            <button 
              onClick={() => onNavigate('parents')}
              className="font-bold text-blue-600 hover:underline"
            >
              Danh bạ toàn bộ PHHS &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 5. HỌC SINH VI PHẠM & VẤN ĐỀ NỀ NẾP HÔM NAY (NẮM BẮT & XỬ LÝ KỊP THỜI) */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Theo Dõi Nề Nếp & Chuyên Cần Trong Ngày</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Danh Sách Học Sinh Vi Phạm & Vấn Đề Cần Xử Lý Hôm Nay
            </h2>
            <p className="text-xs text-slate-500">
              Hỗ trợ Cô Võ Thị Thúy Hào liên hệ phụ huynh ngay và lưu vào sổ tay nhật ký chủ nhiệm
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Sổ Điểm Danh</span>
            </button>
            <button
              onClick={() => onNavigate('diary')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mở Sổ Nhật Ký GVCN</span>
            </button>
          </div>
        </div>

        {todayIssues.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">Hôm nay không có vi phạm nề nếp nghiêm trọng nào!</h4>
            <p className="text-xs text-slate-500 mt-1">Lớp 11A3 duy trì tốt sĩ số và nề nếp 15 phút đầu giờ.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayIssues.map((issue, idx) => {
              const { student } = issue;
              return (
                <div 
                  key={`${student.id}-${idx}`}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    {/* Badge & Time */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                        issue.type === 'ABSENT_KP' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        issue.type === 'LATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        issue.type === 'ABSENT_CP' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {issue.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{issue.time}</span>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={student.avatar} 
                        alt={student.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" 
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.fullName}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Tổ {student.teamId} • {student.code} • <span className="font-bold text-slate-700">{student.currentScore}đ</span>
                        </p>
                      </div>
                    </div>

                    {/* Issue Description */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-3 border border-slate-100 leading-relaxed">
                      {issue.description}
                    </p>

                    {/* Parent Info */}
                    <div className="text-[11px] text-slate-600 bg-slate-100/70 p-2 rounded-xl mb-3">
                      <span>Phụ huynh: </span>
                      <strong>{student.parentName}</strong> ({student.parentRelationship} - <span className="text-blue-700 font-mono font-bold">{student.parentPhone}</span>)
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleOpenContactModal(student, 'CALL')}
                      className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Gọi</span>
                    </button>

                    <button
                      onClick={() => handleOpenContactModal(student, 'SMS')}
                      className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Nhắn tin</span>
                    </button>

                    <button
                      onClick={() => handleOpenDiaryModal(student, `Vi phạm hôm nay: ${issue.title} - ${issue.description}`)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Lưu sổ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. MODAL: TRA CỨU CHI TIẾT KẾ HOẠCH 35 TUẦN NĂM HỌC 2026-2027 */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Khung Thời Gian Năm Học</span>
                <h3 className="text-lg font-black text-slate-900">
                  Kế Hoạch 35 Tuần Thực Học (2026–2027)
                </h3>
              </div>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Milestones List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">1. Các Mốc Thời Gian Trọng Tâm:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {ACADEMIC_MILESTONES.map((m, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${m.badgeColor}`}>
                        {m.title}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs mt-1">{m.dateRange}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 35 Weeks Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">2. Danh Sách Chi Tiết 35 Tuần Thực Học:</h4>
                <span className="text-[11px] font-bold text-slate-500">HK1: 18 tuần • HK2: 17 tuần</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {ACADEMIC_WEEKS.map(w => (
                  <div 
                    key={w.weekNumber}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      w.weekNumber === currentWeek.weekNumber
                        ? 'bg-amber-50 border-amber-300'
                        : w.semester === 1
                        ? 'bg-blue-50/40 border-blue-100'
                        : 'bg-emerald-50/40 border-emerald-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900">{w.label}</strong>
                        <span className={`text-[10px] font-bold px-1.5 rounded ${
                          w.semester === 1 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {w.semester === 1 ? 'HK1' : 'HK2'}
                        </span>
                        {w.weekNumber === currentWeek.weekNumber && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 rounded">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      {w.theme && <p className="text-[10px] text-slate-500 line-clamp-1">{w.theme}</p>}
                    </div>

                    <span className="font-mono text-[11px] text-slate-600 font-semibold">{w.shortDateRange}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: LIÊN HỆ PHỤ HUYNH (CALL / SMS) */}
      {contactStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Liên Hệ Phụ Huynh Học Sinh</span>
                <h3 className="text-base font-black text-slate-900">{contactStudent.fullName} • Tổ {contactStudent.teamId}</h3>
              </div>
              <button 
                onClick={() => setContactStudent(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Phụ Huynh:</span>
                  <strong className="text-slate-900">{contactStudent.parentName} ({contactStudent.parentRelationship})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số Điện Thoại:</span>
                  <strong className="text-blue-700 font-mono text-sm">{contactStudent.parentPhone}</strong>
                </div>
              </div>
            </div>

            {/* Type selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setContactType('CALL')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  contactType === 'CALL' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi Điện Trực Tiếp</span>
              </button>

              <button
                onClick={() => setContactType('SMS')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  contactType === 'SMS' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Mẫu Tin Nhắn SMS / Zalo</span>
              </button>
            </div>

            {contactType === 'CALL' ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Phone className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bấm nút bên dưới để thực hiện cuộc gọi tới phụ huynh:</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{contactStudent.parentPhone}</p>
                </div>
                <a
                  href={`tel:${contactStudent.parentPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Quay Số Gọi Ngay</span>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Nội dung tin nhắn gửi phụ huynh:</label>
                <textarea
                  rows={4}
                  value={smsContent}
                  onChange={e => setSmsContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(smsContent);
                      setCopiedSms(true);
                      setTimeout(() => setCopiedSms(false), 2000);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSms ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{copiedSms ? 'Đã sao chép tin nhắn!' : 'Sao chép tin nhắn'}</span>
                  </button>

                  <a
                    href={`sms:${contactStudent.parentPhone.replace(/\s+/g, '')}?body=${encodeURIComponent(smsContent)}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mở Ứng Dụng SMS</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MODAL: GHI NHẬT KÝ CHỦ NHIỆM XỬ LÝ VI PHẠM */}
      {diaryModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Sổ Tay Nhật Ký Chủ Nhiệm</span>
                <h3 className="text-base font-black text-slate-900">Lưu Biện Pháp Xử Lý Học Sinh</h3>
              </div>
              <button 
                onClick={() => setDiaryModalStudent(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề sự việc:</label>
                <input
                  type="text"
                  value={diaryTitle}
                  onChange={e => setDiaryTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung trao đổi / vi phạm:</label>
                <textarea
                  rows={3}
                  value={diaryContent}
                  onChange={e => setDiaryContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biện pháp xử lý & Cam kết từ gia đình:</label>
                <textarea
                  rows={2}
                  value={diaryAction}
                  onChange={e => setDiaryAction(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              {diarySuccess ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã ghi vào Sổ Nhật Ký GVCN thành công!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDiaryModalStudent(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveDiary}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu Vào Sổ Nhật Ký</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Provision & Settings Modal for GVCN */}
      <AccountProvisionModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />

    </div>
  );
};
