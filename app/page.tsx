"use client";
/* ───── クイズ問題データ ───── */
const QUIZ_QUESTIONS: Record<string, Array<{
  question: string; options: string[]; answer: number; explanation: string; difficulty: string;
}>> = {
  vocabulary: [
    { question: "Please _______ the attached document before the meeting.", options: ["review","reviewed","reviewing","reviewer"], answer: 0, explanation: "命令文なので動詞の原形「review」が正解です。", difficulty: "easy" },
    { question: "The _______ growth of the industry has attracted many investors.", options: ["rapid","rapidly","rapidity","rapids"], answer: 0, explanation: "名詞「growth」を修飾するには形容詞「rapid」が正解です。", difficulty: "easy" },
    { question: "We need to _______ a new marketing strategy.", options: ["develop","developed","developing","developer"], answer: 0, explanation: "「need to」の後には動詞の原形が必要なので「develop」が正解です。", difficulty: "easy" },
  ],
  grammar: [
    { question: "She has been working here _______ 2020.", options: ["since","from","during","after"], answer: 0, explanation: "「現在まで続いている」という意味なので「since」が正解です。", difficulty: "easy" },
    { question: "I _______ to the office every day.", options: ["go","goes","going","went"], answer: 0, explanation: "習慣を表す現在形なので「go」が正解です。", difficulty: "easy" },
    { question: "The package _______ tomorrow.", options: ["will arrive","arrives","arriving","arrived"], answer: 0, explanation: "未来の予定なので「will arrive」が正解です。", difficulty: "easy" },
  ],
  reading: [
    { question: "Dear Ms. Sato, Thank you for your recent order. Your items have been shipped. Q: このメールの主な目的は何ですか？", options: ["注文を促す","配送状況を知らせる","謝罪する","割引を提案する"], answer: 1, explanation: "「Your items have been shipped」から、配送状況を知らせるメールです。", difficulty: "easy" },
    { question: "The annual health checkup will take place on March 10th. Please sign up by February 28th. Q: 2月28日までに何をする必要がありますか？", options: ["健診に参加する","診療所に行く","健診に申し込む","報告書を提出する"], answer: 2, explanation: "「Please sign up by February 28th」から、健診への申し込みが必要です。", difficulty: "easy" },
    { question: "Due to road construction, bus route 45 will be changed starting Monday. Q: バスのルートが変わる理由は？", options: ["悪天候のため","道路工事のため","メンテナンスのため","需要が増えたため"], answer: 1, explanation: "「Due to road construction」から、道路工事がルート変更の理由です。", difficulty: "easy" },
  ],
};
/* ───── クイズヘルパー関数 ───── */
const getQuestionCategory = (task: string): string => {
  if (task.includes("単語") || task.includes("語彙")) return "vocabulary";
  if (task.includes("文法")) return "grammar";
  if (task.includes("リーディング") || task.includes("読解")) return "reading";
  const cats = ["vocabulary", "grammar", "reading"];
  return cats[Math.floor(Math.random() * cats.length)];
};

const getRandomQuestion = (category: string) => {
  const list = QUIZ_QUESTIONS[category] || QUIZ_QUESTIONS.vocabulary;
  return list[Math.floor(Math.random() * list.length)];
};

const CATEGORY_LABEL: Record<string, string> = {
  vocabulary: "単語",
  grammar: "文法",
  reading: "リーディング",
};

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const BADGES = [
  { id: 1, name: "First Step", icon: "*", need: 1 },
  { id: 2, name: "5 Tasks", icon: "**", need: 5 },
  { id: 3, name: "10 Tasks", icon: "***", need: 10 },
  { id: 4, name: "Halfway", icon: "****", need: -1 },
  { id: 5, name: "Complete", icon: "*****", need: -2 },
];
const USER_ID = "default_user";
const DECORATIONS = ["🌳", "🌺", "🦋", "🌻", "🍂", "🌸"];

const SPEECH_MESSAGES = [
  "やった！🎉",
  "いいね！✨",
  "すごい！🌟",
  "頑張ってる！💪",
  "最高！🔥",
  "いけいけ！🚀",
  "いい調子！⭐",
  "GOod！👍",
];

const Mascot = ({ size = 80, progress = 0 }: { size?: number; progress?: number }) => {
  const happy = progress > 0;
  const veryHappy = progress === 100;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.2))" }}>
      <polygon points="16,20 20,4 26,22" fill="#E8960C" />
      <polygon points="54,20 60,4 64,22" fill="#E8960C" />
      <ellipse cx="40" cy="55" rx="20" ry="22" fill="#FFB347" />
      <circle cx="40" cy="24" r="18" fill="#FFB347" />
      <ellipse cx="40" cy="26" rx="13" ry="11" fill="#FFF0D0" />
      <circle cx="33" cy="22" r="5" fill="white" />
      <circle cx="47" cy="22" r="5" fill="white" />
      <circle cx="33" cy={veryHappy ? "23" : "22"} r="2.5" fill="#333" />
      <circle cx="47" cy={veryHappy ? "23" : "22"} r="2.5" fill="#333" />
      <circle cx="34.5" cy="20.5" r="1" fill="white" />
      <circle cx="48.5" cy="20.5" r="1" fill="white" />
      <polygon points="37,28 43,28 40,32" fill="#FF8C00" />
      {happy ? (
        <path d="M35,35 Q40,39 45,35" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M35,36 Q40,34 45,36" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      )}
      <ellipse cx="22" cy="58" rx="6" ry="11" fill="#FFA500" transform="rotate(-8,22,58)" />
      <ellipse cx="58" cy="58" rx="6" ry="11" fill="#FFA500" transform="rotate(8,58,58)" />
      <ellipse cx="40" cy="60" rx="12" ry="9" fill="#FFF0D0" />
      <ellipse cx="33" cy="75" rx="4" ry="2" fill="#FF8C00" />
      <ellipse cx="47" cy="75" rx="4" ry="2" fill="#FF8C00" />
    </svg>
  );
};

export default function Home() {
  const [examDate, setExamDate] = useState("");
  const [schedule, setSchedule] = useState<string[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shownBadgeIds, setShownBadgeIds] = useState<number[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  
  /* クイズ用 */
  const [quizModal, setQuizModal] = useState(false);
  const [quizTaskIdx, setQuizTaskIdx] = useState<number | null>(null);
  const [quizQuestion, setQuizQuestion] = useState<{question: string; options: string[]; answer: number; explanation: string; difficulty: string} | null>(null);
  const [quizCategory, setQuizCategory] = useState<string>("");
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizShowAnswer, setQuizShowAnswer] = useState(false);
  // ── キャラの道移動 ──
  const pathRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const goalRef = useRef<HTMLDivElement>(null);
  const [mascotPos, setMascotPos] = useState({ top: 0, left: 0 });
  const [mascotReady, setMascotReady] = useState(false);
  const [jumpKey, setJumpKey] = useState(0);

  // ── キャラのセリフ ──
  const [speechText, setSpeechText] = useState<string | null>(null);
  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── バッジ獲得演出 ──
  const [popBadge, setPopBadge] = useState<{ id: number; name: string; icon: string } | null>(null);

  const completedCount = completed.length;
  const totalCount = schedule.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentTaskIndex = schedule.findIndex((_, i) => !completed.includes(i));

  // キャラ位置計算
  useLayoutEffect(() => {
    if (schedule.length === 0 || !pathRef.current) {
      setMascotReady(false);
      return;
    }
    let targetEl: HTMLDivElement | null = null;
    if (progress === 100 && goalRef.current) {
      targetEl = goalRef.current;
    } else {
      const idx = completed.length === 0 ? 0 : Math.max(...completed);
      targetEl = nodeRefs.current[idx] || null;
    }
    if (targetEl) {
      const cR = pathRef.current.getBoundingClientRect();
      const nR = targetEl.getBoundingClientRect();
      setMascotPos({
        top: nR.top - cR.top - 26,
        left: nR.left - cR.left - 4,
      });
      setMascotReady(true);
    }
  }, [completed, schedule, expandedTask, progress]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", USER_ID));
        if (snap.exists()) {
          const d = snap.data();
          setExamDate(d.examDate || "");
          setSchedule(d.schedule || []);
          setCompleted(d.completed || []);
          setReasons(d.reasons || []);
          // 獲得済みバッジIDを計算
          const loadedCompleted = d.completed || [];
          const loadedSchedule = d.schedule || [];
          const loadedProgress = loadedSchedule.length > 0 ? Math.round((loadedCompleted.length / loadedSchedule.length) * 100) : 0;
          const earnedIds = BADGES.filter(b => {
            if (b.need === -1) return loadedProgress >= 50;
            if (b.need === -2) return loadedProgress === 100;
            return loadedCompleted.length >= b.need;
          }).map(b => b.id);
          setShownBadgeIds(earnedIds);
        }
      } catch (e) { console.log("load error", e); }
      setDataLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    const save = async () => {
      try { await setDoc(doc(db, "users", USER_ID), { examDate, schedule, completed, reasons }); }
      catch (e) { console.log("save error", e); }
    };
    save();
  }, [examDate, schedule, completed, reasons, dataLoaded]);

  const badges = BADGES.map((b) => ({
    ...b,
    earned: b.need === -1 ? progress >= 50 : b.need === -2 ? progress === 100 : completedCount >= b.need,
  }));

  // バッジ獲得チェック＋演出
  useEffect(() => {
    const newlyEarned = badges.find(b => b.earned && !shownBadgeIds.includes(b.id));
    if (newlyEarned) {
      setShownBadgeIds(prev => [...prev, newlyEarned.id]);
      // コンフェッティ
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      // バッジポップアップ
      setPopBadge({ id: newlyEarned.id, name: newlyEarned.name, icon: newlyEarned.icon });
      setTimeout(() => setPopBadge(null), 2800);
    }
  }, [completed]);

  const handleSubmit = async () => {
    if (!examDate) return;
    const today = new Date();
    const exam = new Date(examDate);
    const diffDays = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) { alert("受験日は今日より後の日付にしてください"); return; }
    if (diffDays > 365) { alert("受験日は1年以内にしてください"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDate, completedCount: 0, totalCount: diffDays }),
      });
      const data = await res.json();
      const aiTasks: { task: string; reason: string }[] = data.tasks;
      const gen: string[] = [];
      const reas: string[] = [];
      for (let i = 0; i < diffDays; i++) {
        const t = aiTasks[i % aiTasks.length];
        gen.push(`Day ${i + 1}: ${t.task}`);
        reas.push(t.reason);
      }
      setSchedule(gen);
      setReasons(reas);
      setCompleted([]);
    } catch { alert("AIが応答しませんでした。もう一度押してくれ。"); }
    setLoading(false);
  };

  const handleReset = async () => {
    setSchedule([]); setCompleted([]); setReasons([]); setExamDate("");
    setMascotReady(false);
    setShownBadgeIds([]);
    try { await setDoc(doc(db, "users", USER_ID), { examDate: "", schedule: [], completed: [], reasons: [] }); }
    catch (e) { console.log("reset error", e); }
  };
  /* ── クイズ機能 ── */
  const handleOpenQuiz = (idx: number) => {
    const task = schedule[idx];
    const category = getQuestionCategory(task);
    const question = getRandomQuestion(category);
    setQuizTaskIdx(idx);
    setQuizCategory(category);
    setQuizQuestion(question);
    setQuizSelected(null);
    setQuizShowAnswer(false);
    setQuizModal(true);
  };

  const handleQuizAnswer = () => {
    if (quizSelected === null || !quizQuestion) return;
    const isCorrect = quizSelected === quizQuestion.answer;
    setQuizShowAnswer(true);
    
    if (isCorrect && quizTaskIdx !== null) {
      setTimeout(() => {
        setCompleted(prev => [...prev, quizTaskIdx]);
        setQuizModal(false);
        triggerSpeech();
        setJumpKey(k => k + 1);
      }, 1500);
    }
  };

  const handleQuizSkip = () => {
    if (quizTaskIdx !== null) {
      setCompleted(prev => [...prev, quizTaskIdx]);
      setQuizModal(false);
      triggerSpeech();
      setJumpKey(k => k + 1);
    }
  };

  const triggerSpeech = () => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    const msg = SPEECH_MESSAGES[Math.floor(Math.random() * SPEECH_MESSAGES.length)];
    setSpeechText(msg);
    speechTimeout.current = setTimeout(() => setSpeechText(null), 2000);
  };

    const toggleComplete = (i: number) => {
      if (!completed.includes(i)) {
        handleOpenQuiz(i);
      }
    };

  if (!dataLoaded) return <div style={{ textAlign: "center", padding: 80, color: "#666" }}>読み込み中...</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #5DADE2 0%, #85C1E9 25%, #AED6F1 50%, #D5F5E3 75%, #7DCEA0 100%)",
      fontFamily: "'Hiragino Kaku Gothic Pro', 'Noto Sans JP', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* コンフェッティ */}
      {showConfetti && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}>
          {["🌟","⭐","✨","🎉","🎊","🌟","⭐","✨","🎉","🎊"].map((e, i) => (
            <div key={i} style={{ position: "absolute", left: `${5 + i * 10}%`, top: "-30px", fontSize: i % 2 === 0 ? 30 : 22, animation: "confettiFall 3s ease-in forwards", animationDelay: `${i * 0.1}s` }}>{e}</div>
          ))}
        </div>
      )}

      {/* バッジポップアップ */}
      {popBadge && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="badge-pop-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          <div className="badge-pop-card" style={{
            position: "relative",
            zIndex: 1,
            background: "linear-gradient(145deg, #fff9e6, #fff3cc)",
            borderRadius: 28,
            padding: "32px 44px",
            textAlign: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 0 4px #FFD700, 0 0 30px rgba(255,215,0,0.4)",
            border: "3px solid #FFD700",
          }}>
            {/* 上の小書き */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#b8860b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>BADGE UNLOCKED</div>
            {/* アイコン大きく */}
            <div className="badge-pop-icon" style={{ fontSize: 72, lineHeight: 1, marginBottom: 10 }}>{popBadge.icon}</div>
            {/* バッジ名 */}
            <div style={{ fontSize: 24, fontWeight: 800, color: "#333" }}>{popBadge.name}</div>
            {/* 星パーティクル */}
            <div style={{ position: "absolute", top: 10, left: 16, fontSize: 20, animation: "starFloat 1.5s ease-out forwards" }}>✨</div>
            <div style={{ position: "absolute", top: 20, right: 20, fontSize: 16, animation: "starFloat 1.8s ease-out forwards 0.2s" }}>⭐</div>
            <div style={{ position: "absolute", bottom: 16, left: 24, fontSize: 18, animation: "starFloat 1.6s ease-out forwards 0.1s" }}>🌟</div>
            <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 14, animation: "starFloat 2s ease-out forwards 0.3s" }}>✨</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity:1; } 100% { transform: translateY(100vh) rotate(720deg); opacity:0; } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity:0; } 60% { transform: scale(1.05); } 100% { transform: scale(1); opacity:1; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 6px rgba(88,204,2,0.5); } 50% { box-shadow: 0 0 18px rgba(88,204,2,0.9); } }
        @keyframes mascotJump {
          0%   { transform: translateY(0) scale(1); }
          30%  { transform: translateY(-20px) scale(1.08); }
          65%  { transform: translateY(5px) scale(0.96); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes speechPop {
          0%   { transform: scale(0.6) translateY(0); opacity: 0; }
          40%  { transform: scale(1.08) translateY(-4px); opacity: 1; }
          60%  { transform: scale(1) translateY(-2px); opacity: 1; }
          80%  { transform: scale(1) translateY(-2px); opacity: 1; }
          100% { transform: scale(0.9) translateY(-6px); opacity: 0; }
        }
        @keyframes badgePopIn {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          50%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          70%  { transform: scale(0.95) rotate(-2deg); }
          85%  { transform: scale(1.02) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes badgePopOut {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes badgeIconBounce {
          0%,100% { transform: translateY(0); }
          30%     { transform: translateY(-12px); }
          60%     { transform: translateY(4px); }
        }
        @keyframes starFloat {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(0); opacity: 0; }
        }
        @keyframes overlayFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes overlayFadeOut {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .badge-earned { animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
        .mascot-bounce { animation: bounce 1.5s ease-in-out infinite; }
        .node-glow { animation: glow 2s infinite; }
        .mascot-jump { animation: mascotJump 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .speech-bubble { animation: speechPop 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .badge-pop-overlay { animation: overlayFadeIn 0.3s ease forwards; }
        .badge-pop-card { animation: badgePopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .badge-pop-icon { animation: badgeIconBounce 1s ease-in-out 0.4s forwards; }
      `}</style>

      {/* Clouds */}
      <div style={{ position: "absolute", top: 28, left: "8%", width: 110, height: 36, background: "#fff", borderRadius: 40, opacity: 0.7, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 50, left: "58%", width: 90, height: 30, background: "#fff", borderRadius: 40, opacity: 0.6, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 14, left: "38%", width: 70, height: 24, background: "#fff", borderRadius: 40, opacity: 0.5, pointerEvents: "none" }} />

      {/* Mountains bottom */}
      <svg style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: 80, pointerEvents: "none", zIndex: 0 }} viewBox="0 0 480 80" preserveAspectRatio="none">
        <polygon points="0,80 70,30 140,80" fill="#388E3C" opacity="0.7" />
        <polygon points="100,80 200,10 300,80" fill="#2E7D32" opacity="0.6" />
        <polygon points="250,80 350,35 450,80" fill="#388E3C" opacity="0.7" />
        <polygon points="0,80 50,50 100,80" fill="#43A047" />
        <polygon points="380,80 440,45 480,80" fill="#43A047" />
      </svg>

      {/* Header */}
      <div style={{ padding: "18px 20px 0", maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mascot size={36} progress={progress} />
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, textShadow: "0 2px 4px rgba(0,0,0,0.25)" }}>Lumo</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.25)", borderRadius: 18, padding: "3px 10px" }}>
              <span>🔥</span><span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{completedCount}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.25)", borderRadius: 18, padding: "3px 10px" }}>
              <span>🏆</span><span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{badges.filter(b => b.earned).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 20px 120px", position: "relative", zIndex: 1 }}>

        {/* Start screen */}
        {schedule.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 30 }}>
            <div className="mascot-bounce" style={{ display: "inline-block" }}>
              <Mascot size={100} progress={0} />
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 19, marginTop: 10, textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>冒険を始めよう！</div>
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 22, marginTop: 18, boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>受験日を選んで</label>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <select value={examDate ? new Date(examDate).getFullYear() : ""} onChange={(e) => { const y = e.target.value; const m = examDate ? String(new Date(examDate).getMonth()+1).padStart(2,"0") : "01"; const d = examDate ? String(new Date(examDate).getDate()).padStart(2,"0") : "01"; if(y) setExamDate(`${y}-${m}-${d}`); }} style={{ flex:1, padding:"11px 8px", border:"2px solid #e0e0e0", borderRadius:12, fontSize:15, color:"#333", outline:"none" }}>
                  <option value="">年</option>{[2026,2027,2028].map(y=><option key={y} value={y}>{y}年</option>)}
                </select>
                <select value={examDate ? new Date(examDate).getMonth()+1 : ""} onChange={(e) => { const y = examDate ? String(new Date(examDate).getFullYear()) : "2026"; const m = e.target.value.padStart(2,"0"); const d = examDate ? String(new Date(examDate).getDate()).padStart(2,"0") : "01"; setExamDate(`${y}-${m}-${d}`); }} style={{ flex:1, padding:"11px 8px", border:"2px solid #e0e0e0", borderRadius:12, fontSize:15, color:"#333", outline:"none" }}>
                  <option value="">月</option>{Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{m}月</option>)}
                </select>
                <select value={examDate ? new Date(examDate).getDate() : ""} onChange={(e) => { const y = examDate ? String(new Date(examDate).getFullYear()) : "2026"; const m = examDate ? String(new Date(examDate).getMonth()+1).padStart(2,"0") : "01"; const d = e.target.value.padStart(2,"0"); setExamDate(`${y}-${m}-${d}`); }} style={{ flex:1, padding:"11px 8px", border:"2px solid #e0e0e0", borderRadius:12, fontSize:15, color:"#333", outline:"none" }}>
                  <option value="">日</option>{Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}日</option>)}
                </select>
              </div>
              <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"13px", marginTop:14, background: loading?"#aaa":"linear-gradient(135deg,#58cc02,#46a302)", color:"#fff", border:"none", borderRadius:12, fontSize:17, fontWeight:700, cursor: loading?"not-allowed":"pointer", boxShadow:"0 4px 0 #3a8500" }}>
                {loading ? "AI考えちゅう..." : "冒険を開始！🗻"}
              </button>
            </div>
          </div>
        )}

        {/* Path */}
        {schedule.length > 0 && (
          <>
            {/* Progress bar */}
            <div style={{ background:"rgba(255,255,255,0.92)", borderRadius:14, padding:"10px 14px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, color:"#555", marginBottom:5 }}>
                <span>🗻 冒険の進捗</span><span style={{color:"#58cc02"}}>{progress}%</span>
              </div>
              <div style={{ background:"#e0e0e0", borderRadius:8, height:10, overflow:"hidden" }}>
                <div style={{ width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#58cc02,#46a302)", borderRadius:8, transition:"width 0.5s ease" }} />
              </div>
            </div>

            {/* Badges */}
            <div style={{ background:"rgba(255,255,255,0.92)", borderRadius:14, padding:"10px 14px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#333", marginBottom:6 }}>バッジ</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {badges.map(b => (
                  <div key={b.id} className={b.earned?"badge-earned":""} style={{ flex:"1 1 auto", minWidth:65, padding:"5px 6px", borderRadius:10, background: b.earned?"linear-gradient(135deg,#fff7e6,#fff0cc)":"#f0f0f0", border:`2px solid ${b.earned?"#ffcc00":"#e0e0e0"}`, textAlign:"center" }}>
                    <div style={{fontSize:16}}>{b.earned ? b.icon : "🔒"}</div>
                    <div style={{fontSize:9, fontWeight:600, color: b.earned?"#b8860b":"#aaa", marginTop:1}}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button onClick={handleReset} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.8)", fontSize:12, cursor:"pointer", marginBottom:10, padding:0, textShadow:"0 1px 2px rgba(0,0,0,0.3)" }}>
              ← 受験日を変える（データ全て削除）
            </button>

            {/* Path tasks */}
            <div ref={pathRef} style={{ position:"relative", paddingLeft:46 }}>
              {/* Path line */}
              <div style={{ position:"absolute", left:22, top:0, bottom:0, width:4, background:"linear-gradient(180deg,#58cc02,#8BC34A,#AED581)", borderRadius:2 }} />

              {/* キャラ＋セリフ */}
              {mascotReady && (
                <div
                  style={{
                    position: "absolute",
                    top: mascotPos.top,
                    left: mascotPos.left,
                    zIndex: 5,
                    pointerEvents: "none",
                    transition: "top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.4s ease",
                  }}
                >
                  {/* セリフバブル */}
                  {speechText && (
                    <div
                      key={speechText + jumpKey}
                      className="speech-bubble"
                      style={{
                        position: "absolute",
                        bottom: 44,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#fff",
                        borderRadius: 16,
                        padding: "6px 12px",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#333",
                        whiteSpace: "nowrap",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                        border: "2px solid #eee",
                      }}
                    >
                      {speechText}
                      <div style={{
                        position: "absolute",
                        bottom: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "8px solid #fff",
                      }} />
                    </div>
                  )}

                  {/* キャラ本体 */}
                  <div key={jumpKey} className="mascot-jump">
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 30,
                      height: 5,
                      background: "rgba(0,0,0,0.13)",
                      borderRadius: "50%",
                      filter: "blur(2px)",
                    }} />
                    <Mascot size={48} progress={progress} />
                  </div>
                </div>
              )}

              {schedule.map((task, i) => {
                const done = completed.includes(i);
                const isCurrent = i === currentTaskIndex;
                const isExpanded = expandedTask === i;
                const showDeco = i > 0 && i % 5 === 0;

                return (
                  <div key={i}>
                    {showDeco && (
                      <div style={{ position:"relative", height:24, display:"flex", alignItems:"center" }}>
                        <div style={{ position:"absolute", left:8, fontSize:18 }}>{DECORATIONS[Math.floor(i/5) % DECORATIONS.length]}</div>
                      </div>
                    )}
                    <div style={{ position:"relative", marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
                      {/* Node */}
                      <div
                        ref={(el) => { nodeRefs.current[i] = el; }}
                        onClick={() => toggleComplete(i)}
                        className={isCurrent && !done ? "node-glow" : ""}
                        style={{
                          width:40, height:40, borderRadius:"50%", flexShrink:0,
                          background: done ? "linear-gradient(135deg,#58cc02,#46a302)" : isCurrent ? "#fff" : "rgba(255,255,255,0.7)",
                          border: done ? "none" : isCurrent ? "3px solid #58cc02" : "3px solid rgba(180,180,180,0.8)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          cursor:"pointer",
                          boxShadow: done ? "0 2px 8px rgba(88,204,2,0.4)" : "0 2px 4px rgba(0,0,0,0.15)",
                          transition:"all 0.3s", zIndex:1, marginLeft:-4,
                        }}
                      >
                        {done ? <span style={{color:"#fff",fontSize:20,fontWeight:700}}>✓</span> : <span style={{color: isCurrent?"#58cc02":"#999",fontSize:13,fontWeight:700}}>{i+1}</span>}
                      </div>

                      {/* Card */}
                      <div
                        onClick={() => setExpandedTask(isExpanded ? null : i)}
                        style={{
                          flex:1, background: done ? "rgba(240,250,240,0.9)" : isCurrent ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.82)",
                          borderRadius:12, padding:"9px 11px",
                          boxShadow: isCurrent ? "0 3px 14px rgba(88,204,2,0.3)" : "0 2px 6px rgba(0,0,0,0.08)",
                          border: isCurrent ? "2px solid rgba(88,204,2,0.35)" : "1px solid rgba(255,255,255,0.5)",
                          cursor:"pointer", transition:"all 0.2s",
                        }}
                      >
                        <div style={{ fontSize:13, fontWeight:600, color: done?"#aaa":"#333", textDecoration: done?"line-through":"none" }}>{task}</div>
                        {isExpanded && reasons[i] && (
                          <div style={{ fontSize:11, color: done?"#bbb":"#666", marginTop:5, paddingTop:5, borderTop:"1px solid #eee" }}>💡 {reasons[i]}</div>
                        )}
                        {!isExpanded && reasons[i] && (
                          <div style={{ fontSize:10, color:"#aaa", marginTop:3 }}>タップで理由を見る</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Goal */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
                <div
                  ref={goalRef}
                  style={{
                    width:44, height:44, borderRadius:"50%", flexShrink:0,
                    background: progress===100 ? "linear-gradient(135deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.6)",
                    border: progress===100 ? "none" : "3px solid rgba(200,200,200,0.6)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow: progress===100 ? "0 0 16px rgba(255,215,0,0.6)" : "0 2px 4px rgba(0,0,0,0.1)",
                    marginLeft:-4,
                  }}
                >
                  <span style={{fontSize:22}}>🏆</span>
                </div>
                <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:12, padding:"9px 14px", fontWeight:700, fontSize:15, color: progress===100?"#E6B800":"#888" }}>
                  {progress === 100 ? "おめでとう！受験日へ！" : "TOEIC受験日"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* クイズモーダル */}
      {quizModal && quizQuestion && (
        <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, maxWidth:500, width:"90%" }}>
            <div style={{ fontSize:15, marginBottom:16, lineHeight:1.6, color:"#333" }}>
              {CATEGORY_LABEL[quizCategory]} 問題
            </div>
            <div style={{ fontSize:15, marginBottom:16, lineHeight:1.6, color:"#333" }}>
              {quizQuestion.question}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {quizQuestion.options.map((opt, idx) => (
                <button key={idx} onClick={() => setQuizSelected(idx)} disabled={quizShowAnswer} style={{
                  padding:12, border: quizSelected === idx ? "2px solid #58cc02" : "2px solid #e0e0e0",
                  borderRadius:8, background: quizShowAnswer ? (idx === quizQuestion.answer ? "#d4f4dd" : quizSelected === idx ? "#ffd4d4" : "#fff") : quizSelected === idx ? "#f0f0f0" : "#fff",
                  cursor: quizShowAnswer ? "default" : "pointer", textAlign:"left", fontSize:14, color:"#333"
                }}>
                  {opt}
                </button>
              ))}
            </div>
            {quizShowAnswer && (
              <div style={{ background: quizSelected === quizQuestion.answer ? "#d4f4dd" : "#ffd4d4", padding:12, borderRadius:8, marginBottom:16 }}>
              <div style={{ fontWeight:700, marginBottom:8, color:"#333" }}>  
                  {quizSelected === quizQuestion.answer ? "正解！" : "不正解"}
                </div>
                <div style={{ fontSize:13, lineHeight:1.5, color:"#333" }}>{quizQuestion.explanation}</div>
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              {!quizShowAnswer && (
                <>
                  <button onClick={handleQuizAnswer} disabled={quizSelected === null} style={{
                    flex:1, padding:12, background: quizSelected === null ? "#ccc" : "#58cc02", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor: quizSelected === null ? "default" : "pointer"
                  }}>
                    回答する
                  </button>
                  <button onClick={handleQuizSkip} style={{ flex:1, padding:12, background:"#888", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
                    スキップ
                  </button>
                </>
              )}
              {quizShowAnswer && quizSelected !== quizQuestion.answer && (
                <button onClick={() => { setQuizSelected(null); setQuizShowAnswer(false); const newQ = getRandomQuestion(quizCategory); setQuizQuestion(newQ); }} style={{
                  flex:1, padding:12, background:"#58cc02", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer"
                }}>
                  もう一度挑戦
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}