export interface AcademicWeekInfo {
  weekNumber: number;
  semester: 1 | 2;
  semesterWeekNumber: number; // 1-18 for HK1, 1-17 for HK2
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
  shortDateRange: string;
  theme?: string;
  isExamWeek?: boolean;
}

export interface AcademicMilestone {
  title: string;
  dateRange: string;
  description: string;
  type: 'semester' | 'holiday' | 'event' | 'closing';
  badgeColor: string;
}

export const ACADEMIC_YEAR = '2026-2027';
export const ACADEMIC_START_DATE = '2026-09-07';
export const TOTAL_ACADEMIC_WEEKS = 35;
export const SEMESTER_1_WEEKS = 18;
export const SEMESTER_2_WEEKS = 17;

export const ACADEMIC_MILESTONES: AcademicMilestone[] = [
  {
    title: 'Học kỳ I (18 tuần thực học)',
    dateRange: '07/09/2026 – 10/01/2027',
    description: 'Bắt đầu năm học mới, triển khai thi đua và đào tạo nghề Trung cấp song hành.',
    type: 'semester',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    title: 'Học kỳ II (17 tuần thực học)',
    dateRange: '11/01/2027 – 23/05/2027',
    description: 'Tăng tốc học văn hóa, hoàn thành chương trình nghề, ôn thi cuối kỳ.',
    type: 'semester',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    title: 'Nghỉ Tết Nguyên đán Đinh Mùi (02 tuần)',
    dateRange: '01/02/2027 – 14/02/2027',
    description: 'Thời gian nghỉ Tết sum vầy cùng gia đình theo quy định của Sở GD&ĐT.',
    type: 'holiday',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    title: 'Kết thúc năm học 2026–2027',
    dateRange: '31/05/2027',
    description: 'Tổng kết thi đua, xét danh hiệu học sinh, hoàn tất học bạ điện tử.',
    type: 'closing',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    title: 'Thi Tốt nghiệp THPT',
    dateRange: 'Tháng 6/2027 (Theo lịch Bộ GD&ĐT)',
    description: 'Kỳ thi Tốt nghiệp THPT Quốc gia dành cho học sinh hoàn thành chương trình GDTX cấp THPT.',
    type: 'event',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  }
];

// Helper to generate the 35 academic weeks
function generateWeeks(): AcademicWeekInfo[] {
  const weeks: AcademicWeekInfo[] = [];

  // HK1: 18 weeks (from Monday 2026-09-07)
  const hk1Start = new Date('2026-09-07T00:00:00');
  for (let i = 0; i < 18; i++) {
    const s = new Date(hk1Start);
    s.setDate(s.getDate() + i * 7);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);

    const sStr = s.toISOString().split('T')[0];
    const eStr = e.toISOString().split('T')[0];
    const sFormatted = `${s.getDate().toString().padStart(2, '0')}/${(s.getMonth() + 1).toString().padStart(2, '0')}`;
    const eFormatted = `${e.getDate().toString().padStart(2, '0')}/${(e.getMonth() + 1).toString().padStart(2, '0')}`;

    let theme = '';
    let isExamWeek = false;
    if (i === 0) theme = 'Khai giảng & Ổn định nề nếp';
    else if (i === 10) theme = 'Chào mừng 20/11 - Ngày Nhà giáo VN';
    else if (i === 16) { theme = 'Ôn tập & Kiểm tra cuối HK1'; isExamWeek = true; }
    else if (i === 17) { theme = 'Tổng kết thi đua Học kỳ I'; isExamWeek = true; }

    weeks.push({
      weekNumber: i + 1,
      semester: 1,
      semesterWeekNumber: i + 1,
      startDate: sStr,
      endDate: eStr,
      label: `Tuần ${i + 1}`,
      shortDateRange: `${sFormatted} - ${eFormatted}`,
      theme,
      isExamWeek
    });
  }

  // HK2: 17 weeks (from Monday 2027-01-11, with 2 weeks Tet break around Feb 1 - Feb 14)
  const hk2Start = new Date('2027-01-11T00:00:00');
  let currentStart = new Date(hk2Start);

  for (let i = 0; i < 17; i++) {
    // If we reach Tet break period (after 3 weeks in Jan):
    if (i === 3) {
      // Add 2 weeks jump for Tet break
      currentStart = new Date('2027-02-15T00:00:00');
    }

    const s = new Date(currentStart);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);

    const sStr = s.toISOString().split('T')[0];
    const eStr = e.toISOString().split('T')[0];
    const sFormatted = `${s.getDate().toString().padStart(2, '0')}/${(s.getMonth() + 1).toString().padStart(2, '0')}`;
    const eFormatted = `${e.getDate().toString().padStart(2, '0')}/${(e.getMonth() + 1).toString().padStart(2, '0')}`;

    let theme = '';
    let isExamWeek = false;
    if (i === 0) theme = 'Khởi động Học kỳ II';
    else if (i === 7) theme = 'Chào mừng 26/3 - Ngày thành lập Đoàn';
    else if (i === 15) { theme = 'Ôn tập & Kiểm tra cuối HK2'; isExamWeek = true; }
    else if (i === 16) { theme = 'Tổng kết năm học 2026-2027'; isExamWeek = true; }

    weeks.push({
      weekNumber: 18 + i + 1,
      semester: 2,
      semesterWeekNumber: i + 1,
      startDate: sStr,
      endDate: eStr,
      label: `Tuần ${18 + i + 1}`,
      shortDateRange: `${sFormatted} - ${eFormatted}`,
      theme,
      isExamWeek
    });

    // Advance 7 days for next week
    currentStart.setDate(currentStart.getDate() + 7);
  }

  return weeks;
}

export const ACADEMIC_WEEKS: AcademicWeekInfo[] = generateWeeks();

export function getAcademicWeek(weekNumber: number): AcademicWeekInfo {
  const found = ACADEMIC_WEEKS.find(w => w.weekNumber === weekNumber);
  return found || ACADEMIC_WEEKS[0];
}

export function getCurrentAcademicWeek(now = new Date()): AcademicWeekInfo {
  const dateStr = now.toISOString().split('T')[0];
  const found = ACADEMIC_WEEKS.find(w => dateStr >= w.startDate && dateStr <= w.endDate);
  if (found) return found;
  // If before school starts or in early days, default to Week 1
  if (dateStr < ACADEMIC_START_DATE) return ACADEMIC_WEEKS[0];
  return ACADEMIC_WEEKS[0];
}
