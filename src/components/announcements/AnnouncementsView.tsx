import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  CheckCircle2, 
  Users, 
  Send, 
  Paperclip, 
  Calendar, 
  Eye, 
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Award,
  Pin,
  Trash2,
  Edit3,
  Filter,
  UserCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';

interface TargetOption {
  value: 'ALL' | 'BCS' | 'PARENTS';
  label: string;
  badgeLabel: string;
  icon: string;
  desc: string;
  badgeClass: string;
}

const TARGET_OPTIONS: TargetOption[] = [
  {
    value: 'ALL',
    label: 'Toàn lớp',
    badgeLabel: 'Toàn thể Lớp 11A3 (41 HS & PH)',
    icon: '🌐',
    desc: 'Tất cả 41 học sinh & Quý Phụ huynh lớp 11A3',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    value: 'BCS',
    label: 'Ban cán sự (BCS)',
    badgeLabel: 'Ban Cán Sự Lớp (BCS)',
    icon: '🎖️',
    desc: 'Lớp trưởng, Lớp phó, Bí thư & 4 Tổ trưởng',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    value: 'PARENTS',
    label: 'Phụ huynh',
    badgeLabel: 'Phụ Huynh Học Sinh',
    icon: '👨‍👩‍👧',
    desc: 'Toàn thể Cha/Mẹ & Người giám hộ học sinh',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
];

const TEMPLATES: { [key in 'ALL' | 'BCS' | 'PARENTS']: { title: string; category: string; content: string }[] } = {
  ALL: [
    {
      title: '🏆 Kế hoạch Thi đua Tuần Mới & Giữ gìn Kỷ cương Lớp 11A3',
      category: 'PHONG TRÀO',
      content: 'Chào toàn thể các em học sinh lớp 11A3!\n\n1. Tuần này lớp chúng ta tiếp tục duy trì thi đua Hoa Điểm Tốt và giữ gìn nề nếp 15 phút đầu giờ.\n2. Yêu cầu 100% học sinh mặc đúng đồng phục, mang đầy đủ sách vở và dụng cụ học tập.\n3. Lịch học nghề Trung cấp: Thứ 3 và Thứ 5 (Nam học Hàn, Nữ học Kế toán) yêu cầu tham gia đúng giờ, không vắng không phép.\n\nChúc cả lớp một tuần học tập hiệu quả và đạt nhiều điểm cộng thi đua!\n\nGVCN: Võ Thị Thúy Hào'
    },
    {
      title: '⏰ Thông báo: Lịch Kiểm tra Giữa kỳ & Ôn tập Văn hóa',
      category: 'HỌC TẬP',
      content: 'Thông báo đến toàn thể 41 học sinh lớp 11A3:\n- Lịch ôn tập và kiểm tra định kỳ các môn văn hóa sẽ diễn ra trong tuần tới.\n- Đề nghị các em chủ động ôn bài theo đề cương của các thầy cô bộ môn.\n- Các bạn trong Ban cán sự hỗ trợ đôn đốc các tổ ôn tập nghiêm túc.\n\nGVCN: Võ Thị Thúy Hào'
    }
  ],
  BCS: [
    {
      title: '🎖️ Giao nhiệm vụ Ban Cán sự: Theo dõi Nề nếp & Tổng hợp Điểm Thi đua',
      category: 'BAN CÁN SỰ',
      content: 'Gửi Ban Cán Sự Lớp 11A3 (Lớp trưởng Nguyễn Văn An, Lớp phó Mai Phương, Bí thư Hoàng Nam và 4 Tổ trưởng):\n\n1. Lớp phó Nề nếp: Kiểm tra và chốt sĩ số, chuyên cần và học sinh đi trễ mỗi đầu buổi học.\n2. 4 Tổ trưởng: Chấm điểm thi đua thành viên trong tổ theo đúng biểu điểm, nhập và trình GVCN phê duyệt trước tiết sinh hoạt Thứ Bảy.\n3. Lớp phó Lao động: Đôn đốc tổ trực nhật vệ sinh phòng học sạch sẽ, tắt điện quạt trước khi ra về.\n\nĐề nghị các em thực hiện nghiêm túc và gương mẫu đi đầu!\n\nGVCN: Võ Thị Thúy Hào'
    },
    {
      title: '📋 Lịch Họp Giao Ban Ban Cán Sự Lớp 11A3 Đầu Tuần',
      category: 'BAN CÁN SỰ',
      content: 'Triệu tập Ban Cán sự lớp 11A3:\n- Thời gian: 07h00 sáng Thứ Hai (15 phút trước giờ chào cờ).\n- Địa điểm: Phòng học 11A3 (Bàn GVCN).\n- Nội dung: Rà soát công tác tuần qua, giải quyết các vướng mắc của 4 tổ và triển khai kế hoạch phong trào mới.\n\nYêu cầu các em có mặt đúng giờ, đầy đủ sổ tay theo dõi.\n\nGVCN: Võ Thị Thúy Hào'
    }
  ],
  PARENTS: [
    {
      title: '📢 Giấy Mời Họp Phụ Huynh Đầu Năm Học 2026–2027 & Đào Tạo Nghề Trung Cấp',
      category: 'HỌP PHỤ HUYNH',
      content: 'Kính gửi Quý Phụ huynh học sinh Lớp 11A3,\n\nNhà trường và GVCN trân trọng kính mời Quý Phụ huynh đến tham dự buổi Họp Phụ Huynh đầu năm học 2026 - 2027:\n- Thời gian: 08h00, Chủ Nhật (ngày 30/08/2026)\n- Địa điểm: Phòng học số 04, Trung tâm GDNN-GDTX An Nhơn\n- Nội dung chính:\n  + Báo cáo tình hình học sinh đầu năm học và phương hướng rèn luyện.\n  + Phối hợp đào tạo nghề Trung cấp song hành (Nam học Hàn, Nữ học Kế toán).\n  + Bầu Ban đại diện Cha Mẹ Học Sinh lớp.\n\nRất mong Quý Phụ huynh sắp xếp thời gian tham dự đông đủ và đúng giờ.\n\nTrân trọng cảm ơn sự đồng hành của Quý Phụ huynh!\nGVCN: Võ Thị Thúy Hào - SĐT: 0914.821.345'
    },
    {
      title: '👨‍👩‍👧 Thông báo: Phối hợp Quản lý Chuyên cần & Học nghề Trung cấp',
      category: 'HỌP PHỤ HUYNH',
      content: 'Kính gửi Quý Phụ huynh Lớp 11A3,\n\nĐể đảm bảo quyền lợi học tập song bằng (Văn hóa THPT & Nghề Trung cấp), kính nhờ Quý Phụ huynh cùng GVCN đôn đốc các em:\n1. Đi học đúng giờ các buổi sáng văn hóa (7h00) và buổi chiều học nghề Thứ 3, Thứ 5.\n2. Khi học sinh có lý do sức khỏe hoặc việc gia đình đột xuất, Quý phụ huynh vui lòng gửi Đơn xin phép trực tuyến trên ứng dụng hoặc liên hệ trực tiếp GVCN trước 07h00 sáng.\n\nGVCN: Võ Thị Thúy Hào'
    }
  ]
};

export const AnnouncementsView: React.FC = () => {
  const { 
    announcements, 
    createAnnouncement, 
    updateAnnouncement,
    deleteAnnouncement,
    toggleImportantAnnouncement,
    markAnnouncementAsRead, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTargetFilter, setSelectedTargetFilter] = useState<string>('ALL_FILTER');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'BCS' | 'PARENTS'>('ALL');
  const [category, setCategory] = useState<string>('THÔNG BÁO CHUNG');
  const [important, setImportant] = useState(false);

  // Filtered announcements
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTarget = 
      selectedTargetFilter === 'ALL_FILTER' || 
      a.targetAudience === selectedTargetFilter ||
      (selectedTargetFilter === 'ALL' && a.targetAudience === 'ALL') ||
      (selectedTargetFilter === 'BCS' && a.targetAudience === 'BCS') ||
      (selectedTargetFilter === 'PARENTS' && a.targetAudience === 'PARENTS');

    return matchesSearch && matchesTarget;
  });

  const countAll = announcements.filter(a => a.targetAudience === 'ALL').length;
  const countBCS = announcements.filter(a => a.targetAudience === 'BCS').length;
  const countParents = announcements.filter(a => a.targetAudience === 'PARENTS').length;

  const openCreateModal = (presetTarget?: 'ALL' | 'BCS' | 'PARENTS') => {
    setEditingAnn(null);
    setTitle('');
    setContent('');
    setTargetAudience(presetTarget || 'ALL');
    setCategory(presetTarget === 'BCS' ? 'BAN CÁN SỰ' : presetTarget === 'PARENTS' ? 'HỌP PHỤ HUYNH' : 'THÔNG BÁO CHUNG');
    setImportant(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setContent(ann.content);
    setTargetAudience((ann.targetAudience === 'BCS' || ann.targetAudience === 'PARENTS') ? ann.targetAudience : 'ALL');
    setCategory(ann.category || 'THÔNG BÁO CHUNG');
    setImportant(!!ann.important);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingAnn) {
      updateAnnouncement({
        ...editingAnn,
        title: title.trim(),
        content: content.trim(),
        targetAudience,
        category,
        important
      });
    } else {
      createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        targetAudience,
        important,
        attachments: [
          { name: `Thong_bao_${targetAudience.toLowerCase()}_11A3.pdf`, size: '185 KB' }
        ],
      });
    }

    setIsAddModalOpen(false);
    setTitle('');
    setContent('');
    setEditingAnn(null);
  };

  const handleApplyTemplate = (tmpl: { title: string; category: string; content: string }) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category);
    setContent(tmpl.content);
  };

  const getTargetInfo = (target: string) => {
    const found = TARGET_OPTIONS.find(t => t.value === target);
    if (found) return found;
    if (target === 'STUDENTS') return {
      value: 'ALL' as const,
      label: 'Học sinh',
      badgeLabel: 'Học Sinh Lớp 11A3',
      icon: '🎓',
      desc: 'Toàn thể học sinh',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    };
    return TARGET_OPTIONS[0];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Kênh Thông Báo & Chỉ Đạo Lớp 11A3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Thông Báo Lớp Chủ Nhiệm (2026–2027)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            GVCN: <strong>Cô Võ Thị Thúy Hào</strong> • Phân loại đích đến chính xác: <strong>Toàn lớp</strong>, <strong>Ban cán sự (BCS)</strong> và <strong>Phụ huynh</strong>
          </p>
        </div>

        {currentUser.role === 'GVCN' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openCreateModal('ALL')}
              id="btn-create-announcement"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn Thông Báo Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* STATS QUICK TARGET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => setSelectedTargetFilter(selectedTargetFilter === 'ALL' ? 'ALL_FILTER' : 'ALL')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex items-center justify-between ${
            selectedTargetFilter === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <div className="text-xs font-bold">Đích đến: Toàn lớp</div>
              <div className={`text-[11px] ${selectedTargetFilter === 'ALL' ? 'text-blue-100' : 'text-slate-500'}`}>
                41 HS & Quý Phụ huynh
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black">{countAll}</span>
            <div className={`text-[10px] ${selectedTargetFilter === 'ALL' ? 'text-blue-100' : 'text-slate-400'}`}>bản tin</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedTargetFilter(selectedTargetFilter === 'BCS' ? 'ALL_FILTER' : 'BCS')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex items-center justify-between ${
            selectedTargetFilter === 'BCS'
              ? 'bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
              : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎖️</span>
            <div>
              <div className="text-xs font-bold">Đích đến: Ban cán sự (BCS)</div>
              <div className={`text-[11px] ${selectedTargetFilter === 'BCS' ? 'text-purple-100' : 'text-slate-500'}`}>
                Lớp trưởng, Phó, Bí thư, Tổ trưởng
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black">{countBCS}</span>
            <div className={`text-[10px] ${selectedTargetFilter === 'BCS' ? 'text-purple-100' : 'text-slate-400'}`}>chỉ đạo</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedTargetFilter(selectedTargetFilter === 'PARENTS' ? 'ALL_FILTER' : 'PARENTS')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer flex items-center justify-between ${
            selectedTargetFilter === 'PARENTS'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <div className="text-xs font-bold">Đích đến: Phụ huynh</div>
              <div className={`text-[11px] ${selectedTargetFilter === 'PARENTS' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Gia đình 41 học sinh Lớp 11A3
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black">{countParents}</span>
            <div className={`text-[10px] ${selectedTargetFilter === 'PARENTS' ? 'text-emerald-100' : 'text-slate-400'}`}>thông báo</div>
          </div>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung thông báo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedTargetFilter('ALL_FILTER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedTargetFilter === 'ALL_FILTER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({announcements.length})
          </button>
          <button
            onClick={() => setSelectedTargetFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedTargetFilter === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌐</span>
            <span>Toàn lớp ({countAll})</span>
          </button>
          <button
            onClick={() => setSelectedTargetFilter('BCS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedTargetFilter === 'BCS' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎖️</span>
            <span>BCS ({countBCS})</span>
          </button>
          <button
            onClick={() => setSelectedTargetFilter('PARENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedTargetFilter === 'PARENTS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍👩‍👧</span>
            <span>Phụ huynh ({countParents})</span>
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENTS LIST */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              📢
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy thông báo phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có thông báo nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
            {currentUser.role === 'GVCN' && (
              <button
                onClick={() => openCreateModal('ALL')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Soạn thông báo mới</span>
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map(ann => {
            const isReadByMe = ann.readBy.includes(currentUser.id);
            const targetInfo = getTargetInfo(ann.targetAudience);

            return (
              <div 
                key={ann.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs space-y-4 hover:shadow-md transition relative ${
                  ann.important ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header of the Card */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.important && (
                      <span className="text-[11px] font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>QUAN TRỌNG</span>
                      </span>
                    )}

                    {/* ĐÍCH ĐẾN BADGE */}
                    <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${targetInfo.badgeClass}`}>
                      <span>{targetInfo.icon}</span>
                      <span>Đích đến: {targetInfo.badgeLabel}</span>
                    </span>

                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {ann.category || 'THÔNG BÁO'}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ann.readBy.length} lượt đọc</span>
                    </span>
                    <span>• Người gửi: <strong className="text-slate-800">{ann.author}</strong></span>
                  </div>
                </div>

                {/* TIÊU ĐỀ THÔNG BÁO */}
                <div>
                  <h2 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                    {ann.title}
                  </h2>
                  
                  {/* NỘI DUNG THÔNG BÁO */}
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2.5 whitespace-pre-line bg-slate-50/80 p-4 rounded-2xl border border-slate-100 font-normal">
                    {ann.content}
                  </div>
                </div>

                {/* Attachments if any */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {ann.attachments.map((att, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-blue-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium border border-slate-200">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{att.name} ({att.size})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer: GVCN Actions & Reader Confirmations */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {currentUser.role === 'GVCN' && (
                      <>
                        <button
                          onClick={() => openEditModal(ann)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </button>
                        <button
                          onClick={() => toggleImportantAnnouncement(ann.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            ann.important 
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                          <span>{ann.important ? 'Bỏ ghim' : 'Ghim quan trọng'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa thông báo "${ann.title}"?`)) {
                              deleteAnnouncement(ann.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Read Receipt Action */}
                  <div>
                    {isReadByMe ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Đã xác nhận đã đọc thông báo</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => markAnnouncementAsRead(ann.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Bấm Xác Nhận Đã Đọc</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SOẠN / CHỈNH SỬA THÔNG BÁO MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{editingAnn ? 'Cập Nhật Thông Báo' : 'Soạn Thông Báo Lớp Mới'}</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingAnn ? 'Chỉnh Sửa Thông Báo' : 'Phát Hành Thông Báo Mới'}
                </h3>
                <p className="text-xs text-slate-500">Người phát hành: <strong>Cô Võ Thị Thúy Hào (GVCN Lớp 11A3)</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* 1. ĐÍCH ĐẾN (3 LỰA CHỌN: TOÀN LỚP, BCS, PHỤ HUYNH) */}
              <div>
                <label className="block font-black text-slate-800 text-xs sm:text-sm mb-1.5">
                  1. Đích đến (Đối tượng nhận thông báo) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {TARGET_OPTIONS.map(opt => {
                    const isSelected = targetAudience === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setTargetAudience(opt.value);
                          if (!category || category === 'THÔNG BÁO CHUNG' || category === 'BAN CÁN SỰ' || category === 'HỌP PHỤ HUYNH') {
                            setCategory(opt.value === 'BCS' ? 'BAN CÁN SỰ' : opt.value === 'PARENTS' ? 'HỌP PHỤ HUYNH' : 'THÔNG BÁO CHUNG');
                          }
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{opt.icon}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <div className="font-black text-xs text-slate-900">{opt.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MẪU SOẠN NHANH THEO ĐÍCH ĐẾN */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Mẫu soạn nhanh cho đích đến <strong>"{TARGET_OPTIONS.find(t => t.value === targetAudience)?.label}"</strong>:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Bấm để tự động điền</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATES[targetAudience].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer"
                    >
                      + {tmpl.title.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. TIÊU ĐỀ THÔNG BÁO */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black text-slate-800 text-xs sm:text-sm">
                    2. Tiêu đề thông báo *
                  </label>
                  <span className="text-[10px] text-slate-400">{title.length} ký tự</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder={
                    targetAudience === 'BCS'
                      ? 'Ví dụ: Triệu tập họp Ban Cán sự lớp 11A3 đầu giờ Thứ Sáu...'
                      : targetAudience === 'PARENTS'
                      ? 'Ví dụ: Kính mời Quý Phụ huynh dự Họp CMHS đầu năm học 2026-2027...'
                      : 'Ví dụ: Kế hoạch thi đua tuần mới & Nhắc nhở lịch học nghề Trung cấp...'
                  }
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 outline-hidden bg-slate-50/50"
                />
              </div>

              {/* 3. NỘI DUNG THÔNG BÁO */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black text-slate-800 text-xs sm:text-sm">
                    3. Nội dung thông báo *
                  </label>
                  <span className="text-[10px] text-slate-400">Hỗ trợ xuống dòng, gạch đầu dòng</span>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder="Nhập nội dung chi tiết thông báo..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50 leading-relaxed font-normal"
                />
              </div>

              {/* Phân loại & Tùy chọn ghim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại thể loại:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  >
                    <option value="THÔNG BÁO CHUNG">THÔNG BÁO CHUNG</option>
                    <option value="HỌP PHỤ HUYNH">HỌP PHỤ HUYNH</option>
                    <option value="BAN CÁN SỰ">BAN CÁN SỰ & CHỈ ĐẠO</option>
                    <option value="HỌC TẬP & NGHỀ">HỌC TẬP & NGHỀ TRUNG CẤP</option>
                    <option value="PHONG TRÀO">PHONG TRÀO & THI ĐUA</option>
                    <option value="KHẨN">THÔNG BÁO KHẨN</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-full">
                    <input
                      type="checkbox"
                      checked={important}
                      onChange={e => setImportant(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500"
                    />
                    <span className="font-bold text-slate-800 text-xs">Ghim thông báo quan trọng lên đầu</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingAnn ? 'Lưu Thay Đổi' : 'Phát Hành Thông Báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

