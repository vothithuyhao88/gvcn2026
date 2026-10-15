import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Heart, 
  MessageSquare, 
  Plus, 
  Calendar, 
  Send,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  Check,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MomentsGalleryView: React.FC = () => {
  const { moments, toggleLikeMoment, addMomentComment, addMoment, deleteMoment, currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'DIRECT' | 'URL'>('DIRECT');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newImgUrl, setNewImgUrl] = useState('');
  
  // File upload states
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lightbox full-size preview
  const [selectedMomentForView, setSelectedMomentForView] = useState<typeof moments[0] | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment input per moment
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compress image to ensure lightweight storage
  const processImageFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF, HEIC)!');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Kích thước ảnh quá lớn (tối đa 15MB). Vui lòng chọn ảnh nhẹ hơn!');
      return;
    }

    setUploadError(null);
    setIsCompressing(true);
    setImageFileName(file.name);

    try {
      const compressedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const maxWidth = 1280;
            const maxHeight = 1280;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(e.target?.result as string);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          };
          img.onerror = () => reject(new Error('Không thể xử lý hình ảnh!'));
        };
        reader.onerror = () => reject(new Error('Không thể đọc file ảnh!'));
      });

      setUploadedImagePreview(compressedData);
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi khi tải ảnh lên, vui lòng thử lại!');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleToggleLike = (momentId: string) => {
    toggleLikeMoment(momentId);
  };

  const handleAddComment = (momentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = commentInputs[momentId];
    if (!comment?.trim()) return;

    addMomentComment(momentId, comment.trim());
    setCommentInputs({ ...commentInputs, [momentId]: '' });
  };

  const handleCreateMoment = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImageUrl = uploadMode === 'DIRECT' ? uploadedImagePreview : newImgUrl.trim();

    if (!newTitle.trim()) {
      setUploadError('Vui lòng nhập tiêu đề cho khoảnh khắc!');
      return;
    }

    if (!finalImageUrl) {
      setUploadError('Vui lòng tải ảnh lên từ thiết bị hoặc dán đường dẫn ảnh!');
      return;
    }

    addMoment(newTitle.trim(), newDesc.trim(), finalImageUrl, newDate);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewImgUrl('');
    setUploadedImagePreview(null);
    setImageFileName('');
    setUploadError(null);
    showToast('Đã đăng khoảnh khắc mới thành công lên bảng tin lớp 12A2! 🎉');
  };

  const handleDeleteMoment = (momentId: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khoảnh khắc "${title}"?`)) {
      deleteMoment(momentId);
      if (selectedMomentForView?.id === momentId) {
        setSelectedMomentForView(null);
      }
      showToast('Đã xóa khoảnh khắc thành công!');
    }
  };

  const isTeacher = currentUser.role === 'GVCN';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Kỷ Niệm & Hoạt Động Lớp 12A2</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Khoảnh Khắc 12A2 – Kết Nối & Trưởng Thành
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu giữ và chia sẻ hình ảnh đẹp trong học tập, thực hành nghề (Hàn / Kế toán) và các phong trào thi đua năm học 2024–2027
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setUploadError(null);
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer hover:shadow-rose-500/20 hover:shadow-lg"
        >
          <Upload className="w-4 h-4" />
          <span>Tải Ảnh Lên Bảng Tin</span>
        </button>
      </div>

      {/* Moments Feed */}
      {moments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Camera className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">Chưa có khoảnh khắc nào được đăng</h3>
          <p className="text-xs max-w-sm mx-auto">
            Hãy là người đầu tiên chia sẻ khoảnh khắc đáng nhớ của lớp 12A2 ngay hôm nay!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tải Ảnh Ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moments.map(moment => {
            const hasLiked = moment.likedBy.includes(currentUser.id);
            const commentText = commentInputs[moment.id] || '';
            const canDelete = isTeacher || moment.author === currentUser.fullName;

            return (
              <div 
                key={moment.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-60 overflow-hidden bg-slate-100 group/img">
                    <img 
                      src={moment.imageUrl} 
                      alt={moment.title}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105 cursor-pointer"
                      onClick={() => setSelectedMomentForView(moment)}
                    />
                    
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <Calendar className="w-3 h-3 text-amber-300" />
                      <span>{moment.date}</span>
                    </div>

                    {/* Quick Expand & Delete buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover/img:opacity-100 transition">
                      <button
                        onClick={() => setSelectedMomentForView(moment)}
                        title="Xem ảnh phóng to"
                        className="p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full backdrop-blur-xs transition cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteMoment(moment.id, moment.title)}
                          title="Xóa khoảnh khắc này"
                          className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full backdrop-blur-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 
                      onClick={() => setSelectedMomentForView(moment)}
                      className="font-bold text-slate-900 text-base hover:text-rose-600 cursor-pointer transition"
                    >
                      {moment.title}
                    </h3>
                    {moment.description && (
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                        {moment.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span>Đăng bởi: <strong className="text-slate-600">{moment.author}</strong></span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md">Lớp 12A2</span>
                    </div>
                  </div>
                </div>

                {/* Likes & Comments Section */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleToggleLike(moment.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        hasLiked ? 'bg-rose-100 text-rose-600' : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{moment.likes} Thích</span>
                    </button>

                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{moment.comments.length} bình luận</span>
                    </span>
                  </div>

                  {/* Recent comments list */}
                  {moment.comments.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto bg-white p-2.5 rounded-2xl text-xs border border-slate-200">
                      {moment.comments.map(c => (
                        <div key={c.id} className="text-slate-700">
                          <strong className="text-slate-900 font-semibold">{c.userName}:</strong>{' '}
                          <span>{c.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <form onSubmit={e => handleAddComment(moment.id, e)} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Viết bình luận cảm nghĩ..."
                      value={commentText}
                      onChange={e => setCommentInputs({ ...commentInputs, [moment.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="p-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / UPLOAD MOMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Tải Lên Khoảnh Khắc Lớp 12A2</h3>
                  <p className="text-[11px] text-slate-500">Đăng bởi: {currentUser.fullName} ({currentUser.position || currentUser.role})</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMoment} className="mt-4 space-y-4 text-xs">
              
              {/* Image Input Options Switcher */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Chọn phương thức tải ảnh:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setUploadMode('DIRECT'); setUploadError(null); }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      uploadMode === 'DIRECT' 
                        ? 'bg-white text-rose-600 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải từ máy / điện thoại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setUploadMode('URL'); setUploadError(null); }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      uploadMode === 'URL' 
                        ? 'bg-white text-rose-600 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Dán đường dẫn (URL)</span>
                  </button>
                </div>
              </div>

              {/* DIRECT FILE UPLOAD ZONE */}
              {uploadMode === 'DIRECT' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {uploadedImagePreview ? (
                    <div className="space-y-2">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-rose-200 bg-slate-100 max-h-64 flex items-center justify-center group">
                        <img 
                          src={uploadedImagePreview} 
                          alt="Ảnh xem trước" 
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-slate-900 font-bold rounded-lg text-xs shadow-md hover:bg-slate-100 cursor-pointer"
                          >
                            Đổi ảnh khác
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImagePreview(null);
                              setImageFileName('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg text-xs shadow-md hover:bg-red-700 cursor-pointer"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[250px] font-medium text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đã chọn: {imageFileName || 'Ảnh từ thiết bị'}
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Chọn ảnh khác
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                        isDragging 
                          ? 'border-rose-500 bg-rose-50/50' 
                          : 'border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/20'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2.5">
                        {isCompressing ? (
                          <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <p className="font-bold text-slate-800 text-xs sm:text-sm">
                        {isCompressing ? 'Đang xử lý tối ưu ảnh...' : 'Bấm vào đây để chọn ảnh từ máy hoặc chụp từ điện thoại'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Hỗ trợ ảnh PNG, JPG, JPEG, WEBP • Tự động nén ảnh nét và siêu nhẹ
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* URL INPUT OPTION */
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Đường dẫn hình ảnh (URL) *</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newImgUrl}
                    onChange={e => setNewImgUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden"
                  />
                  {newImgUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                      <img 
                        src={newImgUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={() => setUploadError('Đường dẫn ảnh không khả dụng hoặc bị chặn bởi máy chủ!')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề khoảnh khắc *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giờ thực hành nghề Hàn / Kế toán sôi nổi..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden font-medium text-slate-900"
                />
              </div>

              {/* Date & Tags */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày diễn ra hoạt động:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden text-slate-800"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Cảm nghĩ về kỷ niệm này:</label>
                <textarea
                  rows={2}
                  placeholder="Chia sẻ đôi dòng cảm xúc, kỷ niệm của các bạn học sinh Lớp 12A2..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Đăng Ngay Lên Bảng Tin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: FULL-SIZE VIEW */}
      {selectedMomentForView && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedMomentForView(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="p-4 bg-slate-950/80 backdrop-blur-xs flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">{selectedMomentForView.date}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">Đăng bởi: {selectedMomentForView.author}</span>
              </div>
              <button
                onClick={() => setSelectedMomentForView(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Full */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[350px] max-h-[60vh]">
              <img 
                src={selectedMomentForView.imageUrl} 
                alt={selectedMomentForView.title}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>

            {/* Bottom Details */}
            <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">{selectedMomentForView.title}</h3>
                {selectedMomentForView.description && (
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{selectedMomentForView.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleLike(selectedMomentForView.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    selectedMomentForView.likedBy.includes(currentUser.id) 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedMomentForView.likedBy.includes(currentUser.id) ? 'fill-white' : ''}`} />
                  <span>{selectedMomentForView.likes} Thích</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
