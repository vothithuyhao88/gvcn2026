import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

export interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

/**
 * Đăng nhập linh hoạt bằng Username hoặc Email kết hợp Firebase Auth & Firestore:
 * 1. Nếu nhập Username (không chứa '@'): Tìm email tương ứng trong Firestore collection 'users'
 * 2. Dùng Email và Mật khẩu để gọi signInWithEmailAndPassword của Firebase Auth
 * 3. Kiểm tra hồ sơ trong Firestore: nếu chưa có (user tạo trên console), tự động tạo mới và CẤP QUYỀN ADMIN (GVCN)
 */
export async function loginWithUsernameOrEmail(
  identifier: string, 
  password: string
): Promise<LoginResult> {
  const trimmedId = identifier.trim();
  
  if (!trimmedId) {
    return {
      success: false,
      message: 'Vui lòng nhập Tên đăng nhập hoặc Email!'
    };
  }

  if (!password) {
    return {
      success: false,
      message: 'Vui lòng nhập Mật khẩu!'
    };
  }

  let emailToSignIn: string = '';

  // 1. Xác định luồng Username hay Email
  if (trimmedId.includes('@')) {
    emailToSignIn = trimmedId.toLowerCase();
  } else {
    // Người dùng nhập Username: Query Database Firestore để tìm Email tương ứng
    try {
      const cleanUsername = trimmedId.toLowerCase();
      const usersRef = collection(db, 'users');
      
      // Query username chính xác (thường lưu dạng lowercase)
      const q = query(usersRef, where('username', '==', cleanUsername));
      let querySnapshot = await getDocs(q);

      // Nếu chưa tìm thấy, thử tìm theo exact case hoặc student code
      if (querySnapshot.empty) {
        const qRaw = query(usersRef, where('username', '==', trimmedId));
        querySnapshot = await getDocs(qRaw);
      }

      // Thử tìm theo mã học sinh / studentId nếu có
      if (querySnapshot.empty) {
        const qStudent = query(usersRef, where('studentId', '==', trimmedId));
        querySnapshot = await getDocs(qStudent);
      }

      if (querySnapshot.empty) {
        return {
          success: false,
          message: `Không tìm thấy tài khoản với Tên đăng nhập "${trimmedId}". Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên.`
        };
      }

      const userData = querySnapshot.docs[0].data();
      if (!userData.email) {
        return {
          success: false,
          message: `Tài khoản "${trimmedId}" chưa được gán email xác thực. Vui lòng liên hệ Quản trị viên.`
        };
      }

      emailToSignIn = userData.email;
    } catch (dbError: any) {
      console.error('Lỗi khi truy vấn Username từ Database:', dbError);
      return {
        success: false,
        message: 'Lỗi truy xuất cơ sở dữ liệu. Vui lòng thử lại sau hoặc đăng nhập bằng Email.'
      };
    }
  }

  // 2. Xác thực với Firebase Authentication
  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailToSignIn, password);
    const firebaseUser = userCredential.user;

    // 3. Đồng bộ Auth & Database: Kiểm tra document trong Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userProfile: User;

    if (userDocSnap.exists()) {
      userProfile = {
        id: firebaseUser.uid,
        ...userDocSnap.data()
      } as User;
    } else {
      // User CÓ trong Authentication (ví dụ: tạo trên Console) nhưng CHƯA CÓ trong Database:
      // Tự động tạo hồ sơ mới trong Database và MẶC ĐỊNH CẤP QUYỀN ADMIN (GVCN)
      const usernameFromEmail = firebaseUser.email 
        ? firebaseUser.email.split('@')[0].toLowerCase() 
        : `admin_${firebaseUser.uid.slice(0, 6)}`;
        
      const displayName = firebaseUser.displayName 
        || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Quản trị viên');

      userProfile = {
        id: firebaseUser.uid,
        username: usernameFromEmail,
        fullName: displayName,
        email: firebaseUser.email || emailToSignIn,
        role: 'GVCN', // Mặc định Quản trị viên / Giáo viên chủ nhiệm toàn quyền
        avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        phone: firebaseUser.phoneNumber || '',
      };

      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      user: userProfile,
      message: `Đăng nhập thành công! Chào mừng ${userProfile.fullName}.`
    };
  } catch (authError: any) {
    console.error('Lỗi xác thực Firebase Auth:', authError);
    let errorMsg = 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!';
    
    if (
      authError.code === 'auth/invalid-credential' || 
      authError.code === 'auth/wrong-password' || 
      authError.code === 'auth/user-not-found'
    ) {
      errorMsg = 'Tên đăng nhập/Email hoặc Mật khẩu không chính xác!';
    } else if (authError.code === 'auth/too-many-requests') {
      errorMsg = 'Tài khoản đã bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau!';
    } else if (authError.code === 'auth/invalid-email') {
      errorMsg = 'Định dạng Email không hợp lệ!';
    } else if (authError.code === 'auth/network-request-failed') {
      errorMsg = 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền!';
    }

    return {
      success: false,
      message: errorMsg
    };
  }
}

/**
 * Lắng nghe thay đổi trạng thái đăng nhập Firebase Auth và đồng bộ với Firestore
 */
export function listenToAuthState(onUserChanged: (user: User | null, loading: boolean) => void) {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      onUserChanged(null, false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = {
          id: firebaseUser.uid,
          ...userDocSnap.data()
        } as User;
        onUserChanged(profile, false);
      } else {
        // Tự động tạo hồ sơ Admin cho user có trong Auth nhưng chưa có trong Database
        const usernameFromEmail = firebaseUser.email 
          ? firebaseUser.email.split('@')[0].toLowerCase() 
          : `admin_${firebaseUser.uid.slice(0, 6)}`;
          
        const displayName = firebaseUser.displayName 
          || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Quản trị viên');

        const newAdminProfile: User = {
          id: firebaseUser.uid,
          username: usernameFromEmail,
          fullName: displayName,
          email: firebaseUser.email || '',
          role: 'GVCN', // Mặc định Admin
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          phone: firebaseUser.phoneNumber || '',
        };

        await setDoc(userDocRef, {
          ...newAdminProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        onUserChanged(newAdminProfile, false);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin người dùng từ Firestore:', err);
      onUserChanged(null, false);
    }
  });
}

/**
 * Đăng xuất khỏi hệ thống
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Cập nhật thông tin profile người dùng
 */
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ người dùng:', error);
    return false;
  }
}
