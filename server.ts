import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    class: "12A2",
    school: "Trung tâm GDNN-GDTX An Nhơn",
    homeroomTeacher: "Võ Thị Thúy Hào",
    schoolYear: "2026-2027",
    hasAiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Assistant endpoints for Homeroom Teacher (GVCN)
app.post("/api/ai/generate-comment", async (req, res) => {
  try {
    const { studentName, score, rank, absences, violations, commendations, tone } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Fallback intelligent generator if key not configured
      const fallbackComment = `Em ${studentName || 'học sinh'} trong tuần/tháng qua ${score >= 90 ? 'có ý thức học tập và rèn luyện rất tốt' : score >= 70 ? 'chấp hành tốt nội quy lớp học' : 'cần cố gắng hơn trong việc rèn luyện nề nếp'}. ${absences > 0 ? `Cần lưu ý hạn chế nghỉ học (${absences} buổi).` : 'Đi học chuyên cần, đầy đủ.'} ${commendations ? `Khen ngợi: ${commendations}.` : ''} ${violations ? `Lưu ý khắc phục: ${violations}.` : ''} Cô mong em tiếp tục phát huy tinh thần tự giác và gắn kết cùng tập thể 12A2!`;
      return res.json({ comment: fallbackComment, fallback: true });
    }

    const prompt = `Bạn là cô giáo Võ Thị Thúy Hào - Giáo viên chủ nhiệm lớp 12A2, Trung tâm GDNN-GDTX An Nhơn (Năm học 2026-2027).
Hãy viết lời nhận xét chi tiết, chuẩn mực sư phạm, vừa động viên khích lệ vừa chỉ rõ điểm cần khắc phục cho học sinh:
- Tên học sinh: ${studentName || 'Học sinh'}
- Điểm thi đua hiện tại: ${score || 100} điểm (Xếp hạng: ${rank || 'Khá'})
- Số buổi nghỉ học: ${absences || 0} buổi
- Điểm cộng/thành tích: ${commendations || 'Chăm chỉ, tham gia phong trào'}
- Vi phạm/điểm trừ: ${violations || 'Không có vi phạm lớn'}
- Phong cách mong muốn: ${tone || 'Thân thiện, động viên, định hướng tích cực'}

Yêu cầu:
- Độ dài khoảng 3-5 câu súc tích, tình cảm, sư phạm.
- Mang đậm tinh thần khẩu hiệu của lớp 12A2: "Kết nối & Trưởng thành".
- Xưng hô "Cô" và "Em" (hoặc gửi phụ huynh thì xưng "Cô Hào/GVCN").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ comment: response.text?.trim() || "Chưa có nhận xét.", fallback: false });
  } catch (error: any) {
    console.error("AI comment error:", error);
    res.status(500).json({ error: error.message || "Lỗi tạo nhận xét AI" });
  }
});

app.post("/api/ai/generate-announcement", async (req, res) => {
  try {
    const { targetAudience, topic, keyPoints, deadline } = req.body;
    const ai = getAIClient();

    let targetName = 'Quý Phụ huynh & Toàn thể Học sinh Lớp 12A2 (Toàn lớp)';
    if (targetAudience === 'bcs') {
      targetName = 'Ban Cán Sự Lớp 12A2 (Lớp trưởng, Lớp phó, Bí thư, 4 Tổ trưởng)';
    } else if (targetAudience === 'parents') {
      targetName = 'Quý Phụ huynh học sinh Lớp 12A2';
    }

    if (!ai) {
      const fallback = `📢 THÔNG BÁO LỚP 12A2\n\nKính gửi ${targetName},\n\nGVCN Võ Thị Thúy Hào xin thông báo về nội dung: ${topic || 'Kế hoạch học tập, rèn luyện và sinh hoạt lớp'}.\n\nNội dung chi tiết:\n${keyPoints || '- Thực hiện nghiêm túc nội quy trung tâm và lớp học 12A2.\n- Chuẩn bị đầy đủ bài vở và tham gia học nghề Trung cấp đầy đủ.'}\n${deadline ? `\n⏰ Thời hạn / Hạn chót thực hiện: ${deadline}` : ''}\n\nTrân trọng cảm ơn sự phối hợp!\nGVCN: Võ Thị Thúy Hào - Lớp 12A2 (Trung tâm GDNN-GDTX An Nhơn)`;
      return res.json({ announcement: fallback, fallback: true });
    }

    const prompt = `Bạn là cô giáo Võ Thị Thúy Hào - GVCN lớp 12A2, Trung tâm GDNN-GDTX An Nhơn (Năm học 2026-2027).
Hãy soạn một thông báo chỉn chu, rõ ràng, trang trọng, sư phạm và chuẩn mực gửi đến đích đến: ${targetName}.
- Chủ đề thông báo: ${topic}
- Các ý chính cần truyền tải: ${keyPoints}
- Thời gian/Hạn chót (nếu có): ${deadline || 'Theo kế hoạch tuần'}

Yêu cầu:
- Trình bày định dạng đẹp mắt với các biểu tượng (emoji) thích hợp, tiêu đề rõ ràng, các gạch đầu dòng mạch lạc.
- Phong cách ngôn từ phù hợp với đích đến (${targetAudience === 'bcs' ? 'Chỉ đạo giao nhiệm vụ dứt khoát cho Ban cán sự lớp' : targetAudience === 'parents' ? 'Trang trọng, cầu thị, tôn trọng khi gửi Quý Phụ huynh' : 'Thân thiện, bao quát toàn lớp'}).
- Cuối thông báo ghi rõ chữ ký GVCN: Võ Thị Thúy Hào (Lớp 12A2 - Trung tâm GDNN-GDTX An Nhơn).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ announcement: response.text?.trim(), fallback: false });
  } catch (error: any) {
    console.error("AI announcement error:", error);
    res.status(500).json({ error: error.message || "Lỗi tạo thông báo AI" });
  }
});

app.post("/api/ai/meeting-agenda", async (req, res) => {
  try {
    const { weekNumber, topStudents, lowStudents, keyIssues, plans } = req.body;
    const ai = getAIClient();

    if (!ai) {
      const fallback = `📋 KỊCH BẢN TIẾT SINH HOẠT CHỦ NHIỆM TUẦN ${weekNumber || 'MỚI'} - LỚP 12A2\n\n1. ỔN ĐỊNH VÀ ĐIỂM DANH (5 phút)\n- Lớp phó nề nếp báo cáo sĩ số và chuyên cần trong tuần.\n\n2. TỔNG KẾT THI ĐUA TUẦN (15 phút)\n- 4 Tổ trưởng lần lượt nhận xét nề nếp và học tập của tổ.\n- Lớp trưởng tổng hợp xếp hạng: Tuyên dương các bạn top đầu (${topStudents || 'Học sinh xuất sắc'}), nhắc nhở các bạn còn vi phạm (${lowStudents || 'Các bạn bị trừ điểm'}).\n\n3. GVCN NHẬN XÉT VÀ ĐỊNH HƯỚNG (15 phút)\n- Cô Võ Thị Thúy Hào đánh giá chung: Vấn đề chuyên cần, học nghề Trung cấp, đồng phục và bảo quản tài sản phòng học.\n- Giải quyết các khúc mắc và tuyên dương tổ xuất sắc nhất tuần.\n\n4. TRIỂN KHAI KẾ HOẠCH TUẦN TỚI (10 phút)\n- Chuẩn bị bài kiểm tra, phân công trực nhật, vệ sinh phòng học.\n- Khẩu hiệu tuần mới: "12A2: Đoàn kết - Tự giác - Bứt phá!"`;
      return res.json({ agenda: fallback, fallback: true });
    }

    const prompt = `Bạn là cô giáo Võ Thị Thúy Hào - GVCN lớp 12A2, Trung tâm GDNN-GDTX An Nhơn (Năm học 2026-2027).
Hãy lên kế hoạch chi tiết cho Tiết Sinh Hoạt Lớp Chủ Nhiệm (Tuần ${weekNumber || 'này'}):
- Top học sinh đạt điểm cao / có tiến bộ: ${topStudents || 'Nguyễn Văn A, Trần Thị B, Lê Văn C'}
- Học sinh cần lưu ý / nhắc nhở nề nếp: ${lowStudents || 'Một số bạn đi trễ, quên làm BTVN'}
- Các vấn đề nổi cộm trong tuần: ${keyIssues || 'Vệ sinh lớp học, chuyên cần học nghề Trung cấp, giữ gìn trật tự 15 phút đầu giờ'}
- Kế hoạch tuần tới: ${plans || 'Thi đua đợt mới, tham gia phong trào thể thao văn nghệ, kiểm tra định kỳ'}

Yêu cầu:
- Phân chia thời lượng cụ thể theo từng phần (45 phút sinh hoạt lớp).
- Có phân công việc rõ ràng cho Lớp Trưởng, Lớp Phó, 4 Tổ Trưởng và phần phát biểu chỉ đạo của GVCN.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ agenda: response.text?.trim(), fallback: false });
  } catch (error: any) {
    console.error("AI meeting agenda error:", error);
    res.status(500).json({ error: error.message || "Lỗi tạo kịch bản sinh hoạt" });
  }
});

app.post("/api/ai/weekly-report", async (req, res) => {
  try {
    const { weekNumber, attendanceStats, disciplineStats, studyStats, recommendations } = req.body;
    const ai = getAIClient();

    if (!ai) {
      const fallback = `BÁO CÁO CÔNG TÁC CHỦ NHIỆM TUẦN ${weekNumber || 'HIỆN TẠI'}\nLớp: 12A2 - Trung tâm GDNN-GDTX An Nhơn\nGVCN: Võ Thị Thúy Hào\n\n1. SĨ SỐ VÀ CHUYÊN CẦN:\n- Tổng số: 35 học sinh.\n- Tình hình: ${attendanceStats || 'Đa số học sinh đi học đều đặn, vắng có phép 2 lượt.'}\n\n2. HỌC TẬP & HỌC NGHỀ:\n- Tình hình chuẩn bị bài và tham gia học nghề Trung cấp nghiêm túc.\n- ${studyStats || 'Nhiều bài kiểm tra đạt điểm tốt, tinh thần phát biểu xây dựng bài sôi nổi.'}\n\n3. NỀ NẾP & THI ĐUA:\n- ${disciplineStats || 'Tổ chức trực nhật sạch sẽ, đồng phục đúng quy định.'}\n\n4. ĐỀ XUẤT - KIẾN NGHỊ:\n- ${recommendations || 'Kính đề nghị Ban Giám hiệu tiếp tục hỗ trợ kiểm tra thiết bị phòng học số 3.'}\n\nKính gửi: Ban Giám đốc Trung tâm GDNN-GDTX An Nhơn.`;
      return res.json({ report: fallback, fallback: true });
    }

    const prompt = `Bạn là cô giáo Võ Thị Thúy Hào - GVCN lớp 12A2, Trung tâm GDNN-GDTX An Nhơn.
Hãy soạn bản "BÁO CÁO CÔNG TÁC CHỦ NHIỆM TUẦN ${weekNumber || 'MỚI'}" để gửi Ban Giám đốc Trung tâm và lưu hồ sơ lớp:
- Thống kê chuyên cần: ${attendanceStats}
- Thống kê nề nếp & thi đua: ${disciplineStats}
- Tình hình học tập văn hóa & học nghề trung cấp: ${studyStats}
- Đề xuất / kiến nghị của GVCN: ${recommendations || 'Không có'}

Yêu cầu thể thức báo cáo hành chính giáo dục chuẩn mực của Việt Nam, trang trọng, số liệu rõ ràng.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ report: response.text?.trim(), fallback: false });
  } catch (error: any) {
    console.error("AI weekly report error:", error);
    res.status(500).json({ error: error.message || "Lỗi tạo báo cáo tuần" });
  }
});

// Vite middleware for dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Class 12A2 Management System running on http://localhost:${PORT}`);
  });
}

startServer();
