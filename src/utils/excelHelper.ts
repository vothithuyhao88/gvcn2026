import * as XLSX from 'xlsx';
import { Student, StudentPosition } from '../types';
import { getEmulationRank } from './emulation';

export interface ParsedStudentRow {
  code?: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  teamId: number;
  position: StudentPosition;
  vocationalCourse: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: 'Bố' | 'Mẹ' | 'Người giám hộ';
  address: string;
  notes?: string;
  baseScore?: number;
  currentScore?: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Generates and downloads the official Excel template for Class 11A3 students
 */
export function downloadStudentExcelTemplate() {
  const headers = [
    'STT',
    'Mã học sinh (*)',
    'Họ và tên (*)',
    'Giới tính (*)',
    'Ngày sinh (YYYY-MM-DD)',
    'Tổ (1-4)',
    'Chức vụ',
    'Nghề học (Hàn/Kế toán)',
    'Số ĐT học sinh',
    'Họ tên phụ huynh (*)',
    'SĐT phụ huynh (*)',
    'Quan hệ (Bố/Mẹ/Người giám hộ)',
    'Địa chỉ cư trú',
    'Ghi chú'
  ];

  const sampleRows = [
    [1, '11A3-01', 'Nguyễn Văn An', 'Nam', '2009-03-15', 1, 'LỚP TRƯỞNG', 'Hàn', '0912345678', 'Nguyễn Văn Bình', '0987654321', 'Bố', 'Phường Bình Định, TX. An Nhơn', 'Học sinh gương mẫu'],
    [2, '11A3-02', 'Lê Thị Mai Phương', 'Nữ', '2009-07-20', 2, 'LỚP PHÓ HỌC TẬP', 'Kế toán', '0923456789', 'Lê Văn Cường', '0978123456', 'Bố', 'Phường Đập Đá, TX. An Nhơn', 'Cán sự học tập năng nổ'],
    [3, '11A3-03', 'Trần Quốc Bảo', 'Nam', '2009-11-05', 3, 'THÀNH VIÊN', 'Hàn', '0934567890', 'Trần Thị Dung', '0965432198', 'Mẹ', 'Xã Nhơn An, TX. An Nhơn', ''],
    [4, '11A3-04', 'Phạm Hoàng Nam', 'Nam', '2009-02-18', 1, 'TỔ TRƯỞNG TỔ 1', 'Hàn', '0945678901', 'Phạm Văn Em', '0954321987', 'Bố', 'Xã Nhơn Hạnh, TX. An Nhơn', ''],
    [5, '11A3-05', 'Nguyễn Thị Thảo Nguyên', 'Nữ', '2009-09-12', 2, 'TỔ TRƯỞNG TỔ 2', 'Kế toán', '0956789012', 'Nguyễn Văn Phúc', '0943219876', 'Bố', 'Phường Nhơn Hòa, TX. An Nhơn', '']
  ];

  const wsData = [
    ['TRUNG TÂM GDNN - GDTX THỊ XÃ AN NHƠN - TỈNH BÌNH ĐỊNH'],
    ['FILE MẪU NHẬP DANH SÁCH HỌC SINH LỚP 11A3 (NIÊN KHÓA 2025–2028)'],
    ['GVCN: Võ Thị Thúy Hào • SĐT: 0932556039 • Khẩu hiệu: Đoàn Kết & Chia Sẻ'],
    ['(Lưu ý: Các cột có dấu (*) là bắt buộc. Nghề học: Nam học Hàn, Nữ học Kế toán. Tổ từ 1 đến 4)'],
    [], // empty line
    headers,
    ...sampleRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã HS
    { wch: 24 }, // Họ và tên
    { wch: 10 }, // Giới tính
    { wch: 16 }, // Ngày sinh
    { wch: 10 }, // Tổ
    { wch: 22 }, // Chức vụ
    { wch: 18 }, // Nghề học
    { wch: 15 }, // SĐT HS
    { wch: 22 }, // Họ tên PH
    { wch: 15 }, // SĐT PH
    { wch: 14 }, // Quan hệ
    { wch: 32 }, // Địa chỉ
    { wch: 24 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Hoc_Sinh_11A3');

  XLSX.writeFile(wb, 'File_Mau_Nhap_Hoc_Sinh_Lop_11A3.xlsx');
}

/**
 * Exports current student data to a beautifully formatted Excel file
 */
export function exportStudentsToExcel(studentsList: Student[], fileNamePrefix = 'Danh_Sach_Hoc_Sinh_Lop_11A3') {
  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Giới tính',
    'Ngày sinh',
    'Tổ',
    'Chức vụ',
    'Nghề học (Trung cấp)',
    'Điểm thi đua',
    'Xếp loại',
    'Số ĐT học sinh',
    'Họ tên phụ huynh',
    'SĐT phụ huynh',
    'Quan hệ',
    'Địa chỉ cư trú',
    'Cần quan tâm',
    'Ghi chú'
  ];

  const rows = studentsList.map((s, idx) => {
    const rank = getEmulationRank(s.currentScore);
    return [
      idx + 1,
      s.code,
      s.fullName,
      s.gender,
      s.dob,
      `Tổ ${s.teamId}`,
      s.position,
      s.vocationalCourse,
      s.currentScore,
      rank.label,
      s.phone || '',
      s.parentName,
      s.parentPhone,
      s.parentRelationship,
      s.address,
      s.attentionFlag ? 'Có' : 'Bình thường',
      s.notes || ''
    ];
  });

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const wsData = [
    ['TRUNG TÂM GDNN - GDTX THỊ XÃ AN NHƠN'],
    ['LỚP 11A3 • NIÊN KHÓA 2025–2028 • ĐOÀN KẾT VÀ CHIA SẺ'],
    [`DANH SÁCH HỌC SINH (Tổng số: ${studentsList.length} học sinh) - Xuất ngày: ${dateStr}`],
    ['Giáo viên chủ nhiệm: Cô Võ Thị Thúy Hào • SĐT: 0932556039'],
    [],
    headers,
    ...rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã HS
    { wch: 25 }, // Họ tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 8 },  // Tổ
    { wch: 24 }, // Chức vụ
    { wch: 18 }, // Nghề học
    { wch: 14 }, // Điểm thi đua
    { wch: 16 }, // Xếp loại
    { wch: 15 }, // SĐT HS
    { wch: 24 }, // Tên PH
    { wch: 15 }, // SĐT PH
    { wch: 12 }, // Quan hệ
    { wch: 34 }, // Địa chỉ
    { wch: 14 }, // Cần quan tâm
    { wch: 24 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_11A3');

  const fileDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `${fileNamePrefix}_${fileDate}.xlsx`);
}

/**
 * Exports Student, Cadre and Parent Accounts List matching the exact orange table format in requirements
 */
export function exportAccountListToExcel(studentsList: Student[], fileNamePrefix = 'Danh_Sach_Cap_Tai_Khoan_11A3') {
  const headers = [
    'STT',
    'HoTen',
    'To',
    'ChucVu',
    'MaHocSinh',
    'MatKhauHS',
    'MatKhauPH'
  ];

  const rows = studentsList.map((s, idx) => {
    // Format standardized position display
    let chucVu = 'Thành viên';
    if (s.position === 'LỚP TRƯỞNG') chucVu = 'Lớp trưởng';
    else if (s.position === 'LỚP PHÓ HỌC TẬP' || s.position === 'LỚP PHÓ LAO ĐỘNG - NỀ NẾP') chucVu = 'Lớp phó';
    else if (s.position.includes('TỔ TRƯỞNG')) chucVu = 'Tổ trưởng';

    return [
      idx + 1,
      s.fullName,
      s.teamId,
      chucVu,
      s.code,
      s.studentPassword || '123456',
      s.parentPassword || '123456'
    ];
  });

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const wsData = [
    ['TRUNG TÂM GDNN - GDTX THỊ XÃ AN NHƠN - TỈNH BÌNH ĐỊNH'],
    ['BẢNG CẤP TÀI KHOẢN HỌC SINH, CÁN SỰ & PHỤ HUYNH LỚP 11A3 (2026–2027)'],
    [`GVCN: Cô Võ Thị Thúy Hào • Tên đăng nhập GVCN: thuyhao | Mật khẩu: thuyhao88 • Xuất ngày: ${dateStr}`],
    ['(Ghi chú: Học sinh & Cán sự đăng nhập bằng Mã học sinh và MatKhauHS; Phụ huynh đăng nhập bằng Mã học sinh của con và MatKhauPH)'],
    [],
    headers,
    ...rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 8 },  // STT
    { wch: 26 }, // HoTen
    { wch: 8 },  // To
    { wch: 18 }, // ChucVu
    { wch: 16 }, // MaHocSinh
    { wch: 16 }, // MatKhauHS
    { wch: 16 }, // MatKhauPH
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cap_Tai_Khoan_11A3');

  const fileDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `${fileNamePrefix}_${fileDate}.xlsx`);
}

/**
 * Parses an Excel or CSV file buffer / arrayBuffer and converts into valid Student records
 */
export function parseStudentExcelFile(data: ArrayBuffer | Uint8Array): {
  rows: ParsedStudentRow[];
  totalParsed: number;
  validCount: number;
  errorCount: number;
} {
  const wb = XLSX.read(data, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  
  if (!ws) {
    throw new Error('File không chứa dữ liệu hoặc bảng tính rỗng!');
  }

  // Convert to JSON 2D array
  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Find the header row (look for 'Họ và tên' or 'Mã' or 'Họ tên')
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const rowStr = (rawRows[i] || []).join(' ').toLowerCase();
    if (rowStr.includes('họ và tên') || rowStr.includes('họ tên') || (rowStr.includes('mã') && rowStr.includes('tên'))) {
      headerRowIndex = i;
      break;
    }
  }

  // If no header found, assume row 0 or 5 is header
  if (headerRowIndex === -1) {
    headerRowIndex = rawRows.length > 5 && (rawRows[5] || []).length > 2 ? 5 : 0;
  }

  const headerRow = (rawRows[headerRowIndex] || []).map((h: any) => String(h).trim().toLowerCase());
  
  // Helper to find column index by keyword
  const findCol = (keywords: string[]) => {
    return headerRow.findIndex((colName: string) => 
      keywords.some(kw => colName.includes(kw))
    );
  };

  const colCode = findCol(['mã', 'code']);
  const colName = findCol(['họ và tên', 'họ tên', 'tên học sinh', 'fullname']);
  const colGender = findCol(['giới tính', 'phái', 'gender', 'nam/nữ']);
  const colDob = findCol(['ngày sinh', 'dob', 'năm sinh', 'ngaysinh']);
  const colTeam = findCol(['tổ', 'team', 'nhóm']);
  const colPosition = findCol(['chức vụ', 'vị trí', 'position']);
  const colVocational = findCol(['nghề', 'nghề học', 'chuyên ngành', 'vocational']);
  const colPhone = findCol(['sđt hs', 'số đt học sinh', 'điện thoại hs', 'sđt học sinh', 'phone']);
  const colParentName = findCol(['họ tên phụ huynh', 'tên phụ huynh', 'tên cha', 'tên mẹ', 'phụ huynh', 'parent']);
  const colParentPhone = findCol(['sđt phụ huynh', 'sđt ph', 'điện thoại ph', 'số đt ph', 'parentphone']);
  const colParentRel = findCol(['quan hệ', 'mối quan hệ', 'relationship']);
  const colAddress = findCol(['địa chỉ', 'nơi ở', 'cư trú', 'address']);
  const colNotes = findCol(['ghi chú', 'notes', 'nhận xét']);

  const parsedList: ParsedStudentRow[] = [];

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Check if row has any content
    const rowText = row.join('').trim();
    if (!rowText || rowText.length < 2) continue;

    const errors: string[] = [];

    // Extract values with fallbacks
    const rawFullName = colName >= 0 ? String(row[colName] || '').trim() : '';
    if (!rawFullName) {
      // If no name found, skip this empty line
      continue;
    }

    const rawCode = colCode >= 0 ? String(row[colCode] || '').trim() : '';
    const rawGenderVal = colGender >= 0 ? String(row[colGender] || '').trim().toLowerCase() : '';
    const gender: 'Nam' | 'Nữ' = rawGenderVal.includes('nữ') || rawGenderVal.includes('nu') || rawGenderVal.includes('female') || rawGenderVal === 'f'
      ? 'Nữ' 
      : 'Nam';

    // Parse DoB
    let dob = '2009-01-01';
    if (colDob >= 0 && row[colDob]) {
      const rawDob = String(row[colDob]).trim();
      // Handle DD/MM/YYYY or YYYY-MM-DD or excel date serial
      if (typeof row[colDob] === 'number') {
        const d = XLSX.SSF.parse_date_code(row[colDob]);
        if (d) {
          dob = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        }
      } else if (rawDob.includes('/')) {
        const parts = rawDob.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          dob = `${year}-${month}-${day}`;
        }
      } else if (rawDob.includes('-')) {
        dob = rawDob;
      }
    }

    // Parse Team (1, 2, 3, 4)
    let teamId = 1;
    if (colTeam >= 0 && row[colTeam]) {
      const numMatch = String(row[colTeam]).match(/[1-4]/);
      if (numMatch) {
        teamId = parseInt(numMatch[0], 10);
      }
    }

    // Parse Position
    let position: StudentPosition = 'THÀNH VIÊN';
    if (colPosition >= 0 && row[colPosition]) {
      const rawPos = String(row[colPosition]).trim().toUpperCase();
      if (rawPos.includes('LỚP TRƯỞNG') || rawPos.includes('TRƯỞNG LỚP')) position = 'LỚP TRƯỞNG';
      else if (rawPos.includes('HỌC TẬP')) position = 'LỚP PHÓ HỌC TẬP';
      else if (rawPos.includes('LAO ĐỘNG') || rawPos.includes('NỀ NẾP')) position = 'LỚP PHÓ LAO ĐỘNG - NỀ NẾP';
      else if (rawPos.includes('TỔ 1') || rawPos.includes('TỔ TRƯỞNG 1')) position = 'TỔ TRƯỞNG TỔ 1';
      else if (rawPos.includes('TỔ 2') || rawPos.includes('TỔ TRƯỞNG 2')) position = 'TỔ TRƯỞNG TỔ 2';
      else if (rawPos.includes('TỔ 3') || rawPos.includes('TỔ TRƯỞNG 3')) position = 'TỔ TRƯỞNG TỔ 3';
      else if (rawPos.includes('TỔ 4') || rawPos.includes('TỔ TRƯỞNG 4')) position = 'TỔ TRƯỞNG TỔ 4';
    }

    // Parse Vocational
    let vocationalCourse = gender === 'Nữ' ? 'Kế toán' : 'Hàn';
    if (colVocational >= 0 && row[colVocational]) {
      const rawVoc = String(row[colVocational]).trim().toLowerCase();
      if (rawVoc.includes('kế toán') || rawVoc.includes('ke toan')) vocationalCourse = 'Kế toán';
      else if (rawVoc.includes('hàn') || rawVoc.includes('han')) vocationalCourse = 'Hàn';
    }

    const phone = colPhone >= 0 ? String(row[colPhone] || '').trim() : '';
    const parentName = colParentName >= 0 ? String(row[colParentName] || '').trim() : `Phụ huynh em ${rawFullName.split(' ').pop()}`;
    const parentPhone = colParentPhone >= 0 ? String(row[colParentPhone] || '').trim() : '';
    
    let parentRelationship: 'Bố' | 'Mẹ' | 'Người giám hộ' = 'Bố';
    if (colParentRel >= 0 && row[colParentRel]) {
      const rawRel = String(row[colParentRel]).toLowerCase();
      if (rawRel.includes('mẹ') || rawRel.includes('me')) parentRelationship = 'Mẹ';
      else if (rawRel.includes('giám hộ')) parentRelationship = 'Người giám hộ';
    }

    const address = colAddress >= 0 && row[colAddress] ? String(row[colAddress]).trim() : 'TX. An Nhơn, Tỉnh Bình Định';
    const notes = colNotes >= 0 ? String(row[colNotes] || '').trim() : '';

    // Validation checks
    if (!rawFullName || rawFullName.length < 2) {
      errors.push('Thiếu họ và tên học sinh');
    }

    parsedList.push({
      code: rawCode,
      fullName: rawFullName,
      gender,
      dob,
      teamId,
      position,
      vocationalCourse,
      phone,
      parentName,
      parentPhone,
      parentRelationship,
      address,
      notes,
      baseScore: 100,
      currentScore: 100,
      isValid: errors.length === 0,
      errors
    });
  }

  const validCount = parsedList.filter(p => p.isValid).length;
  const errorCount = parsedList.length - validCount;

  return {
    rows: parsedList,
    totalParsed: parsedList.length,
    validCount,
    errorCount
  };
}
