import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  Medal, 
  Crown, 
  Sparkles, 
  Users, 
  Star, 
  ChevronRight, 
  Calendar,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';
import { getEmulationRank } from '../../utils/emulation';

export const LeaderboardView: React.FC = () => {
  const { students } = useApp();

  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | 'SEMESTER'>('WEEK');

  // Sorted students
  const sortedStudents = [...students].sort((a, b) => b.currentScore - a.currentScore);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Team averages
  const teamStats = [1, 2, 3, 4].map(teamId => {
    const members = students.filter(s => s.teamId === teamId);
    const avgScore = members.length > 0 
      ? Math.round(members.reduce((acc, cur) => acc + cur.currentScore, 0) / members.length)
      : 0;
    const totalScore = members.reduce((acc, cur) => acc + cur.currentScore, 0);
    return {
      name: `Tổ ${teamId}`,
      teamId,
      avgScore,
      totalScore,
      membersCount: members.length,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const chartData = [1, 2, 3, 4].map(teamId => {
    const members = students.filter(s => s.teamId === teamId);
    const avgScore = members.length > 0 
      ? Math.round(members.reduce((acc, cur) => acc + cur.currentScore, 0) / members.length)
      : 0;
    return {
      teamName: `Tổ ${teamId}`,
      diemTrungBinh: avgScore,
    };
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Bảng Vinh Danh & Xếp Hạng Lớp 12A2</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Bảng Xếp Hạng Thi Đua & Rèn Luyện
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tôn vinh các cá nhân xuất sắc và xếp hạng thi đua giữa 4 Tổ (2026–2027)
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setTimeRange('WEEK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              timeRange === 'WEEK' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuần Này
          </button>
          <button
            onClick={() => setTimeRange('MONTH')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              timeRange === 'MONTH' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tháng Này
          </button>
          <button
            onClick={() => setTimeRange('SEMESTER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              timeRange === 'SEMESTER' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Học Kỳ I
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM HERO */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Hoa Điểm Tốt Tuần Này</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Gương Mặt Xuất Sắc Lớp 12A2</h2>
        </div>

        {/* Podium cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto items-end pt-4">
          
          {/* Top 2: Bạc */}
          {top2 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center flex flex-col items-center justify-between order-2 sm:order-1 sm:h-72">
              <div className="w-full">
                <div className="text-2xl mb-1">🥈</div>
                <div className="relative inline-block mb-2">
                  <img src={top2.avatar} alt={top2.fullName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-300" />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-slate-300 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    2
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm truncate">{top2.fullName}</h3>
                <p className="text-xs text-slate-300">Tổ {top2.teamId} • {top2.position}</p>
              </div>
              <div className="mt-3 bg-white/10 py-1.5 px-4 rounded-xl w-full">
                <span className="text-lg font-black text-amber-300">{top2.currentScore}</span>
                <span className="text-[11px] text-slate-300 ml-1">điểm</span>
              </div>
            </div>
          )}

          {/* Top 1: Vàng (Center Highest) */}
          {top1 && (
            <div className="bg-gradient-to-b from-amber-500/30 to-amber-600/10 backdrop-blur-md border-2 border-amber-400/60 rounded-3xl p-6 text-center flex flex-col items-center justify-between order-1 sm:order-2 sm:h-84 shadow-2xl relative">
              <div className="absolute -top-4 bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Quán Quân Tuần</span>
              </div>
              <div className="w-full mt-2">
                <div className="text-3xl mb-1">🥇</div>
                <div className="relative inline-block mb-2">
                  <img src={top1.avatar} alt={top1.fullName} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl" />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                    1
                  </span>
                </div>
                <h3 className="font-black text-amber-200 text-base truncate">{top1.fullName}</h3>
                <p className="text-xs text-slate-200 font-medium">Tổ {top1.teamId} • {top1.position}</p>
              </div>
              <div className="mt-4 bg-amber-400 text-slate-950 py-2 px-6 rounded-2xl w-full font-black shadow-md">
                <span className="text-xl">{top1.currentScore}</span>
                <span className="text-xs ml-1 font-bold">điểm</span>
              </div>
            </div>
          )}

          {/* Top 3: Đồng */}
          {top3 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center flex flex-col items-center justify-between order-3 sm:order-3 sm:h-64">
              <div className="w-full">
                <div className="text-2xl mb-1">🥉</div>
                <div className="relative inline-block mb-2">
                  <img src={top3.avatar} alt={top3.fullName} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-300" />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-orange-300 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    3
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm truncate">{top3.fullName}</h3>
                <p className="text-xs text-slate-300">Tổ {top3.teamId} • {top3.position}</p>
              </div>
              <div className="mt-3 bg-white/10 py-1.5 px-4 rounded-xl w-full">
                <span className="text-lg font-black text-amber-300">{top3.currentScore}</span>
                <span className="text-[11px] text-slate-300 ml-1">điểm</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2-COLUMN SECTION: BẢNG XẾP HẠNG 4 TỔ VỚI BIỂU ĐỒ & DANH SÁCH 35 HỌC SINH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 Col): Thi Đua 4 Tổ & Biểu Đồ */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚩</span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Xếp Hạng Thi Đua 4 Tổ
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                4 Tổ
              </span>
            </div>

            {/* List of 4 teams */}
            <div className="space-y-3 mb-6">
              {teamStats.map((team, idx) => (
                <div 
                  key={team.teamId}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    idx === 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{team.name}</span>
                        {idx === 0 && <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-sm">Hạng 1</span>}
                      </div>
                      <div className="text-[10px] text-slate-500">{team.membersCount} học sinh</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-700">{team.avgScore} đ/hs</div>
                    <div className="text-[10px] text-slate-400">Tổng: {team.totalScore}đ</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts Bar Chart */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Biểu đồ so sánh điểm trung bình 4 Tổ:
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="teamName" tick={{ fontSize: 11 }} />
                    <YAxis domain={[80, 110]} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val} điểm/hs`, 'Điểm TB']}
                      contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="diemTrungBinh" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Full Ranking List (35 Students) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Bảng Xếp Hạng Toàn Thể {students.length} Học Sinh Lớp 12A2
                </h3>
                <p className="text-xs text-slate-500">
                  Cập nhật theo kết quả điểm danh, hoạt động học tập và duyệt thi đua
                </p>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {students.length} Học sinh
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {sortedStudents.map((student, idx) => {
                const isTop3 = idx < 3;
                const medalEmojis = ['🥇', '🥈', '🥉'];
                return (
                  <div key={student.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-2xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-7 text-center font-black text-xs text-slate-400">
                        {isTop3 ? (
                          <span className="text-base">{medalEmojis[idx]}</span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>

                      <img src={student.avatar} alt={student.fullName} className="w-10 h-10 rounded-xl object-cover" />

                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{student.fullName}</span>
                          <span className="text-[10px] text-slate-400">({student.code})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tổ {student.teamId} • <span className="text-indigo-600 font-medium">{student.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-blue-700">{student.currentScore} đ</div>
                      {(() => {
                        const rank = getEmulationRank(student.currentScore);
                        return (
                          <div className={`text-[10px] font-bold ${rank.colorClass}`}>
                            {rank.emoji} {rank.rank}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
