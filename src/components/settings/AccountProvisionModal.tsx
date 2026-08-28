import React, { useState, useMemo } from 'react';
import { 
  X, 
  KeyRound, 
  Download, 
  Printer, 
  RotateCcw, 
  Search, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Eye, 
  EyeOff, 
  Edit3, 
  Save, 
  Lock, 
  Sparkles,
  Copy,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportAccountListToExcel } from '../../utils/excelHelper';
import { Student } from '../../types';

interface AccountProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountProvisionModal: React.FC<AccountProvisionModalProps> = ({ isOpen, onClose }) => {
  const { 
    students, 
    teacherCredentials, 
    updateTeacherCredentials, 
    updateStudentCredentials, 
    batchResetPasswords, 
    batchGenerateStudentCodes 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'teacher' | 'print'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | 'ALL'>('ALL');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'CADRES' | 'MEMBERS'>('ALL');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Editing individual student state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    code: string;
    studentPassword: string;
    parentPassword: string;
  }>({ code: '', studentPassword: '', parentPassword: '' });

  // Teacher credentials form
  const [teacherUsername, setTeacherUsername] = useState(teacherCredentials.username);
  const [teacherPassword, setTeacherPassword] = useState(teacherCredentials.password);
  const [showTeacherPass, setShowTeacherPass] = useState(false);
  const [teacherSavedSuccess, setTeacherSavedSuccess] = useState(false);

  // Toast / notification message
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchQuery = 
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone && s.phone.includes(searchQuery)) ||
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTeam = selectedTeam === 'ALL' || s.teamId === selectedTeam;
      
      const isLeader = s.position && s.position !== 'THÀNH VIÊN';
      const matchRole = 
        selectedRole === 'ALL' ||
        (selectedRole === 'CADRES' && isLeader) ||
        (selectedRole === 'MEMBERS' && !isLeader);

      return matchQuery && matchTeam && matchRole;
    });
  }, [students, searchQuery, selectedTeam, selectedRole]);

  if (!isOpen) return null;

  const toggleShowPass = (id: string, type: 'hs' | 'ph') => {
    const key = `${id}_${type}`;
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditForm({
      code: student.code,
      studentPassword: student.studentPassword || '123456',
      parentPassword: student.parentPassword || '123456',
    });
  };

  const handleSaveStudent = (studentId: string) => {
    if (!editForm.code.trim()) {
      showToast('Mã học sinh không được để trống!', 'error');
      return;
    }
    updateStudentCredentials(
      studentId, 
      editForm.studentPassword.trim() || '123456', 
      editForm.parentPassword.trim() || '123456', 
      editForm.code.trim()
    );
    setEditingStudentId(null);
    showToast('Đã lưu thông tin tài khoản học sinh thành công!', 'success');
  };

  const handleBatchReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại TẤT CẢ mật khẩu của Học sinh và Phụ huynh về "123456"?')) {
      batchResetPasswords('123456', '123456');
      showToast('Đã đặt lại tất cả mật khẩu HS và PH về "123456"!', 'success');
    }
  };

  const handleBatchGenerateCodes = () => {
    if (window.confirm('Hệ thống sẽ tự động chuẩn hóa Mã học sinh thành 2411A801 -> 2411A841 theo danh sách lớp. Bạn có muốn tiếp tục?')) {
      batchGenerateStudentCodes('2411A8');
      showToast('Đã chuẩn hóa toàn bộ Mã học sinh theo định dạng 2411A8XX!', 'success');
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherUsername.trim() || !teacherPassword.trim()) {
      showToast('Tên đăng nhập và mật khẩu GVCN không được để trống!', 'error');
      return;
    }
    updateTeacherCredentials(teacherUsername.trim(), teacherPassword.trim());
    setTeacherSavedSuccess(true);
    showToast('Đã cập nhật thông tin tài khoản GVCN thành công!', 'success');
    setTimeout(() => setTeacherSavedSuccess(false), 3000);
  };

  const handleExportExcel = () => {
    exportAccountListToExcel(students, 'Danh_Sach_Cap_Tai_Khoan_Lop_11A3');
    showToast('Đã xuất file Excel Bảng Cấp Tài Khoản thành công!', 'success');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}: ${text}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">CÀI ĐẶT & CẤP TÀI KHOẢN LỚP 11A3</h2>
                <span className="bg-amber-800/60 text-amber-100 text-xs px-2.5 py-0.5 rounded-full font-medium border border-amber-400/30">
                  GVCN: Võ Thị Thúy Hào
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Dựa vào Mã Học Sinh (Mã HS) để cấp tài khoản đăng nhập cho Ban cán sự, Học sinh và Phụ huynh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-amber-100 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs Bar & Quick Actions */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-1 sm:space-x-2 bg-slate-200/80 dark:bg-slate-700/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Bảng Cấp Tài Khoản ({students.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'teacher'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tài Khoản GVCN (thuyhao)</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'print'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>In Thẻ & Phiếu Đăng Nhập</span>
            </button>
          </div>

          {/* Quick Excel Export & Batch Actions */}
          {activeTab === 'list' && (
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                onClick={handleBatchGenerateCodes}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition"
                title="Tự động chuẩn hóa mã 2411A801 -> 2411A841"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Chuẩn hóa</span> Mã HS
              </button>

              <button
                onClick={handleBatchReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 transition"
                title="Đặt lại tất cả mật khẩu HS và PH về 123456"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Mật khẩu (123456)</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel Bảng Cấp TK</span>
              </button>
            </div>
          )}
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className={`mx-6 mt-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between animate-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              : toastMsg.type === 'info'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Account List Table (Orange header matching requirements) */}
        {activeTab === 'list' && (
          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            {/* Search & Filter Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo Tên học sinh, Mã HS (2411A8XX), Tên phụ huynh..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedTeam}
                  onChange={e => setSelectedTeam(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ALL">Tất cả các Tổ (1 - 4)</option>
                  <option value={1}>Tổ 1</option>
                  <option value={2}>Tổ 2</option>
                  <option value={3}>Tổ 3</option>
                  <option value={4}>Tổ 4</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ALL">Tất cả chức vụ</option>
                  <option value="CADRES">Ban Cán Sự & Tổ Trưởng</option>
                  <option value="MEMBERS">Thành Viên</option>
                </select>
              </div>
            </div>

            {/* Note banner */}
            <div className="p-3 mb-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong>Nguyên tắc đăng nhập:</strong> Học sinh & Ban cán sự đăng nhập bằng <strong>Mã học sinh (MaHocSinh)</strong> và <strong>Mật khẩu HS (MatKhauHS)</strong>. Phụ huynh đăng nhập bằng <strong>Mã học sinh của con</strong> và <strong>Mật khẩu PH (MatKhauPH)</strong>.
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto border border-orange-200 dark:border-slate-700 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  {/* Distinctive Orange Header matching User image 2 */}
                  <tr className="bg-[#f97316] text-white font-bold tracking-wide uppercase text-xs sticky top-0 z-10 shadow-sm">
                    <th className="py-3 px-3 w-12 text-center border-r border-orange-400">STT</th>
                    <th className="py-3 px-4 min-w-[200px] border-r border-orange-400">Họ và Tên</th>
                    <th className="py-3 px-3 w-16 text-center border-r border-orange-400">Tổ</th>
                    <th className="py-3 px-3 min-w-[140px] border-r border-orange-400">Chức Vụ</th>
                    <th className="py-3 px-3 min-w-[130px] border-r border-orange-400">Mã Học Sinh</th>
                    <th className="py-3 px-3 min-w-[130px] border-r border-orange-400">Mật Khẩu HS</th>
                    <th className="py-3 px-3 min-w-[130px] border-r border-orange-400">Mật Khẩu PH</th>
                    <th className="py-3 px-3 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Không tìm thấy học sinh nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const isEditing = editingStudentId === student.id;
                      const isLeader = student.position && student.position !== 'THÀNH VIÊN';
                      const showHsPass = showPasswords[`${student.id}_hs`];
                      const showPhPass = showPasswords[`${student.id}_ph`];

                      return (
                        <tr 
                          key={student.id}
                          className={`hover:bg-orange-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                            isLeader ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                          }`}
                        >
                          {/* STT */}
                          <td className="py-2.5 px-3 text-center font-medium text-slate-500 dark:text-slate-400">
                            {idx + 1}
                          </td>

                          {/* HoTen */}
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={student.avatar}
                                alt={student.fullName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div>
                                <span>{student.fullName}</span>
                                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                  PH: {student.parentName} ({student.parentPhone})
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* To */}
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                              {student.teamId}
                            </span>
                          </td>

                          {/* ChucVu */}
                          <td className="py-2.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              student.position === 'LỚP TRƯỞNG' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
                                : student.position.includes('LỚP PHÓ')
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : student.position.includes('TỔ TRƯỞNG')
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {student.position}
                            </span>
                          </td>

                          {/* MaHocSinh */}
                          <td className="py-2.5 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.code}
                                onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                                className="w-full px-2 py-1 text-xs rounded border border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono font-bold bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                              />
                            ) : (
                              <div className="flex items-center space-x-1.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                                <span>{student.code}</span>
                                <button
                                  onClick={() => copyToClipboard(student.code, 'Mã HS')}
                                  title="Sao chép Mã HS"
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* MatKhauHS */}
                          <td className="py-2.5 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.studentPassword}
                                onChange={e => setEditForm(prev => ({ ...prev, studentPassword: e.target.value }))}
                                className="w-full px-2 py-1 text-xs rounded border border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                              />
                            ) : (
                              <div className="flex items-center space-x-1.5 font-mono text-slate-700 dark:text-slate-300">
                                <span>{showHsPass ? (student.studentPassword || '123456') : '••••••'}</span>
                                <button
                                  onClick={() => toggleShowPass(student.id, 'hs')}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title={showHsPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                  {showHsPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </td>

                          {/* MatKhauPH */}
                          <td className="py-2.5 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.parentPassword}
                                onChange={e => setEditForm(prev => ({ ...prev, parentPassword: e.target.value }))}
                                className="w-full px-2 py-1 text-xs rounded border border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                              />
                            ) : (
                              <div className="flex items-center space-x-1.5 font-mono text-slate-700 dark:text-slate-300">
                                <span>{showPhPass ? (student.parentPassword || '123456') : '••••••'}</span>
                                <button
                                  onClick={() => toggleShowPass(student.id, 'ph')}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title={showPhPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                  {showPhPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleSaveStudent(student.id)}
                                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                  title="Lưu thay đổi"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingStudentId(null)}
                                  className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                  title="Hủy"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleStartEdit(student)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition"
                                  title="Chỉnh sửa mã HS và mật khẩu"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    updateStudentCredentials(student.id, '123456', '123456');
                                    showToast(`Đã reset mật khẩu của ${student.fullName} về "123456"`, 'info');
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
                                  title="Reset mật khẩu em này về 123456"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom summary bar */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>
                Đang hiển thị <strong>{filteredStudents.length}</strong> / <strong>{students.length}</strong> học sinh
              </div>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                  <span>Mật khẩu mặc định: <strong>123456</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Đăng nhập 24/7 không cần internet</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GVCN Account Settings */}
        {activeTab === 'teacher' && (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Tài Khoản Giáo Viên Chủ Nhiệm (GVCN)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quản lý thông tin đăng nhập và quyền quản trị cao nhất của lớp 11A3
                  </p>
                </div>
              </div>

              {teacherSavedSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thông tin tài khoản GVCN thành công!</span>
                </div>
              )}

              <form onSubmit={handleSaveTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên đăng nhập GVCN:
                  </label>
                  <input
                    type="text"
                    value={teacherUsername}
                    onChange={e => setTeacherUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="thuyhao"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mặc định theo yêu cầu: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-orange-600">thuyhao</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu GVCN:
                  </label>
                  <div className="relative">
                    <input
                      type={showTeacherPass ? 'text' : 'password'}
                      value={teacherPassword}
                      onChange={e => setTeacherPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                      placeholder="thuyhao 88"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTeacherPass(!showTeacherPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showTeacherPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mặc định theo yêu cầu: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-orange-600">thuyhao 88</code> (hoặc <code className="font-mono">thuyhao88</code>)
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherUsername('thuyhao');
                      setTeacherPassword('thuyhao 88');
                      updateTeacherCredentials('thuyhao', 'thuyhao 88');
                      showToast('Đã khôi phục tài khoản GVCN về thuyhao / thuyhao 88', 'info');
                    }}
                    className="text-xs text-slate-500 hover:text-orange-600 underline font-medium"
                  >
                    Khôi phục mặc định (thuyhao / thuyhao 88)
                  </button>

                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Tài Khoản GVCN</span>
                  </button>
                </div>
              </form>

              {/* Roles summary */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Cơ chế cấp quyền & bảo mật của lớp 11A3:
                </h4>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>GVCN (Cô Thúy Hào):</strong> Toàn quyền quản lý, duyệt thi đua, sổ chủ nhiệm, thêm bớt học sinh và cấp tài khoản.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Ban cán sự & Tổ trưởng:</strong> Chấm thi đua tổ tuần, điểm danh, nộp báo cáo thi đua lên GVCN.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Học sinh & Phụ huynh:</strong> Xem bảng điểm thi đua cá nhân, xin nghỉ phép điện tử, nhận thông báo của GVCN.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Print Slip & Cards for Distribution */}
        {activeTab === 'print' && (
          <div className="p-6 flex-1 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4 no-print">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Phiếu Cấp Tài Khoản & Thẻ Đăng Nhập Cá Nhân (40 Học sinh)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Được thiết kế sẵn định dạng in để GVCN in ra khổ giấy A4, cắt và phát cho từng học sinh & phụ huynh
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Ngay (Print)</span>
              </button>
            </div>

            {/* Printable Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((s, idx) => (
                <div 
                  key={s.id}
                  className="p-4 rounded-xl border-2 border-dashed border-orange-300 dark:border-slate-700 bg-orange-50/30 dark:bg-slate-800/40 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="border-b border-orange-200 dark:border-slate-700 pb-2 mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                      TT GDNN-GDTX TX. An Nhơn • Lớp 11A3
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center justify-between">
                      <span>{idx + 1}. {s.fullName}</span>
                      <span className="text-[11px] font-semibold text-slate-500">Tổ {s.teamId}</span>
                    </div>
                    <div className="text-[11px] text-orange-600 dark:text-orange-300 font-medium">
                      Chức vụ: {s.position}
                    </div>
                  </div>

                  {/* Credentials Section */}
                  <div className="space-y-2 text-xs">
                    {/* Student Login */}
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-[11px] text-blue-700 dark:text-blue-400 flex items-center justify-between">
                        <span>🎓 TÀI KHOẢN HỌC SINH / CÁN SỰ:</span>
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[11px]">
                        <span>Tên đăng nhập (Mã HS):</span>
                        <strong className="text-orange-600">{s.code}</strong>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span>Mật khẩu HS:</span>
                        <strong>{s.studentPassword || '123456'}</strong>
                      </div>
                    </div>

                    {/* Parent Login */}
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                        <span>👪 TÀI KHOẢN PHỤ HUYNH ({s.parentName}):</span>
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[11px]">
                        <span>Tên đăng nhập (Mã HS con):</span>
                        <strong className="text-orange-600">{s.code}</strong>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span>Mật khẩu PH:</span>
                        <strong>{s.parentPassword || '123456'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-2.5 pt-2 border-t border-orange-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>GVCN: Võ Thị Thúy Hào</span>
                    <span>SĐT: 0932.556.039</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
