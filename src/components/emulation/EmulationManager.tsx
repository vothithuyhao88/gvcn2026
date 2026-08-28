import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  Users,
  Edit3,
  Trash2,
  RotateCcw,
  Check,
  X,
  Save,
  Plus,
  Shield,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CriteriaRule } from '../../types';
import { getEmulationRank, EMULATION_RANK_LEGEND } from '../../utils/emulation';

export const EmulationManager: React.FC = () => {
  const { 
    students, 
    criteria, 
    currentUser, 
    addCriteria, 
    updateCriteria, 
    deleteCriteria, 
    resetCriteriaToDefault 
  } = useApp();

  const isGVCN = currentUser.role === 'GVCN';

  const [activeTab, setActiveTab] = useState<'CRITERIA' | 'STUDENT_SCORES'>('CRITERIA');
  const [searchTerm, setSearchTerm] = useState('');
  const [criteriaTypeFilter, setCriteriaTypeFilter] = useState<'ALL' | 'CỘNG' | 'TRỪ'>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<number | 'ALL'>('ALL');
  const [selectedRankFilter, setSelectedRankFilter] = useState<string>('ALL');

  // Modal / Form state for Add/Edit Criteria (GVCN)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<CriteriaRule | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    category: 'CỘNG' as 'CỘNG' | 'TRỪ',
    title: '',
    points: 5,
    unit: 'lần',
    description: '',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    const nextCodeNum = criteria.length + 1;
    const padCode = nextCodeNum < 10 ? `0${nextCodeNum}` : `${nextCodeNum}`;
    setEditingCriteria(null);
    setFormData({
      code: `TC-${padCode}`,
      category: 'CỘNG',
      title: '',
      points: 5,
      unit: 'lần',
      description: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (crit: CriteriaRule) => {
    setEditingCriteria(crit);
    setFormData({
      code: crit.code,
      category: crit.category,
      title: crit.title,
      points: Math.abs(crit.points),
      unit: crit.unit || 'lần',
      description: crit.description || '',
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên tiêu chí!');
      return;
    }

    const calculatedPoints = formData.category === 'TRỪ' 
      ? -Math.abs(formData.points) 
      : Math.abs(formData.points);

    if (editingCriteria) {
      // Update existing
      updateCriteria({
        ...editingCriteria,
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        title: formData.title.trim(),
        points: calculatedPoints,
        unit: formData.unit.trim() || 'lần',
        description: formData.description.trim(),
      });
      showToast(`Đã cập nhật thành công tiêu chí "${formData.title}"`);
    } else {
      // Create new
      addCriteria({
        code: formData.code.trim().toUpperCase() || `TC-${criteria.length + 1}`,
        category: formData.category,
        title: formData.title.trim(),
        points: calculatedPoints,
        unit: formData.unit.trim() || 'lần',
        description: formData.description.trim(),
      });
      showToast(`Đã thêm mới tiêu chí "${formData.title}" vào bảng quy định`);
    }

    setIsModalOpen(false);
  };

  // Delete Criteria
  const handleDelete = (crit: CriteriaRule) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tiêu chí "${crit.title}" (${crit.code})?`)) {
      deleteCriteria(crit.id);
      showToast(`Đã xóa tiêu chí "${crit.title}"`);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm('Khôi phục danh sách về 20 tiêu chí quy định chuẩn mặc định của lớp 11A3?')) {
      resetCriteriaToDefault();
      showToast('Đã khôi phục bảng 20 tiêu chí chuẩn mặc định.');
    }
  };

  // Filter criteria
  const filteredCriteria = criteria.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = criteriaTypeFilter === 'ALL' || c.category === criteriaTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesTeam = selectedTeam === 'ALL' || s.teamId === selectedTeam;
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const rankInfo = getEmulationRank(s.currentScore);
    const matchesRank = selectedRankFilter === 'ALL' || rankInfo.rank === selectedRankFilter;
    return matchesTeam && matchesSearch && matchesRank;
  });

  // Stats count
  const rankStats = {
    tot: students.filter(s => s.currentScore > 85).length,
    kha: students.filter(s => s.currentScore > 70 && s.currentScore <= 85).length,
    dat: students.filter(s => s.currentScore >= 50 && s.currentScore <= 70).length,
    yeu: students.filter(s => s.currentScore < 50).length,
  };

  const plusCount = criteria.filter(c => c.category === 'CỘNG').length;
  const minusCount = criteria.filter(c => c.category === 'TRỪ').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Thang Điểm Thi Đua & Xếp Loại Lớp 11A3 (2026–2027)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Quản Lý Chỉ Tiêu Khen Thưởng & Xếp Loại</span>
            {isGVCN && (
              <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
                Quyền GVCN
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thang điểm 100: <strong>&gt; 85đ: Tốt • &gt; 70đ: Khá • ≥ 50đ: Đạt • &lt; 50đ: Yếu</strong> • Tổng: <strong>{criteria.length} tiêu chí</strong> ({plusCount} cộng / {minusCount} trừ)
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('CRITERIA')}
            id="tab-criteria-list"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'CRITERIA' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Bảng Tiêu Chí ({criteria.length})
          </button>
          <button
            onClick={() => setActiveTab('STUDENT_SCORES')}
            id="tab-student-ranks"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'STUDENT_SCORES' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍🎓 Xếp Loại Học Sinh ({students.length})
          </button>
        </div>
      </div>

      {/* 4-TIER RANKING SCALE LEGEND BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Quy định Thang Điểm 100 & Phân Loại Thi Đua Lớp 11A3
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMULATION_RANK_LEGEND.map(item => (
            <div 
              key={item.rank}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${item.tagColor}`}>
                    Loại {item.rank}
                  </span>
                  <span className="font-black text-xs">{item.condition}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{item.desc}</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-current/10 text-[10px] font-bold flex justify-between">
                <span>Số lượng hiện tại:</span>
                <span>
                  {item.rank === 'Tốt' && `${rankStats.tot} bạn`}
                  {item.rank === 'Khá' && `${rankStats.kha} bạn`}
                  {item.rank === 'Đạt' && `${rankStats.dat} bạn`}
                  {item.rank === 'Yếu' && `${rankStats.yeu} bạn`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TAB 1: DANH SÁCH & QUẢN LÝ TIÊU CHÍ (GVCN ĐƯỢC THÊM/SỬA/XÓA/LƯU) */}
      {activeTab === 'CRITERIA' && (
        <div className="space-y-4">
          
          {/* Action Bar for GVCN */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tiêu chí (phát biểu, thuộc bài, vắng, trực nhật...)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCriteriaTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  criteriaTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tất cả ({criteria.length})
              </button>
              <button
                onClick={() => setCriteriaTypeFilter('CỘNG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  criteriaTypeFilter === 'CỘNG' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
                }`}
              >
                🌟 Khen thưởng (+{plusCount})
              </button>
              <button
                onClick={() => setCriteriaTypeFilter('TRỪ')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  criteriaTypeFilter === 'TRỪ' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700'
                }`}
              >
                ⚠️ Vi phạm (-{minusCount})
              </button>
            </div>

            {/* GVCN Action Buttons: Add New & Reset Defaults */}
            {isGVCN && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  title="Khôi phục về bảng 20 tiêu chí mặc định ban đầu"
                  className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenCreate}
                  id="btn-add-new-criteria"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md ring-2 ring-blue-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Thêm Tiêu Chí Mới</span>
                </button>
              </div>
            )}
          </div>

          {/* Criteria Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCriteria.map(item => {
              const isPlus = item.category === 'CỘNG';
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border-2 p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                    isPlus ? 'border-emerald-200/90 hover:border-emerald-300' : 'border-rose-200/90 hover:border-rose-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isPlus ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {item.code} • {item.category === 'CỘNG' ? 'Điểm cộng' : 'Điểm trừ'}
                      </span>
                      <span className={`text-base font-black ${isPlus ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPlus ? `+${item.points}` : item.points} đ/{item.unit || 'lần'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Đơn vị tính: <strong className="text-slate-600">{item.unit || 'lần'}</strong>
                    </div>

                    {/* GVCN Controls: Edit & Delete */}
                    {isGVCN ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          id={`btn-edit-crit-${item.code}`}
                          className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          id={`btn-delete-crit-${item.code}`}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Xóa tiêu chí này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Quy định 11A3</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCriteria.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Không tìm thấy tiêu chí nào phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm tiêu chí mới".</p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: ĐIỂM HỌC SINH TỔNG HỢP & XẾP LOẠI */}
      {activeTab === 'STUDENT_SCORES' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm học sinh theo tên, mã..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden"
              >
                <option value="ALL">Tất cả các Tổ</option>
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>

              <select
                value={selectedRankFilter}
                onChange={e => setSelectedRankFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden"
              >
                <option value="ALL">Tất cả Xếp loại</option>
                <option value="Tốt">🌟 Loại Tốt (&gt; 85đ)</option>
                <option value="Khá">👍 Loại Khá (&gt; 70-85đ)</option>
                <option value="Đạt">👌 Loại Đạt (50-70đ)</option>
                <option value="Yếu">⚠️ Loại Yếu (&lt; 50đ)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-12 text-center">STT</th>
                    <th className="p-4">Học sinh</th>
                    <th className="p-4">Tổ / Chức vụ</th>
                    <th className="p-4 text-center">Điểm khởi điểm</th>
                    <th className="p-4 text-center">Điểm hiện tại</th>
                    <th className="p-4">Xếp loại thi đua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s, idx) => {
                    const rankInfo = getEmulationRank(s.currentScore);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={s.avatar} alt={s.fullName} className="w-8 h-8 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-slate-900">{s.fullName}</div>
                              <div className="text-[10px] text-slate-400">{s.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">Tổ {s.teamId}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">{s.position}</span>
                        </td>
                        <td className="p-4 text-center text-slate-500 font-semibold">{s.baseScore} đ</td>
                        <td className="p-4 text-center">
                          <span className="text-base font-black text-blue-700">{s.currentScore}</span>
                          <span className="text-[10px] text-slate-400 ml-1">đ</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${rankInfo.badgeClass}`}>
                            <span>{rankInfo.emoji}</span>
                            <span>{rankInfo.rank}</span>
                            <span className="text-[10px] opacity-75 font-normal">({rankInfo.description})</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / CHỈNH SỬA TIÊU CHÍ (GVCN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                  formData.category === 'CỘNG' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  {editingCriteria ? '✏️' : '➕'}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingCriteria ? 'Chỉnh Sửa Tiêu Chí Thi Đua' : 'Thêm Tiêu Chí Thi Đua Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">Giáo viên chủ nhiệm thiết lập thang điểm 11A3</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCriteria} className="space-y-4 mt-4 text-xs">
              
              {/* Phân loại Cộng / Trừ */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Phân loại chỉ tiêu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'CỘNG' })}
                    className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                      formData.category === 'CỘNG'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>🌟</span>
                    <span>Khen Thưởng (Điểm cộng)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: 'TRỪ' })}
                    className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                      formData.category === 'TRỪ'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>⚠️</span>
                    <span>Vi Phạm (Điểm trừ)</span>
                  </button>
                </div>
              </div>

              {/* Mã & Mức điểm */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mã tiêu chí:</label>
                  <input
                    type="text"
                    required
                    placeholder="TC-21"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-bold uppercase text-slate-900 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mức điểm:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.points}
                    onChange={e => setFormData({ ...formData, points: Math.abs(Number(e.target.value)) })}
                    className={`w-full p-2.5 bg-slate-50 border-2 rounded-xl font-black text-sm outline-hidden ${
                      formData.category === 'CỘNG' 
                        ? 'border-emerald-300 text-emerald-700' 
                        : 'border-rose-300 text-rose-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Đơn vị:</label>
                  <input
                    type="text"
                    required
                    placeholder="lần / tiết / buổi"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              {/* Tên tiêu chí */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tên tiêu chí khen thưởng / vi phạm:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đạt điểm 10 kiểm tra miệng, Giúp đỡ bạn cùng tiến..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-bold text-slate-900 outline-hidden"
                />
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mô tả & Hướng dẫn áp dụng (Tùy chọn):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Áp dụng khi có xác nhận của giáo viên bộ môn hoặc cán sự..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-medium text-slate-800 outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  id="btn-save-criteria"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCriteria ? 'Lưu Thay Đổi' : 'Thêm Tiêu Chí'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
