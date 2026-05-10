import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// ─── Configuration ──────────────────────────────────────────
// IMPORTANT: never commit your real API key. Use a .env file (see README).
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5";

// ─── Demo data ──────────────────────────────────────────────
const COLORS = { High: "#34d399", Moderate: "#fbbf24", Low: "#fb923c", Fail: "#f87171" };
const TAGS = { High: "tag-h", Moderate: "tag-m", Low: "tag-l", Fail: "tag-f" };

const STUDENT = {
  name: "Yazan Alhaj Hassan",
  id: "2021-12345",
  program: "Computer Science",
  semester: "Spring 2025",
  courses: [
    { id: 1, code: "COMP 401", name: "Software Engineering", attendance: 85, quizAvg: 78, assignAvg: 82, midterm: 75, predicted: "Moderate", risks: ["Quiz performance below target (78% — target 80%)"] },
    { id: 2, code: "COMP 320", name: "Database Systems", attendance: 60, quizAvg: 55, assignAvg: 65, midterm: 58, predicted: "Fail", risks: ["Critical attendance deficit (60% — minimum 75%)", "Consistently low quiz scores", "Below-average midterm performance"] },
    { id: 3, code: "COMP 450", name: "Machine Learning", attendance: 92, quizAvg: 88, assignAvg: 90, midterm: 86, predicted: "High", risks: [] },
    { id: 4, code: "COMP 380", name: "Web Development", attendance: 78, quizAvg: 72, assignAvg: 75, midterm: 70, predicted: "Moderate", risks: ["Attendance could be improved", "Assignment average slightly below target"] },
  ],
};

const INSTRUCTOR = {
  name: "Dr. Noha Alharbi",
  course: "Machine Learning — COMP 450",
  students: [
    { id: 1, name: "Yazan Alhaj Hassan", attendance: 92, quiz: 88, midterm: 86, predicted: "High" },
    { id: 2, name: "Mohammed Almarzouk", attendance: 75, quiz: 72, midterm: 68, predicted: "Moderate" },
    { id: 3, name: "Loai Albalawi", attendance: 68, quiz: 60, midterm: 62, predicted: "Low" },
    { id: 4, name: "Abdulaziz Alhumaid", attendance: 95, quiz: 91, midterm: 89, predicted: "High" },
    { id: 5, name: "Sarah Al-Rashid", attendance: 55, quiz: 45, midterm: 50, predicted: "Fail" },
    { id: 6, name: "Omar Al-Qahtani", attendance: 80, quiz: 70, midterm: 73, predicted: "Moderate" },
    { id: 7, name: "Fatima Al-Zahrani", attendance: 88, quiz: 85, midterm: 83, predicted: "High" },
    { id: 8, name: "Ahmed Al-Dosari", attendance: 65, quiz: 58, midterm: 61, predicted: "Low" },
  ],
};

// ─── Helper components ──────────────────────────────────────
function Tag({ level }) {
  return <span className={`tag ${TAGS[level] || "tag-m"}`}>{level.toUpperCase()}</span>;
}

function Bar({ value, color }) {
  const c = color || (value >= 80 ? "#34d399" : value >= 65 ? "#fbbf24" : "#f87171");
  return (
    <div className="bar-bg">
      <div className="bar-fill" style={{ width: value + "%", background: c }} />
    </div>
  );
}

function MetRow({ label, value }) {
  const c = value >= 80 ? "#34d399" : value >= 65 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
        <span className="mono" style={{ color: c, fontSize: 13, fontWeight: 600 }}>{value}%</span>
      </div>
      <Bar value={value} color={c} />
    </div>
  );
}

function DonutRing({ value, color, size = 60 }) {
  const r = 26, circ = 2 * Math.PI * r, dash = (value / 100) * circ;
  return (
    <div className="donut" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 4px ${color}60)` }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div className="mono" style={{ color, fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{value}%</div>
        <div style={{ color: "#475569", fontSize: 9, marginTop: 2 }}>ATT</div>
      </div>
    </div>
  );
}

// Markdown → HTML for chat replies
function md(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => "<ul>" + m + "</ul>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
}

// ─── LLM API calls ──────────────────────────────────────────
async function callClaude(messages, maxTokens = 700) {
  if (!API_KEY) throw new Error("Missing VITE_ANTHROPIC_API_KEY in .env");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages }),
  });
  if (!res.ok) throw new Error("API error: " + res.status);
  const d = await res.json();
  return d.content.map((b) => b.text || "").join("").trim();
}

async function fetchRec(course) {
  const t0 = performance.now();
  try {
    const prompt = `You are an academic advisor AI for the SPGP system at AlMaarefa University.

Anonymized student data (no PII) for ${course.name} (${course.code}):
- Attendance: ${course.attendance}%
- Quiz Average: ${course.quizAvg}%
- Assignment Average: ${course.assignAvg}%
- Midterm Score: ${course.midterm}%
- Predicted Grade Category: ${course.predicted}
- Detected Risk Factors: ${course.risks.length ? course.risks.join("; ") : "None"}

Return ONLY valid JSON (no markdown):
{
  "summary": "one motivating sentence (max 22 words)",
  "confidence": 0.00,
  "recommendations": [
    {"area":"specific topic","action":"specific actionable step","priority":"high|medium|low"},
    {"area":"...","action":"...","priority":"..."},
    {"area":"...","action":"...","priority":"..."}
  ],
  "citations": ["e.g. AlMaarefa attendance policy 2024"]
}`;
    const txt = await callClaude([{ role: "user", content: prompt }], 700);
    const clean = txt.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, _latency: Math.round(performance.now() - t0), _source: MODEL, _error: null };
  } catch (e) {
    return {
      summary: course.predicted === "Fail"
        ? "Urgent action needed — focused steps now can recover this course before finals."
        : "You are on track — strategic focus will secure your strongest finish.",
      confidence: 0.72,
      recommendations: [
        { area: "Attendance", action: `Raise attendance above 80% — strongly correlated with final grade in ${course.name}.`, priority: course.attendance < 75 ? "high" : "medium" },
        { area: "Quiz preparation", action: "Re-do past quizzes weekly and cross-reference each missed item with lecture notes.", priority: course.quizAvg < 70 ? "high" : "medium" },
        { area: "Office hours", action: "Schedule a 30-minute session with the instructor this week for targeted guidance.", priority: "medium" },
      ],
      citations: ["AlMaarefa attendance policy", "Roediger & Karpicke (2006) — testing effect"],
      _latency: Math.round(performance.now() - t0),
      _source: "fallback (offline)",
      _error: e.message,
    };
  }
}

async function askAI(question, context, role) {
  const t0 = performance.now();
  try {
    const prompt = `You are an AI assistant in the SPGP (Student Performance & Grade Prediction) system at AlMaarefa University.

ROLE OF USER: ${role}

CONTEXT (anonymised data):
${context}

USER QUESTION: ${question}

Respond clearly and concisely (max 150 words). Use markdown:
- **bold** for emphasis
- bullet points (- ) for lists
- \`code\` for specific numbers/percentages
Be supportive and actionable. Do not invent data not in the context.`;
    const txt = await callClaude([{ role: "user", content: prompt }], 600);
    return { text: txt, latency: Math.round(performance.now() - t0), error: null };
  } catch (e) {
    return {
      text: "**I'm having trouble reaching the AI service right now.**\n\nBased on the data shown:\n- Focus on areas with the lowest scores first\n- Attendance below `75%` is a critical risk factor\n- Schedule office hours for personalised guidance\n\nPlease try your question again in a moment.",
      latency: Math.round(performance.now() - t0),
      error: e.message,
    };
  }
}

// ─── Chat panel ─────────────────────────────────────────────
function ChatPanel({ context, role, suggestions, accent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: q }];
    setMessages(newMsgs);
    setLoading(true);
    const reply = await askAI(q, context, role);
    setMessages([...newMsgs, { role: "ai", content: reply.text, latency: reply.latency, error: reply.error }]);
    setLoading(false);
  }

  function onKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }

  const accentColor = accent || "#63b3ed";

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accentColor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="ti ti-message-circle-question" style={{ color: accentColor, fontSize: 20 }} aria-hidden="true" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>Ask the AI</div>
          <div style={{ color: "#475569", fontSize: 12 }}>Powered by Claude Sonnet 4 · structured input → text output</div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-g" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setMessages([])}>
            <i className="ti ti-trash" style={{ verticalAlign: -1, marginRight: 3, fontSize: 12 }} aria-hidden="true" />Clear
          </button>
        )}
      </div>

      {messages.length === 0 && !loading && (
        <div style={{ padding: "6px 0 12px" }}>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
            {role === "instructor"
              ? "Ask Claude about your class — patterns, at-risk students, intervention ideas, or summaries."
              : "Ask Claude anything about your performance — study tips, schedules, weak areas, or motivation."}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestions.map((s, i) => (
              <button key={i} className="suggest-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ maxHeight: 380, overflowY: "auto", padding: "4px 2px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} style={{ display: "flex" }}><div className="msg-user">{m.content}</div></div>
            ) : (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div className="msg-ai" dangerouslySetInnerHTML={{ __html: md(m.content) }} />
                <div style={{ display: "flex", gap: 6, paddingLeft: 6 }}>
                  <span className="pill" style={{ background: "rgba(99,179,237,.08)", color: "#64748b", fontSize: 10 }}>
                    <i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" />{m.latency}ms
                  </span>
                  {m.error ? (
                    <span className="pill" style={{ background: "rgba(245,158,11,.1)", color: "#fbbf24", fontSize: 10 }}>fallback</span>
                  ) : (
                    <span className="pill" style={{ background: "rgba(16,185,129,.08)", color: "#34d399", fontSize: 10 }}>{MODEL}</span>
                  )}
                </div>
              </div>
            )
          )}
          {loading && (
            <div className="msg-ai" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="spin" />
              <span style={{ color: "#475569", fontSize: 13 }}>Claude is thinking...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div style={{ position: "relative", marginTop: 14 }}>
        <textarea
          className="chat-input"
          rows={1}
          placeholder={role === "instructor" ? "Ask about your class data..." : "Ask about your performance..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading}
          style={{ minHeight: 52, maxHeight: 120 }}
        />
        <button className="send-btn" disabled={!input.trim() || loading} onClick={() => send()} aria-label="Send">
          <i className="ti ti-send" style={{ color: "#fff", fontSize: 16 }} aria-hidden="true" />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: "#334155" }}>
        <i className="ti ti-shield-check" style={{ fontSize: 12, color: "#34d399" }} aria-hidden="true" />
        <span>Only anonymised performance metrics are sent to the AI · Press Enter to send</span>
      </div>
    </div>
  );
}

// ─── Login screen ───────────────────────────────────────────
function Login({ onSelect }) {
  return (
    <div className="screen" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 30% 50%,rgba(43,108,176,.06) 0%,transparent 60%),#070c18", padding: "24px" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(43,108,176,.12)", border: "1px solid rgba(43,108,176,.2)", borderRadius: 12, padding: "8px 18px", marginBottom: 28 }}>
            <i className="ti ti-school" style={{ color: "#63b3ed", fontSize: 18 }} aria-hidden="true" />
            <span className="mono" style={{ color: "#63b3ed", fontSize: 13, fontWeight: 600, letterSpacing: ".08em" }}>SPGP · LLM-POWERED</span>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>
            AI Student Performance<br />
            <span style={{ color: "#63b3ed" }}>& Grade Prediction</span>
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>Selected Topics — AlMaarefa University · CSIS Department</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div className="privacy">
            <i className="ti ti-shield-check" style={{ fontSize: 16 }} aria-hidden="true" />
            <span>Privacy: only anonymised performance metrics are sent to the LLM. No PII leaves the device.</span>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20, textAlign: "center" }}>Select your role to continue</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { role: "Student", icon: "ti-user-circle", desc: "View predictions, get AI advice, ask questions", color: "#63b3ed", fn: () => onSelect("student") },
              { role: "Instructor", icon: "ti-presentation", desc: "Monitor class & query AI about student data", color: "#a78bfa", fn: () => onSelect("instructor") },
            ].map((r) => (
              <button key={r.role} className="role-btn" onClick={r.fn}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`ti ${r.icon}`} style={{ color: r.color, fontSize: 22 }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{r.role} View</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{r.desc}</div>
                </div>
                <i className="ti ti-arrow-right" style={{ color: r.color, fontSize: 18 }} aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="mono" style={{ color: "#334155", fontSize: 11, textAlign: "center", marginTop: 22 }}>
            Team: Yazan · Loai · Abdulaziz · Mohammed · Supervisor: Dr. Noha Alharbi
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Student dashboard ──────────────────────────────────────
function StudentView({ onBack }) {
  const [sel, setSel] = useState(null);
  const [recs, setRecs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);

  async function open(c) {
    setSel(c);
    setShowJson(false);
    if (!recs[c.id]) {
      setLoading(true);
      const r = await fetchRec(c);
      setRecs((prev) => ({ ...prev, [c.id]: r }));
      setLoading(false);
    }
  }

  const counts = { High: 0, Moderate: 0, Low: 0, Fail: 0 };
  STUDENT.courses.forEach((c) => counts[c.predicted]++);
  const avgAtt = Math.round(STUDENT.courses.reduce((a, c) => a + c.attendance, 0) / STUDENT.courses.length);
  const priColor = { high: "#f87171", medium: "#fbbf24", low: "#34d399" };

  const fullContext = `Student courses:\n${STUDENT.courses.map((c) =>
    `- ${c.code} ${c.name}: attendance ${c.attendance}%, quiz avg ${c.quizAvg}%, assignment avg ${c.assignAvg}%, midterm ${c.midterm}%, predicted ${c.predicted}`
  ).join("\n")}`;

  const courseContext = sel
    ? `Course: ${sel.code} ${sel.name}\n- Attendance: ${sel.attendance}%\n- Quiz avg: ${sel.quizAvg}%\n- Assignment avg: ${sel.assignAvg}%\n- Midterm: ${sel.midterm}%\n- Predicted: ${sel.predicted}\n- Risks: ${sel.risks.length ? sel.risks.join("; ") : "none"}`
    : fullContext;

  return (
    <div className="screen">
      <div className="hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <i className="ti ti-school" style={{ color: "#63b3ed", fontSize: 20 }} aria-hidden="true" />
          <div style={{ width: 1, height: 18, background: "#1e293b" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{STUDENT.name}</div>
            <div className="mono" style={{ color: "#475569", fontSize: 11 }}>{STUDENT.id} · {STUDENT.program}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#475569", fontSize: 13 }}>{STUDENT.semester}</span>
          <button className="btn btn-g" onClick={() => { setSel(null); onBack(); }}>
            <i className="ti ti-arrow-left" style={{ verticalAlign: -2, marginRight: 5 }} aria-hidden="true" />Log out
          </button>
        </div>
      </div>

      <div className="scroll-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { l: "Enrolled", v: STUDENT.courses.length, u: "courses", c: "#63b3ed" },
            { l: "At risk", v: counts.Fail + counts.Low, u: "courses", c: "#f87171" },
            { l: "On track", v: counts.High + counts.Moderate, u: "courses", c: "#34d399" },
            { l: "Avg attendance", v: avgAtt, u: "%", c: "#fbbf24" },
          ].map((s) => (
            <div key={s.l} className="stat-card">
              <div className="mono" style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{s.l}</div>
              <div className="mono" style={{ color: s.c, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
              <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>{s.u}</div>
            </div>
          ))}
        </div>

        {!sel ? (
          <div>
            <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700, marginBottom: 18 }}>
              <i className="ti ti-chart-bar" style={{ marginRight: 8, verticalAlign: -2 }} aria-hidden="true" />
              Course performance predictions
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28 }}>
              {STUDENT.courses.map((c) => (
                <div key={c.id} className="card" style={{ padding: 22, cursor: "pointer" }} onClick={() => open(c)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div>
                      <div className="mono" style={{ color: "#475569", fontSize: 11, marginBottom: 3 }}>{c.code}</div>
                      <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                    </div>
                    <Tag level={c.predicted} />
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                    <DonutRing value={c.attendance} color={COLORS[c.predicted]} size={62} />
                    <div style={{ flex: 1 }}>
                      <MetRow label="Quiz average" value={c.quizAvg} />
                      <MetRow label="Assignments" value={c.assignAvg} />
                    </div>
                  </div>
                  {c.risks.length > 0 && (
                    <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                      <div style={{ color: "#f87171", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        <i className="ti ti-alert-triangle" style={{ marginRight: 5, verticalAlign: -1 }} aria-hidden="true" />Risk factors
                      </div>
                      {c.risks.map((r, i) => <div key={i} style={{ color: "#fca5a5", fontSize: 12, lineHeight: 1.5 }}>{r}</div>)}
                    </div>
                  )}
                  <div style={{ color: "#63b3ed", fontSize: 12, fontWeight: 600 }}>
                    <i className="ti ti-brain" style={{ marginRight: 5, verticalAlign: -1 }} aria-hidden="true" />
                    Click for AI recommendations
                  </div>
                </div>
              ))}
            </div>
            <ChatPanel
              context={fullContext}
              role="student"
              accent="#63b3ed"
              suggestions={[
                "Which course should I focus on first?",
                "Make me a weekly study plan",
                "How can I improve my Database Systems grade?",
                "What's my strongest subject?",
              ]}
            />
          </div>
        ) : (
          <div>
            <button className="btn btn-g" onClick={() => setSel(null)} style={{ marginBottom: 22 }}>
              <i className="ti ti-arrow-left" style={{ verticalAlign: -2, marginRight: 6 }} aria-hidden="true" />All courses
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>
              <div className="card" style={{ padding: 26 }}>
                <div style={{ marginBottom: 22 }}>
                  <div className="mono" style={{ color: "#475569", fontSize: 11, marginBottom: 3 }}>{sel.code}</div>
                  <h2 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 20, marginBottom: 10 }}>{sel.name}</h2>
                  <Tag level={sel.predicted} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                  {[
                    { l: "Attendance", v: sel.attendance },
                    { l: "Quiz avg", v: sel.quizAvg },
                    { l: "Assignments", v: sel.assignAvg },
                    { l: "Midterm", v: sel.midterm },
                  ].map((m) => (
                    <div key={m.l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                      <div className="mono" style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>{m.l}</div>
                      <div className="mono" style={{ color: m.v >= 80 ? "#34d399" : m.v >= 65 ? "#fbbf24" : "#f87171", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{m.v}%</div>
                    </div>
                  ))}
                </div>
                {sel.risks.length > 0 ? (
                  <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 12, padding: 16 }}>
                    <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 10, fontSize: 14 }}>
                      <i className="ti ti-alert-triangle" style={{ marginRight: 6, verticalAlign: -1 }} aria-hidden="true" />Risk factors detected
                    </div>
                    {sel.risks.map((r, i) => (
                      <div key={i} style={{ color: "#fca5a5", fontSize: 13, padding: "5px 0", borderBottom: i < sel.risks.length - 1 ? "1px solid rgba(239,68,68,.1)" : "none", lineHeight: 1.5 }}>{r}</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.18)", borderRadius: 12, padding: 14 }}>
                    <div style={{ color: "#34d399", fontWeight: 600, fontSize: 14 }}>
                      <i className="ti ti-circle-check" style={{ marginRight: 6, verticalAlign: -1 }} aria-hidden="true" />No risk factors — excellent performance!
                    </div>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(43,108,176,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-brain" style={{ color: "#63b3ed", fontSize: 20 }} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>AI recommendations</div>
                      <div style={{ color: "#475569", fontSize: 12 }}>Structured JSON output</div>
                    </div>
                  </div>
                  {recs[sel.id] && (
                    <button className={"filt-btn" + (showJson ? " on" : "")} onClick={() => setShowJson(!showJson)}>
                      <i className="ti ti-code" style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden="true" />
                      {showJson ? "View" : "JSON"}
                    </button>
                  )}
                </div>

                {loading && !recs[sel.id] ? (
                  <div style={{ textAlign: "center", padding: "44px 0" }}>
                    <div className="spin" style={{ margin: "0 auto 14px" }} />
                    <div className="mono" style={{ color: "#63b3ed", fontSize: 13 }}>Calling Claude API...</div>
                    <div style={{ color: "#334155", fontSize: 11, marginTop: 6 }}>Sending anonymised metrics only</div>
                  </div>
                ) : recs[sel.id] ? (
                  showJson ? (
                    <div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                        <span className="pill" style={{ background: "rgba(99,179,237,.12)", color: "#93c5fd" }}>
                          <i className="ti ti-clock" style={{ fontSize: 11 }} aria-hidden="true" />{recs[sel.id]._latency}ms
                        </span>
                        <span className="pill" style={{ background: "rgba(167,139,250,.12)", color: "#c4b5fd" }}>
                          <i className="ti ti-cpu" style={{ fontSize: 11 }} aria-hidden="true" />{recs[sel.id]._source}
                        </span>
                        {recs[sel.id]._error && (
                          <span className="pill" style={{ background: "rgba(245,158,11,.12)", color: "#fbbf24" }}>
                            <i className="ti ti-alert-circle" style={{ fontSize: 11 }} aria-hidden="true" />Fallback used
                          </span>
                        )}
                      </div>
                      <div className="json-box">
                        {JSON.stringify({
                          summary: recs[sel.id].summary,
                          confidence: recs[sel.id].confidence,
                          recommendations: recs[sel.id].recommendations,
                          citations: recs[sel.id].citations,
                        }, null, 2)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: "rgba(43,108,176,.1)", border: "1px solid rgba(43,108,176,.2)", borderRadius: 11, padding: 14, marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <i className="ti ti-quote" style={{ color: "#63b3ed", fontSize: 18, marginTop: 2 }} aria-hidden="true" />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "#93c5fd", fontSize: 13, lineHeight: 1.65, fontStyle: "italic", marginBottom: 6 }}>{recs[sel.id].summary}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="mono" style={{ color: "#475569", fontSize: 10 }}>AI confidence</span>
                            <div style={{ flex: 1, maxWidth: 80, height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: Math.round((recs[sel.id].confidence || 0.7) * 100) + "%", background: "#63b3ed", borderRadius: 2 }} />
                            </div>
                            <span className="mono" style={{ color: "#93c5fd", fontSize: 11, fontWeight: 600 }}>
                              {Math.round((recs[sel.id].confidence || 0.7) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {recs[sel.id].recommendations.map((r, i) => {
                        const pc = priColor[r.priority] || "#fbbf24";
                        return (
                          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, borderLeft: `3px solid ${pc}` }}>
                            <div className="rec-num">{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{r.area}</span>
                                <span className="mono" style={{ color: pc, fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>{r.priority}</span>
                              </div>
                              <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>{r.action}</p>
                            </div>
                          </div>
                        );
                      })}
                      {recs[sel.id].citations && recs[sel.id].citations.length > 0 && (
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="mono" style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
                            <i className="ti ti-bookmark" style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden="true" />Sources cited by AI
                          </div>
                          {recs[sel.id].citations.map((c, i) => (
                            <div key={i} style={{ color: "#64748b", fontSize: 11, padding: "3px 0" }}>• {c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : null}
              </div>
            </div>

            <ChatPanel
              context={courseContext}
              role="student"
              accent="#63b3ed"
              suggestions={[
                `How do I improve in ${sel.name}?`,
                "Make me a study schedule for this course",
                "What topics should I prioritise?",
                "Should I drop this course?",
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Instructor dashboard ───────────────────────────────────
function InstructorView({ onBack }) {
  const [filter, setFilter] = useState("All");
  const counts = { All: INSTRUCTOR.students.length, High: 0, Moderate: 0, Low: 0, Fail: 0 };
  INSTRUCTOR.students.forEach((s) => counts[s.predicted]++);
  const list = filter === "All" ? INSTRUCTOR.students : INSTRUCTOR.students.filter((s) => s.predicted === filter);
  const failStudents = INSTRUCTOR.students.filter((s) => s.predicted === "Fail").map((s) => s.name.split(" ")[0]);

  const classContext = `Class: ${INSTRUCTOR.course}\nTotal students: ${INSTRUCTOR.students.length}\nDistribution: ${counts.High} High, ${counts.Moderate} Moderate, ${counts.Low} Low, ${counts.Fail} Fail risk\n\nStudents:\n${INSTRUCTOR.students.map((s) =>
    `- Student ${s.id}: attendance ${s.attendance}%, quiz avg ${s.quiz}%, midterm ${s.midterm}%, predicted ${s.predicted}`
  ).join("\n")}`;

  return (
    <div className="screen">
      <div className="hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <i className="ti ti-school" style={{ color: "#a78bfa", fontSize: 20 }} aria-hidden="true" />
          <div style={{ width: 1, height: 18, background: "#1e293b" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{INSTRUCTOR.name}</div>
            <div className="mono" style={{ color: "#475569", fontSize: 11 }}>Instructor · {INSTRUCTOR.course}</div>
          </div>
        </div>
        <button className="btn btn-g" onClick={onBack}>
          <i className="ti ti-arrow-left" style={{ verticalAlign: -2, marginRight: 5 }} aria-hidden="true" />Log out
        </button>
      </div>

      <div className="scroll-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { l: "High grade", v: counts.High, c: "#34d399", d: "Predicted high" },
            { l: "Moderate", v: counts.Moderate, c: "#fbbf24", d: "On track" },
            { l: "Low risk", v: counts.Low, c: "#fb923c", d: "Needs attention" },
            { l: "Fail risk", v: counts.Fail, c: "#f87171", d: "Immediate action" },
          ].map((s) => (
            <div key={s.l} className="stat-card" style={{ borderLeft: `3px solid ${s.c}` }}>
              <div className="mono" style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 7 }}>{s.l}</div>
              <div className="mono" style={{ color: s.c, fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
              <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["All", "High", "Moderate", "Low", "Fail"].map((f) => (
            <button key={f} className={`filt-btn${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
              {f} {f !== "All" ? `(${counts[f]})` : ""}
            </button>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden", marginBottom: 22 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Student", "Attendance", "Quiz avg", "Midterm", "Predicted", "Status"].map((h) => (
                  <th key={h} style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontSize: 11, fontFamily: "IBM Plex Mono,monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="tr-row">
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: `${COLORS[s.predicted]}18`, border: `2px solid ${COLORS[s.predicted]}30`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS[s.predicted], fontWeight: 700, fontSize: 13 }}>{s.name.charAt(0)}</div>
                      <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 70, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: s.attendance + "%", background: s.attendance >= 80 ? "#34d399" : s.attendance >= 65 ? "#fbbf24" : "#f87171", borderRadius: 3 }} />
                      </div>
                      <span className="mono" style={{ color: s.attendance >= 80 ? "#34d399" : s.attendance >= 65 ? "#fbbf24" : "#f87171", fontSize: 12, fontWeight: 600 }}>{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="mono" style={{ padding: "14px 18px", color: s.quiz >= 75 ? "#34d399" : s.quiz >= 60 ? "#fbbf24" : "#f87171", fontWeight: 600, fontSize: 13 }}>{s.quiz}%</td>
                  <td className="mono" style={{ padding: "14px 18px", color: s.midterm >= 75 ? "#34d399" : s.midterm >= 60 ? "#fbbf24" : "#f87171", fontWeight: 600, fontSize: 13 }}>{s.midterm}%</td>
                  <td style={{ padding: "14px 18px" }}><Tag level={s.predicted} /></td>
                  <td style={{ padding: "14px 18px" }}>
                    {s.predicted === "Fail" && (
                      <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>
                        <i className="ti ti-alert-circle" style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden="true" />Needs intervention
                      </span>
                    )}
                    {s.predicted === "Low" && (
                      <span style={{ color: "#fb923c", fontSize: 12, fontWeight: 600 }}>
                        <i className="ti ti-eye" style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden="true" />Monitor closely
                      </span>
                    )}
                    {s.predicted === "Moderate" && (
                      <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 600 }}>
                        <i className="ti ti-circle-dot" style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden="true" />On track
                      </span>
                    )}
                    {s.predicted === "High" && (
                      <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>
                        <i className="ti ti-circle-check" style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden="true" />Performing well
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {counts.Fail > 0 && (
          <div style={{ marginBottom: 22, padding: "14px 18px", background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 12, fontSize: 14 }}>
            <span style={{ color: "#f87171", fontWeight: 700 }}>
              <i className="ti ti-alert-triangle" style={{ verticalAlign: -1, marginRight: 6 }} aria-hidden="true" />Intervention alert:{" "}
            </span>
            <span style={{ color: "#94a3b8" }}>
              {failStudents.join(" and ")} {failStudents.length > 1 ? "are" : "is"} at critical risk of failing. Immediate academic support is recommended.
            </span>
          </div>
        )}

        <ChatPanel
          context={classContext}
          role="instructor"
          accent="#a78bfa"
          suggestions={[
            "Summarise the class performance",
            "Which topics should I review next session?",
            "Suggest interventions for at-risk students",
            "What's the average attendance pattern?",
          ]}
        />
      </div>
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  if (screen === "login") return <Login onSelect={setScreen} />;
  if (screen === "student") return <StudentView onBack={() => setScreen("login")} />;
  return <InstructorView onBack={() => setScreen("login")} />;
}
