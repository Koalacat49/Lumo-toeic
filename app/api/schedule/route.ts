import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { examDate, completedCount, totalCount } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const daysLeft = totalCount - completedCount;
  
  const prompt = `あなたはTOEIC学習プランナーです。受験日まで${daysLeft}日あります。

以下のルールで、毎日のタスクを${daysLeft}個作成してください：

1. 単語・文法・リーディング・リスニングをバランスよく配分
2. 序盤は基礎固め、中盤は応用、終盤は実践問題
3. 各タスクは必ず具体的な教材名と数量を含める
4. 使用する教材例：
   - 単語：「金のフレーズ」「銀のフレーズ」「TOEIC L&R TEST 出る単特急」
   - 文法：「でる1000問」「文法問題でる1000問」
   - リーディング：「公式問題集」「精選模試」
   - リスニング：「公式問題集」「究極のゼミ」
5. タスク例：「金のフレーズ Section 1-3（300語）」「でる1000問 Part 5 問題50問」
6. 理由は短く明確に（なぜ今このタスクをやるべきか）

JSON配列で返してください：
[
  {"task": "教材名 + 具体的な範囲・数量", "reason": "短い理由"},
  ...
]

コードブロックや余計な説明は不要です。JSON配列のみを返してください。`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const tasks = JSON.parse(text);
    
    // 配列かどうか確認
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error("Invalid response format");
    }
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // fallbackも具体的にする
    const materials = [
      { name: "金のフレーズ Section 1-2", reason: "頻出単語を優先" },
      { name: "でる1000問 Part 5 基礎編", reason: "文法の基礎固め" },
      { name: "公式問題集 Part 7 短文", reason: "読解スピード向上" },
      { name: "公式問題集 Part 1-2", reason: "リスニング基礎" },
      { name: "金のフレーズ Section 3-4", reason: "語彙力強化" }
    ];
    
    const fallback = Array.from({length: Math.min(daysLeft, 5)}, (_, i) => {
      const day = completedCount + i + 1;
      const material = materials[i % materials.length];
      return {
        task: `Day ${day}: ${material.name}`,
        reason: material.reason
      };
    });
    
    return NextResponse.json({ tasks: fallback });
  }
}