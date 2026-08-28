import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  FileText, 
  UserCheck, 
  AlertCircle,
  RefreshCw,
  Award,
  Layers,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACADEMIC_WEEKS } from '../../data/academicCalendar';

export const AiTeacherAssistantView: React.FC = () => {
  const { students, currentUser, attendanceRecords, createAnnouncement } = useApp();

  const [activeFeature, setActiveFeature] = useState<'COMMENT' | 'ANNOUNCEMENT' | 'MEETING_AGENDA' | 'WEEKLY_REPORT'>('COMMENT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Form states for Feature 1: Comment
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [commentTone, setCommentTone] = useState('Động viên, tích cực, sư phạm');
  const [extraNotes, setExtraNotes] = useState('');

  // Form states for Feature 2: Announcement
  const [annTarget, setAnnTarget] = useState<'all' | 'bcs' | 'parents'>('all');
  const [annTopic, setAnnTopic] = useState('Kế hoạch thi đua tuần mới & Học nghề Trung cấp');
  const [annPoints, setAnnPoints] = useState('- Duy trì nề nếp 15 phút đầu giờ và đồng phục nghiêm túc\n- Lịch học nghề Trung cấp chiều thứ 3 & thứ 5: Nam (Hàn), Nữ (Kế toán)\n- Ban cán sự đôn đốc các tổ chấm điểm thi đua trước thứ Bảy');
  const [annDeadline, setAnnDeadline] = useState('Thực hiện nghiêm túc từ sáng thứ Hai tuần tới');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Form states for Feature 3: Meeting Agenda
  const [weekNumber, setWeekNumber] = useState(1);
  const [agendaKeyIssues, setAgendaKeyIssues] = useState('Nề nếp đồng phục, chuyên cần các buổi học nghề Trung cấp chiều thứ 3 & thứ 5, vệ sinh lớp học');
  const [agendaPlans, setAgendaPlans] = useState('Phát động tuần lễ hoa điểm tốt chào mừng ngày nhà giáo, kiểm tra 15 phút môn Toán');

  // Form states for Feature 4: Weekly Report
  const [repAttendance, setRepAttendance] = useState('Sĩ số 41/41, chuyên cần đạt 98%, có 1 lượt nghỉ có phép');
  const [repDiscipline, setRepDiscipline] = useState('Tổ 1 và Tổ 3 xếp loại Tốt, Tổ 2 có 1 bạn đi trễ, Tổ 4 hoàn thành trực nhật sạch sẽ');
  const [repStudy, setRepStudy] = useState('Học sinh tích cực phát biểu xây dựng bài, các lớp nghề Hàn (Nam) và Kế toán (Nữ) tham gia đầy đủ 100%');
  const [repRecommendations, setRepRecommendations] = useState('Đề nghị trung tâm kiểm tra lại quạt trần phía cuối lớp học 11A3');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateComment = async () => {
    setLoading(true);
    setResult('');
    try {
      const absences = attendanceRecords.filter(a => a.studentId === selectedStudent?.id && a.status.startsWith('ABSENT')).length;
      const res = await fetch('/api/ai/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent?.fullName,
          score: selectedStudent?.currentScore,
          rank: selectedStudent?.currentScore >= 100 ? 'Xuất sắc' : selectedStudent?.currentScore >= 85 ? 'Khá/Tốt' : 'Cần cố gắng',
          absences,
          violations: extraNotes || 'Chấp hành tốt nề nếp lớp',
          commendations: selectedStudent?.currentScore >= 100 ? 'Chăm ngoan, gương mẫu, tích cực phát biểu' : 'Có cố gắng trong học tập',
          tone: commentTone,
        }),
      });
      const data = await res.json();
      setResult(data.comment || data.error || 'Có lỗi xảy ra.');
    } catch (err: any) {
      setResult(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnnouncement = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai/generate-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience: annTarget,
          topic: annTopic,
          keyPoints: annPoints,
          deadline: annDeadline,
        }),
      });
      const data = await res.json();
      setResult(data.announcement || data.error || 'Có lỗi xảy ra.');
    } catch (err: any) {
      setResult(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgenda = async () => {
    setLoading(true);
    setResult('');
    try {
      const topStudents = students.slice(0, 3).map(s => `${s.fullName} (${s.currentScore}đ)`).join(', ');
      const lowStudents = students.slice(-3).map(s => s.fullName).join(', ');

      const res = await fetch('/api/ai/meeting-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber,
          topStudents,
          lowStudents,
          keyIssues: agendaKeyIssues,
          plans: agendaPlans,
        }),
      });
      const data = await res.json();
      setResult(data.agenda || data.error || 'Có lỗi xảy ra.');
    } catch (err: any) {
      setResult(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber,
          attendanceStats: repAttendance,
          disciplineStats: repDiscipline,
          studyStats: repStudy,
          recommendations: repRecommendations,
        }),
      });
      const data = await res.json();
      setResult(data.report || data.error || 'Có lỗi xảy ra.');
    } catch (err: any) {
      setResult(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Trợ Lý Sư Phạm AI • Gemini 3.7 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Trợ Lý Chủ Nhiệm Đắc Lực Lớp 11A3
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Hỗ trợ Cô Võ Thị Thúy Hào tự động hóa soạn thảo nhận xét học bạ, thông báo phụ huynh, thiết kế kịch bản sinh hoạt lớp và báo cáo tuần chuẩn mẫu GDNN-GDTX.
          </p>
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => { setActiveFeature('COMMENT'); setResult(''); }}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeFeature === 'COMMENT'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-2" />
          <div>
            <div className="font-bold text-xs">1. Soạn Nhận Xét Học Sinh</div>
            <div className={`text-[10px] mt-0.5 ${activeFeature === 'COMMENT' ? 'text-blue-100' : 'text-slate-400'}`}>
              Học bạ, sổ liên lạc, động viên
            </div>
          </div>
        </button>

        <button
          onClick={() => { setActiveFeature('ANNOUNCEMENT'); setResult(''); }}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeFeature === 'ANNOUNCEMENT'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-2" />
          <div>
            <div className="font-bold text-xs">2. Soạn Thông Báo Lớp</div>
            <div className={`text-[10px] mt-0.5 ${activeFeature === 'ANNOUNCEMENT' ? 'text-blue-100' : 'text-slate-400'}`}>
              Họp PH, kế hoạch, thi cử
            </div>
          </div>
        </button>

        <button
          onClick={() => { setActiveFeature('MEETING_AGENDA'); setResult(''); }}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeFeature === 'MEETING_AGENDA'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-5 h-5 mb-2" />
          <div>
            <div className="font-bold text-xs">3. Kịch Bản Sinh Hoạt Lớp</div>
            <div className={`text-[10px] mt-0.5 ${activeFeature === 'MEETING_AGENDA' ? 'text-blue-100' : 'text-slate-400'}`}>
              45 phút tiết sinh hoạt thứ 7
            </div>
          </div>
        </button>

        <button
          onClick={() => { setActiveFeature('WEEKLY_REPORT'); setResult(''); }}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeFeature === 'WEEKLY_REPORT'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <FileText className="w-5 h-5 mb-2" />
          <div>
            <div className="font-bold text-xs">4. Báo Cáo Tuần GDNN-GDTX</div>
            <div className={`text-[10px] mt-0.5 ${activeFeature === 'WEEKLY_REPORT' ? 'text-blue-100' : 'text-slate-400'}`}>
              Gửi Ban Giám đốc Trung tâm
            </div>
          </div>
        </button>
      </div>

      {/* 2-COLUMN WORKSPACE: LEFT (Form parameters) | RIGHT (AI Output & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Form inputs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              {activeFeature === 'COMMENT' && 'Thiết lập thông tin học sinh cần nhận xét'}
              {activeFeature === 'ANNOUNCEMENT' && 'Thiết lập nội dung thông báo cần soạn'}
              {activeFeature === 'MEETING_AGENDA' && 'Thiết lập thông tin tiết sinh hoạt lớp'}
              {activeFeature === 'WEEKLY_REPORT' && 'Thiết lập số liệu báo cáo tuần'}
            </h3>
          </div>

          {/* FEATURE 1: COMMENT FORM */}
          {activeFeature === 'COMMENT' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn học sinh trong lớp (35 bạn):</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-hidden"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} - Tổ {s.teamId} ({s.position}) - Điểm: {s.currentScore}đ
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-slate-600">
                  <div className="text-[11px] font-bold text-slate-800">Thông tin tóm tắt:</div>
                  <div>• Nghề đang học: <strong>{selectedStudent.vocationalCourse}</strong></div>
                  <div>• Điểm thi đua hiện tại: <strong className="text-blue-700">{selectedStudent.currentScore} điểm</strong></div>
                  <div>• Phụ huynh: {selectedStudent.parentName} ({selectedStudent.parentPhone})</div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phong cách nhận xét:</label>
                <input
                  type="text"
                  value={commentTone}
                  onChange={e => setCommentTone(e.target.value)}
                  placeholder="Ví dụ: Động viên, chỉ rõ ưu điểm và nhắc nhở nhẹ nhàng..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú bổ sung về em này (nếu có):</label>
                <textarea
                  rows={2}
                  value={extraNotes}
                  onChange={e => setExtraNotes(e.target.value)}
                  placeholder="Ví dụ: Tuần này em có tiến bộ rõ rệt ở môn Toán, phát biểu 2 lần..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <button
                onClick={handleGenerateComment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'AI Đang Soạn Nhận Xét...' : 'Tạo Nhận Xét Bằng AI'}</span>
              </button>
            </div>
          )}

          {/* FEATURE 2: ANNOUNCEMENT FORM */}
          {activeFeature === 'ANNOUNCEMENT' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-black text-slate-800 mb-1">1. Đích đến (Đối tượng nhận thông báo):</label>
                <select
                  value={annTarget}
                  onChange={e => setAnnTarget(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">🌐 Toàn thể Lớp 11A3 (41 Học sinh & Quý Phụ huynh)</option>
                  <option value="bcs">🎖️ Ban Cán Sự Lớp (BCS - Lớp trưởng, Phó, Bí thư, Tổ trưởng)</option>
                  <option value="parents">👨‍👩‍👧 Phụ Huynh Học Sinh Lớp 11A3</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">2. Tiêu đề / Chủ đề thông báo:</label>
                <input
                  type="text"
                  value={annTopic}
                  onChange={e => setAnnTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">3. Các ý chính cần phổ biến (Nội dung cốt lõi):</label>
                <textarea
                  rows={3}
                  value={annPoints}
                  onChange={e => setAnnPoints(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời gian / Hạn chót (nếu có):</label>
                <input
                  type="text"
                  value={annDeadline}
                  onChange={e => setAnnDeadline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <button
                onClick={handleGenerateAnnouncement}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'AI Đang Soạn Thông Báo...' : 'Soạn Thông Báo Chuẩn Sư Phạm'}</span>
              </button>
            </div>
          )}

          {/* FEATURE 3: MEETING AGENDA FORM */}
          {activeFeature === 'MEETING_AGENDA' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tuần sinh hoạt (35 tuần thực học):</label>
                <select
                  value={weekNumber}
                  onChange={e => setWeekNumber(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Các vấn đề trọng tâm trong tuần:</label>
                <textarea
                  rows={3}
                  value={agendaKeyIssues}
                  onChange={e => setAgendaKeyIssues(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kế hoạch tuần tới:</label>
                <textarea
                  rows={2}
                  value={agendaPlans}
                  onChange={e => setAgendaPlans(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <button
                onClick={handleGenerateAgenda}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'AI Đang Lập Kế Hoạch...' : 'Tạo Kịch Bản Sinh Hoạt 45 Phút'}</span>
              </button>
            </div>
          )}

          {/* FEATURE 4: WEEKLY REPORT FORM */}
          {activeFeature === 'WEEKLY_REPORT' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tuần báo cáo (35 tuần thực học):</label>
                <select
                  value={weekNumber}
                  onChange={e => setWeekNumber(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tình hình chuyên cần & sĩ số:</label>
                <input
                  type="text"
                  value={repAttendance}
                  onChange={e => setRepAttendance(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tình hình nề nếp 4 tổ:</label>
                <input
                  type="text"
                  value={repDiscipline}
                  onChange={e => setRepDiscipline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tình hình học văn hóa & học nghề:</label>
                <input
                  type="text"
                  value={repStudy}
                  onChange={e => setRepStudy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đề xuất kiến nghị với Ban Giám đốc:</label>
                <input
                  type="text"
                  value={repRecommendations}
                  onChange={e => setRepRecommendations(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                />
              </div>

              <button
                onClick={handleGenerateWeeklyReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'AI Đang Tổng Hợp Báo Cáo...' : 'Tạo Báo Cáo Tuần Chuẩn Sư Phạm'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: AI Generated Output */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Kết quả tạo bởi Trợ Lý AI
                </h3>
              </div>

              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép văn bản'}</span>
                </button>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 min-h-[300px] text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">Gemini 3.7 Flash đang phân tích và tạo nội dung sư phạm...</span>
                </div>
              ) : result ? (
                result
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2 text-center">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                  <span className="text-xs">Chọn thông số bên trái và bấm nút Tạo để AI hỗ trợ cô Võ Thị Thúy Hào.</span>
                </div>
              )}
            </div>

            {/* Direct publish button if activeFeature === 'ANNOUNCEMENT' and result exists */}
            {activeFeature === 'ANNOUNCEMENT' && result && (
              <div className="mt-3.5 bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Phát hành trực tiếp lên Bảng Tin Lớp</span>
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Đích đến: <strong>{annTarget === 'all' ? 'Toàn lớp' : annTarget === 'bcs' ? 'Ban cán sự (BCS)' : 'Phụ huynh'}</strong>
                  </div>
                </div>

                {publishedSuccess ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã đăng lên Bảng Tin!</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      createAnnouncement({
                        title: annTopic || 'Thông báo Lớp 11A3',
                        content: result,
                        category: annTarget === 'bcs' ? 'BAN CÁN SỰ' : annTarget === 'parents' ? 'HỌP PHỤ HUYNH' : 'THÔNG BÁO CHUNG',
                        targetAudience: annTarget === 'bcs' ? 'BCS' : annTarget === 'parents' ? 'PARENTS' : 'ALL',
                        important: false,
                        attachments: []
                      });
                      setPublishedSuccess(true);
                      setTimeout(() => setPublishedSuccess(false), 3000);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Đăng Lên Bảng Tin Lớp</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>GVCN: Võ Thị Thúy Hào • Lớp 11A3</span>
            <span>GDNN-GDTX An Nhơn (2026–2027)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
