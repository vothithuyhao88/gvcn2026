import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Filter, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HomeroomDiary } from '../../types';

export const HomeroomDiaryView: React.FC = () => {
  const { diaries, addDiary, currentUser, students } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Diary state
  const [newDiaryData, setNewDiaryData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Nề nếp' as HomeroomDiary['category'],
    content: '',
    involvedStudents: [] as string[],
    actionTaken: '',
  });

  const categories: HomeroomDiary['category'][] = [
    'Nề nếp', 
    'Học tập', 
    'Khen thưởng - Kỷ luật', 
    'Sự việc phát sinh', 
    'Trao đổi PHHS', 
    'Hoạt động trải nghiệm'
  ];

  const filteredDiaries = diaries.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryData.title.trim() || !newDiaryData.content.trim()) return;

    addDiary({
      title: newDiaryData.title,
      date: newDiaryData.date,
      category: newDiaryData.category,
      content: newDiaryData.content,
      involvedStudents: newDiaryData.involvedStudents,
      actionTaken: newDiaryData.actionTaken,
    });

    setIsAddModalOpen(false);
    setNewDiaryData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Nề nếp',
      content: '',
      involvedStudents: [],
      actionTaken: '',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Sổ Tay Điện Tử • GVCN Võ Thị Thúy Hào</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Nhật Ký Chủ Nhiệm Lớp 11A3
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi chép diễn biến nề nếp, học tập, sự việc phát sinh và kết quả trao đổi với phụ huynh học sinh
          </p>
        </div>

        {currentUser.role === 'GVCN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-diary"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Nhật Ký Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm trong sổ nhật ký..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Diary Entries List */}
      <div className="space-y-4">
        {filteredDiaries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Chưa có mục nhật ký nào</p>
            <p className="text-xs text-slate-400 mt-1">Bấm "Ghi Nhật Ký Mới" để lưu lại các sự việc trong lớp.</p>
          </div>
        ) : (
          filteredDiaries.map(entry => (
            <div 
              key={entry.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase">
                    {entry.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{entry.date}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>GVCN: Võ Thị Thúy Hào</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{entry.title}</h3>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {entry.content}
              </div>

              {entry.actionTaken && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Biện pháp / Kết quả xử lý:</strong> {entry.actionTaken}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD DIARY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Ghi Nhật Ký Chủ Nhiệm Mới</h3>
            <p className="text-xs text-slate-500 mb-4">Lớp 11A3 • Năm học 2026–2027</p>

            <form onSubmit={handleCreateDiary} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày ghi nhận:</label>
                  <input
                    type="date"
                    value={newDiaryData.date}
                    onChange={e => setNewDiaryData({ ...newDiaryData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại:</label>
                  <select
                    value={newDiaryData.category}
                    onChange={e => setNewDiaryData({ ...newDiaryData, category: e.target.value as HomeroomDiary['category'] })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề ghi chép *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Họp trao đổi với phụ huynh em Huỳnh Gia Huy..."
                  value={newDiaryData.title}
                  onChange={e => setNewDiaryData({ ...newDiaryData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết sự việc *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả cụ thể sự việc, tình hình học tập, nề nếp hoặc nội dung làm việc..."
                  value={newDiaryData.content}
                  onChange={e => setNewDiaryData({ ...newDiaryData, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biện pháp đã xử lý / Phương hướng:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phụ huynh cam kết nhắc nhở con học bài, GVCN theo dõi thêm tuần sau..."
                  value={newDiaryData.actionTaken}
                  onChange={e => setNewDiaryData({ ...newDiaryData, actionTaken: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  Lưu Nhật Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
