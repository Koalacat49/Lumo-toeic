import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { examDate, completedCount, totalCount } = await req.json();
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `あなたはTOEIC学習のコーチです。以下の条件に基づいて、今後のタスクを今日から順に提案してください。

受験日: ${examDate}
今までの完了タスク数: ${completedCount}
全タスク数: ${totalCount}

以下の種類のタスクを組み合わせて、バランスよく提案してください：
- 単語暗記
- 文法
- リーディング
- リスニング
- 模擬テスト

レスポンスは以下のJSON形式で返してください。他の説明は不要。各タスクに「なぜ今やるべきか」の短い理由も簡潔に書いてくれ。
[{"task":"タスク1","reason":"理由1"},{"task":"タスク2","reason":"理由2"}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const tasks = JSON.parse(cleaned);
    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ 
      tasks: [
        { task: "単語暗記：100語", reason: "基礎語彙" },
        { task: "文法：仮定法", reason: "Part 5対策" }
      ]
    });
  }
}
