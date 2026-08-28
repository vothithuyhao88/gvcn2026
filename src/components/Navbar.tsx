import React, { useState } from 'react';
import { 
  Bell, 
  LogOut, 
  UserCheck, 
  CheckCircle2, 
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Cloud,
  RefreshCw,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import { ClassLogo } from './common/ClassLogo';
import { AvatarChangeModal } from './common/AvatarChangeModal';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  onOpenLoginModal: () => void;
  onOpenAiAssistant?: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab,
  activeTab, 
  onSelectTab,
  setActiveTab, 
  onOpenLoginModal,
  onOpenAiAssistant,
  mobileMenuOpen,
  onToggleMobileMenu
}) => {
  const currentActiveTab = currentTab || activeTab || 'dashboard';
  const handleSelect = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    if (setActiveTab) setActiveTab(tab);
    setInternalMobileOpen(false);
  };

  const { 
    currentUser, 
    loginAs, 
    updateUserAvatar, 
    students, 
    submissions, 
    leaveRequests, 
    announcements,
    isFirestoreLive,
    firebaseProjectId,
    syncAllToFirestoreNow
  } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const isMobileOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : internalMobileOpen;
  const toggleMobile = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalMobileOpen(!internalMobileOpen);
    }
  };

  // Calculate pending alerts for Reminder Center
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;
  const unreadAnnouncements = announcements.filter(a => !a.readBy.includes(currentUser.id)).length;
  const totalAlerts = (currentUser.role === 'GVCN' ? (pendingSubmissions + pendingLeaves) : 0) + unreadAnnouncements;

  const handleSwitchUser = (userId: string) => {
    loginAs(userId);
    setShowRoleMenu(false);
  };

  // User initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isGVCN = currentUser.role === 'GVCN';
  const isParent = currentUser.role === 'PARENT';
  const isBCS = currentUser.role === 'STUDENT' && !!currentUser.position && currentUser.position !== 'THÀNH VIÊN';
  const isStudentMember = currentUser.role === 'STUDENT' && (!currentUser.position || currentUser.position === 'THÀNH VIÊN');

  const getNavItems = () => {
    // 1. PHỤ HUYNH HỌC SINH (PHHS)
    if (isParent) {
      return [
        { id: 'dashboard', label: 'Trang chủ Phụ huynh', icon: '🏠', group: 'Sổ liên lạc' },
        { id: 'attendance', label: 'Điểm danh con', icon: '📅', group: 'Theo dõi con' },
        { id: 'emulation', label: 'Thi đua & Điểm rèn luyện', icon: '🏆', group: 'Theo dõi con' },
        { id: 'leaderboard', label: 'Bảng vinh danh lớp', icon: '📊', group: 'Theo dõi con' },
        { id: 'duty', label: 'Lịch trực nhật con', icon: '🧹', group: 'Theo dõi con' },
        { id: 'announcements', label: 'Thông báo từ GVCN', icon: '📢', group: 'Liên hệ', badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined },
        { id: 'connection', label: 'Gửi Đơn phép & Nhắn tin', icon: '💬', group: 'Liên hệ', badge: pendingLeaves > 0 ? `${pendingLeaves}` : undefined },
        { id: 'moments', label: 'Khoảnh khắc 11A3', icon: '📸', group: 'Khác' },
        { id: 'documents', label: 'Sổ tay & Lịch học', icon: '📁', group: 'Khác' },
      ];
    }

    // 2. HỌC SINH THÀNH VIÊN
    if (isStudentMember) {
      return [
        { id: 'dashboard', label: 'Trang chủ Học sinh', icon: '🏠', group: 'Tổng quan' },
        { id: 'emulation', label: 'Điểm thi đua cá nhân', icon: '🏆', group: 'Rèn luyện' },
        { id: 'leaderboard', label: 'Bảng vinh danh tuần', icon: '📊', group: 'Rèn luyện' },
        { id: 'attendance', label: 'Chuyên cần học tập', icon: '📅', group: 'Rèn luyện' },
        { id: 'duty', label: 'Lịch trực nhật tổ', icon: '🧹', group: 'Rèn luyện' },
        { id: 'announcements', label: 'Thông báo lớp', icon: '📢', group: 'Tương tác', badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined },
        { id: 'connection', label: 'Góc kết nối & Ý kiến', icon: '💬', group: 'Tương tác' },
        { id: 'moments', label: 'Khoảnh khắc 11A3', icon: '📸', group: 'Dữ liệu' },
        { id: 'documents', label: 'Tài liệu học tập & TKB', icon: '📁', group: 'Dữ liệu' },
      ];
    }

    // 3. BAN CÁN SỰ LỚP & TỔ TRƯỞNG (BCS)
    if (isBCS) {
      return [
        { id: 'dashboard', label: 'Trang chủ Ban Cán Sự', icon: '🏠', group: 'Tổng quan' },
        { id: 'team-scoring', label: 'Chấm điểm thi đua Tổ', icon: '⭐', group: 'Chấm điểm', badge: 'Chấm tổ' },
        { id: 'emulation', label: 'Bảng quy định thi đua', icon: '🏆', group: 'Chấm điểm' },
        { id: 'leaderboard', label: 'Bảng vinh danh 4 Tổ', icon: '📊', group: 'Chấm điểm' },
        { id: 'attendance', label: 'Theo dõi chuyên cần', icon: '📅', group: 'Nề nếp' },
        { id: 'duty', label: 'Lịch trực nhật & Phân công', icon: '🧹', group: 'Nề nếp' },
        { id: 'announcements', label: 'Thông báo & Chỉ đạo GVCN', icon: '📢', group: 'Tương tác', badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined },
        { id: 'connection', label: 'Góc kết nối & Trao đổi', icon: '💬', group: 'Tương tác' },
        { id: 'moments', label: 'Khoảnh khắc 11A3', icon: '📸', group: 'Dữ liệu' },
        { id: 'documents', label: 'Tài liệu & Lịch học', icon: '📁', group: 'Dữ liệu' },
      ];
    }

    // 4. GIÁO VIÊN CHỦ NHIỆM (GVCN)
    return [
      { id: 'dashboard', label: 'Trang chủ GVCN', icon: '🏠', group: 'Tổng quan' },
      { id: 'ai-assistant', label: 'Trợ lý AI Chủ nhiệm', icon: '✨', group: 'Tổng quan', badge: 'AI' },
      { id: 'students', label: 'Quản lý 41 Học sinh', icon: '👨‍🎓', group: 'Quản lý' },
      { id: 'parents', label: 'Quản lý Phụ huynh', icon: '👥', group: 'Quản lý' },
      { id: 'attendance', label: 'Điểm danh toàn lớp', icon: '📅', group: 'Quản lý' },
      { id: 'emulation', label: 'Thang điểm & Xếp loại', icon: '🏆', group: 'Thi đua' },
      { id: 'team-scoring', label: 'Duyệt điểm 4 Tổ', icon: '⭐', group: 'Thi đua', badge: pendingSubmissions > 0 ? `${pendingSubmissions} chờ` : undefined },
      { id: 'leaderboard', label: 'Bảng vinh danh tuần', icon: '📊', group: 'Thi đua' },
      { id: 'duty', label: 'Phân công trực nhật', icon: '🧹', group: 'Thi đua' },
      { id: 'announcements', label: 'Thông báo lớp', icon: '📢', group: 'Kết nối', badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : undefined },
      { id: 'connection', label: 'Góc kết nối & Đơn phép', icon: '💬', group: 'Kết nối', badge: pendingLeaves > 0 ? `${pendingLeaves} đơn` : undefined },
      { id: 'diary', label: 'Nhật ký chủ nhiệm', icon: '📖', group: 'Kết nối' },
      { id: 'moments', label: 'Khoảnh khắc 11A3', icon: '📸', group: 'Dữ liệu' },
      { id: 'documents', label: 'Tài liệu & Lịch học', icon: '📁', group: 'Dữ liệu' },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-blue-800 text-white shadow-lg border-b border-blue-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle + Class Branding */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Mở thanh menu dọc"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* 11A3 Circular Brand Logo */}
            <div 
              onClick={() => handleSelect('dashboard')}
              className="cursor-pointer group flex items-center shrink-0"
              title="Lớp 11A3 • Đoàn Kết & Chia Sẻ (Niên khóa 2025–2028)"
            >
              <ClassLogo size="md" withBorder={true} withGlow={true} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg lg:text-xl font-black leading-tight tracking-tight text-white flex items-center gap-2">
                <span>LỚP 11A3 • ĐOÀN KẾT & CHIA SẺ</span>
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 uppercase tracking-wider font-medium">
                Niên khóa 2025–2028 • GVCN Võ Thị Thúy Hào
              </p>
            </div>
          </div>

          {/* Right Controls: Firestore Cloud Indicator + Notification Bell + Current Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Firestore Cloud Live Status & Sync Button */}
            <div className="hidden md:flex items-center">
              <button
                id="btn-sync-firestore"
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    await syncAllToFirestoreNow();
                    setSyncSuccess(true);
                    setTimeout(() => setSyncSuccess(false), 3000);
                  } catch (e) {
                    console.error("Manual sync error:", e);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition border border-white/15 cursor-pointer shadow-xs"
                title={`Cơ sở dữ liệu Firebase: ${firebaseProjectId} • Dữ liệu tự động đồng bộ thời gian thực đa thiết bị. Bấm để đẩy toàn bộ dữ liệu lên Cloud.`}
              >
                <span className={`w-2 h-2 rounded-full ${isFirestoreLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <Cloud className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden lg:inline">{firebaseProjectId}</span>
                <RefreshCw className={`w-3 h-3 text-blue-200 ml-0.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {syncSuccess && <span className="text-emerald-300 font-bold text-[10px]">✓ Đã lưu Cloud</span>}
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Trung tâm thông báo & nhắc việc"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Menu Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span>Trung Tâm Nhắc Việc & Thông Báo</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{totalAlerts} việc</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 text-xs">
                    {currentUser.role === 'GVCN' && pendingSubmissions > 0 && (
                      <div 
                        onClick={() => { handleSelect('team-scoring'); setShowNotifMenu(false); }}
                        className="p-2.5 bg-orange-50 text-orange-800 rounded-lg border border-orange-100 flex items-center gap-2 hover:bg-orange-100 transition cursor-pointer my-1"
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold">Có {pendingSubmissions} bảng chấm thi đua chờ duyệt</p>
                          <p className="text-[11px] text-orange-700">Tổ trưởng đã gửi kết quả tuần. Nhấn để duyệt.</p>
                        </div>
                      </div>
                    )}

                    {currentUser.role === 'GVCN' && pendingLeaves > 0 && (
                      <div 
                        onClick={() => { handleSelect('connection'); setShowNotifMenu(false); }}
                        className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-2 hover:bg-red-100 transition cursor-pointer my-1"
                      >
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold">Có {pendingLeaves} đơn xin nghỉ phép chờ xử lý</p>
                          <p className="text-[11px] text-red-600">Phụ huynh/học sinh gửi đơn. Nhấn để xem.</p>
                        </div>
                      </div>
                    )}

                    {unreadAnnouncements > 0 && (
                      <div 
                        onClick={() => { handleSelect('announcements'); setShowNotifMenu(false); }}
                        className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition cursor-pointer my-1"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold">Có {unreadAnnouncements} thông báo mới của lớp</p>
                          <p className="text-[11px] text-blue-600">Kế hoạch học tập & hoạt động phong trào.</p>
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 flex items-center gap-2 my-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold">Lịch trực nhật hôm nay</p>
                        <p className="text-[11px] text-slate-500">Tổ được phân công trực nhật lớp và tắt thiết bị điện.</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 pt-2 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Đóng thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Current Role Display & Quick Switch */}
            <div className="relative">
              <button
                id="btn-profile-role-switcher"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-3 text-left hover:bg-white/10 p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition cursor-pointer group"
                title="Bấm để xem hồ sơ, đổi ảnh đại diện hoặc chuyển đổi quyền"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-tight">
                    {isGVCN ? '👑 Quyền GVCN' : isBCS ? '⭐ Ban Cán Sự' : isParent ? '👪 Phụ Huynh' : '🎓 Học Sinh'}
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-white flex items-center gap-1">
                    <span className="truncate max-w-[140px]">
                      {isGVCN ? 'Cô Thúy Hào' : currentUser.fullName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-200 group-hover:translate-y-0.5 transition-transform" />
                  </p>
                </div>

                <div className="relative">
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.fullName}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 shadow-sm shrink-0 bg-white ${
                        isGVCN ? 'border-amber-300 ring-2 ring-amber-400/40' : isBCS ? 'border-indigo-300 ring-2 ring-indigo-400/40' : isParent ? 'border-emerald-300 ring-2 ring-emerald-400/40' : 'border-sky-300 ring-2 ring-sky-400/40'
                      }`}
                    />
                  ) : (
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm shrink-0 ${
                      isGVCN ? 'bg-amber-100 text-amber-900' : isBCS ? 'bg-indigo-100 text-indigo-900' : isParent ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {isGVCN ? 'TH' : getInitials(currentUser.fullName)}
                    </div>
                  )}
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRoleMenu(false);
                      setIsAvatarModalOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-slate-950 p-1 rounded-full shadow-md border border-white cursor-pointer transition transform group-hover:scale-110"
                    title="Đổi ảnh đại diện của tôi"
                  >
                    <Camera className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>

              {/* Fast User Switch Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản đang đăng nhập:</div>
                    <div className="font-bold text-slate-900 text-sm mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={currentUser.avatar || ''}
                          alt={currentUser.fullName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-900">{currentUser.fullName}</div>
                          <div className="text-xs text-slate-500 truncate">
                            {isGVCN ? '👑 Toàn quyền quản trị lớp 11A3' : currentUser.position || 'Phụ huynh học sinh'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                        isGVCN ? 'bg-blue-100 text-blue-800' : isBCS ? 'bg-indigo-100 text-indigo-800' : isParent ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {isGVCN ? 'GVCN' : isBCS ? 'BCS' : isParent ? 'PHHS' : 'Học Sinh'}
                      </span>
                    </div>

                    {/* Prominent Change Avatar Button */}
                    <div className="mt-3">
                      <button
                        type="button"
                        id="btn-change-my-avatar"
                        onClick={() => {
                          setShowRoleMenu(false);
                          setIsAvatarModalOpen(true);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Đổi Ảnh Đại Diện Của Tôi</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ⚡ Chuyển đổi nhanh 4 nhóm quyền (Demo):
                  </div>

                  <div className="max-h-72 overflow-y-auto px-2 space-y-3 divide-y divide-slate-100">
                    {/* 1. GVCN */}
                    <div className="pt-1">
                      <div className="text-[10px] font-bold text-blue-700 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                        <span>👑 1. Giáo Viên Chủ Nhiệm</span>
                      </div>
                      {DEMO_USERS.filter(u => u.role === 'GVCN').map(u => {
                        const avatarToUse = u.id === currentUser.id ? currentUser.avatar : u.avatar;
                        return (
                          <button
                            key={u.id}
                            onClick={() => handleSwitchUser(u.id)}
                            className={`w-full mt-1 flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                              u.id === currentUser.id ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={avatarToUse} alt={u.fullName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-300" />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{u.fullName}</div>
                                <div className="text-[10px] text-blue-600">GVCN lớp 11A3 (Toàn quyền)</div>
                              </div>
                            </div>
                            {u.id === currentUser.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* 2. Ban Cán Sự & Tổ Trưởng */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-indigo-700 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                        <span>⭐ 2. Ban Cán Sự & Tổ Trưởng</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {DEMO_USERS.filter(u => u.role === 'STUDENT' && u.position && u.position !== 'THÀNH VIÊN').map(u => {
                          const linkedStudent = students.find(s => s.id === u.studentId);
                          const avatarToUse = linkedStudent?.avatar || (u.id === currentUser.id ? currentUser.avatar : u.avatar);
                          return (
                            <button
                              key={u.id}
                              onClick={() => handleSwitchUser(u.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                u.id === currentUser.id ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={avatarToUse} alt={u.fullName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-200" />
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{u.fullName}</div>
                                  <div className="text-[10px] text-indigo-600 font-semibold">{u.position} • Tổ {u.teamId}</div>
                                </div>
                              </div>
                              {u.id === currentUser.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Học sinh thành viên */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-sky-700 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                        <span>🎓 3. Học Sinh Thành Viên</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {DEMO_USERS.filter(u => u.role === 'STUDENT' && (!u.position || u.position === 'THÀNH VIÊN')).map(u => {
                          const linkedStudent = students.find(s => s.id === u.studentId);
                          const avatarToUse = linkedStudent?.avatar || (u.id === currentUser.id ? currentUser.avatar : u.avatar);
                          return (
                            <button
                              key={u.id}
                              onClick={() => handleSwitchUser(u.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                u.id === currentUser.id ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={avatarToUse} alt={u.fullName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-sky-200" />
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{u.fullName}</div>
                                  <div className="text-[10px] text-slate-500">Học sinh • Tổ {u.teamId}</div>
                                </div>
                              </div>
                              {u.id === currentUser.id && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Phụ huynh */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                        <span>👪 4. Phụ Huynh Học Sinh</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {DEMO_USERS.filter(u => u.role === 'PARENT').map(u => {
                          const avatarToUse = u.id === currentUser.id ? currentUser.avatar : u.avatar;
                          return (
                            <button
                              key={u.id}
                              onClick={() => handleSwitchUser(u.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                u.id === currentUser.id ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={avatarToUse} alt={u.fullName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-200" />
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{u.fullName}</div>
                                  <div className="text-[10px] text-emerald-600">Phụ huynh học sinh</div>
                                </div>
                              </div>
                              {u.id === currentUser.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="px-3 pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => { setShowRoleMenu(false); onOpenLoginModal(); }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Chọn quyền khác...</span>
                    </button>
                    <button
                      onClick={() => { setShowRoleMenu(false); onOpenLoginModal(); }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer py-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đổi tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu (Vertical) */}
      {isMobileOpen && (
        <div className="lg:hidden border-t border-blue-700 bg-white px-4 py-4 shadow-xl text-slate-900 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-3 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 font-bold text-xs uppercase tracking-widest flex items-center justify-between">
            <span>Thanh Menu Dọc</span>
            <button onClick={toggleMobile} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {navItems.map(item => {
              const isActive = currentActiveTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`p-3 rounded-xl text-left text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Avatar Change Modal */}
      <AvatarChangeModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar || ''}
        userName={currentUser.fullName}
        userRoleTitle={isGVCN ? 'Giáo Viên Chủ Nhiệm' : isBCS ? (currentUser.position || 'Ban Cán Sự') : isParent ? 'Phụ Huynh Học Sinh' : 'Học Sinh Lớp 11A3'}
        userGender={currentUser.fullName.includes('Thị') || currentUser.fullName.includes('Mai') || currentUser.fullName.includes('Nguyễn Thị') || currentUser.fullName.includes('Hào') ? 'Nữ' : 'Nam'}
        userRole={currentUser.role}
        onSaveAvatar={(newAvatarUrl) => {
          updateUserAvatar(newAvatarUrl, currentUser.id, currentUser.studentId);
        }}
      />
    </header>
  );
};
