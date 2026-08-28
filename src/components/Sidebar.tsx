import React from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Award, 
  Star, 
  BarChart3, 
  BookOpen, 
  Megaphone, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  Camera, 
  FolderOpen,
  UserCog,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  FileCheck2,
  ListTodo,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLogo } from './common/ClassLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavGroup {
  groupTitle?: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, students, submissions, leaveRequests, announcements } = useApp();

  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;
  const unreadAnnouncements = announcements.filter(a => !a.readBy.includes(currentUser.id)).length;

  const linkedStudent = currentUser.role === 'PARENT' 
    ? students.find(s => s.id === currentUser.studentId)
    : undefined;

  const isGVCN = currentUser.role === 'GVCN';
  const isParent = currentUser.role === 'PARENT';
  const isBCS = currentUser.role === 'STUDENT' && !!currentUser.position && currentUser.position !== 'THÀNH VIÊN';
  const isStudentMember = currentUser.role === 'STUDENT' && (!currentUser.position || currentUser.position === 'THÀNH VIÊN');

  // Build role-tailored navigation groups
  const getNavGroups = (): NavGroup[] => {
    // 1. PHỤ HUYNH HỌC SINH (PHHS)
    if (isParent) {
      return [
        {
          groupTitle: 'SỔ LIÊN LẠC ĐIỆN TỬ',
          items: [
            { id: 'dashboard', label: 'Trang chủ Phụ huynh', icon: Home },
          ]
        },
        {
          groupTitle: 'THEO DÕI CON',
          items: [
            { id: 'attendance', label: 'Điểm danh & Chuyên cần', icon: CalendarCheck },
            { id: 'emulation', label: 'Thi đua & Điểm rèn luyện', icon: Award },
            { id: 'leaderboard', label: 'Bảng vinh danh lớp', icon: BarChart3 },
            { id: 'duty', label: 'Lịch trực nhật của con', icon: Calendar },
          ]
        },
        {
          groupTitle: 'TƯƠNG TÁC & THÔNG BÁO',
          items: [
            { 
              id: 'announcements', 
              label: 'Thông báo từ GVCN', 
              icon: Megaphone, 
              badge: unreadAnnouncements > 0 ? `${unreadAnnouncements} mới` : undefined, 
              badgeColor: 'bg-blue-500 text-white' 
            },
            { 
              id: 'connection', 
              label: 'Gửi Đơn phép & Nhắn tin', 
              icon: MessageSquare, 
              badge: pendingLeaves > 0 ? `${pendingLeaves} đơn` : undefined, 
              badgeColor: 'bg-amber-500 text-white' 
            },
            { id: 'moments', label: 'Khoảnh khắc 11A3', icon: Camera },
            { id: 'documents', label: 'Sổ tay & Lịch học', icon: FolderOpen },
          ]
        }
      ];
    }

    // 2. HỌC SINH THÀNH VIÊN (HỌC SINH)
    if (isStudentMember) {
      return [
        {
          groupTitle: 'TỔNG QUAN',
          items: [
            { id: 'dashboard', label: 'Trang chủ Học sinh', icon: Home },
          ]
        },
        {
          groupTitle: 'RÈN LUYỆN & HỌC TẬP',
          items: [
            { id: 'emulation', label: 'Điểm thi đua cá nhân', icon: Award },
            { id: 'leaderboard', label: 'Bảng vinh danh tuần', icon: BarChart3 },
            { id: 'attendance', label: 'Chuyên cần học tập', icon: CalendarCheck },
            { id: 'duty', label: 'Lịch trực nhật tổ', icon: Calendar },
          ]
        },
        {
          groupTitle: 'KẾT NỐI & TÀI LIỆU',
          items: [
            { 
              id: 'announcements', 
              label: 'Thông báo lớp 11A3', 
              icon: Megaphone, 
              badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined, 
              badgeColor: 'bg-blue-500 text-white' 
            },
            { id: 'connection', label: 'Góc kết nối & Ý kiến', icon: MessageSquare },
            { id: 'moments', label: 'Khoảnh khắc kỷ niệm', icon: Camera },
            { id: 'documents', label: 'Tài liệu học tập & TKB', icon: FolderOpen },
          ]
        }
      ];
    }

    // 3. BAN CÁN SỰ LỚP & TỔ TRƯỞNG (BCS)
    if (isBCS) {
      return [
        {
          groupTitle: 'TỔNG QUAN CÁN SỰ',
          items: [
            { id: 'dashboard', label: 'Trang chủ Ban Cán Sự', icon: Home },
          ]
        },
        {
          groupTitle: 'CHẤM ĐIỂM & NỀ NẾP TỔ',
          items: [
            { 
              id: 'team-scoring', 
              label: 'Chấm điểm thi đua Tổ', 
              icon: Star,
              badge: 'Chấm tổ',
              badgeColor: 'bg-indigo-600 text-white'
            },
            { id: 'emulation', label: 'Bảng quy định thi đua', icon: Award },
            { id: 'leaderboard', label: 'Bảng vinh danh 4 Tổ', icon: BarChart3 },
            { id: 'attendance', label: 'Theo dõi chuyên cần', icon: CalendarCheck },
            { id: 'duty', label: 'Lịch trực nhật & Phân công', icon: Calendar },
          ]
        },
        {
          groupTitle: 'TƯƠNG TÁC & HOẠT ĐỘNG',
          items: [
            { 
              id: 'announcements', 
              label: 'Thông báo & Chỉ đạo GVCN', 
              icon: Megaphone, 
              badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined, 
              badgeColor: 'bg-blue-500 text-white' 
            },
            { id: 'connection', label: 'Góc kết nối & Trao đổi', icon: MessageSquare },
            { id: 'moments', label: 'Khoảnh khắc 11A3', icon: Camera },
            { id: 'documents', label: 'Tài liệu & Lịch học', icon: FolderOpen },
          ]
        }
      ];
    }

    // 4. GIÁO VIÊN CHỦ NHIỆM (GVCN) - Toàn quyền quản trị
    return [
      {
        groupTitle: 'TỔNG QUAN & TRỢ LÝ AI',
        items: [
          { id: 'dashboard', label: 'Trang chủ GVCN', icon: Home },
          { id: 'ai-assistant', label: 'Trợ lý AI Chủ nhiệm', icon: Sparkles, badge: 'AI Pro', badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' },
        ]
      },
      {
        groupTitle: 'QUẢN LÝ NHÂN SỰ',
        items: [
          { id: 'students', label: 'Quản lý 41 Học sinh', icon: Users },
          { id: 'account-settings', label: 'Cấp tài khoản (Mã HS)', icon: KeyRound, badge: 'Cài đặt', badgeColor: 'bg-amber-500 text-white' },
          { id: 'parents', label: 'Quản lý Phụ huynh', icon: UserCog },
          { id: 'attendance', label: 'Điểm danh toàn lớp', icon: CalendarCheck },
        ]
      },
      {
        groupTitle: 'NỀ NẾP & THI ĐUA',
        items: [
          { id: 'emulation', label: 'Thang điểm & Xếp loại', icon: Award },
          { 
            id: 'team-scoring', 
            label: 'Duyệt điểm 4 Tổ', 
            icon: Star, 
            badge: pendingSubmissions > 0 ? `${pendingSubmissions} chờ duyệt` : undefined,
            badgeColor: 'bg-amber-500 text-white animate-pulse'
          },
          { id: 'leaderboard', label: 'Bảng vinh danh tuần', icon: BarChart3 },
          { id: 'duty', label: 'Phân công trực nhật', icon: Calendar },
        ]
      },
      {
        groupTitle: 'KẾT NỐI & DỮ LIỆU',
        items: [
          { 
            id: 'announcements', 
            label: 'Thông báo lớp', 
            icon: Megaphone,
            badge: unreadAnnouncements > 0 ? unreadAnnouncements : undefined,
            badgeColor: 'bg-blue-500 text-white'
          },
          { 
            id: 'connection', 
            label: 'Góc kết nối & Đơn phép', 
            icon: MessageSquare,
            badge: pendingLeaves > 0 ? `${pendingLeaves} đơn` : undefined,
            badgeColor: 'bg-rose-500 text-white'
          },
          { id: 'diary', label: 'Nhật ký chủ nhiệm', icon: BookOpen },
          { id: 'moments', label: 'Khoảnh khắc 11A3', icon: Camera },
          { id: 'documents', label: 'Tài liệu & Lịch học', icon: FolderOpen },
        ]
      }
    ];
  };

  const navGroups = getNavGroups();

  return (
    <aside 
      id="sidebar-navigation-vertical"
      className="w-64 bg-white border-r border-slate-200 p-3.5 flex flex-col gap-3 shrink-0 shadow-xs sticky top-[69px] h-[calc(100vh-69px)] overflow-y-auto"
    >
      {/* Current User Role Identity Badge */}
      <div className={`p-3 rounded-2xl border text-xs ${
        isGVCN 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'
          : isBCS
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950'
          : isParent
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
          : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 text-sky-950'
      }`}>
        <div className="flex items-center gap-2">
          {isGVCN && <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />}
          {isBCS && <Star className="w-4 h-4 text-indigo-600 shrink-0 fill-indigo-500" />}
          {isParent && <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />}
          {isStudentMember && <GraduationCap className="w-4 h-4 text-sky-600 shrink-0" />}

          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-[11px] uppercase tracking-wider block truncate">
              {isGVCN ? 'GVCN Võ Thị Thúy Hào' 
                : isBCS ? `BCS: ${currentUser.position}` 
                : isParent ? 'Phụ Huynh Học Sinh' 
                : 'Học Sinh Lớp 11A3'}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-medium">
              {isGVCN ? 'Toàn quyền quản trị lớp' 
                : isBCS ? `${currentUser.fullName} • Tổ ${currentUser.teamId}`
                : isParent ? `PH em: ${linkedStudent?.fullName || 'Huỳnh Gia Huy'}`
                : `${currentUser.fullName} • Tổ ${currentUser.teamId || 1}`}
            </span>
          </div>
        </div>
      </div>

      {/* Role Tailored Navigation Groups */}
      <div className="flex flex-col gap-4 py-1">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.groupTitle && (
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.groupTitle}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                      isActive
                        ? isGVCN 
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                          : isBCS
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                          : isParent
                          ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || (isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700')}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Info Card */}
      <div className="mt-auto pt-3">
        <div className="p-3 bg-gradient-to-br from-amber-50/80 via-slate-50 to-blue-50/60 rounded-2xl border border-amber-200/70 shadow-xs text-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <ClassLogo size="sm" withBorder={true} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 text-xs leading-tight">
                Trung tâm GDNN-GDTX An Nhơn
              </p>
              <p className="text-[11px] text-blue-800 font-semibold mt-0.5 leading-snug">
                website thuộc bản quyền cô Thuý Hào
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-center text-[11px]">
            <a 
              href="tel:0932556039" 
              className="w-full text-center font-mono font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 py-1 px-2.5 rounded-lg border border-amber-300/60 transition shadow-2xs"
              title="Gọi Cô Thúy Hào: 093 2556 039"
            >
              sđt: 093 2556 039
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
