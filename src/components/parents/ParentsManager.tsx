import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  HeartHandshake,
  ExternalLink,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ParentsManager: React.FC = () => {
  const { students, announcements, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | 'ALL'>('ALL');
  const [activeMessageModal, setActiveMessageModal] = useState<string | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.parentPhone.includes(searchTerm);
    const matchesTeam = selectedTeam === 'ALL' || s.teamId === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const latestAnnouncement = announcements[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setMsgSentSuccess(true);
    setTimeout(() => {
      setMsgSentSuccess(false);
      setActiveMessageModal(null);
      setMsgContent('');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Ban Đại Diện & Danh Sách Phụ Huynh Lớp 12A2</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Quản Lý Kết Nối Phụ Huynh Học Sinh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh bạ liên lạc {students.length} phụ huynh, theo dõi trạng thái nhận thông báo và trao đổi phối hợp giáo dục
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{students.length}/{students.length} Phụ Huynh Đã Kết Nối</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên PH, tên con, SĐT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden"
        >
          <option value="ALL">Tất cả các Tổ (1, 2, 3, 4)</option>
          <option value={1}>Tổ 1</option>
          <option value={2}>Tổ 2</option>
          <option value={3}>Tổ 3</option>
          <option value={4}>Tổ 4</option>
        </select>
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <div 
            key={student.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                    {student.parentRelationship || 'Phụ huynh'} • Tổ {student.teamId}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{student.parentName}</h3>
                </div>

                <a
                  href={`tel:${student.parentPhone}`}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                  title="Gọi điện cho phụ huynh"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Child Info */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Học sinh con em:</div>
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>{student.fullName}</span>
                  <span className="text-blue-700 font-black">{student.currentScore}đ</span>
                </div>
                <div className="text-[11px] text-slate-500">{student.vocationalCourse}</div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <strong className="text-slate-900">{student.parentPhone}</strong>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Địa chỉ: {student.address}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã xem thông báo</span>
              </span>

              {currentUser.role === 'GVCN' && (
                <button
                  onClick={() => setActiveMessageModal(student.id)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Gửi tin nhắn</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK MESSAGE MODAL */}
      {activeMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base mb-1">Gửi Tin Nhắn Phụ Huynh</h3>
            <p className="text-xs text-slate-500 mb-4">
              Người nhận: <strong>{students.find(s => s.id === activeMessageModal)?.parentName}</strong>
            </p>

            {msgSentSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ✓ Tin nhắn đã được gửi thành công đến phụ huynh!
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={4}
                  placeholder="Kính gửi quý phụ huynh, về tình hình học tập và nề nếp của con trong tuần..."
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  required
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMessageModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Tin Nhắn</span>
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
