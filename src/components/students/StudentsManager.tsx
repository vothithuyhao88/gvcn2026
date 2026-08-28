import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Phone, 
  MapPin, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  GraduationCap, 
  HeartHandshake,
  ChevronRight,
  Sparkles,
  Save,
  Calendar,
  User,
  Shield,
  Briefcase,
  Copy,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  FileSpreadsheet,
  Download,
  Upload,
  FileDown,
  ChevronDown,
  Trash2,
  Check,
  Camera,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, StudentPosition } from '../../types';
import { getEmulationRank, EMULATION_RANK_LEGEND } from '../../utils/emulation';
import { downloadStudentExcelTemplate, exportStudentsToExcel, ParsedStudentRow } from '../../utils/excelHelper';
import { ExcelImportModal } from './ExcelImportModal';
import { AvatarChangeModal } from '../common/AvatarChangeModal';
import { AccountProvisionModal } from '../settings/AccountProvisionModal';

// Predefined avatar selections for convenient profile photo picking
const SAMPLE_AVATARS = {
  Nam: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  ],
  Nữ: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  ]
};

const VOCATIONAL_OPTIONS = [
  { value: 'Hàn', label: 'Nam (Hàn)', fullLabel: 'Hàn (Dành cho Nam)', icon: '⚡', targetGender: 'Nam', desc: 'Kỹ thuật Hàn cơ khí' },
  { value: 'Kế toán', label: 'Nữ (Kế toán)', fullLabel: 'Kế toán (Dành cho Nữ)', icon: '📊', targetGender: 'Nữ', desc: 'Kế toán doanh nghiệp' },
];

const POSITIONS: StudentPosition[] = [
  'THÀNH VIÊN',
  'LỚP TRƯỞNG',
  'LỚP PHÓ HỌC TẬP',
  'LỚP PHÓ LAO ĐỘNG - NỀ NẾP',
  'TỔ TRƯỞNG TỔ 1',
  'TỔ TRƯỞNG TỔ 2',
  'TỔ TRƯỞNG TỔ 3',
  'TỔ TRƯỞNG TỔ 4',
];

export const StudentsManager: React.FC = () => {
  const { 
    students, 
    updateStudent, 
    addStudent, 
    deleteStudent, 
    batchImportStudents, 
    currentUser, 
    directScoreAdjustment,
    updateUserAvatar
  } = useApp();
  const isGVCN = currentUser.role === 'GVCN';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | 'ALL'>('ALL');
  const [selectedVocational, setSelectedVocational] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'Nam' | 'Nữ'>('ALL');
  const [filterAttentionOnly, setFilterAttentionOnly] = useState(false);
  
  // Selected student for Profile View / Edit / Score / Avatar
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [adjustScoreStudent, setAdjustScoreStudent] = useState<Student | null>(null);
  const [avatarChangeTargetStudent, setAvatarChangeTargetStudent] = useState<Student | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Excel import handler
  const handleBatchImportComplete = (importedRows: ParsedStudentRow[], mode: 'append' | 'replace') => {
    batchImportStudents(importedRows, mode);
    showToast(`Đã nhập thành công ${importedRows.length} học sinh vào hệ thống Lớp 11A3!`);
  };

  // Excel export handlers
  const handleExportAll = () => {
    exportStudentsToExcel(students, 'Danh_Sach_Hoc_Sinh_Lop_11A3_Tat_Ca');
    showToast(`Đã xuất file Excel ${students.length} học sinh thành công!`);
  };

  const handleExportFiltered = () => {
    exportStudentsToExcel(filteredStudents, 'Danh_Sach_Hoc_Sinh_Lop_11A3_Bo_Loc');
    showToast(`Đã xuất file Excel ${filteredStudents.length} học sinh theo bộ lọc!`);
  };
  
  // Quick score adjustment form state
  const [adjustPoints, setAdjustPoints] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Add student form state
  const [newStudentData, setNewStudentData] = useState<Omit<Student, 'id' | 'currentScore' | 'baseScore'>>({
    fullName: '',
    code: `11A3-${String(students.length + 1).padStart(2, '0')}`,
    gender: 'Nam',
    dob: '2009-01-01',
    teamId: 1,
    position: 'THÀNH VIÊN',
    vocationalCourse: 'Hàn',
    phone: '',
    parentName: '',
    parentPhone: '',
    parentRelationship: 'Bố',
    address: 'TX. An Nhơn, Tỉnh Bình Định',
    notes: '',
    avatar: SAMPLE_AVATARS.Nam[0],
    attentionFlag: false,
  });

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = selectedTeam === 'ALL' || s.teamId === selectedTeam;
    const matchesVocational = selectedVocational === 'ALL' || s.vocationalCourse.toLowerCase().includes(selectedVocational.toLowerCase());
    const matchesGender = selectedGender === 'ALL' || s.gender === selectedGender;
    const matchesAttention = !filterAttentionOnly || s.attentionFlag || s.currentScore < 85;

    return matchesSearch && matchesTeam && matchesVocational && matchesGender && matchesAttention;
  });

  // Handle Save Edit Student
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editingStudent.fullName.trim()) {
      alert('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    updateStudent(editingStudent);
    
    // If we're also viewing this student, update viewing state
    if (viewingStudent && viewingStudent.id === editingStudent.id) {
      setViewingStudent(editingStudent);
    }
    
    setEditingStudent(null);
    showToast(`Đã lưu thành công hồ sơ học sinh: ${editingStudent.fullName}`);
  };

  // Handle Create New Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    addStudent(newStudentData);
    setIsAddModalOpen(false);
    showToast(`Đã thêm mới học sinh: ${newStudentData.fullName} vào danh sách Lớp 11A3`);
    
    // Reset add form
    const nextNum = students.length + 2;
    setNewStudentData({
      fullName: '',
      code: `11A3-${String(nextNum).padStart(2, '0')}`,
      gender: 'Nam',
      dob: '2009-01-01',
      teamId: 1,
      position: 'THÀNH VIÊN',
      vocationalCourse: 'Hàn',
      phone: '',
      parentName: '',
      parentPhone: '',
      parentRelationship: 'Bố',
      address: 'TX. An Nhơn, Tỉnh Bình Định',
      notes: '',
      avatar: SAMPLE_AVATARS.Nam[0],
      attentionFlag: false,
    });
  };

  // Handle Score Adjustment
  const handleApplyScoreAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustScoreStudent || !adjustReason.trim()) return;
    
    directScoreAdjustment(
      adjustScoreStudent.id, 
      adjustPoints, 
      adjustReason, 
      adjustPoints > 0 ? 'GVCN khen thưởng trực tiếp' : 'GVCN nhắc nhở trừ điểm'
    );
    
    // Update local modal view if open
    if (viewingStudent && viewingStudent.id === adjustScoreStudent.id) {
      setViewingStudent({
        ...viewingStudent,
        currentScore: Math.max(0, viewingStudent.currentScore + adjustPoints),
      });
    }

    showToast(`Đã ${adjustPoints > 0 ? 'cộng' : 'trừ'} ${Math.abs(adjustPoints)} điểm cho học sinh ${adjustScoreStudent.fullName}`);
    setAdjustScoreStudent(null);
    setAdjustReason('');
  };

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}: ${text}`);
  };

  const maleCount = students.filter(s => s.gender === 'Nam').length;
  const femaleCount = students.filter(s => s.gender === 'Nữ').length;
  const attentionCount = students.filter(s => s.attentionFlag || s.currentScore < 85).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Hồ Sơ & Danh Sách Học Sinh • Lớp 11A3 (2026–2027)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 flex-wrap">
            <span>Quản Lý {students.length} Học Sinh</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {filteredStudents.length} / {students.length} đang hiển thị
            </span>
            {isGVCN && (
              <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Toàn quyền chỉnh sửa hồ sơ & Phụ huynh</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý chi tiết: Họ tên, Ngày sinh, SĐT, Địa chỉ cư trú, Thông tin Phụ huynh (Họ tên cha/mẹ, SĐT, Địa chỉ) và Chuyên ngành đào tạo Trung cấp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nút Cài đặt & Cấp tài khoản cho BCS & Học sinh (Chỉ GVCN) */}
          {isGVCN && (
            <button
              onClick={() => setIsAccountModalOpen(true)}
              id="btn-open-account-provision"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer border border-amber-400/30"
              title="Cài đặt và cấp tài khoản đăng nhập cho Ban cán sự, Học sinh và Phụ huynh dựa vào Mã HS"
            >
              <KeyRound className="w-4 h-4" />
              <span>Cài Đặt Cấp Tài Khoản (Mã HS)</span>
            </button>
          )}

          {/* 1. Nút Tải file mẫu Excel */}
          <button
            onClick={downloadStudentExcelTemplate}
            id="btn-download-template"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-slate-200 shadow-2xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Tải file Excel mẫu chuẩn 11A3 về máy"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Tải</span> <span>File Mẫu Excel</span>
          </button>

          {/* 2. Nút Nhập từ file mẫu Excel (Chỉ GVCN) */}
          {isGVCN && (
            <button
              onClick={() => setIsExcelImportModalOpen(true)}
              id="btn-import-excel"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Nhập danh sách học sinh theo file mẫu Excel sẵn có"
            >
              <Upload className="w-4 h-4" />
              <span>Nhập Excel</span>
            </button>
          )}

          {/* 3. Nút Thêm học sinh mới (Chỉ GVCN) */}
          {isGVCN && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              id="btn-add-student"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Thêm thủ công một học sinh mới vào lớp"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm Mới</span>
            </button>
          )}

          {/* 4. Nút Xuất DL Excel */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              id="btn-export-excel"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Xuất dữ liệu học sinh lớp 11A3 ra file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất DL Excel</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isExportDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-40 text-xs animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsExportDropdownOpen(false)}
              >
                <div className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Tùy Chọn Xuất File Excel (.xlsx)
                </div>
                <button
                  onClick={() => { handleExportAll(); setIsExportDropdownOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between text-slate-800 font-bold transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Xuất tất cả ({students.length} học sinh)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">.xlsx</span>
                </button>

                {filteredStudents.length !== students.length && (
                  <button
                    onClick={() => { handleExportFiltered(); setIsExportDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between text-slate-800 font-bold transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      <span>Xuất đang lọc ({filteredStudents.length} học sinh)</span>
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">.xlsx</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 my-1"></div>

                <button
                  onClick={() => { downloadStudentExcelTemplate(); setIsExportDropdownOpen(false); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Tải File Mẫu Excel Chuẩn</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-sm">
            👥
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Sĩ số Lớp 11A3</div>
            <div className="text-lg font-black text-slate-900">{students.length} học sinh</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm">
            👫
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Cơ cấu giới tính</div>
            <div className="text-xs font-bold text-slate-800">
              <span className="text-blue-700">{maleCount} Nam</span> • <span className="text-rose-600">{femaleCount} Nữ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
            🏫
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Phân bổ 4 Tổ</div>
            <div className="text-xs font-bold text-slate-800">
              T1: {students.filter(s=>s.teamId===1).length} • T2: {students.filter(s=>s.teamId===2).length} • T3: {students.filter(s=>s.teamId===3).length} • T4: {students.filter(s=>s.teamId===4).length}
            </div>
          </div>
        </div>

        <div 
          onClick={() => setFilterAttentionOnly(!filterAttentionOnly)}
          className={`rounded-2xl border p-3.5 shadow-xs flex items-center gap-3 cursor-pointer transition ${
            filterAttentionOnly 
              ? 'bg-amber-500 text-white border-amber-600' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
            filterAttentionOnly ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
          }`}>
            ⚠️
          </div>
          <div>
            <div className={`text-[11px] font-bold uppercase ${filterAttentionOnly ? 'text-amber-100' : 'text-slate-400'}`}>
              Cần lưu ý nề nếp
            </div>
            <div className="text-xs font-bold">
              {attentionCount} học sinh {filterAttentionOnly && ' (Đang lọc)'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã HS, tên phụ huynh, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
          </div>

          {/* Team Filter */}
          <div>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả các Tổ (Tổ 1, 2, 3, 4)</option>
              <option value="1">Tổ 1 ({students.filter(s=>s.teamId===1).length} HS)</option>
              <option value="2">Tổ 2 ({students.filter(s=>s.teamId===2).length} HS)</option>
              <option value="3">Tổ 3 ({students.filter(s=>s.teamId===3).length} HS)</option>
              <option value="4">Tổ 4 ({students.filter(s=>s.teamId===4).length} HS)</option>
            </select>
          </div>

          {/* Vocational Filter */}
          <div>
            <select
              value={selectedVocational}
              onChange={e => setSelectedVocational(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả ngành nghề (Hàn & Kế toán)</option>
              <option value="Hàn">Nam (Hàn) - {students.filter(s=>s.vocationalCourse==='Hàn').length} HS</option>
              <option value="Kế toán">Nữ (Kế toán) - {students.filter(s=>s.vocationalCourse==='Kế toán').length} HS</option>
            </select>
          </div>

          {/* Gender Filter / Reset */}
          <div className="flex items-center gap-2">
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value as 'ALL' | 'Nam' | 'Nữ')}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">Giới tính: Tất cả</option>
              <option value="Nam">Nam ({maleCount})</option>
              <option value="Nữ">Nữ ({femaleCount})</option>
            </select>
            
            <button
              onClick={() => { 
                setSearchTerm(''); 
                setSelectedTeam('ALL'); 
                setSelectedVocational('ALL'); 
                setSelectedGender('ALL');
                setFilterAttentionOnly(false);
              }}
              title="Đặt lại bộ lọc"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const isAttention = student.currentScore < 85 || student.attentionFlag;
          const rankInfo = getEmulationRank(student.currentScore);

          return (
            <div
              key={student.id}
              className={`bg-white rounded-3xl border-2 p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isAttention ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Card Top: Avatar, Name, Position, Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setAvatarChangeTargetStudent(student)}
                      className="relative group cursor-pointer shrink-0"
                      title="Bấm để đổi ảnh đại diện cho học sinh này"
                    >
                      <img
                        src={student.avatar}
                        alt={student.fullName}
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs group-hover:opacity-90 group-hover:ring-blue-400 transition"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full shadow-xs border border-white transition transform group-hover:scale-115">
                        <Camera className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md uppercase">
                          Tổ {student.teamId}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{student.code}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm mt-0.5">{student.fullName}</h3>
                      <div className="text-[11px] font-bold text-blue-700">{student.position}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-blue-700">{student.currentScore}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rankInfo.badgeClass}`}>
                      {rankInfo.emoji} {rankInfo.label}
                    </span>
                  </div>
                </div>

                {/* Info Rows */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Sinh ngày: <strong className="text-slate-800">{student.dob}</strong> ({student.gender})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-800 flex items-center gap-1.5">
                      <span>{student.vocationalCourse === 'Hàn' ? '⚡' : '📊'}</span>
                      <span>Nghề {student.vocationalCourse} ({student.vocationalCourse === 'Hàn' ? 'Nam' : 'Nữ'})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">PH: <strong className="text-slate-800">{student.parentName}</strong> ({student.parentPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500">{student.address}</span>
                  </div>
                </div>

                {/* Attention note if applicable */}
                {isAttention && (
                  <div className="mt-3 p-2.5 bg-amber-100/80 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span className="leading-tight font-medium">{student.notes || 'Học sinh cần GVCN lưu ý rèn luyện'}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingStudent(student)}
                  id={`btn-view-${student.code}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem hồ sơ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isGVCN && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setAdjustScoreStudent(student);
                        setAdjustPoints(5);
                        setAdjustReason('');
                      }}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
                      title="Cộng / Trừ điểm thi đua"
                    >
                      <span>⚡ Điểm</span>
                    </button>
                    
                    <button
                      onClick={() => setEditingStudent({ ...student })}
                      id={`btn-edit-${student.code}`}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1"
                      title="Chỉnh sửa hồ sơ học sinh"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy học sinh nào</h3>
          <p className="text-xs text-slate-500 mt-1">Vui lòng thử tìm kiếm bằng từ khóa khác hoặc đặt lại bộ lọc.</p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. STUDENT DETAIL VIEW MODAL (Khớp với UI người dùng yêu cầu) */}
      {/* ========================================================= */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            
            {/* Modal Top Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div
                  onClick={() => setAvatarChangeTargetStudent(viewingStudent)}
                  className="relative group cursor-pointer shrink-0"
                  title="Bấm để đổi ảnh đại diện cho học sinh này"
                >
                  <img
                    src={viewingStudent.avatar}
                    alt={viewingStudent.fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-xs group-hover:opacity-90 transition"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-md border-2 border-white transition transform group-hover:scale-110">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Tổ {viewingStudent.teamId} • {viewingStudent.position}
                    </span>
                    {viewingStudent.attentionFlag && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                        ⚠️ Cần lưu ý
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 text-xl mt-1">{viewingStudent.fullName}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-slate-500">Mã học sinh: <strong className="text-slate-700">{viewingStudent.code}</strong></p>
                    <button
                      type="button"
                      onClick={() => setAvatarChangeTargetStudent(viewingStudent)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Đổi ảnh đại diện</span>
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Info Cards */}
            <div className="py-4 space-y-3.5 text-xs text-slate-700">
              
              {/* Grid 4 Stats */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Ngày sinh:</span>
                  <strong className="font-bold text-slate-900 text-xs">{viewingStudent.dob || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Giới tính:</span>
                  <strong className="font-bold text-slate-900 text-xs">{viewingStudent.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Số điện thoại:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <strong className="font-bold text-slate-900 text-xs">{viewingStudent.phone || 'Chưa cập nhật'}</strong>
                    {viewingStudent.phone && (
                      <button 
                        onClick={() => handleCopyText(viewingStudent.phone, 'SĐT học sinh')}
                        className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                        title="Sao chép số điện thoại"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Điểm thi đua:</span>
                  <strong className="font-black text-blue-700 text-sm">{viewingStudent.currentScore} điểm</strong>
                </div>
              </div>

              {/* Vocational Course Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>{viewingStudent.vocationalCourse === 'Hàn' ? '⚡' : '📊'}</span>
                    <span>Đào tạo nghề Trung cấp:</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {viewingStudent.vocationalCourse === 'Hàn' ? 'Dành cho Nam' : 'Dành cho Nữ'}
                  </span>
                </div>
                <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <span>Nghề {viewingStudent.vocationalCourse}</span>
                  <span className="text-xs text-slate-500 font-medium">({viewingStudent.vocationalCourse === 'Hàn' ? 'Kỹ thuật Hàn cơ khí' : 'Kế toán doanh nghiệp'})</span>
                </div>
                <div className="text-[11px] text-slate-500">Học tại Trung tâm GDNN-GDTX An Nhơn (Chiều Thứ 3 & Thứ 5)</div>
              </div>

              {/* Parent Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>👨‍👩‍👧</span>
                  <span>Thông tin Phụ huynh:</span>
                </div>
                <div className="text-slate-800">
                  Họ tên: <strong className="text-slate-900">{viewingStudent.parentName}</strong> ({viewingStudent.parentRelationship || 'Phụ huynh'})
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span>SĐT liên hệ: <strong className="text-blue-800">{viewingStudent.parentPhone}</strong></span>
                  {viewingStudent.parentPhone && (
                    <button 
                      onClick={() => handleCopyText(viewingStudent.parentPhone, 'SĐT phụ huynh')}
                      className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                      title="Sao chép số điện thoại phụ huynh"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-slate-800 flex items-start gap-1">
                  <span className="shrink-0">Địa chỉ:</span>
                  <span className="font-medium text-slate-900">{viewingStudent.address}</span>
                </div>
              </div>

              {/* GVCN Notes if any */}
              {viewingStudent.notes && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-[11px] text-amber-900 space-y-0.5">
                  <strong className="font-bold">Ghi chú của GVCN:</strong>
                  <p className="leading-relaxed">{viewingStudent.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>

              {isGVCN && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdjustScoreStudent(viewingStudent);
                      setAdjustPoints(5);
                      setAdjustReason('');
                    }}
                    className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <span>⚡ Điểm thi đua</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingStudent({ ...viewingStudent });
                    }}
                    id="btn-edit-from-profile"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Chỉnh Sửa Thông Tin</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT STUDENT PROFILE MODAL (Dành cho GVCN chỉnh sửa đầy đủ) */}
      {/* ========================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-8 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Chỉnh Sửa Hồ Sơ Học Sinh</h3>
                  <p className="text-xs text-slate-500">GVCN cập nhật thông tin: <strong className="text-slate-800">{editingStudent.fullName}</strong> ({editingStudent.code})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              
              {/* SECTION A: THÔNG TIN HỌC SINH */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide text-blue-800">
                  <User className="w-4 h-4" />
                  <span>1. Thông Tin Cá Nhân Học Sinh</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.fullName}
                      onChange={e => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã học sinh</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.code}
                      onChange={e => setEditingStudent({ ...editingStudent, code: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày sinh (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={editingStudent.dob}
                      onChange={e => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={editingStudent.gender}
                      onChange={e => {
                        const newGender = e.target.value as 'Nam' | 'Nữ';
                        setEditingStudent({ 
                          ...editingStudent, 
                          gender: newGender,
                          vocationalCourse: newGender === 'Nữ' ? 'Kế toán' : 'Hàn',
                          avatar: (newGender === 'Nữ' ? SAMPLE_AVATARS.Nữ : SAMPLE_AVATARS.Nam)[0]
                        });
                      }}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      <option value="Nam">Nam (Học nghề Hàn)</option>
                      <option value="Nữ">Nữ (Học nghề Kế toán)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SĐT học sinh</label>
                    <input
                      type="text"
                      placeholder="09xx xxx xxx"
                      value={editingStudent.phone}
                      onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phân Tổ</label>
                    <select
                      value={editingStudent.teamId}
                      onChange={e => setEditingStudent({ ...editingStudent, teamId: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      <option value={1}>Tổ 1</option>
                      <option value={2}>Tổ 2</option>
                      <option value={3}>Tổ 3</option>
                      <option value={4}>Tổ 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chức vụ trong lớp</label>
                    <select
                      value={editingStudent.position}
                      onChange={e => setEditingStudent({ ...editingStudent, position: e.target.value as StudentPosition })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      {POSITIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Điểm thi đua hiện tại</label>
                    <input
                      type="number"
                      value={editingStudent.currentScore}
                      onChange={e => setEditingStudent({ ...editingStudent, currentScore: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-black text-blue-700 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700 text-xs sm:text-sm">
                      Chuyên ngành đào tạo Trung cấp (GDNN-GDTX An Nhơn) *
                    </label>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      2 lựa chọn: Nam (Hàn) • Nữ (Kế toán)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VOCATIONAL_OPTIONS.map(opt => {
                      const isSelected = editingStudent.vocationalCourse === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditingStudent({ ...editingStudent, vocationalCourse: opt.value })}
                          className={`p-3 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{opt.icon}</span>
                            <div>
                              <div className="font-black text-xs text-slate-900">{opt.label}</div>
                              <div className="text-[10px] text-slate-500">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION B: THÔNG TIN PHỤ HUYNH */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide text-blue-800">
                  <HeartHandshake className="w-4 h-4" />
                  <span>2. Thông Tin Phụ Huynh & Gia Đình</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ tên Cha / Mẹ *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={editingStudent.parentName}
                      onChange={e => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mối quan hệ</label>
                    <select
                      value={editingStudent.parentRelationship || 'Bố'}
                      onChange={e => setEditingStudent({ ...editingStudent, parentRelationship: e.target.value as any })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Người giám hộ">Người giám hộ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SĐT Phụ huynh liên hệ *</label>
                    <input
                      type="text"
                      required
                      placeholder="09xx xxx xxx"
                      value={editingStudent.parentPhone}
                      onChange={e => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa chỉ thường trú / Nơi ở gia đình *</label>
                  <input
                    type="text"
                    required
                    placeholder="Xã Nhơn Hậu, TX. An Nhơn, Bình Định"
                    value={editingStudent.address}
                    onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              {/* SECTION C: GHI CHÚ GVCN & ẢNH ĐẠI DIỆN */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide text-blue-800">
                  <Bookmark className="w-4 h-4" />
                  <span>3. Ghi Chú Của GVCN & Ảnh Đại Diện</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú theo dõi nề nếp, học tập:</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú điểm mạnh, hạn chế cần khắc phục hoặc lưu ý phối hợp với phụ huynh..."
                    value={editingStudent.notes || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-attentionFlag"
                    checked={editingStudent.attentionFlag || false}
                    onChange={e => setEditingStudent({ ...editingStudent, attentionFlag: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="edit-attentionFlag" className="font-bold text-amber-900 cursor-pointer">
                    Đánh dấu học sinh cần GVCN & Ban cán sự theo dõi, nhắc nhở đặc biệt
                  </label>
                </div>

                {/* Avatar Quick Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700">Ảnh đại diện học sinh:</label>
                    <button
                      type="button"
                      onClick={() => setAvatarChangeTargetStudent(editingStudent)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chụp ảnh / Tải lên / Chọn kho ảnh</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                    <img
                      src={editingStudent.avatar}
                      alt={editingStudent.fullName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-500 font-medium">Chọn nhanh mẫu tương thích:</p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-1">
                        {(editingStudent.gender === 'Nữ' ? SAMPLE_AVATARS.Nữ : SAMPLE_AVATARS.Nam).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt="Avatar option"
                            onClick={() => setEditingStudent({ ...editingStudent, avatar: url })}
                            className={`w-8 h-8 rounded-lg object-cover cursor-pointer ring-2 transition ${
                              editingStudent.avatar === url ? 'ring-blue-600 scale-105' : 'ring-transparent opacity-60 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${editingStudent.fullName}" (${editingStudent.code}) khỏi danh sách Lớp 11A3?`)) {
                      deleteStudent(editingStudent.id);
                      if (viewingStudent && viewingStudent.id === editingStudent.id) {
                        setViewingStudent(null);
                      }
                      setEditingStudent(null);
                      showToast(`Đã xóa học sinh ${editingStudent.fullName} khỏi danh sách`);
                    }
                  }}
                  className="px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa Học Sinh</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    id="btn-save-edit-student"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Hồ Sơ Học Sinh</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ADD NEW STUDENT MODAL (Thêm học sinh mới) */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-8 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Thêm Học Sinh Mới Vào Lớp 11A3</h3>
                  <p className="text-xs text-slate-500">Năm học 2026–2027 • GVCN Võ Thị Thúy Hào</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 mt-4 text-xs">
              
              {/* Student info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5 uppercase text-blue-800">
                  <User className="w-4 h-4" />
                  <span>1. Thông Tin Học Sinh</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Hoàng"
                      value={newStudentData.fullName}
                      onChange={e => setNewStudentData({ ...newStudentData, fullName: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã học sinh</label>
                    <input
                      type="text"
                      required
                      value={newStudentData.code}
                      onChange={e => setNewStudentData({ ...newStudentData, code: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={newStudentData.dob}
                      onChange={e => setNewStudentData({ ...newStudentData, dob: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={newStudentData.gender}
                      onChange={e => {
                        const newGender = e.target.value as 'Nam' | 'Nữ';
                        setNewStudentData({ 
                          ...newStudentData, 
                          gender: newGender,
                          vocationalCourse: newGender === 'Nữ' ? 'Kế toán' : 'Hàn',
                          avatar: (newGender === 'Nữ' ? SAMPLE_AVATARS.Nữ : SAMPLE_AVATARS.Nam)[0]
                        });
                      }}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      <option value="Nam">Nam (Học nghề Hàn)</option>
                      <option value="Nữ">Nữ (Học nghề Kế toán)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SĐT học sinh</label>
                    <input
                      type="text"
                      placeholder="09xx xxx xxx"
                      value={newStudentData.phone}
                      onChange={e => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phân Tổ</label>
                    <select
                      value={newStudentData.teamId}
                      onChange={e => setNewStudentData({ ...newStudentData, teamId: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      <option value={1}>Tổ 1</option>
                      <option value={2}>Tổ 2</option>
                      <option value={3}>Tổ 3</option>
                      <option value={4}>Tổ 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chức vụ</label>
                    <select
                      value={newStudentData.position}
                      onChange={e => setNewStudentData({ ...newStudentData, position: e.target.value as StudentPosition })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      {POSITIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700 text-xs sm:text-sm">
                      Chuyên ngành đào tạo Trung cấp (GDNN-GDTX An Nhơn) *
                    </label>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      2 lựa chọn: Nam (Hàn) • Nữ (Kế toán)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VOCATIONAL_OPTIONS.map(opt => {
                      const isSelected = newStudentData.vocationalCourse === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNewStudentData({ ...newStudentData, vocationalCourse: opt.value })}
                          className={`p-3 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{opt.icon}</span>
                            <div>
                              <div className="font-black text-xs text-slate-900">{opt.label}</div>
                              <div className="text-[10px] text-slate-500">{opt.desc}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Parent info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 text-xs flex items-center gap-1.5 uppercase text-blue-800">
                  <HeartHandshake className="w-4 h-4" />
                  <span>2. Thông Tin Phụ Huynh</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ tên Cha / Mẹ *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn B"
                      value={newStudentData.parentName}
                      onChange={e => setNewStudentData({ ...newStudentData, parentName: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mối quan hệ</label>
                    <select
                      value={newStudentData.parentRelationship || 'Bố'}
                      onChange={e => setNewStudentData({ ...newStudentData, parentRelationship: e.target.value as any })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    >
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Người giám hộ">Người giám hộ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SĐT Phụ huynh *</label>
                    <input
                      type="text"
                      required
                      placeholder="09xx xxx xxx"
                      value={newStudentData.parentPhone}
                      onChange={e => setNewStudentData({ ...newStudentData, parentPhone: e.target.value })}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa chỉ thường trú *</label>
                  <input
                    type="text"
                    required
                    placeholder="Xã/Phường, TX. An Nhơn, Bình Định"
                    value={newStudentData.address}
                    onChange={e => setNewStudentData({ ...newStudentData, address: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tạo Mới Học Sinh</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. QUICK SCORE ADJUSTMENT MODAL (GVCN cộng/trừ điểm thi đua) */}
      {/* ========================================================= */}
      {adjustScoreStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  ⚡
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Điều Chỉnh Điểm Thi Đua
                  </h3>
                  <p className="text-xs text-slate-500">
                    Học sinh: <strong className="text-slate-800">{adjustScoreStudent.fullName}</strong> (Tổ {adjustScoreStudent.teamId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustScoreStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyScoreAdjustment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Chọn mức điểm:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, -5, -10].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setAdjustPoints(pt)}
                      className={`py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                        adjustPoints === pt 
                          ? (pt > 0 ? 'bg-emerald-600 text-white shadow-md' : 'bg-rose-600 text-white shadow-md')
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pt > 0 ? `+${pt}đ` : `${pt}đ`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hoặc nhập số điểm tùy ý:</label>
                <input
                  type="number"
                  value={adjustPoints}
                  onChange={e => setAdjustPoints(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do điều chỉnh (khen thưởng / nhắc nhở):</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Tích cực phát biểu, hỗ trợ GVCN trực nhật lớp..."
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustScoreStudent(null)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Xác Nhận Điểm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. EXCEL IMPORT MODAL (Nhập theo file mẫu Excel sẵn) */}
      {/* ========================================================= */}
      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onImportComplete={handleBatchImportComplete}
        existingCount={students.length}
      />

      {/* ========================================================= */}
      {/* 6. AVATAR CHANGE MODAL CHO HỌC SINH */}
      {/* ========================================================= */}
      {avatarChangeTargetStudent && (
        <AvatarChangeModal
          isOpen={!!avatarChangeTargetStudent}
          onClose={() => setAvatarChangeTargetStudent(null)}
          currentAvatar={avatarChangeTargetStudent.avatar || ''}
          userName={avatarChangeTargetStudent.fullName}
          userRoleTitle={`Học sinh • ${avatarChangeTargetStudent.position || 'Thành viên'} (Tổ ${avatarChangeTargetStudent.teamId})`}
          userGender={avatarChangeTargetStudent.gender}
          userRole="STUDENT"
          onSaveAvatar={(newAvatarUrl) => {
            updateUserAvatar(newAvatarUrl, undefined, avatarChangeTargetStudent.id);
            if (viewingStudent && viewingStudent.id === avatarChangeTargetStudent.id) {
              setViewingStudent(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
            }
            if (editingStudent && editingStudent.id === avatarChangeTargetStudent.id) {
              setEditingStudent(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
            }
            showToast(`Đã cập nhật ảnh đại diện cho học sinh ${avatarChangeTargetStudent.fullName}!`);
            setAvatarChangeTargetStudent(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 7. ACCOUNT PROVISION MODAL (Cài đặt & Cấp tài khoản dựa vào Mã HS) */}
      {/* ========================================================= */}
      <AccountProvisionModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

    </div>
  );
};
