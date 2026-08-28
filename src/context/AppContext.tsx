import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Student, 
  AttendanceRecord, 
  Announcement, 
  HomeroomDiary, 
  ClassMoment, 
  ClassDocument, 
  DutySchedule, 
  WeeklyTeamSubmission, 
  LeaveRequest, 
  EmulationScoreEntry,
  CriteriaRule
} from '../types';
import { 
  INITIAL_STUDENTS, 
  DEMO_USERS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_DUTY_SCHEDULE, 
  INITIAL_DIARIES, 
  INITIAL_MOMENTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_SUBMISSIONS 
} from '../data/mockData';
import { EMULATION_CRITERIA } from '../data/criteria';
import { loginWithUsernameOrEmail } from '../services/authService';
import {
  COLLECTIONS,
  initializeFirestoreDataIfEmpty,
  saveDocumentToFirestore,
  updateDocumentInFirestore,
  deleteDocumentFromFirestore,
  batchSaveToFirestore,
  subscribeToCollection,
} from '../services/firestoreService';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  students: Student[];
  criteria: CriteriaRule[];
  submissions: WeeklyTeamSubmission[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];
  diaries: HomeroomDiary[];
  moments: ClassMoment[];
  documents: ClassDocument[];
  dutySchedule: DutySchedule[];
  leaveRequests: LeaveRequest[];
  
  // Cloud & Firebase Firestore State
  isFirestoreLive: boolean;
  firebaseProjectId: string;
  syncAllToFirestoreNow: () => Promise<{ success: boolean; message: string }>;
  
  // Account & Credentials Management (GVCN)
  teacherCredentials: { username: string; password: string };
  updateTeacherCredentials: (username: string, password: string) => void;
  updateStudentCredentials: (studentId: string, studentPassword?: string, parentPassword?: string, studentCode?: string) => void;
  batchResetPasswords: (defaultStudentPass?: string, defaultParentPass?: string) => void;
  batchGenerateStudentCodes: (prefix?: string) => void;
  loginWithCredentials: (usernameOrCode: string, password: string, roleType: 'GVCN' | 'BCS' | 'STUDENT' | 'PARENT') => { success: boolean; message: string; user?: User };
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;

  // Actions
  loginAs: (userId: string) => void;
  updateUserAvatar: (newAvatarUrl: string, targetUserId?: string, targetStudentId?: string) => void;
  updateStudent: (student: Student) => void;
  addStudent: (student: Omit<Student, 'id' | 'currentScore' | 'baseScore'>) => void;
  deleteStudent: (studentId: string) => void;
  batchImportStudents: (importedStudents: Array<Omit<Student, 'id' | 'currentScore' | 'baseScore'> & { id?: string; baseScore?: number; currentScore?: number }>, mode?: 'append' | 'replace') => void;
  
  // Attendance
  recordAttendance: (date: string, studentId: string, status: 'PRESENT' | 'ABSENT_CP' | 'ABSENT_KP' | 'LATE', notes?: string) => void;
  
  // Emulation & Scoring
  addScoreEntryToSubmission: (teamId: number, week: number, entry: Omit<EmulationScoreEntry, 'id' | 'status' | 'week' | 'teamId'>) => void;
  deleteScoreEntry: (teamId: number, week: number, entryId: string) => void;
  applyTeamScoringNow: (teamId: number, week: number) => void;
  submitTeamScoresToTeacher: (teamId: number, week: number) => void;
  approveTeamSubmission: (submissionId: string, teacherFeedback?: string) => void;
  rejectTeamSubmission: (submissionId: string, teacherFeedback: string) => void;
  directScoreAdjustment: (studentId: string, pointsDelta: number, reason: string, criteriaTitle: string) => void;
  
  // Criteria Management (GVCN)
  addCriteria: (criteriaData: Omit<CriteriaRule, 'id'>) => void;
  updateCriteria: (criteriaRule: CriteriaRule) => void;
  deleteCriteria: (criteriaId: string) => void;
  resetCriteriaToDefault: () => void;
  
  // Announcements
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'readBy' | 'author'>) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (announcementId: string) => void;
  toggleImportantAnnouncement: (announcementId: string) => void;
  markAnnouncementAsRead: (announcementId: string) => void;
  
  // Diaries
  addDiary: (diary: Omit<HomeroomDiary, 'id' | 'createdAt'>) => void;
  
  // Moments
  toggleLikeMoment: (momentId: string) => void;
  addMomentComment: (momentId: string, content: string) => void;
  addMoment: (title: string, description: string, imageUrl: string) => void;
  
  // Documents
  addDocument: (doc: Omit<ClassDocument, 'id' | 'uploadedAt'>) => void;
  
  // Leave Requests
  createLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateLeaveRequestStatus: (requestId: string, status: 'APPROVED' | 'REJECTED', teacherNote?: string) => void;
  
  // Duty schedule
  updateDutySchedule: (day: string, tasks: string[], notes?: string) => void;
  
  // Reset demo data
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '11A3_CURRENT_USER',
  STUDENTS: '11A3_STUDENTS',
  SUBMISSIONS: '11A3_SUBMISSIONS',
  ATTENDANCE: '11A3_ATTENDANCE',
  ANNOUNCEMENTS: '11A3_ANNOUNCEMENTS',
  DIARIES: '11A3_DIARIES',
  MOMENTS: '11A3_MOMENTS',
  DOCUMENTS: '11A3_DOCUMENTS',
  SCHEDULE: '11A3_SCHEDULE',
  LEAVE_REQUESTS: '11A3_LEAVE_REQUESTS',
  CRITERIA: '11A3_CRITERIA',
  TEACHER_CREDENTIALS: '11A3_GVCN_CREDENTIALS',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // GVCN Credentials
  const [teacherCredentials, setTeacherCredentials] = useState<{ username: string; password: string }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_CREDENTIALS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return { username: 'thuyhao', password: 'thuyhao 88' };
  });

  // Initialize user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEMO_USERS[0]; // Default: GVCN Võ Thị Thúy Hào
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_STUDENTS.length) {
          // Normalize vocationalCourse and ensure default passwords exist
          return parsed.map((s: Student, idx: number) => {
            return {
              ...s,
              studentPassword: s.studentPassword || '123456',
              parentPassword: s.parentPassword || '123456',
              vocationalCourse: (s.vocationalCourse === 'Hàn' || s.vocationalCourse === 'Kế toán') 
                ? s.vocationalCourse 
                : (s.gender === 'Nữ' ? 'Kế toán' : 'Hàn')
            };
          });
        }
      } catch (e) { /* fallback */ }
    }
    return INITIAL_STUDENTS.map((s) => ({
      ...s,
      studentPassword: s.studentPassword || '123456',
      parentPassword: s.parentPassword || '123456',
    }));
  });

  // Submissions
  const [submissions, setSubmissions] = useState<WeeklyTeamSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SUBMISSIONS;
  });

  // Attendance Records (Generate default today's attendance if empty)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    const today = new Date().toISOString().split('T')[0];
    return INITIAL_STUDENTS.map((s, idx) => {
      let status: AttendanceRecord['status'] = 'PRESENT';
      if (s.id === 'hs-14') status = 'ABSENT_CP'; // Tuấn vắng có phép
      else if (s.id === 'hs-24') status = 'LATE'; // Long đi trễ
      else if (s.id === 'hs-06' && idx % 10 === 0) status = 'ABSENT_KP';
      return {
        id: `att-${s.id}-${today}`,
        date: today,
        studentId: s.id,
        status,
        recordedBy: 'Trần Minh Khang (Lớp phó Lao động)',
      };
    });
  });

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // Diaries
  const [diaries, setDiaries] = useState<HomeroomDiary[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIARIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DIARIES;
  });

  // Moments
  const [moments, setMoments] = useState<ClassMoment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MOMENTS;
  });

  // Documents
  const [documents, setDocuments] = useState<ClassDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DOCUMENTS;
  });

  // Duty Schedule
  const [dutySchedule, setDutySchedule] = useState<DutySchedule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_DUTY_SCHEDULE;
  });

  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_LEAVE_REQUESTS;
  });

  // Criteria
  const [criteria, setCriteria] = useState<CriteriaRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CRITERIA);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return EMULATION_CRITERIA;
  });

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(diaries));
  }, [diaries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(moments));
  }, [moments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(dutySchedule));
  }, [dutySchedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_CREDENTIALS, JSON.stringify(teacherCredentials));
  }, [teacherCredentials]);

  // Cloud Firestore Real-time synchronization state
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(true);
  const firebaseProjectId = 'gvcn20262027';

  // 1. Initialize Firestore collections and real-time listeners for the new project
  useEffect(() => {
    let unsubscribeList: (() => void)[] = [];

    async function initAndSubscribe() {
      try {
        // Auto-seed Firestore if collections are empty in gvcn20262027
        await initializeFirestoreDataIfEmpty({
          students,
          submissions,
          attendanceRecords,
          announcements,
          diaries,
          moments,
          documents,
          dutySchedule,
          leaveRequests,
          criteria,
          teacherCredentials,
        });

        // Setup real-time listeners for all 10 collections
        const unsubStudents = subscribeToCollection<Student>(COLLECTIONS.STUDENTS, (data) => {
          if (data && data.length > 0) {
            setStudents(data);
          }
        });
        unsubscribeList.push(unsubStudents);

        const unsubSubs = subscribeToCollection<WeeklyTeamSubmission>(COLLECTIONS.SUBMISSIONS, (data) => {
          if (data && data.length > 0) {
            setSubmissions(data);
          }
        });
        unsubscribeList.push(unsubSubs);

        const unsubAtt = subscribeToCollection<AttendanceRecord>(COLLECTIONS.ATTENDANCE, (data) => {
          if (data && data.length > 0) {
            setAttendanceRecords(data);
          }
        });
        unsubscribeList.push(unsubAtt);

        const unsubAnn = subscribeToCollection<Announcement>(COLLECTIONS.ANNOUNCEMENTS, (data) => {
          if (data && data.length > 0) {
            setAnnouncements(data);
          }
        });
        unsubscribeList.push(unsubAnn);

        const unsubDiaries = subscribeToCollection<HomeroomDiary>(COLLECTIONS.DIARIES, (data) => {
          if (data && data.length > 0) {
            setDiaries(data);
          }
        });
        unsubscribeList.push(unsubDiaries);

        const unsubMoments = subscribeToCollection<ClassMoment>(COLLECTIONS.MOMENTS, (data) => {
          if (data && data.length > 0) {
            setMoments(data);
          }
        });
        unsubscribeList.push(unsubMoments);

        const unsubDocs = subscribeToCollection<ClassDocument>(COLLECTIONS.DOCUMENTS, (data) => {
          if (data && data.length > 0) {
            setDocuments(data);
          }
        });
        unsubscribeList.push(unsubDocs);

        const unsubDuty = subscribeToCollection<DutySchedule>(COLLECTIONS.DUTY_SCHEDULES, (data) => {
          if (data && data.length > 0) {
            setDutySchedule(data);
          }
        });
        unsubscribeList.push(unsubDuty);

        const unsubLeaves = subscribeToCollection<LeaveRequest>(COLLECTIONS.LEAVE_REQUESTS, (data) => {
          if (data && data.length > 0) {
            setLeaveRequests(data);
          }
        });
        unsubscribeList.push(unsubLeaves);

        const unsubCriteria = subscribeToCollection<CriteriaRule>(COLLECTIONS.CRITERIA, (data) => {
          if (data && data.length > 0) {
            setCriteria(data);
          }
        });
        unsubscribeList.push(unsubCriteria);

        setIsFirestoreLive(true);
      } catch (err) {
        console.warn('Lỗi kết nối đồng bộ Firestore:', err);
        setIsFirestoreLive(false);
      }
    }

    initAndSubscribe();

    return () => {
      unsubscribeList.forEach(unsub => unsub());
    };
  }, []);

  // Force push all local data to Firestore
  const syncAllToFirestoreNow = async (): Promise<{ success: boolean; message: string }> => {
    try {
      await batchSaveToFirestore(COLLECTIONS.STUDENTS, students);
      await batchSaveToFirestore(COLLECTIONS.SUBMISSIONS, submissions);
      await batchSaveToFirestore(COLLECTIONS.ATTENDANCE, attendanceRecords);
      await batchSaveToFirestore(COLLECTIONS.ANNOUNCEMENTS, announcements);
      await batchSaveToFirestore(COLLECTIONS.DIARIES, diaries);
      await batchSaveToFirestore(COLLECTIONS.MOMENTS, moments);
      await batchSaveToFirestore(COLLECTIONS.DOCUMENTS, documents);
      await batchSaveToFirestore(COLLECTIONS.DUTY_SCHEDULES, dutySchedule);
      await batchSaveToFirestore(COLLECTIONS.LEAVE_REQUESTS, leaveRequests);
      await batchSaveToFirestore(COLLECTIONS.CRITERIA, criteria);
      await saveDocumentToFirestore(COLLECTIONS.SETTINGS, {
        id: 'class_11a3_config',
        teacherCredentials,
        updatedAt: new Date().toISOString(),
      });
      setIsFirestoreLive(true);
      return { 
        success: true, 
        message: 'Đã đồng bộ toàn bộ 41 học sinh & dữ liệu lớp 11A3 lên dự án Firebase gvcn20262027 thành công!' 
      };
    } catch (err: any) {
      return { success: false, message: `Lỗi đồng bộ Firestore: ${err.message}` };
    }
  };

  // Update GVCN credentials
  const updateTeacherCredentials = (username: string, password: string) => {
    setTeacherCredentials({ username, password });
    saveDocumentToFirestore(COLLECTIONS.SETTINGS, {
      id: 'class_11a3_config',
      teacherCredentials: { username, password },
      updatedAt: new Date().toISOString(),
    });
  };

  // Update credentials for a specific student
  const updateStudentCredentials = (
    studentId: string, 
    studentPassword?: string, 
    parentPassword?: string, 
    studentCode?: string
  ) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          code: studentCode !== undefined ? studentCode.trim() : s.code,
          studentPassword: studentPassword !== undefined ? studentPassword : (s.studentPassword || '123456'),
          parentPassword: parentPassword !== undefined ? parentPassword : (s.parentPassword || '123456'),
        };
        saveDocumentToFirestore(COLLECTIONS.STUDENTS, updated);
        return updated;
      }
      return s;
    }));
  };

  // Batch reset student & parent passwords to default
  const batchResetPasswords = (defaultStudentPass = '123456', defaultParentPass = '123456') => {
    const updated = students.map(s => ({
      ...s,
      studentPassword: defaultStudentPass,
      parentPassword: defaultParentPass,
    }));
    setStudents(updated);
    batchSaveToFirestore(COLLECTIONS.STUDENTS, updated);
  };

  // Batch generate / normalize student codes (e.g. 2411A801 -> 2411A841)
  const batchGenerateStudentCodes = (prefix = '2411A8') => {
    const updated = students.map((s, idx) => ({
      ...s,
      code: `${prefix}${String(idx + 1).padStart(2, '0')}`,
    }));
    setStudents(updated);
    batchSaveToFirestore(COLLECTIONS.STUDENTS, updated);
  };

  // Flexible login with username/code & password
  const loginWithCredentials = (
    usernameOrCode: string, 
    password: string, 
    roleType: 'GVCN' | 'BCS' | 'STUDENT' | 'PARENT'
  ): { success: boolean; message: string; user?: User } => {
    const rawInput = usernameOrCode.trim();
    const cleanInput = rawInput.toLowerCase();
    const alphanumericInput = rawInput.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // 1. GVCN Login
    if (roleType === 'GVCN') {
      const isTeacherUser = 
        cleanInput === teacherCredentials.username.toLowerCase() || 
        cleanInput === 'thuyhao' || 
        cleanInput === 'gvcn_thuyhao' ||
        cleanInput === 'vothithuyhao88@gmail.com' ||
        cleanInput === 'vothithuyhao@annhon.edu.vn';

      const isTeacherPass = 
        password.trim() === teacherCredentials.password.trim() || 
        password.replace(/\s+/g, '') === teacherCredentials.password.replace(/\s+/g, '') ||
        password.trim() === 'thuyhao 88' ||
        password.trim() === 'thuyhao88' ||
        password.replace(/\s+/g, '') === 'thuyhao88';
      
      if (isTeacherUser && isTeacherPass) {
        const gvcnUser = DEMO_USERS.find(u => u.role === 'GVCN') || DEMO_USERS[0];
        
        let customAvatar = gvcnUser.avatar;
        try {
          const userAvatarsRaw = localStorage.getItem('11A3_USER_AVATARS');
          if (userAvatarsRaw) {
            const userAvatars = JSON.parse(userAvatarsRaw);
            if (userAvatars[gvcnUser.id]) customAvatar = userAvatars[gvcnUser.id];
          }
        } catch (e) {}

        const userObj: User = {
          ...gvcnUser,
          username: teacherCredentials.username || 'thuyhao',
          avatar: customAvatar || gvcnUser.avatar,
        };
        setCurrentUser(userObj);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
        return { success: true, message: `Chào mừng Giáo viên chủ nhiệm Võ Thị Thúy Hào!`, user: userObj };
      }
      return { 
        success: false, 
        message: `Tên đăng nhập hoặc mật khẩu GVCN không chính xác! (Mặc định: thuyhao / thuyhao 88)` 
      };
    }

    // 2. Student or Cadre (BCS) Login
    if (roleType === 'STUDENT' || roleType === 'BCS') {
      // Find student by code, id, or username
      const student = students.find(s => {
        const sCodeClean = (s.code || '').trim().toLowerCase();
        const sCodeAlpha = (s.code || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const sId = (s.id || '').toLowerCase();
        return sCodeClean === cleanInput || 
               sCodeAlpha === alphanumericInput || 
               sId === cleanInput ||
               cleanInput === `hs-${s.code.toLowerCase()}` ||
               cleanInput === `2411a8${s.code.replace(/[^0-9]/g, '')}` ||
               cleanInput === `11a3-${s.code.replace(/[^0-9]/g, '')}`;
      }) || DEMO_USERS.find(u => u.username?.toLowerCase() === cleanInput && u.studentId)?.studentId 
         ? students.find(s => s.id === DEMO_USERS.find(u => u.username?.toLowerCase() === cleanInput)?.studentId)
         : undefined;

      if (!student) {
        return { 
          success: false, 
          message: `Không tìm thấy tài khoản học sinh có mã "${rawInput}". Vui lòng kiểm tra lại mã học sinh!` 
        };
      }

      const expectedPass = student.studentPassword || '123456';
      if (password !== expectedPass && password !== '123456') {
        return { 
          success: false, 
          message: `Mật khẩu học sinh không chính xác! (Mật khẩu mặc định là: 123456 hoặc liên hệ GVCN cấp lại)` 
        };
      }

      // Check custom avatar
      let customAvatar = student.avatar;
      try {
        const userAvatarsRaw = localStorage.getItem('11A3_USER_AVATARS');
        if (userAvatarsRaw) {
          const userAvatars = JSON.parse(userAvatarsRaw);
          if (userAvatars[student.id]) customAvatar = userAvatars[student.id];
        }
      } catch (e) {}

      // Form user object
      const isLeader = student.position && student.position !== 'THÀNH VIÊN';
      const userObj: User = {
        id: `user-${student.id}`,
        username: student.code,
        fullName: student.fullName,
        role: 'STUDENT',
        position: student.position,
        teamId: student.teamId,
        studentId: student.id,
        avatar: customAvatar || student.avatar,
        phone: student.phone,
      };

      setCurrentUser(userObj);
      return { 
        success: true, 
        message: isLeader 
          ? `Đăng nhập thành công Cán sự ${student.fullName} (${student.position})!`
          : `Đăng nhập thành công học sinh ${student.fullName} (Tổ ${student.teamId})!`, 
        user: userObj 
      };
    }

    // 3. Parent (PHHS) Login
    if (roleType === 'PARENT') {
      const student = students.find(s => {
        const sCodeClean = (s.code || '').trim().toLowerCase();
        const sCodeAlpha = (s.code || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const sId = (s.id || '').toLowerCase();
        return sCodeClean === cleanInput || 
               sCodeAlpha === alphanumericInput || 
               sId === cleanInput ||
               cleanInput === `hs-${s.code.toLowerCase()}` ||
               cleanInput === `2411a8${s.code.replace(/[^0-9]/g, '')}` ||
               cleanInput === `11a3-${s.code.replace(/[^0-9]/g, '')}`;
      });

      if (!student) {
        return { 
          success: false, 
          message: `Không tìm thấy học sinh có mã "${rawInput}". Phụ huynh vui lòng nhập đúng Mã học sinh của con em mình!` 
        };
      }

      const expectedPass = student.parentPassword || '123456';
      if (password !== expectedPass && password !== '123456') {
        return { 
          success: false, 
          message: `Mật khẩu phụ huynh không chính xác! (Mật khẩu mặc định: 123456 hoặc liên hệ GVCN cấp lại)` 
        };
      }

      const parentTitle = student.parentName 
        ? `${student.parentRelationship} ${student.parentName} (PH em ${student.fullName})` 
        : `Phụ huynh em ${student.fullName}`;

      const userObj: User = {
        id: `user-parent-${student.id}`,
        username: `ph_${student.code}`,
        fullName: parentTitle,
        role: 'PARENT',
        studentId: student.id,
        teamId: student.teamId,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        phone: student.parentPhone,
      };

      setCurrentUser(userObj);
      return { 
        success: true, 
        message: `Đăng nhập thành công Sổ liên lạc Phụ huynh của học sinh ${student.fullName}!`, 
        user: userObj 
      };
    }

    return { success: false, message: 'Vai trò đăng nhập không hợp lệ!' };
  };

  // Universal Login function supporting GVCN (thuyhao / thuyhao 88), Student (MaHS/123456), Parent, and Firebase Auth
  const login = async (
    identifier: string, 
    password: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();
    const alphaId = rawId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const cleanPass = password.trim();
    const alphaPass = cleanPass.replace(/\s+/g, '');

    // 1. Kiểm tra tài khoản GVCN (Cô Võ Thị Thúy Hào)
    const teacherUserClean = (teacherCredentials.username || 'thuyhao').trim().toLowerCase();
    const teacherPassClean = (teacherCredentials.password || 'thuyhao 88').trim();
    const teacherPassAlpha = teacherPassClean.replace(/\s+/g, '');

    const isTeacherUser = 
      cleanId === teacherUserClean || 
      cleanId === 'thuyhao' || 
      cleanId === 'gvcn_thuyhao' ||
      cleanId === 'thuyhao88' ||
      cleanId === 'vothithuyhao88@gmail.com' ||
      cleanId === 'vothithuyhao@annhon.edu.vn';

    const isTeacherPass = 
      cleanPass === teacherPassClean ||
      alphaPass === teacherPassAlpha ||
      cleanPass === 'thuyhao 88' ||
      cleanPass === 'thuyhao88' ||
      alphaPass === 'thuyhao88';

    if (isTeacherUser && isTeacherPass) {
      const gvcnUser = DEMO_USERS.find(u => u.role === 'GVCN') || DEMO_USERS[0];
      let customAvatar = gvcnUser.avatar;
      try {
        const userAvatarsRaw = localStorage.getItem('11A3_USER_AVATARS');
        if (userAvatarsRaw) {
          const userAvatars = JSON.parse(userAvatarsRaw);
          if (userAvatars[gvcnUser.id]) customAvatar = userAvatars[gvcnUser.id];
        }
      } catch (e) {}

      const userObj: User = {
        ...gvcnUser,
        username: teacherCredentials.username || 'thuyhao',
        avatar: customAvatar || gvcnUser.avatar,
      };
      setCurrentUser(userObj);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
      return { 
        success: true, 
        message: 'Đăng nhập thành công! Chào mừng Giáo viên chủ nhiệm Cô Võ Thị Thúy Hào.', 
        user: userObj 
      };
    }

    // 2. Kiểm tra tài khoản Học sinh / Ban Cán Sự (BCS)
    const student = students.find(s => {
      const sCodeClean = (s.code || '').trim().toLowerCase();
      const sCodeAlpha = (s.code || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      return sCodeClean === cleanId || 
             sCodeAlpha === alphaId || 
             sId === cleanId ||
             cleanId === `hs-${s.code.toLowerCase()}` ||
             cleanId === `2411a8${s.code.replace(/[^0-9]/g, '')}` ||
             cleanId === `11a3-${s.code.replace(/[^0-9]/g, '')}`;
    }) || (DEMO_USERS.find(u => u.username?.toLowerCase() === cleanId && u.studentId)
          ? students.find(s => s.id === DEMO_USERS.find(u => u.username?.toLowerCase() === cleanId)?.studentId)
          : undefined);

    if (student) {
      const expectedPass = student.studentPassword || '123456';
      if (cleanPass === expectedPass || cleanPass === '123456') {
        let customAvatar = student.avatar;
        try {
          const userAvatarsRaw = localStorage.getItem('11A3_USER_AVATARS');
          if (userAvatarsRaw) {
            const userAvatars = JSON.parse(userAvatarsRaw);
            if (userAvatars[student.id]) customAvatar = userAvatars[student.id];
          }
        } catch (e) {}

        const isLeader = student.position && student.position !== 'THÀNH VIÊN';
        const userObj: User = {
          id: `user-${student.id}`,
          username: student.code,
          fullName: student.fullName,
          role: 'STUDENT',
          position: student.position,
          teamId: student.teamId,
          studentId: student.id,
          avatar: customAvatar || student.avatar,
          phone: student.phone,
        };

        setCurrentUser(userObj);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
        return { 
          success: true, 
          message: isLeader 
            ? `Đăng nhập thành công Cán sự ${student.fullName} (${student.position})!`
            : `Đăng nhập thành công học sinh ${student.fullName} (Tổ ${student.teamId})!`, 
          user: userObj 
        };
      }
    }

    // 3. Kiểm tra tài khoản Phụ Huynh (PHHS)
    const parentStudent = students.find(s => {
      const sCodeClean = (s.code || '').trim().toLowerCase();
      const sCodeAlpha = (s.code || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      return cleanId === `ph_${sCodeClean}` ||
             cleanId === `ph_${sCodeAlpha}` ||
             sCodeClean === cleanId || 
             sCodeAlpha === alphaId || 
             sId === cleanId;
    });

    if (parentStudent) {
      const expectedParentPass = parentStudent.parentPassword || '123456';
      if (cleanPass === expectedParentPass || cleanPass === '123456') {
        const parentTitle = parentStudent.parentName 
          ? `${parentStudent.parentRelationship} ${parentStudent.parentName} (PH em ${parentStudent.fullName})` 
          : `Phụ huynh em ${parentStudent.fullName}`;

        const userObj: User = {
          id: `user-parent-${parentStudent.id}`,
          username: `ph_${parentStudent.code}`,
          fullName: parentTitle,
          role: 'PARENT',
          studentId: parentStudent.id,
          teamId: parentStudent.teamId,
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          phone: parentStudent.parentPhone,
        };

        setCurrentUser(userObj);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
        return { 
          success: true, 
          message: `Đăng nhập thành công Sổ liên lạc Phụ huynh của học sinh ${parentStudent.fullName}!`, 
          user: userObj 
        };
      }
    }

    // 4. Thử đăng nhập qua Firebase Authentication
    try {
      const fbResult = await loginWithUsernameOrEmail(rawId, cleanPass);
      if (fbResult.success && fbResult.user) {
        const userObj: User = fbResult.user;
        setCurrentUser(userObj);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
        return {
          success: true,
          message: fbResult.message || 'Đăng nhập thành công qua Firebase Auth!',
          user: userObj,
        };
      }
    } catch (fbErr) {
      console.warn('Firebase Auth login fallback:', fbErr);
    }

    return { 
      success: false, 
      message: 'Tên đăng nhập hoặc mật khẩu không chính xác! (GVCN: thuyhao / thuyhao 88, Học sinh/PH: Mã HS / 123456)' 
    };
  };

  // Login handler
  const loginAs = (userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      let customAvatar = found.avatar;
      try {
        const userAvatarsRaw = localStorage.getItem('11A3_USER_AVATARS');
        if (userAvatarsRaw) {
          const userAvatars = JSON.parse(userAvatarsRaw);
          if (userAvatars[userId]) {
            customAvatar = userAvatars[userId];
          }
        }
      } catch (e) {}

      // If student, check if student in students list has custom avatar
      if (found.studentId) {
        const stud = students.find(s => s.id === found.studentId);
        if (stud?.avatar) {
          customAvatar = stud.avatar;
        }
      }

      setCurrentUser({
        ...found,
        avatar: customAvatar || found.avatar
      });
    }
  };

  // Avatar Management for all roles & students
  const updateUserAvatar = (newAvatarUrl: string, targetUserId?: string, targetStudentId?: string) => {
    const userIdToUpdate = targetUserId || currentUser.id;

    // 1. Update currentUser if matching
    if (currentUser.id === userIdToUpdate || (currentUser.studentId && currentUser.studentId === targetStudentId)) {
      setCurrentUser(prev => ({ ...prev, avatar: newAvatarUrl }));
    }

    // 2. Persist in custom user avatars map in localStorage
    try {
      const userAvatarsRaw = localStorage.getItem('11A3_USER_AVATARS');
      const userAvatars = userAvatarsRaw ? JSON.parse(userAvatarsRaw) : {};
      userAvatars[userIdToUpdate] = newAvatarUrl;
      localStorage.setItem('11A3_USER_AVATARS', JSON.stringify(userAvatars));
    } catch (e) {}

    // 3. Find if there is a linked student ID
    let studentIdToUpdate = targetStudentId;
    if (!studentIdToUpdate) {
      if (currentUser.id === userIdToUpdate && currentUser.studentId) {
        studentIdToUpdate = currentUser.studentId;
      } else {
        const demoUser = DEMO_USERS.find(u => u.id === userIdToUpdate);
        if (demoUser?.studentId) {
          studentIdToUpdate = demoUser.studentId;
        }
      }
    }

    // 4. Update student record in students array
    if (studentIdToUpdate) {
      setStudents(prev => prev.map(s => s.id === studentIdToUpdate ? { ...s, avatar: newAvatarUrl } : s));
    }
  };

  // Student operations
  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    saveDocumentToFirestore(COLLECTIONS.STUDENTS, updatedStudent);
  };

  const addStudent = (newStud: Omit<Student, 'id' | 'currentScore' | 'baseScore'>) => {
    const id = `hs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const student: Student = {
      ...newStud,
      id,
      baseScore: 100,
      currentScore: 100,
    };
    setStudents(prev => [...prev, student]);
    saveDocumentToFirestore(COLLECTIONS.STUDENTS, student);
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    deleteDocumentFromFirestore(COLLECTIONS.STUDENTS, studentId);
  };

  const batchImportStudents = (
    importedList: Array<Omit<Student, 'id' | 'currentScore' | 'baseScore'> & { id?: string; baseScore?: number; currentScore?: number }>,
    mode: 'append' | 'replace' = 'append'
  ) => {
    const timestamp = Date.now();
    const formatted: Student[] = importedList.map((item, index) => {
      const id = item.id || `hs-${timestamp}-${index + 1}`;
      return {
        id,
        code: item.code || `11A3-${String(index + 1).padStart(2, '0')}`,
        fullName: item.fullName,
        gender: item.gender || 'Nam',
        dob: item.dob || '2009-01-01',
        address: item.address || 'TX. An Nhơn, Tỉnh Bình Định',
        phone: item.phone || '',
        teamId: item.teamId || 1,
        position: item.position || 'THÀNH VIÊN',
        parentName: item.parentName || '',
        parentPhone: item.parentPhone || '',
        parentRelationship: item.parentRelationship || 'Bố',
        vocationalCourse: item.vocationalCourse || (item.gender === 'Nữ' ? 'Kế toán' : 'Hàn'),
        baseScore: item.baseScore ?? 100,
        currentScore: item.currentScore ?? (item.baseScore ?? 100),
        avatar: item.avatar || (item.gender === 'Nữ' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' 
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'),
        notes: item.notes || '',
        attentionFlag: item.attentionFlag || false,
      };
    });

    if (mode === 'replace') {
      setStudents(formatted);
      batchSaveToFirestore(COLLECTIONS.STUDENTS, formatted);
    } else {
      // Append or merge by student code / fullName if existing
      setStudents(prev => {
        const merged = [...prev];
        for (const newStudent of formatted) {
          const existIdx = merged.findIndex(s => 
            (newStudent.code && s.code.toLowerCase() === newStudent.code.toLowerCase()) || 
            (s.fullName.trim().toLowerCase() === newStudent.fullName.trim().toLowerCase())
          );
          if (existIdx >= 0) {
            merged[existIdx] = { ...merged[existIdx], ...newStudent, id: merged[existIdx].id };
          } else {
            merged.push(newStudent);
          }
        }
        batchSaveToFirestore(COLLECTIONS.STUDENTS, merged);
        return merged;
      });
    }
  };

  // Attendance operations
  const recordAttendance = (date: string, studentId: string, status: 'PRESENT' | 'ABSENT_CP' | 'ABSENT_KP' | 'LATE', notes?: string) => {
    const record: AttendanceRecord = {
      id: `att-${studentId}-${date}`,
      date,
      studentId,
      status,
      notes,
      recordedBy: currentUser.fullName,
    };

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(a => a.date === date && a.studentId === studentId);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = record;
        return next;
      }
      return [...prev, record];
    });

    saveDocumentToFirestore(COLLECTIONS.ATTENDANCE, record);
  };

  // Team Scoring & Emulation Workflow (Tổ trưởng chấm điểm -> Cập nhật thang điểm & xếp loại -> Gửi GVCN duyệt)
  const addScoreEntryToSubmission = (
    teamId: number, 
    week: number, 
    entry: Omit<EmulationScoreEntry, 'id' | 'status' | 'week' | 'teamId'>
  ) => {
    const newEntry: EmulationScoreEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      week,
      teamId,
      status: 'PENDING',
    };

    setSubmissions(prev => {
      const subIdx = prev.findIndex(s => s.week === week && s.teamId === teamId);
      let updatedSub: WeeklyTeamSubmission;
      if (subIdx >= 0) {
        const updated = [...prev];
        const currentSub = updated[subIdx];
        updatedSub = {
          ...currentSub,
          status: 'DRAFT', // Remains draft until explicitly sent to teacher
          entries: [...currentSub.entries, newEntry],
        };
        updated[subIdx] = updatedSub;
        saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, updatedSub);
        return updated;
      } else {
        updatedSub = {
          id: `sub-team-${teamId}-w${week}`,
          week,
          teamId,
          teamLeaderId: currentUser.studentId || currentUser.id,
          teamLeaderName: currentUser.fullName,
          status: 'DRAFT',
          entries: [newEntry],
        };
        saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, updatedSub);
        return [...prev, updatedSub];
      }
    });

    // Cập nhật ngay điểm thi đua cho học sinh để hiển thị thang điểm và xếp loại tức thì
    setStudents(prev => prev.map(s => {
      if (s.id === entry.studentId) {
        const updated = {
          ...s,
          currentScore: Math.max(0, s.currentScore + entry.pointsDelta),
        };
        saveDocumentToFirestore(COLLECTIONS.STUDENTS, updated);
        return updated;
      }
      return s;
    }));
  };

  const deleteScoreEntry = (teamId: number, week: number, entryId: string) => {
    let removedDelta = 0;
    let targetStudentId = '';

    setSubmissions(prev => {
      return prev.map(sub => {
        if (sub.teamId === teamId && sub.week === week) {
          const entryToRemove = sub.entries.find(e => e.id === entryId);
          if (entryToRemove) {
            removedDelta = entryToRemove.pointsDelta;
            targetStudentId = entryToRemove.studentId;
          }
          const updatedSub = {
            ...sub,
            entries: sub.entries.filter(e => e.id !== entryId),
          };
          saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, updatedSub);
          return updatedSub;
        }
        return sub;
      });
    });

    // Revert the points for the student
    if (targetStudentId) {
      setStudents(prev => prev.map(s => {
        if (s.id === targetStudentId) {
          const updated = {
            ...s,
            currentScore: Math.max(0, s.currentScore - removedDelta),
          };
          saveDocumentToFirestore(COLLECTIONS.STUDENTS, updated);
          return updated;
        }
        return s;
      }));
    }
  };

  // Cập nhật lại toàn bộ thang điểm và xếp loại cho thành viên tổ
  const applyTeamScoringNow = (teamId: number, week: number) => {
    const sub = submissions.find(s => s.week === week && s.teamId === teamId);
    if (!sub) return;

    // Recalculate based on baseScore (100) + entries
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.teamId === teamId) {
          const studentEntries = sub.entries.filter(e => e.studentId === s.id);
          const totalDelta = studentEntries.reduce((sum, e) => sum + e.pointsDelta, 0);
          return {
            ...s,
            currentScore: Math.max(0, s.baseScore + totalDelta),
          };
        }
        return s;
      });
      batchSaveToFirestore(COLLECTIONS.STUDENTS, next);
      return next;
    });
  };

  const submitTeamScoresToTeacher = (teamId: number, week: number) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.week === week && sub.teamId === teamId) {
        const updated = {
          ...sub,
          status: 'PENDING' as const,
          submittedAt: new Date().toISOString(),
        };
        saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, updated);
        return updated;
      }
      return sub;
    }));
  };

  // GVCN Approves Submission -> Apply points to students
  const approveTeamSubmission = (submissionId: string, teacherFeedback?: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const now = new Date().toISOString();

    // 1. Update submission status
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        const updated = {
          ...s,
          status: 'APPROVED' as const,
          reviewedAt: now,
          teacherFeedback: teacherFeedback || 'Đã duyệt bảng chấm điểm thi đua tổ.',
          entries: s.entries.map(e => ({
            ...e,
            status: 'APPROVED' as const,
            approvedAt: now,
            approvedBy: currentUser.fullName,
          })),
        };
        saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, updated);
        return updated;
      }
      return s;
    }));

    // 2. Recalculate student scores based on approved entries
    setStudents(prev => {
      const next = [...prev];
      sub.entries.forEach(entry => {
        const sIndex = next.findIndex(st => st.id === entry.studentId);
        if (sIndex >= 0) {
          next[sIndex] = {
            ...next[sIndex],
            currentScore: Math.max(0, next[sIndex].currentScore + entry.pointsDelta),
          };
          saveDocumentToFirestore(COLLECTIONS.STUDENTS, next[sIndex]);
        }
      });
      return next;
    });
  };

  const rejectTeamSubmission = (submissionId: string, teacherFeedback: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        const updated = {
          ...s,
          status: 'REJECTED' as const,
          reviewedAt: new Date().toISOString(),
          teacherFeedback,
          entries: s.entries.map(e => ({
            ...e,
            status: 'REJECTED' as const,
          })),
        };
        saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, updated);
        return updated;
      }
      return s;
    }));
  };

  // Direct Teacher adjustment
  const directScoreAdjustment = (studentId: string, pointsDelta: number, reason: string, criteriaTitle: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          currentScore: Math.max(0, s.currentScore + pointsDelta),
        };
        saveDocumentToFirestore(COLLECTIONS.STUDENTS, updated);
        return updated;
      }
      return s;
    }));

    // Log directly as approved entry
    const student = students.find(s => s.id === studentId);
    if (student) {
      const approvedEntry: EmulationScoreEntry = {
        id: `direct-${Date.now()}`,
        studentId,
        studentName: student.fullName,
        teamId: student.teamId,
        criteriaId: 'direct-adjustment',
        criteriaTitle: criteriaTitle || reason,
        pointsDelta,
        date: new Date().toISOString().split('T')[0],
        week: 1,
        recordedBy: currentUser.fullName,
        notes: `GVCN điều chỉnh trực tiếp: ${reason}`,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.fullName,
      };

      setSubmissions(prev => {
        const subIdx = prev.findIndex(s => s.week === 1 && s.teamId === student.teamId);
        if (subIdx >= 0) {
          const next = [...prev];
          next[subIdx] = {
            ...next[subIdx],
            entries: [...next[subIdx].entries, approvedEntry],
          };
          saveDocumentToFirestore(COLLECTIONS.SUBMISSIONS, next[subIdx]);
          return next;
        }
        return prev;
      });
    }
  };

  // Criteria Management (GVCN)
  const addCriteria = (newCrit: Omit<CriteriaRule, 'id'>) => {
    const id = `crit-${Date.now()}`;
    const item: CriteriaRule = {
      ...newCrit,
      id,
    };
    setCriteria(prev => [item, ...prev]);
    saveDocumentToFirestore(COLLECTIONS.CRITERIA, item);
  };

  const updateCriteria = (updatedCrit: CriteriaRule) => {
    setCriteria(prev => prev.map(c => c.id === updatedCrit.id ? updatedCrit : c));
    saveDocumentToFirestore(COLLECTIONS.CRITERIA, updatedCrit);
  };

  const deleteCriteria = (criteriaId: string) => {
    setCriteria(prev => prev.filter(c => c.id !== criteriaId));
    deleteDocumentFromFirestore(COLLECTIONS.CRITERIA, criteriaId);
  };

  const resetCriteriaToDefault = () => {
    setCriteria(EMULATION_CRITERIA);
    batchSaveToFirestore(COLLECTIONS.CRITERIA, EMULATION_CRITERIA);
  };

  // Announcements
  const createAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt' | 'readBy' | 'author'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: currentUser.fullName,
      readBy: [currentUser.id],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    saveDocumentToFirestore(COLLECTIONS.ANNOUNCEMENTS, newAnn);
  };

  const updateAnnouncement = (ann: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? ann : a));
    saveDocumentToFirestore(COLLECTIONS.ANNOUNCEMENTS, ann);
  };

  const deleteAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    deleteDocumentFromFirestore(COLLECTIONS.ANNOUNCEMENTS, announcementId);
  };

  const toggleImportantAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const updated = { ...a, important: !a.important };
        saveDocumentToFirestore(COLLECTIONS.ANNOUNCEMENTS, updated);
        return updated;
      }
      return a;
    }));
  };

  const markAnnouncementAsRead = (announcementId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId && !a.readBy.includes(currentUser.id)) {
        const updated = {
          ...a,
          readBy: [...a.readBy, currentUser.id],
        };
        saveDocumentToFirestore(COLLECTIONS.ANNOUNCEMENTS, updated);
        return updated;
      }
      return a;
    }));
  };

  // Homeroom Diaries
  const addDiary = (diary: Omit<HomeroomDiary, 'id' | 'createdAt'>) => {
    const newDiary: HomeroomDiary = {
      ...diary,
      id: `diary-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDiaries(prev => [newDiary, ...prev]);
    saveDocumentToFirestore(COLLECTIONS.DIARIES, newDiary);
  };

  // Moments
  const toggleLikeMoment = (momentId: string) => {
    setMoments(prev => prev.map(m => {
      if (m.id === momentId) {
        const hasLiked = m.likedBy.includes(currentUser.id);
        const likedBy = hasLiked 
          ? m.likedBy.filter(id => id !== currentUser.id)
          : [...m.likedBy, currentUser.id];
        const updated = {
          ...m,
          likes: likedBy.length,
          likedBy,
        };
        saveDocumentToFirestore(COLLECTIONS.MOMENTS, updated);
        return updated;
      }
      return m;
    }));
  };

  const addMomentComment = (momentId: string, content: string) => {
    setMoments(prev => prev.map(m => {
      if (m.id === momentId) {
        const updated = {
          ...m,
          comments: [
            ...m.comments,
            {
              id: `c-${Date.now()}`,
              userName: currentUser.fullName,
              userRole: (currentUser.role === 'GVCN' ? 'GVCN' : currentUser.role === 'PARENT' ? 'Phụ huynh' : 'Học sinh') as any,
              content,
              time: 'Vừa xong',
            }
          ]
        };
        saveDocumentToFirestore(COLLECTIONS.MOMENTS, updated);
        return updated;
      }
      return m;
    }));
  };

  const addMoment = (title: string, description: string, imageUrl: string) => {
    const newMoment: ClassMoment = {
      id: `moment-${Date.now()}`,
      title,
      description,
      imageUrl,
      date: new Date().toISOString().split('T')[0],
      author: currentUser.fullName,
      likes: 0,
      likedBy: [],
      comments: [],
    };
    setMoments(prev => [newMoment, ...prev]);
    saveDocumentToFirestore(COLLECTIONS.MOMENTS, newMoment);
  };

  // Documents
  const addDocument = (doc: Omit<ClassDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: ClassDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments(prev => [newDoc, ...prev]);
    saveDocumentToFirestore(COLLECTIONS.DOCUMENTS, newDoc);
  };

  // Leave Requests
  const createLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    saveDocumentToFirestore(COLLECTIONS.LEAVE_REQUESTS, newReq);
  };

  const updateLeaveRequestStatus = (requestId: string, status: 'APPROVED' | 'REJECTED', teacherNote?: string) => {
    setLeaveRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const updated = {
          ...r,
          status,
          teacherNote,
          reviewedAt: new Date().toISOString(),
        };
        saveDocumentToFirestore(COLLECTIONS.LEAVE_REQUESTS, updated);
        return updated;
      }
      return r;
    }));
  };

  // Duty Schedule
  const updateDutySchedule = (day: string, tasks: string[], notes?: string) => {
    setDutySchedule(prev => prev.map(d => {
      if (d.dayOfWeek === day) {
        const updated = { ...d, tasks, notes };
        saveDocumentToFirestore(COLLECTIONS.DUTY_SCHEDULES, updated);
        return updated;
      }
      return d;
    }));
  };

  // Reset to initial state
  const resetToDefault = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setCurrentUser(DEMO_USERS[0]);
    setSubmissions(INITIAL_SUBMISSIONS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setDiaries(INITIAL_DIARIES);
    setMoments(INITIAL_MOMENTS);
    setDocuments(INITIAL_DOCUMENTS);
    setDutySchedule(INITIAL_DUTY_SCHEDULE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setCriteria(EMULATION_CRITERIA);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      students,
      criteria,
      submissions,
      attendanceRecords,
      announcements,
      diaries,
      moments,
      documents,
      dutySchedule,
      leaveRequests,
      isFirestoreLive,
      firebaseProjectId,
      syncAllToFirestoreNow,
      teacherCredentials,
      updateTeacherCredentials,
      updateStudentCredentials,
      batchResetPasswords,
      batchGenerateStudentCodes,
      loginWithCredentials,
      login,
      loginAs,
      updateUserAvatar,
      updateStudent,
      addStudent,
      deleteStudent,
      batchImportStudents,
      recordAttendance,
      addScoreEntryToSubmission,
      deleteScoreEntry,
      applyTeamScoringNow,
      submitTeamScoresToTeacher,
      approveTeamSubmission,
      rejectTeamSubmission,
      directScoreAdjustment,
      addCriteria,
      updateCriteria,
      deleteCriteria,
      resetCriteriaToDefault,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      toggleImportantAnnouncement,
      markAnnouncementAsRead,
      addDiary,
      toggleLikeMoment,
      addMomentComment,
      addMoment,
      addDocument,
      createLeaveRequest,
      updateLeaveRequestStatus,
      updateDutySchedule,
      resetToDefault,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
