import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  HeartHandshake, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Filter,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';

export const ConnectionHubView: React.FC = () => {
  const { 
    currentUser, 
    leaveRequests, 
    updateLeaveRequestStatus, 
    createLeaveRequest, 
    students 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LEAVE_REQUESTS' | 'CHAT'>('LEAVE_REQUESTS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Simple mock chat messages
  const [messages, setMessages] = useState<{ id: string; sender: string; role: string; content: string; time: string; isMe: boolean }[]>([
    { id: '1', sender: 'Cô Võ Thị Thúy Hào (GVCN)', role: 'GVCN', content: 'Chào quý phụ huynh và các em học sinh 12A2! Mọi trao đổi về nề nếp và bài tập có thể nhắn trực tiếp tại đây nhé.', time: '08:00', isMe: false },
    { id: '2', sender: 'Bác Lê Văn Toàn (PH Mai Phương)', role: 'Phụ huynh', content: 'Kính chào cô Hào, gia đình đã nhận được thông báo họp PHHS đầu năm vào Chủ Nhật này. Cảm ơn cô!', time: '08:30', isMe: false },
    { id: '3', sender: 'Huỳnh Gia Huy (Lớp trưởng)', role: 'Học sinh', content: 'Thưa cô, tổ 1 và tổ 2 hôm nay đã hoàn thành trực nhật sạch sẽ và tắt hết quạt trước khi ra về ạ.', time: '11:45', isMe: false },
  ]);

  const [chatInput, setChatInput] = useState('');

  // Leave Form state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStudentId, setLeaveStudentId] = useState(currentUser.studentId || 'hs-01');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');

  const isTeacher = currentUser.role === 'GVCN';

  const filteredLeaves = leaveRequests.filter(l => {
    if (selectedStatusFilter === 'ALL') return true;
    return l.status === selectedStatusFilter;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: String(Date.now()),
      sender: currentUser.fullName,
      role: currentUser.role === 'GVCN' ? 'GVCN' : currentUser.role === 'PARENT' ? 'Phụ huynh' : currentUser.position || 'Học sinh',
      content: chatInput,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages([...messages, newMsg]);
    setChatInput('');
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    const targetStudent = students.find(s => s.id === leaveStudentId) || students[0];

    createLeaveRequest({
      studentId: targetStudent.id,
      studentName: targetStudent.fullName,
      requestedBy: currentUser.role === 'PARENT' ? 'PARENT' : 'STUDENT',
      requesterName: `${currentUser.fullName} (${currentUser.role === 'PARENT' ? 'Phụ huynh' : 'Học sinh'})`,
      requesterPhone: currentUser.phone || targetStudent.parentPhone,
      fromDate: leaveDate,
      toDate: leaveDate,
      reason: leaveReason,
    });

    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Góc Kết Nối Lớp 12A2</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Trao Đổi Trực Tuyến & Duyệt Đơn Xin Nghỉ Học
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cầu nối tương tác giữa Cô Võ Thị Thúy Hào ↔ Phụ Huynh ↔ Học Sinh & Ban cán sự lớp
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('LEAVE_REQUESTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'LEAVE_REQUESTS' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✉️ Đơn Xin Nghỉ Học ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'CHAT' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💬 Phòng Trao Đổi Lớp
          </button>
        </div>
      </div>

      {/* TAB 1: LEAVE REQUESTS MANAGER */}
      {activeTab === 'LEAVE_REQUESTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setSelectedStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tất cả ({leaveRequests.length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedStatusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700'
                }`}
              >
                ⏳ Chờ xử lý ({leaveRequests.filter(l => l.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedStatusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
                }`}
              >
                ✓ Đã duyệt
              </button>
            </div>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Nộp Đơn Xin Phép Nghỉ</span>
            </button>
          </div>

          {/* List of Leave Requests */}
          <div className="space-y-3">
            {filteredLeaves.map(leave => (
              <div 
                key={leave.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {leave.status === 'APPROVED' ? '✓' : leave.status === 'REJECTED' ? '✕' : '✉️'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{leave.studentName}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                        Nghỉ ngày: {leave.fromDate}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {leave.status === 'APPROVED' ? 'Đã duyệt' : leave.status === 'REJECTED' ? 'Từ chối' : 'Đang chờ duyệt'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1">
                      <strong>Lý do:</strong> {leave.reason}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Người gửi: {leave.requesterName}</span>
                      <span>•</span>
                      <span>SĐT: {leave.requesterPhone}</span>
                    </div>

                    {leave.teacherNote && (
                      <div className="mt-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-700">
                        <strong>Phản hồi của GVCN:</strong> "{leave.teacherNote}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Teacher Action Controls */}
                {isTeacher && leave.status === 'PENDING' && (
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => updateLeaveRequestStatus(leave.id, 'APPROVED', 'Đã duyệt đơn nghỉ phép. Em chú ý chép bài đầy đủ nhé!')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt Đơn</span>
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Nhập lý do không duyệt đơn:') || 'Không đủ điều kiện nghỉ học';
                        updateLeaveRequestStatus(leave.id, 'REJECTED', note);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Từ Chối</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLASS CHAT ROOM */}
      {activeTab === 'CHAT' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Kênh Trao Đổi Lớp 12A2 (GVCN & Phụ Huynh & Học Sinh)</h3>
                <p className="text-[11px] text-slate-500">Giữ gìn lời nói chuẩn mực, văn minh trường học</p>
              </div>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-full">
              Năm học 2026–2027
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                  <span className="font-bold text-slate-700">{msg.sender}</span>
                  <span>({msg.role})</span>
                  <span>• {msg.time}</span>
                </div>
                <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                  msg.isMe ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Nhắn tin với tư cách ${currentUser.fullName}...`}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* MODAL NỘP ĐƠN */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-1">Nộp Đơn Xin Phép Nghỉ Học</h3>
            <p className="text-xs text-slate-500 mb-4">Gửi đến GVCN: Võ Thị Thúy Hào (Lớp 12A2)</p>

            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              {currentUser.role === 'GVCN' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn học sinh xin nghỉ:</label>
                  <select
                    value={leaveStudentId}
                    onChange={e => setLeaveStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} (Tổ {s.teamId})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày xin nghỉ:</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={e => setLeaveDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do xin nghỉ chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập lý do chi tiết..."
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Gửi Đơn Cho Cô
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
