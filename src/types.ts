export type UserRole = 'GVCN' | 'STUDENT' | 'PARENT';

export type StudentPosition = 
  | 'LỚP TRƯỞNG'
  | 'LỚP PHÓ HỌC TẬP'
  | 'LỚP PHÓ LAO ĐỘNG - NỀ NẾP'
  | 'TỔ TRƯỞNG TỔ 1'
  | 'TỔ TRƯỞNG TỔ 2'
  | 'TỔ TRƯỞNG TỔ 3'
  | 'TỔ TRƯỞNG TỔ 4'
  | 'THÀNH VIÊN';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  studentId?: string; // For parents or students
  position?: StudentPosition;
  teamId?: number; // 1, 2, 3, 4
  phone?: string;
  email?: string;
}

export interface Student {
  id: string;
  code: string; // e.g. 11A3-01
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  address: string;
  phone: string;
  teamId: number; // 1, 2, 3, 4
  position: StudentPosition;
  parentName: string;
  parentPhone: string;
  parentRelationship: 'Bố' | 'Mẹ' | 'Người giám hộ';
  vocationalCourse: string; // 'Hàn' (Nam) | 'Kế toán' (Nữ)
  baseScore: number; // starting 100
  currentScore: number;
  avatar: string;
  notes?: string;
  attentionFlag?: boolean; // Học sinh cần quan tâm đặc biệt
  studentPassword?: string; // Mật khẩu học sinh (mặc định: 123456)
  parentPassword?: string;  // Mật khẩu phụ huynh (mặc định: 123456)
}

export interface CriteriaRule {
  id: string;
  code: string;
  category: 'CỘNG' | 'TRỪ';
  title: string;
  points: number; // positive or negative
  unit: string;
  description?: string;
}

export interface EmulationScoreEntry {
  id: string;
  studentId: string;
  studentName: string;
  teamId: number;
  criteriaId: string;
  criteriaTitle: string;
  pointsDelta: number;
  date: string;
  week: number;
  recordedBy: string; // User fullName & position
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  approvedBy?: string;
}

export interface WeeklyTeamSubmission {
  id: string;
  week: number;
  teamId: number;
  teamLeaderId: string;
  teamLeaderName: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  reviewedAt?: string;
  teacherFeedback?: string;
  entries: EmulationScoreEntry[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT_CP' | 'ABSENT_KP' | 'LATE';
  notes?: string;
  recordedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'CHUNG' | 'HỌC TẬP' | 'PHONG TRÀO' | 'HỌP PHỤ HUYNH' | 'BAN CÁN SỰ' | 'KHẨN' | 'NỀ NẾP' | string;
  targetAudience: 'ALL' | 'BCS' | 'PARENTS' | 'STUDENTS' | 'TEAM_1' | 'TEAM_2' | 'TEAM_3' | 'TEAM_4' | 'INDIVIDUAL';
  targetStudentId?: string;
  createdAt: string;
  author: string;
  attachments?: { name: string; size: string; url?: string }[];
  readBy: string[]; // User IDs who marked as read
  important?: boolean;
}

export interface HomeroomDiary {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'Học tập' | 'Nề nếp' | 'Khen thưởng - Kỷ luật' | 'Sự việc phát sinh' | 'Trao đổi PHHS' | 'Hoạt động trải nghiệm';
  involvedStudents?: string[];
  actionTaken?: string;
  images?: string[];
  createdAt: string;
}

export interface MessageItem {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface ChatThread {
  id: string;
  type: 'GVCN_STUDENT' | 'GVCN_PARENT' | 'GVCN_CADRES' | 'CLASS_GROUP';
  participantIds: string[];
  participantNames: string[];
  title: string;
  subtitle?: string;
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount: number;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestedBy: 'PARENT' | 'STUDENT';
  requesterName: string;
  requesterPhone: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  teacherNote?: string;
  reviewedAt?: string;
}

export interface ClassMoment {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  author: string;
  likes: number;
  likedBy: string[];
  comments: {
    id: string;
    userName: string;
    userRole: string;
    content: string;
    time: string;
  }[];
}

export interface ClassDocument {
  id: string;
  title: string;
  category: 'Thời khóa biểu' | 'Lịch học nghề' | 'Nội quy & Thi đua' | 'Tài liệu ôn tập' | 'Kế hoạch tuần/tháng';
  uploadedAt: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'link';
  downloadUrl?: string;
  description: string;
}

export interface DutySchedule {
  id?: string;
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  teamId: number;
  assignedLeader: string;
  tasks: string[];
  notes?: string;
}
