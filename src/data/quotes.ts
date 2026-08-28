export interface StudyQuote {
  quote: string;
  authorOrSource?: string;
  category: 'ca-dao' | 'tuc-ngu' | 'danh-ngon';
}

export const INSPIRATIONAL_STUDY_QUOTES: StudyQuote[] = [
  {
    quote: 'Có công mài sắt, có ngày nên kim • Kiến tha lâu cũng đầy tổ.',
    authorOrSource: 'Tục ngữ Việt Nam',
    category: 'tuc-ngu'
  },
  {
    quote: 'Học thầy chẳng tày học bạn • Muốn biết phải hỏi, muốn giỏi phải học.',
    authorOrSource: 'Ca dao - Tục ngữ Việt Nam',
    category: 'ca-dao'
  },
  {
    quote: 'Ngọc bất trác, bất thành khí; Nhân bất học, bất tri đạo.',
    authorOrSource: 'Cổ nhân',
    category: 'danh-ngon'
  },
  {
    quote: 'Học là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.',
    authorOrSource: 'Ngạn ngữ',
    category: 'danh-ngon'
  },
  {
    quote: 'Đường đi khó, không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông.',
    authorOrSource: 'Nguyễn Bá Học',
    category: 'danh-ngon'
  },
  {
    quote: 'Cần cù bù thông minh • Học đi đôi với hành, lý luận gắn liền với thực tiễn.',
    authorOrSource: 'Châm ngôn rèn luyện',
    category: 'tuc-ngu'
  },
  {
    quote: 'Hôm nay kiên trì từng con chữ, ngày mai vững bước tương lai tươi sáng.',
    authorOrSource: 'Lời gửi gắm từ GVCN Cô Thúy Hào',
    category: 'danh-ngon'
  },
  {
    quote: 'Dốt đến đâu học lâu cũng biết • Tay làm hàm nhai, tay quai miệng trễ.',
    authorOrSource: 'Tục ngữ Việt Nam',
    category: 'tuc-ngu'
  },
  {
    quote: 'Tri thức là chìa khóa mở cánh cửa tương lai • Không có áp lực, không có kim cương.',
    authorOrSource: 'Danh ngôn giáo dục',
    category: 'danh-ngon'
  },
  {
    quote: 'Rèn đức luyện tài, quyết tâm vươn lên xây dựng ước mơ và lập nghiệp.',
    authorOrSource: 'Khẩu hiệu thi đua Lớp 11A3',
    category: 'danh-ngon'
  }
];

export function getRandomStudyQuote(excludeIndex = -1): { quote: StudyQuote; index: number } {
  let idx = Math.floor(Math.random() * INSPIRATIONAL_STUDY_QUOTES.length);
  if (idx === excludeIndex && INSPIRATIONAL_STUDY_QUOTES.length > 1) {
    idx = (idx + 1) % INSPIRATIONAL_STUDY_QUOTES.length;
  }
  return { quote: INSPIRATIONAL_STUDY_QUOTES[idx], index: idx };
}
