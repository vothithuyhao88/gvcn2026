import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Link as LinkIcon, 
  Check, 
  RotateCcw, 
  CheckCircle2, 
  Image as ImageIcon,
  User as UserIcon,
  RefreshCw,
  Sliders,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Video,
  VideoOff,
  SwitchCamera
} from 'lucide-react';
import { UserRole } from '../../types';

// Curated avatar libraries categorized by role and style
export const CURATED_AVATARS = {
  GVCN: [
    {
      id: 'gv-1',
      title: 'Cô giáo thanh lịch 1',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      tag: 'Nhà giáo'
    },
    {
      id: 'gv-2',
      title: 'Cô giáo Áo dài duyên dáng',
      url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80',
      tag: 'Áo dài'
    },
    {
      id: 'gv-3',
      title: 'Cô giáo tươi tắn',
      url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
      tag: 'Sư phạm'
    },
    {
      id: 'gv-4',
      title: 'Nhà giáo mẫu mực',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
      tag: 'Công sở'
    },
    {
      id: 'gv-5',
      title: 'Cô giáo tri thức',
      url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&auto=format&fit=crop&q=80',
      tag: 'Giáo dục'
    },
    {
      id: 'gv-6',
      title: 'Cô giáo thân thiện',
      url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
      tag: 'Chủ nhiệm'
    }
  ],
  MALE_STUDENTS: [
    {
      id: 'male-1',
      title: 'Nam sinh Áo trắng 1',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      tag: 'Học sinh'
    },
    {
      id: 'male-2',
      title: 'Nam sinh Năng động',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      tag: 'Tổ trưởng'
    },
    {
      id: 'male-3',
      title: 'Nam sinh Nghề Hàn',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      tag: 'Kỹ thuật'
    },
    {
      id: 'male-4',
      title: 'Nam sinh Chững chạc',
      url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&auto=format&fit=crop&q=80',
      tag: 'Lớp phó'
    },
    {
      id: 'male-5',
      title: 'Nam sinh Thể thao',
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      tag: 'Phong trào'
    },
    {
      id: 'male-6',
      title: 'Nam sinh Trẻ trung',
      url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
      tag: 'Học đường'
    },
    {
      id: 'male-7',
      title: 'Nam sinh Thân thiện',
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
      tag: 'Đoàn viên'
    },
    {
      id: 'male-8',
      title: 'Nam sinh Điển trai',
      url: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=300&auto=format&fit=crop&q=80',
      tag: 'Thành viên'
    }
  ],
  FEMALE_STUDENTS: [
    {
      id: 'female-1',
      title: 'Nữ sinh Duyên dáng 1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      tag: 'Học sinh'
    },
    {
      id: 'female-2',
      title: 'Nữ sinh Học tập',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      tag: 'Lớp phó'
    },
    {
      id: 'female-3',
      title: 'Nữ sinh Kế toán',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
      tag: 'Kế toán'
    },
    {
      id: 'female-4',
      title: 'Nữ sinh Tươi tắn',
      url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80',
      tag: 'Tổ trưởng'
    },
    {
      id: 'female-5',
      title: 'Nữ sinh Dịu dàng',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      tag: 'Áo trắng'
    },
    {
      id: 'female-6',
      title: 'Nữ sinh Chăm ngoan',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      tag: 'Văn nghệ'
    },
    {
      id: 'female-7',
      title: 'Nữ sinh Tri thức',
      url: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=300&auto=format&fit=crop&q=80',
      tag: 'Chăm chỉ'
    },
    {
      id: 'female-8',
      title: 'Nữ sinh Thân thiện',
      url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
      tag: 'Thành viên'
    }
  ],
  CHIBI_ANIME: [
    {
      id: 'anime-1',
      title: 'Chibi Học sinh Nam đeo kính',
      url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student11A3boy&backgroundColor=b6e3f4',
      tag: 'Robot Chibi'
    },
    {
      id: 'anime-2',
      title: 'Chibi Nữ sinh tóc bím',
      url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student11A3girl&backgroundColor=ffdfbf',
      tag: 'Robot Chibi'
    },
    {
      id: 'anime-3',
      title: 'Avatar Học sinh Hoạt hình 1',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GiaHuy11A3&backgroundColor=b6e3f4',
      tag: 'Adventurer'
    },
    {
      id: 'anime-4',
      title: 'Avatar Nữ sinh Hoạt hình 2',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MaiPhuong11A3&backgroundColor=ffd5dc',
      tag: 'Adventurer'
    },
    {
      id: 'anime-5',
      title: 'Avatar Nam sinh Năng động 3',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HoangNam11A3&backgroundColor=c0aede',
      tag: 'Adventurer'
    },
    {
      id: 'anime-6',
      title: 'Avatar Nữ sinh Dễ thương 4',
      url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ThaoNguyen11A3&backgroundColor=d1d4f9',
      tag: 'Adventurer'
    },
    {
      id: 'anime-7',
      title: 'Avatar 3D Person 1',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede',
      tag: '3D Avatar'
    },
    {
      id: 'anime-8',
      title: 'Avatar 3D Person 2',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
      tag: '3D Avatar'
    }
  ],
  PARENTS: [
    {
      id: 'ph-1',
      title: 'Phụ huynh Nam',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      tag: 'Bố'
    },
    {
      id: 'ph-2',
      title: 'Phụ huynh Nữ',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      tag: 'Mẹ'
    },
    {
      id: 'ph-3',
      title: 'Phụ huynh Tri thức',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      tag: 'Phụ huynh'
    },
    {
      id: 'ph-4',
      title: 'Phụ huynh Ấm áp',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      tag: 'Phụ huynh'
    }
  ]
};

interface AvatarChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  userName: string;
  userRoleTitle?: string;
  userGender?: 'Nam' | 'Nữ';
  userRole?: UserRole;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

export const AvatarChangeModal: React.FC<AvatarChangeModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  userRoleTitle = 'Thành viên Lớp 11A3',
  userGender = 'Nam',
  userRole = 'STUDENT',
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'url'>('presets');
  const [previewAvatar, setPreviewAvatar] = useState<string>(currentAvatar);
  const [presetCategory, setPresetCategory] = useState<string>(
    userRole === 'GVCN' ? 'GVCN' : userRole === 'PARENT' ? 'PARENTS' : userGender === 'Nữ' ? 'FEMALE_STUDENTS' : 'MALE_STUDENTS'
  );
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial avatar when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewAvatar(currentAvatar || '');
      setCustomUrl('');
      setUrlError(false);
      setUploadError(null);
      setCameraError(null);
      
      // Select best initial preset category
      if (userRole === 'GVCN') {
        setPresetCategory('GVCN');
      } else if (userRole === 'PARENT') {
        setPresetCategory('PARENTS');
      } else if (userGender === 'Nữ') {
        setPresetCategory('FEMALE_STUDENTS');
      } else {
        setPresetCategory('MALE_STUDENTS');
      }
    } else {
      stopCamera();
    }
  }, [isOpen, currentAvatar, userRole, userGender]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCountdown(null);
  };

  // Start camera helper
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập máy ảnh trực tiếp.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Bạn đã từ chối quyền truy cập máy ảnh. Vui lòng cho phép quyền Camera trong cài đặt trình duyệt.'
          : 'Không thể khởi động camera: ' + (err.message || 'Lỗi thiết bị')
      );
      setIsCameraActive(false);
    }
  };

  // Switch camera tab handling
  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab, facingMode]);

  const handleCapturePhoto = () => {
    if (countdown !== null) return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          doSnap();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const doSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Create square crop
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const startX = ((video.videoWidth || 480) - size) / 2;
      const startY = ((video.videoHeight || 480) - size) / 2;

      ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPreviewAvatar(dataUrl);
      stopCamera();
      setActiveTab('presets'); // Return to preview with photo applied
    }
  };

  // File Upload Handlers
  const handleFileSelect = (file: File) => {
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn một file ảnh hợp lệ (PNG, JPG, JPEG, WEBP, GIF)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Kích thước ảnh quá lớn (tối đa 8MB). Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewAvatar(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc file ảnh. Vui lòng thử lại!');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setUrlError(false);

    // Test image load
    const img = new Image();
    img.onload = () => {
      setPreviewAvatar(customUrl.trim());
      setUrlError(false);
    };
    img.onerror = () => {
      setUrlError(true);
    };
    img.src = customUrl.trim();
  };

  const handleSave = () => {
    if (!previewAvatar) return;
    onSaveAvatar(previewAvatar);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={previewAvatar || currentAvatar}
                alt={userName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/50 shadow-md bg-white"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs">
                <Camera className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Thay Đổi Ảnh Đại Diện Cá Nhân</span>
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {userName} • <span className="font-semibold text-amber-200">{userRoleTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 pt-3 flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'presets'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Kho Ảnh Mẫu Tuyển Chọn</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'upload'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải Ảnh Từ Thiết Bị</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'camera'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>Chụp Bằng Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-3.5 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'url'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Nhập Link URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-white">
          
          {/* TAB 1: PRESETS / KHO ẢNH MẪU */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Category selector */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {userRole === 'GVCN' && (
                  <button
                    onClick={() => setPresetCategory('GVCN')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      presetCategory === 'GVCN'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    👑 Giáo Viên Chủ Nhiệm
                  </button>
                )}

                <button
                  onClick={() => setPresetCategory('MALE_STUDENTS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    presetCategory === 'MALE_STUDENTS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  👨‍🎓 Nam Sinh & Nghề Hàn
                </button>

                <button
                  onClick={() => setPresetCategory('FEMALE_STUDENTS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    presetCategory === 'FEMALE_STUDENTS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  👩‍🎓 Nữ Sinh & Kế Toán
                </button>

                <button
                  onClick={() => setPresetCategory('CHIBI_ANIME')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    presetCategory === 'CHIBI_ANIME'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🎨 Chibi / 3D Hoạt Hình
                </button>

                <button
                  onClick={() => setPresetCategory('PARENTS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    presetCategory === 'PARENTS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  👪 Phụ Huynh
                </button>
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {((CURATED_AVATARS as any)[presetCategory] || CURATED_AVATARS.MALE_STUDENTS).map((item: any) => {
                  const isSelected = previewAvatar === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreviewAvatar(item.url)}
                      className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition cursor-pointer flex flex-col items-center justify-center p-1 ${
                        isSelected 
                          ? 'border-blue-600 ring-4 ring-blue-100 shadow-md scale-102 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300 hover:shadow-xs bg-slate-50'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-2xs flex items-center justify-center rounded-xl">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-1.5 inset-x-1.5 text-center text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs py-0.5 rounded-md truncate">
                        {item.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
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
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 hover:border-blue-400'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Kéo & thả ảnh từ máy tính hoặc bấm vào đây để chọn
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ PNG, JPG, JPEG, WEBP hoặc GIF (Dung lượng tối đa 8MB)
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-4 py-2 rounded-xl shadow-2xs transition"
                >
                  Chọn ảnh từ máy / điện thoại
                </button>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAMERA LIVE CAPTURE */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <canvas ref={canvasRef} className="hidden" />

              <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 max-w-md mx-auto flex items-center justify-center shadow-lg border border-slate-800">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    
                    {/* Face Guide Oval */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-white/60 shadow-2xl" />
                    </div>

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-2xs flex items-center justify-center">
                        <div className="text-6xl font-black text-amber-300 animate-ping">
                          {countdown}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <VideoOff className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">Camera chưa được kích hoạt</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                      Bật máy ảnh
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {isCameraActive && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Đổi camera trước / sau"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={countdown !== null}
                    className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-rose-600/30 transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{countdown !== null ? `Đang chụp sau ${countdown}s...` : 'Chụp ảnh ngay'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: URL LINK */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dán đường dẫn URL trực tiếp của hình ảnh:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setUrlError(false);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xem thử</span>
                  </button>
                </div>
              </div>

              {urlError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Đường dẫn ảnh không tải được. Vui lòng kiểm tra lại URL hoặc chọn ảnh khác!</span>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-700">Gợi ý:</p>
                <p className="text-[11px] text-slate-500">
                  Bạn có thể lấy link ảnh từ Unsplash, Imgur, Facebook hoặc link ảnh công khai trên Google Drive để sử dụng.
                </p>
              </div>
            </div>
          )}

          {/* REAL-TIME PREVIEW IN CONTEXT */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Xem Trước Ảnh Đại Diện Trên Giao Diện</span>
              <span className="text-blue-600 font-bold">Hiển thị tức thì</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Header Navbar Pill Preview */}
              <div className="bg-blue-800 text-white p-3 rounded-xl flex items-center gap-3 shadow-inner">
                <img
                  src={previewAvatar}
                  alt="Preview Navbar"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-blue-200 font-bold uppercase">{userRoleTitle}</p>
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                </div>
              </div>

              {/* 2. Card Profile Badge Preview */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
                <img
                  src={previewAvatar}
                  alt="Preview Card"
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 bg-slate-50"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-bold text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">Lớp 11A3 • 2025–2028</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!previewAvatar}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Lưu & Áp Dụng Ảnh Đại Diện Này</span>
          </button>
        </div>

      </div>
    </div>
  );
};
