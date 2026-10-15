import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AttendanceTracker: React.FC = () => {
  const { students, attendanceRecords, recordAttendance, currentUser } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterTeam, setFilterTeam] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = currentUser.role === 'GVCN' || currentUser.position?.includes('LỚP PHÓ') || currentUser.position?.includes('LỚP TRƯỞNG');

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesTeam = filterTeam === 'ALL' || s.teamId === filterTeam;
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  // Calculate statistics for selected date
  const dateRecords = attendanceRecords.filter(a => a.date === selectedDate);
  const presentCount = dateRecords.filter(a => a.status === 'PRESENT').length;
  const absentCpCount = dateRecords.filter(a => a.status === 'ABSENT_CP').length;
  const absentKpCount = dateRecords.filter(a => a.status === 'ABSENT_KP').length;
  const lateCount = dateRecords.filter(a => a.status === 'LATE').length;
  const recordedCount = dateRecords.length;

  const handleSetStatus = (studentId: string, status: 'PRESENT' | 'ABSENT_CP' | 'ABSENT_KP' | 'LATE') => {
    if (!canEdit) return;
    recordAttendance(selectedDate, studentId, status);
  };

  const handleMarkAllPresent = () => {
    if (!canEdit) return;
    filteredStudents.forEach(s => {
      recordAttendance(selectedDate, s.id, 'PRESENT');
    });
  };

  const changeDateBy = (days: number) => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Sổ Điểm Danh Chuyên Cần 12A2</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Theo Dõi Nề Nếp & Chuyên Cần Hàng Ngày
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận học sinh có mặt, vắng có phép/không phép và đi học muộn
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden"
          />

          <button
            onClick={() => changeDateBy(1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="Ngày tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {canEdit && (
            <button
              onClick={handleMarkAllPresent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Điểm danh cả lớp Có mặt</span>
            </button>
          )}
        </div>
      </div>

      {/* STATS TILES FOR SELECTED DATE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Sĩ số lớp</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{students.length}</div>
            <span className="text-[10px] text-slate-400">Đã chấm: {recordedCount}/{students.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            12A2
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase">🟢 Có mặt</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{presentCount}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Tỷ lệ: {students.length ? Math.round((presentCount / students.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase">🟡 Vắng có phép</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{absentCpCount}</div>
            <span className="text-[10px] text-slate-500">Đã gửi đơn/báo cô</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 uppercase">🔴 Vắng K.Phép & Đi trễ</span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{absentKpCount + lateCount}</div>
            <span className="text-[10px] text-rose-700 font-semibold">
              {absentKpCount} Không phép • {lateCount} Trễ
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="ALL">Tất cả các Tổ</option>
            <option value={1}>Tổ 1</option>
            <option value={2}>Tổ 2</option>
            <option value={3}>Tổ 3</option>
            <option value={4}>Tổ 4</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          {!canEdit && <span className="text-amber-700 font-medium italic">Chế độ xem (Chỉ GVCN và BCS có quyền điểm danh)</span>}
        </div>
      </div>

      {/* Attendance Roll Call Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">STT</th>
                <th className="p-4">Học sinh</th>
                <th className="p-4">Tổ / Chức vụ</th>
                <th className="p-4 text-center">Trạng thái ngày {selectedDate}</th>
                <th className="p-4">Ghi chú chuyên cần</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const record = dateRecords.find(a => a.studentId === student.id);
                const currentStatus = record?.status || 'PRESENT';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 text-center font-bold text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt={student.fullName} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-[10px] text-slate-400">{student.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                        Tổ {student.teamId}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{student.position}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          disabled={!canEdit}
                          onClick={() => handleSetStatus(student.id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>🟢 Có mặt</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleSetStatus(student.id, 'ABSENT_CP')}
                          className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'ABSENT_CP'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>🟡 Có phép</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleSetStatus(student.id, 'ABSENT_KP')}
                          className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'ABSENT_KP'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>🔴 K.Phép</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleSetStatus(student.id, 'LATE')}
                          className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'LATE'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>🟠 Đi trễ</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-slate-500 text-[11px]">
                        {record?.notes || (currentStatus === 'PRESENT' ? 'Đi học đúng giờ' : 'Ghi nhận theo ngày')}
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
  );
};
