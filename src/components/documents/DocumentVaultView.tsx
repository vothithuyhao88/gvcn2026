import React, { useState } from 'react';
import { 
  FolderDown, 
  FileText, 
  Search, 
  Download, 
  ExternalLink, 
  Calendar, 
  Plus, 
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassDocument } from '../../types';

export const DocumentVaultView: React.FC = () => {
  const { documents, addDocument, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New doc state
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<ClassDocument['category']>('Thời khóa biểu');
  const [newDesc, setNewDesc] = useState('');

  const categories: ClassDocument['category'][] = [
    'Thời khóa biểu', 
    'Lịch học nghề', 
    'Nội quy & Thi đua', 
    'Tài liệu ôn tập', 
    'Kế hoạch tuần/tháng'
  ];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addDocument({
      title: newTitle,
      category: newCat,
      fileSize: '1.2 MB',
      fileType: 'pdf',
      downloadUrl: '#',
      description: newDesc || 'Tài liệu sinh hoạt học tập lớp 11A3',
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <FolderDown className="w-4 h-4" />
            <span>Tài Liệu & Lịch Học Lớp 11A3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Kho Biểu Mẫu, Thời Khóa Biểu & Lịch Học Nghề
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trung tâm GDNN-GDTX An Nhơn • Năm học 2026–2027 • Tải về xem nhanh
          </p>
        </div>

        {currentUser.role === 'GVCN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tải Lên Tài Liệu Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, thời khóa biểu..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
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
                selectedCategory === cat ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition hover:border-blue-200"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full">
                  {doc.category}
                </span>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md uppercase">
                  {doc.fileType} • {doc.fileSize}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h3>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Cập nhật: {doc.uploadedAt}
                  </div>
                  {doc.description && (
                    <div className="text-xs text-slate-500 mt-1.5">{doc.description}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Năm học 2026–2027
              </span>

              <button
                onClick={() => alert(`Đang tải tệp tin: ${doc.title}`)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Về</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Tải Lên Tài Liệu Lớp 11A3</h3>
            <p className="text-xs text-slate-500 mb-4">Chia sẻ biểu mẫu, thời khóa biểu hoặc đề cương</p>

            <form onSubmit={handleAddDoc} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Danh mục tài liệu:</label>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value as ClassDocument['category'])}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên tài liệu / Văn bản *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đề cương ôn tập kiểm tra giữa kỳ 1..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn gọn:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Áp dụng cho tuần học thứ 4..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Lưu & Đăng Tải
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
