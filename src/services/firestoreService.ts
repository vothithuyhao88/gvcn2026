import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  User,
  Student,
  WeeklyTeamSubmission,
  AttendanceRecord,
  Announcement,
  HomeroomDiary,
  ClassMoment,
  ClassDocument,
  DutySchedule,
  LeaveRequest,
  CriteriaRule,
} from '../types';

// Collection Constants
export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  SUBMISSIONS: 'submissions',
  ANNOUNCEMENTS: 'announcements',
  DIARIES: 'diaries',
  MOMENTS: 'moments',
  DOCUMENTS: 'documents',
  DUTY_SCHEDULES: 'duty_schedules',
  LEAVE_REQUESTS: 'leave_requests',
  CRITERIA: 'criteria',
  SETTINGS: 'system_settings',
} as const;

/**
 * Kiểm tra kết nối Firestore và khởi tạo dữ liệu mẫu nếu Database Firestore còn rỗng
 */
export async function initializeFirestoreDataIfEmpty(initialData: {
  students: Student[];
  submissions: WeeklyTeamSubmission[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];
  diaries: HomeroomDiary[];
  moments: ClassMoment[];
  documents: ClassDocument[];
  dutySchedule: DutySchedule[];
  leaveRequests: LeaveRequest[];
  criteria: CriteriaRule[];
  teacherCredentials: { username: string; password: string };
}): Promise<{ initialized: boolean; message: string }> {
  try {
    const studentsCol = collection(db, COLLECTIONS.STUDENTS);
    const snap = await getDocs(studentsCol);

    if (!snap.empty && snap.docs.length >= 10) {
      return { initialized: false, message: 'Dữ liệu Firestore đã tồn tại sẵn.' };
    }

    console.log('Khởi tạo nạp dữ liệu ban đầu lên Firestore (gvcn20262027)...');
    const batch = writeBatch(db);

    // 1. Students
    initialData.students.forEach((s) => {
      const docRef = doc(db, COLLECTIONS.STUDENTS, s.id);
      batch.set(docRef, { ...s, updatedAt: new Date().toISOString() });
    });

    // 2. Submissions
    initialData.submissions.forEach((sub) => {
      const docRef = doc(db, COLLECTIONS.SUBMISSIONS, sub.id);
      batch.set(docRef, { ...sub, updatedAt: new Date().toISOString() });
    });

    // 3. Attendance
    initialData.attendanceRecords.forEach((att) => {
      const docRef = doc(db, COLLECTIONS.ATTENDANCE, att.id);
      batch.set(docRef, { ...att, updatedAt: new Date().toISOString() });
    });

    // 4. Announcements
    initialData.announcements.forEach((ann) => {
      const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id);
      batch.set(docRef, { ...ann, updatedAt: new Date().toISOString() });
    });

    // 5. Diaries
    initialData.diaries.forEach((d) => {
      const docRef = doc(db, COLLECTIONS.DIARIES, d.id);
      batch.set(docRef, { ...d, updatedAt: new Date().toISOString() });
    });

    // 6. Moments
    initialData.moments.forEach((m) => {
      const docRef = doc(db, COLLECTIONS.MOMENTS, m.id);
      batch.set(docRef, { ...m, updatedAt: new Date().toISOString() });
    });

    // 7. Documents
    initialData.documents.forEach((docItem) => {
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, docItem.id);
      batch.set(docRef, { ...docItem, updatedAt: new Date().toISOString() });
    });

    // 8. Duty Schedules
    initialData.dutySchedule.forEach((ds) => {
      const docId = ds.id || `duty-${ds.dayOfWeek}`;
      const docRef = doc(db, COLLECTIONS.DUTY_SCHEDULES, docId);
      batch.set(docRef, { ...ds, id: docId, updatedAt: new Date().toISOString() });
    });

    // 9. Leave Requests
    initialData.leaveRequests.forEach((lr) => {
      const docRef = doc(db, COLLECTIONS.LEAVE_REQUESTS, lr.id);
      batch.set(docRef, { ...lr, updatedAt: new Date().toISOString() });
    });

    // 10. Criteria
    initialData.criteria.forEach((crit) => {
      const docRef = doc(db, COLLECTIONS.CRITERIA, crit.id);
      batch.set(docRef, { ...crit, updatedAt: new Date().toISOString() });
    });

    // 11. GVCN profile in users collection & settings
    const gvcnRef = doc(db, COLLECTIONS.USERS, 'user-gvcn-1');
    batch.set(gvcnRef, {
      id: 'user-gvcn-1',
      username: 'thuyhao',
      fullName: 'Võ Thị Thúy Hào',
      email: 'vothithuyhao88@gmail.com',
      role: 'GVCN',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '0988.123.456',
      createdAt: new Date().toISOString(),
    });

    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'class_11a3_config');
    batch.set(settingsRef, {
      className: '11A3',
      schoolYear: '2026-2027',
      teacherName: 'Võ Thị Thúy Hào',
      teacherCredentials: initialData.teacherCredentials,
      slogan: 'Kết Nối & Trưởng Thành',
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
    return { initialized: true, message: 'Đã tải thành công toàn bộ dữ liệu mẫu lên Firestore (gvcn20262027)!' };
  } catch (error: any) {
    console.error('Lỗi khi nạp dữ liệu lên Firestore:', error);
    return { initialized: false, message: `Lỗi kết nối Firestore: ${error.message}` };
  }
}

// ----------------------------------------------------
// GENERIC FIRESTORE CRUD HELPERS
// ----------------------------------------------------

export async function saveDocumentToFirestore<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn(`Lưu tài liệu ${collectionName}/${data.id} thất bại:`, error);
  }
}

export async function updateDocumentInFirestore(
  collectionName: string,
  docId: string,
  data: Partial<any>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn(`Cập nhật tài liệu ${collectionName}/${docId} thất bại:`, error);
  }
}

export async function deleteDocumentFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Xóa tài liệu ${collectionName}/${docId} thất bại:`, error);
  }
}

export async function batchSaveToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.warn(`Batch save ${collectionName} thất bại:`, error);
  }
}

// ----------------------------------------------------
// REAL-TIME LISTENERS
// ----------------------------------------------------

export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as T[];
      onData(items);
    },
    (err) => {
      console.warn(`Lỗi lắng nghe realtime từ ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}
