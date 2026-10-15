export type EmulationRank = 'Tốt' | 'Khá' | 'Đạt' | 'Yếu';

export interface EmulationRankInfo {
  rank: EmulationRank;
  label: string;
  colorClass: string;
  textColor: string;
  bgClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeClass: string;
  cardBorder: string;
  emoji: string;
  description: string;
}

/**
 * Quy định xếp loại thi đua & rèn luyện lớp 12A2 (Chuẩn thang điểm 100):
 * - Điểm > 85: Xếp loại Tốt
 * - Điểm > 70 đến 85: Xếp loại Khá
 * - Điểm >= 50 đến 70 (> 50): Xếp loại Đạt
 * - Điểm < 50: Xếp loại Yếu
 */
export function getEmulationRank(score: number): EmulationRankInfo {
  if (score > 85) {
    return {
      rank: 'Tốt',
      label: 'Tốt',
      colorClass: 'text-emerald-700',
      textColor: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cardBorder: 'border-emerald-200 hover:border-emerald-300',
      emoji: '🌟',
      description: 'Điểm > 85đ',
    };
  }
  
  if (score > 70) {
    return {
      rank: 'Khá',
      label: 'Khá',
      colorClass: 'text-blue-700',
      textColor: 'text-blue-700',
      bgClass: 'bg-blue-50',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-300',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      cardBorder: 'border-blue-200 hover:border-blue-300',
      emoji: '👍',
      description: '70đ < Điểm ≤ 85đ',
    };
  }
  
  if (score >= 50) {
    return {
      rank: 'Đạt',
      label: 'Đạt',
      colorClass: 'text-amber-700',
      textColor: 'text-amber-700',
      bgClass: 'bg-amber-50',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-300',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      cardBorder: 'border-amber-200 hover:border-amber-300',
      emoji: '👌',
      description: '50đ ≤ Điểm ≤ 70đ',
    };
  }
  
  return {
    rank: 'Yếu',
    label: 'Yếu',
    colorClass: 'text-rose-700',
    textColor: 'text-rose-700',
    bgClass: 'bg-rose-50',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    cardBorder: 'border-rose-200 hover:border-rose-300',
    emoji: '⚠️',
    description: 'Điểm < 50đ',
  };
}

export const EMULATION_RANK_LEGEND = [
  { rank: 'Tốt', condition: '> 85 điểm', desc: 'Thực hiện xuất sắc nề nếp, tích cực phát biểu, rèn luyện tốt', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', tagColor: 'bg-emerald-600 text-white' },
  { rank: 'Khá', condition: '> 70 - 85 điểm', desc: 'Nề nếp tốt, hoàn thành đầy đủ nhiệm vụ học tập & chuyên cần', color: 'bg-blue-50 text-blue-800 border-blue-200', tagColor: 'bg-blue-600 text-white' },
  { rank: 'Đạt', condition: '50 - 70 điểm', desc: 'Có vi phạm nhẹ hoặc cần tích cực hơn trong học tập', color: 'bg-amber-50 text-amber-800 border-amber-200', tagColor: 'bg-amber-600 text-white' },
  { rank: 'Yếu', condition: '< 50 điểm', desc: 'Vi phạm nề nếp nghiêm trọng hoặc vắng nhiều, cần GVCN & PH nhắc nhở', color: 'bg-rose-50 text-rose-800 border-rose-200', tagColor: 'bg-rose-600 text-white' },
];
