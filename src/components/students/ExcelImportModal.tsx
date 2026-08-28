import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Users, 
  Trash2, 
  RefreshCw,
  ArrowRight,
  ClipboardCheck,
  HelpCircle
} from 'lucide-react';
import { 
  downloadStudentExcelTemplate, 
  parseStudentExcelFile, 
  ParsedStudentRow 
} from '../../utils/excelHelper';
import { Student } from '../../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (students: ParsedStudentRow[], mode: 'append' | 'replace') => void;
  existingCount: number;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  existingCount,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setErrorMsg('Vui lòng chọn file định dạng Excel (.xlsx, .xls) hoặc CSV (.csv)');
      return;
    }

    try {
      setIsProcessing(true);
      setFileName(file.name);
      const buffer = await file.arrayBuffer();
      const result = parseStudentExcelFile(buffer);

      if (result.rows.length === 0) {
        setErrorMsg('Không tìm thấy dòng dữ liệu học sinh nào hợp lệ trong file. Vui lòng tải file mẫu để kiểm tra đúng cấu trúc cột.');
        setParsedRows([]);
      } else {
        setParsedRows(result.rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể đọc dữ liệu từ file Excel. Vui lòng kiểm tra lại định dạng file.');
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleParsePastedText = () => {
    setErrorMsg(null);
    if (!pasteText.trim()) {
      setErrorMsg('Vui lòng dán dữ liệu bảng từ Excel vào ô văn bản bên dưới!');
      return;
    }

    try {
      const lines = pasteText.trim().split(/\r?\n/);
      const parsedList: ParsedStudentRow[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split('\t').map(c => c.trim());

        // Skip header if line has 'Họ và tên' or 'Mã'
        if (i === 0 && (line.toLowerCase().includes('họ') || line.toLowerCase().includes('mã') || line.toLowerCase().includes('tên'))) {
          continue;
        }

        // Expected format if copied from Excel:
        // STT \t Mã HS \t Họ tên \t Giới tính \t Ngày sinh \t Tổ \t Chức vụ \t Nghề \t SĐT HS \t Tên PH \t SĐT PH \t Quan hệ \t Địa chỉ
        let code = '';
        let fullName = '';
        let gender: 'Nam' | 'Nữ' = 'Nam';
        let dob = '2009-01-01';
        let teamId = 1;
        let position = 'THÀNH VIÊN' as any;
        let vocationalCourse = 'Hàn';
        let phone = '';
        let parentName = '';
        let parentPhone = '';
        let parentRelationship: 'Bố' | 'Mẹ' | 'Người giám hộ' = 'Bố';
        let address = 'TX. An Nhơn, Tỉnh Bình Định';
        let notes = '';

        if (cols.length >= 2) {
          // Check if first col is number (STT)
          let offset = 0;
          if (/^\d+$/.test(cols[0]) && cols.length > 2) {
            offset = 1;
          }

          code = cols[offset] || `11A3-${String(parsedList.length + 1).padStart(2, '0')}`;
          fullName = cols[offset + 1] || cols[0];
          
          if (cols[offset + 2]) {
            const g = cols[offset + 2].toLowerCase();
            gender = g.includes('nữ') || g.includes('nu') || g.includes('female') ? 'Nữ' : 'Nam';
          }

          if (cols[offset + 3]) {
            dob = cols[offset + 3];
          }

          if (cols[offset + 4]) {
            const t = parseInt(cols[offset + 4], 10);
            if (t >= 1 && t <= 4) teamId = t;
          }

          if (cols[offset + 5]) {
            const pos = cols[offset + 5].toUpperCase();
            if (pos.includes('LỚP TRƯỞNG')) position = 'LỚP TRƯỞNG';
            else if (pos.includes('HỌC TẬP')) position = 'LỚP PHÓ HỌC TẬP';
            else if (pos.includes('LAO ĐỘNG')) position = 'LỚP PHÓ LAO ĐỘNG - NỀ NẾP';
            else if (pos.includes('TỔ 1')) position = 'TỔ TRƯỞNG TỔ 1';
            else if (pos.includes('TỔ 2')) position = 'TỔ TRƯỞNG TỔ 2';
            else if (pos.includes('TỔ 3')) position = 'TỔ TRƯỞNG TỔ 3';
            else if (pos.includes('TỔ 4')) position = 'TỔ TRƯỞNG TỔ 4';
          }

          vocationalCourse = gender === 'Nữ' ? 'Kế toán' : 'Hàn';
          if (cols[offset + 6]) {
            const voc = cols[offset + 6].toLowerCase();
            if (voc.includes('kế toán')) vocationalCourse = 'Kế toán';
            else if (voc.includes('hàn')) vocationalCourse = 'Hàn';
          }

          if (cols[offset + 7]) phone = cols[offset + 7];
          if (cols[offset + 8]) parentName = cols[offset + 8];
          if (cols[offset + 9]) parentPhone = cols[offset + 9];
          if (cols[offset + 10]) {
            const r = cols[offset + 10].toLowerCase();
            if (r.includes('mẹ')) parentRelationship = 'Mẹ';
            else if (r.includes('giám hộ')) parentRelationship = 'Người giám hộ';
          }
          if (cols[offset + 11]) address = cols[offset + 11];
          if (cols[offset + 12]) notes = cols[offset + 12];
        }

        if (fullName && fullName.length >= 2) {
          parsedList.push({
            code,
            fullName,
            gender,
            dob,
            teamId,
            position,
            vocationalCourse,
            phone,
            parentName: parentName || `Phụ huynh em ${fullName.split(' ').pop()}`,
            parentPhone,
            parentRelationship,
            address,
            notes,
            isValid: true,
            errors: []
          });
        }
      }

      if (parsedList.length === 0) {
        setErrorMsg('Không nhận diện được dòng dữ liệu học sinh nào. Vui lòng copy các cột từ bảng Excel!');
      } else {
        setParsedRows(parsedList);
        setFileName(`Dữ liệu dán trực tiếp (${parsedList.length} học sinh)`);
      }
    } catch (e: any) {
      setErrorMsg('Lỗi khi phân tích dữ liệu dán: ' + e.message);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có học sinh nào hợp lệ để nhập vào hệ thống!');
      return;
    }

    onImportComplete(validRows, importMode);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;
  const maleCount = parsedRows.filter(r => r.gender === 'Nam').length;
  const femaleCount = parsedRows.filter(r => r.gender === 'Nữ').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Nhập Danh Sách Học Sinh Từ File Mẫu Excel</span>
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Lớp 11A3 (Niên khóa 2025–2028) • Tự động nhận diện cột thông tin & phụ huynh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar & Template Download */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file Excel (.xlsx / .csv)</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Dán từ bảng tính (Copy / Paste)</span>
            </button>
          </div>

          <button
            onClick={downloadStudentExcelTemplate}
            className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Tải file mẫu Excel chuẩn để điền dữ liệu"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải File Excel Mẫu Chuẩn (.xlsx)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lỗi xử lý file:</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/70'
                    : parsedRows.length > 0
                    ? 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    : 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>

                <p className="text-sm font-bold text-slate-800">
                  {fileName ? (
                    <span className="text-emerald-700 flex items-center gap-1.5 justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Đã chọn: {fileName}</span>
                    </span>
                  ) : (
                    'Kéo thả file Excel hoặc bấm vào đây để tải lên'
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng Microsoft Excel (.xlsx, .xls) và file văn bản phân tách (.csv)
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                  <span>Khuyên dùng: Dùng File Mẫu Chuẩn để đạt độ chính xác 100%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Dán các dòng dữ liệu sao chép từ Excel / Google Sheets vào đây:</span>
                <span className="text-[11px] text-slate-400 font-normal">Các cột phân tách bằng Tab</span>
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Ví dụ:&#10;11A3-01	Nguyễn Văn An	Nam	2009-03-15	1	LỚP TRƯỞNG	Hàn	0912345678	Nguyễn Văn Bình	0987654321	Bố	TX. An Nhơn&#10;11A3-02	Lê Thị Mai Phương	Nữ	2009-07-20	2	LỚP PHÓ HỌC TẬP	Kế toán	0923456789	Lê Văn Cường	0978123456	Bố	TX. An Nhơn"
                rows={5}
                className="w-full text-xs font-mono p-3.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Xử lý dữ liệu dán</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview Table if rows parsed */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã nhận diện: <strong className="text-emerald-700 text-sm">{validCount}</strong> học sinh hợp lệ</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    ({maleCount} Nam / {femaleCount} Nữ)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">Chế độ nhập:</span>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as any)}
                    className="bg-white border border-slate-300 font-bold text-xs rounded-xl px-2.5 py-1 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="append">Bổ sung / Cập nhật vào danh sách ({existingCount} HS hiện tại)</option>
                    <option value="replace">Ghi đè thay thế toàn bộ danh sách lớp</option>
                  </select>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 pl-3">STT</th>
                        <th className="p-2.5">Mã HS</th>
                        <th className="p-2.5">Họ và tên</th>
                        <th className="p-2.5">Giới tính</th>
                        <th className="p-2.5">Tổ</th>
                        <th className="p-2.5">Chức vụ</th>
                        <th className="p-2.5">Nghề học</th>
                        <th className="p-2.5">Phụ huynh & SĐT</th>
                        <th className="p-2.5">Địa chỉ</th>
                        <th className="p-2.5 pr-3 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition">
                          <td className="p-2.5 pl-3 text-slate-400 font-mono text-[11px]">{i + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-blue-700 text-[11px]">{r.code || `11A3-${String(i+1).padStart(2,'0')}`}</td>
                          <td className="p-2.5 font-bold text-slate-900">{r.fullName}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.gender === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.gender}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-slate-700">Tổ {r.teamId}</td>
                          <td className="p-2.5 text-slate-600 text-[11px]">{r.position}</td>
                          <td className="p-2.5">
                            <span className="text-[11px] font-semibold text-slate-700">{r.vocationalCourse}</span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-600">
                            <div>{r.parentName}</div>
                            {r.parentPhone && <div className="font-mono text-slate-500 text-[10px]">{r.parentPhone}</div>}
                          </td>
                          <td className="p-2.5 text-slate-500 text-[11px] max-w-[140px] truncate" title={r.address}>
                            {r.address}
                          </td>
                          <td className="p-2.5 pr-3 text-center">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold" title={r.errors.join(', ')}>
                                <AlertCircle className="w-3 h-3" /> Lỗi
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Guide box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Hướng dẫn cấu trúc dữ liệu Lớp 11A3:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
              <li><strong>Nghề học:</strong> Nam học nghề Hàn, Nữ học nghề Kế toán.</li>
              <li><strong>Tổ:</strong> Điền số từ 1 đến 4.</li>
              <li><strong>Điểm thi đua:</strong> Mặc định khi nhập mới sẽ bắt đầu từ 100 điểm chuẩn.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setFileName(null);
                  setPasteText('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa dữ liệu xem trước</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCount === 0 || isProcessing}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 cursor-pointer ${
                validCount === 0 || isProcessing
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Xác Nhận Nhập {validCount > 0 ? `${validCount} Học Sinh` : ''} Vào Lớp 11A3</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
