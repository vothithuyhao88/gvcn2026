import React, { useState } from 'react';
import { 
  Camera, 
  Heart, 
  MessageSquare, 
  Plus, 
  Calendar, 
  Share2, 
  Sparkles, 
  Send,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MomentsGalleryView: React.FC = () => {
  const { moments, toggleLikeMoment, addMomentComment, addMoment, currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');

  // Comment input per moment
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const handleToggleLike = (momentId: string) => {
    toggleLikeMoment(momentId);
  };

  const handleAddComment = (momentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = commentInputs[momentId];
    if (!comment?.trim()) return;

    addMomentComment(momentId, comment);
    setCommentInputs({ ...commentInputs, [momentId]: '' });
  };

  const handleCreateMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImgUrl.trim()) return;

    addMoment(newTitle, newDesc, newImgUrl);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewImgUrl('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Kỷ Niệm & Hoạt Động Lớp 11A3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Khoảnh Khắc 11A3 – Kết Nối & Trưởng Thành
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu giữ những hình ảnh đẹp trong học tập, trải nghiệm nghề và các phong trào thi đua năm học 2026–2027
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khoảnh Khắc Mới</span>
        </button>
      </div>

      {/* Moments Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moments.map(moment => {
          const hasLiked = moment.likedBy.includes(currentUser.id);
          const commentText = commentInputs[moment.id] || '';

          return (
            <div 
              key={moment.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img 
                    src={moment.imageUrl} 
                    alt={moment.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-300" />
                    <span>{moment.date}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base">{moment.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{moment.description}</p>
                  <div className="text-[11px] text-slate-400 mt-2">Đăng bởi: {moment.author}</div>
                </div>
              </div>

              {/* Likes & Comments Section */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLike(moment.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      hasLiked ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  <div className="space-y-1.5 max-h-32 overflow-y-auto bg-slate-50 p-2.5 rounded-2xl text-xs">
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
                    placeholder="Viết bình luận cảm xúc..."
                    value={commentText}
                    onChange={e => setCommentInputs({ ...commentInputs, [moment.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD MOMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Thêm Khoảnh Khắc Lớp 11A3</h3>
            <p className="text-xs text-slate-500 mb-4">Chia sẻ kỷ niệm đẹp với tập thể lớp</p>

            <form onSubmit={handleCreateMoment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề khoảnh khắc *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giờ thực hành nghề Hàn / Kế toán sôi nổi..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả cảm nghĩ:</label>
                <textarea
                  rows={2}
                  placeholder="Viết đôi dòng cảm nghĩ về hoạt động..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đường dẫn hình ảnh (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newImgUrl}
                  onChange={e => setNewImgUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                >
                  Đăng Khoảnh Khắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
