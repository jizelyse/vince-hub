import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// ─── VINLAND SAGA QUOTES ─────────────────────────────────────────────────────
const QUOTES = [
  { text: "A true warrior needs no sword.", author: "Askeladd" },
  { text: "You have no enemies. No one has the right to take a life.", author: "Thors" },
  { text: "Don't waste your time trying to fight. Use it to run and live.", author: "Thors" },
  { text: "What does it mean to be strong? Think about it.", author: "Thors" },
  { text: "There is no enemy. There is no one you need to fight.", author: "Thors" },
  { text: "A real warrior doesn't need a sword.", author: "Thors" },
  { text: "Keep moving forward. That is all.", author: "Askeladd" },
  { text: "You've finally found it. Your own fight.", author: "Askeladd" },
  { text: "I have no enemies. That is my pride.", author: "Thorfinn" },
  { text: "Surpass your limits. Right here. Right now.", author: "Thorfinn" },
  { text: "The weak don't get to choose how they die.", author: "Askeladd" },
  { text: "Go on living. Find your true fight.", author: "Askeladd" },
  { text: "A man's worth isn't in his sword arm.", author: "Thors" },
  { text: "Do you have a place you truly want to protect?", author: "Thorfinn" },
  { text: "Strength without purpose is just violence.", author: "Thors" },
];

const getDailyQuote = () => {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
};

// ─── BLEACH CHARACTERS ───────────────────────────────────────────────────────
const BLEACH_CHARS = [
  { name: "Ichigo", role: "Soul Reaper", color: "#ff3a3a", bg: "rgba(255,58,58,0.08)" },
  { name: "Rukia", role: "Shinigami", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  { name: "Byakuya", role: "Captain", color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
  { name: "Aizen", role: "Traitor", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
];

// ─── AI ───────────────────────────────────────────────────────────────────────
const callAI = async (prompt, system = "") => {
  try {
    const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    const res = await fetch(GEMINI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  } catch { return ""; }
};

const callAIVision = async (base64, mimeType, prompt) => {
  try {
    const body = { contents: [{ role: "user", parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: prompt }] }] };
    const res = await fetch(GEMINI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  } catch { return ""; }
};

const parseJSON = str => { try { return JSON.parse(str.replace(/```json|```/g, "").trim()); } catch { return null; } };

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const sbAuth = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
};

const todayKey = () => new Date().toISOString().split("T")[0];

const useLS = (key, init) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  const save = v => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, save];
};

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#060608",
  surface: "#0c0c10",
  surface2: "#111116",
  border: "rgba(255,255,255,0.06)",
  borderHi: "rgba(255,255,255,0.12)",
  text: "#f0f0f0",
  muted: "#666",
  dim: "#2a2a2a",
  accent: "#c8c8c8",
  red: "#e63946",
  gold: "#d4a017",
  blue: "#4a9eff",
  green: "#3ddc84",
  purple: "#9d7aff",
  yellow: "#f5c518",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
  input::placeholder, textarea::placeholder { color: #2a2a2a; }
  input:focus, textarea:focus { outline: none; }
  button { font-family: inherit; cursor: pointer; border: none; background: none; }
  * { -webkit-tap-highlight-color: transparent; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slash { from { transform: translateX(-120%) skewX(-20deg); opacity: 0; } to { transform: translateX(0) skewX(-20deg); opacity: 1; } }
  .fade-up { animation: fadeUp 0.3s ease both; }
  .fade-in { animation: fadeIn 0.25s ease both; }

  /* BLEACH UI ELEMENTS */
  .bleach-line {
    position: relative;
    overflow: hidden;
  }
  .bleach-line::before {
    content: '';
    position: absolute;
    left: 0; top: 0;
    width: 2px; height: 100%;
    background: linear-gradient(180deg, ${C.red}, transparent);
  }
  .soul-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: ${C.muted};
    border: 1px solid rgba(255,255,255,0.06);
    padding: 2px 8px;
    border-radius: 2px;
  }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, onClick, glow }) => (
  <div onClick={onClick} style={{
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "18px 20px",
    transition: "all 0.2s",
    position: "relative",
    overflow: "hidden",
    ...(glow ? { boxShadow: `0 0 40px ${glow}` } : {}),
    ...(onClick ? { cursor: "pointer" } : {}),
    ...style,
  }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = C.borderHi; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = C.border; } : undefined}
  >
    {/* Bleach diagonal accent */}
    <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, background: `linear-gradient(225deg, rgba(230,57,70,0.06) 0%, transparent 60%)`, pointerEvents: "none" }} />
    {children}
  </div>
);

const Label = ({ children, style = {}, red }) => (
  <div style={{
    fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
    color: red ? C.red : C.muted, marginBottom: 12,
    fontFamily: "'JetBrains Mono', monospace",
    display: "flex", alignItems: "center", gap: 8,
    ...style,
  }}>
    {red && <span style={{ display: "inline-block", width: 6, height: 6, background: C.red, borderRadius: "50%", flexShrink: 0 }} />}
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "default", size = "md", full, disabled, style = {} }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 4, fontWeight: 500, transition: "all 0.15s",
    fontSize: size === "sm" ? 11 : 12,
    padding: size === "sm" ? "5px 12px" : "8px 16px",
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "0.04em",
    fontFamily: "inherit",
  };
  const v = {
    default: { background: C.surface2, border: `1px solid ${C.border}`, color: C.accent },
    primary: { background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.25)", color: C.red },
    gold: { background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.25)", color: C.gold },
    ghost: { background: "transparent", border: "1px solid transparent", color: C.muted },
    danger: { background: "rgba(255,77,77,0.06)", border: "1px solid rgba(255,77,77,0.15)", color: "#f87171" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.75"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
};

const Input = ({ value, onChange, placeholder, type = "text", onKeyDown, style = {}, multiline, rows = 4 }) => {
  const base = {
    width: "100%", background: C.surface2, border: `1px solid ${C.border}`,
    borderRadius: 4, color: C.text, padding: "9px 12px", fontSize: 13,
    transition: "border-color 0.2s", fontFamily: "inherit",
    ...(multiline ? { resize: "vertical" } : {}),
    ...style,
  };
  if (multiline) return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base} onFocus={e => e.target.style.borderColor = C.borderHi} onBlur={e => e.target.style.borderColor = C.border} />;
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={base} onFocus={e => e.target.style.borderColor = C.borderHi} onBlur={e => e.target.style.borderColor = C.border} />;
};

const Bar = ({ pct, color = C.accent }) => (
  <div style={{ height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 1, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: color, transition: "width 0.5s ease", borderRadius: 1 }} />
  </div>
);

const Spinner = () => <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: C.red, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;

const StatBox = ({ label, value, color = C.text }) => (
  <div style={{ textAlign: "center", padding: "12px 6px", background: C.surface2, borderRadius: 6, border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: C.muted, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</div>
  </div>
);

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    const data = await sbAuth(email, password);
    if (data.access_token) {
      localStorage.setItem("sb_session", JSON.stringify(data));
      onLogin(data.user);
    } else {
      setError("Access denied.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24, position: "relative", overflow: "hidden" }}>
      {/* Bleach background art - diagonal lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: -100, left: `${i * 20 - 10}%`, width: 1, height: "150%", background: `rgba(230,57,70,${0.03 - i * 0.004})`, transform: "rotate(15deg)", transformOrigin: "top" }} />
        ))}
      </div>
      {/* Glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle, rgba(230,57,70,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 340, position: "relative" }} className="fade-up">
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: C.red, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, marginBottom: 12 }}>SOUL SOCIETY</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: C.text }}>VINCE HUB</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, letterSpacing: "0.05em" }}>{getGreeting()}</div>
        </div>

        {/* Bleach character strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {BLEACH_CHARS.map(c => (
            <div key={c.name} style={{ flex: 1, padding: "8px 4px", background: c.bg, border: `1px solid ${c.color}22`, borderRadius: 4, textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: c.color, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono',monospace" }}>{c.name.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
            <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === "Enter" && handle()} />
            {error && <div style={{ color: C.red, fontSize: 12, letterSpacing: "0.02em" }}>{error}</div>}
            <Btn variant="primary" full onClick={handle} disabled={loading}>
              {loading ? <Spinner /> : "Enter"}
            </Btn>
          </div>
        </Card>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: C.dim }}>Restricted access</div>
      </div>
    </div>
  );
};

// ─── WATER ───────────────────────────────────────────────────────────────────
const Water = () => {
  const [cups, setCups] = useLS(`water_${todayKey()}`, 0);
  const goal = 8;
  return (
    <Card>
      <Label>Water Intake</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: C.blue, fontFamily: "'JetBrains Mono',monospace" }}>{cups}</span>
        <span style={{ color: C.muted, fontSize: 13 }}>/ {goal} cups</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 28, borderRadius: 3, background: i < cups ? C.blue : C.surface2, border: `1px solid ${i < cups ? "rgba(74,158,255,0.3)" : C.border}`, transition: "all 0.2s", opacity: i < cups ? 1 : 0.5 }} />
        ))}
      </div>
      <Bar pct={(cups / goal) * 100} color={C.blue} />
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Btn size="sm" onClick={() => setCups(Math.min(goal, cups + 1))}>+ Add</Btn>
        <Btn size="sm" variant="ghost" onClick={() => setCups(Math.max(0, cups - 1))}>Remove</Btn>
      </div>
    </Card>
  );
};

// ─── HEALTH ──────────────────────────────────────────────────────────────────
const Health = () => {
  const [stats, setStats] = useLS("health_stats", { weight: "", height: "", age: "" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stats);
  const bmi = stats.weight && stats.height ? (parseFloat(stats.weight) / ((parseFloat(stats.height) / 100) ** 2)).toFixed(1) : null;
  const bmiInfo = bmi ? (bmi < 18.5 ? ["Underweight", C.blue] : bmi < 25 ? ["Normal", C.green] : bmi < 30 ? ["Overweight", C.yellow] : ["Obese", C.red]) : null;

  return (
    <Card>
      <Label>Health Stats</Label>
      {!editing ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <StatBox label="Weight" value={stats.weight ? `${stats.weight}kg` : "—"} />
            <StatBox label="Height" value={stats.height ? `${stats.height}cm` : "—"} />
            <StatBox label="Age" value={stats.age || "—"} />
          </div>
          {bmi && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: C.surface2, borderRadius: 6, marginBottom: 12, border: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>BMI</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: bmiInfo[1], fontFamily: "'JetBrains Mono',monospace" }}>{bmi}</div>
              </div>
              <div style={{ color: bmiInfo[1], fontSize: 13, fontWeight: 500 }}>{bmiInfo[0]}</div>
            </div>
          )}
          <Btn size="sm" onClick={() => { setDraft(stats); setEditing(true); }}>Edit</Btn>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["weight", "Weight (kg)"], ["height", "Height (cm)"], ["age", "Age"]].map(([k, lbl]) => (
            <div key={k}>
              <Label style={{ marginBottom: 6 }}>{lbl}</Label>
              <Input type="number" value={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.value })} placeholder={lbl} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="primary" onClick={() => { setStats(draft); setEditing(false); }}>Save</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── WORKOUT ─────────────────────────────────────────────────────────────────
const Workout = () => {
  const [plans, setPlans] = useLS("workout_plans", [
    { id: 1, name: "Push", exercises: [{ id: 1, name: "Bench Press 4x8", done: false }, { id: 2, name: "Overhead Press 3x10", done: false }, { id: 3, name: "Tricep Dips 3x12", done: false }] },
    { id: 2, name: "Pull", exercises: [{ id: 1, name: "Deadlift 4x5", done: false }, { id: 2, name: "Pull-ups 4x8", done: false }, { id: 3, name: "Barbell Row 3x10", done: false }] },
    { id: 3, name: "Legs", exercises: [{ id: 1, name: "Squat 4x6", done: false }, { id: 2, name: "Romanian DL 3x10", done: false }, { id: 3, name: "Leg Press 3x12", done: false }] },
  ]);
  const [active, setActive] = useState(0);
  const [newEx, setNewEx] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const plan = plans[active];
  const done = plan?.exercises.filter(e => e.done).length || 0;
  const total = plan?.exercises.length || 0;

  const toggle = id => setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: p.exercises.map(e => e.id === id ? { ...e, done: !e.done } : e) }));
  const addEx = () => { if (!newEx.trim()) return; setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: [...p.exercises, { id: Date.now(), name: newEx.trim(), done: false }] })); setNewEx(""); };
  const delEx = id => setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: p.exercises.filter(e => e.id !== id) }));
  const reset = () => setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: p.exercises.map(e => ({ ...e, done: false })) }));
  const addPlan = () => { if (!newPlan.trim()) return; setPlans([...plans, { id: Date.now(), name: newPlan.trim(), exercises: [] }]); setNewPlan(""); };

  return (
    <Card>
      <Label>Workout Tracker</Label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {plans.map((p, i) => (
          <button key={p.id} onClick={() => setActive(i)} style={{ padding: "4px 12px", borderRadius: 3, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.06em", fontFamily: "inherit", background: i === active ? "rgba(230,57,70,0.1)" : "transparent", border: `1px solid ${i === active ? "rgba(230,57,70,0.3)" : C.border}`, color: i === active ? C.red : C.muted }}>{p.name.toUpperCase()}</button>
        ))}
      </div>
      {plan && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{done}/{total}</span>
            <Btn size="sm" variant="ghost" onClick={reset}>Reset</Btn>
          </div>
          <Bar pct={total ? (done / total) * 100 : 0} color={C.red} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0" }}>
            {plan.exercises.map(ex => (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, background: ex.done ? "rgba(230,57,70,0.04)" : C.surface2, border: `1px solid ${ex.done ? "rgba(230,57,70,0.15)" : C.border}`, transition: "all 0.2s", cursor: "pointer" }} onClick={() => toggle(ex.id)}>
                <div style={{ width: 15, height: 15, borderRadius: 2, flexShrink: 0, border: `1px solid ${ex.done ? C.red : C.dim}`, background: ex.done ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  {ex.done && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ flex: 1, fontSize: 13, color: ex.done ? C.muted : C.text, textDecoration: ex.done ? "line-through" : "none" }}>{ex.name}</span>
                <span onClick={e => { e.stopPropagation(); delEx(ex.id); }} style={{ color: C.dim, fontSize: 16, padding: "0 2px" }}>×</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={newEx} onChange={e => setNewEx(e.target.value)} placeholder="Add exercise..." onKeyDown={e => e.key === "Enter" && addEx()} style={{ flex: 1 }} />
            <Btn size="sm" onClick={addEx}>Add</Btn>
          </div>
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <Input value={newPlan} onChange={e => setNewPlan(e.target.value)} placeholder="New plan..." onKeyDown={e => e.key === "Enter" && addPlan()} style={{ flex: 1 }} />
        <Btn size="sm" onClick={addPlan}>+ Plan</Btn>
      </div>
    </Card>
  );
};

// ─── CALORIES ────────────────────────────────────────────────────────────────
const Calories = () => {
  const [entries, setEntries] = useLS(`calories_${todayKey()}`, []);
  const goalCal = 2200;
  const [food, setFood] = useState("");
  const [cals, setCals] = useState("");
  const [prot, setProt] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const totalCal = entries.reduce((s, e) => s + (e.cal || 0), 0);
  const totalProt = entries.reduce((s, e) => s + (e.prot || 0), 0);

  const aiGuess = async () => {
    if (!food.trim()) return;
    setLoading(true); setHint("");
    const res = await callAI(`Estimate calories and protein for: "${food}". Typical Filipino/Asian home serving. Reply ONLY valid JSON no markdown: {"calories":number,"protein":number,"note":"brief"}`, "Nutrition expert. Valid JSON only.");
    const p = parseJSON(res);
    if (p) { setCals(String(p.calories || "")); setProt(String(p.protein || "")); setHint(p.note || ""); }
    else setHint("Could not estimate. Fill manually.");
    setLoading(false);
  };

  const add = () => {
    if (!food.trim() || !cals) return;
    setEntries([...entries, { id: Date.now(), name: food, cal: parseInt(cals) || 0, prot: parseInt(prot) || 0 }]);
    setFood(""); setCals(""); setProt(""); setHint("");
  };

  return (
    <Card>
      <Label>Calorie Tracker</Label>
      <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color: totalCal > goalCal * 0.9 ? C.red : C.green, fontFamily: "'JetBrains Mono',monospace" }}>{totalCal}</div>
          <div style={{ fontSize: 11, color: C.muted }}>of {goalCal} kcal</div>
        </div>
        <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 20 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.blue, fontFamily: "'JetBrains Mono',monospace" }}>{totalProt}g</div>
          <div style={{ fontSize: 11, color: C.muted }}>protein</div>
        </div>
      </div>
      <Bar pct={(totalCal / goalCal) * 100} color={totalCal > goalCal * 0.9 ? C.red : C.green} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Input value={food} onChange={e => setFood(e.target.value)} placeholder="Food item..." style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && aiGuess()} />
          <Btn size="sm" variant="primary" onClick={aiGuess} disabled={loading}>{loading ? <Spinner /> : "AI"}</Btn>
        </div>
        {hint && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>{hint}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <Input type="number" value={cals} onChange={e => setCals(e.target.value)} placeholder="kcal" />
          <Input type="number" value={prot} onChange={e => setProt(e.target.value)} placeholder="protein g" />
          <Btn size="sm" onClick={add}>Add</Btn>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 14, maxHeight: 160, overflowY: "auto" }}>
        {entries.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: C.surface2, borderRadius: 5, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.text }}>{e.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{e.cal}kcal · {e.prot}g</span>
              <span onClick={() => setEntries(entries.filter(x => x.id !== e.id))} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span>
            </div>
          </div>
        ))}
        {entries.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 10 }}>Nothing logged</div>}
      </div>
    </Card>
  );
};

// ─── FOOD PHOTO ───────────────────────────────────────────────────────────────
const FoodPhoto = () => {
  const [img, setImg] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const fileRef = useRef();

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setImg(ev.target.result); setResult(null); };
    r.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!img) return; setLoading(true); setResult(null);
    const base64 = img.split(",")[1];
    const mimeType = img.split(";")[0].split(":")[1];
    const prompt = `Analyze this food photo.${note ? ` Context: "${note}"` : ""} Give best estimate. Reply ONLY valid JSON no markdown: {"food":"name","calories":number,"protein":number,"carbs":number,"fat":number,"note":"any uncertainty","followUp":"one clarifying question if very uncertain, else empty string"}`;
    const res = await callAIVision(base64, mimeType, prompt);
    const parsed = parseJSON(res);
    setResult(parsed || { food: "Unknown", calories: 0, protein: 0, carbs: 0, fat: 0, note: "Could not analyze." });
    setLoading(false);
  };

  return (
    <Card>
      <Label>AI Food Scanner</Label>
      <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 150, border: `2px dashed ${C.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: 12, background: C.surface2, transition: "border-color 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
      >
        {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center", color: C.dim }}><div style={{ fontSize: 22, marginBottom: 6 }}>+</div><div style={{ fontSize: 12 }}>Upload food photo</div></div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {img && (
        <>
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Any context? (e.g. homemade, restaurant)" style={{ marginBottom: 10 }} />
          <Btn variant="primary" full onClick={analyze} disabled={loading}>{loading ? <><Spinner /> &nbsp;Analyzing...</> : "Analyze Food"}</Btn>
        </>
      )}
      {result && (
        <div style={{ marginTop: 14, padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{result.food}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[["Calories", result.calories, "kcal", C.yellow], ["Protein", result.protein, "g", C.green], ["Carbs", result.carbs, "g", C.blue], ["Fat", result.fat, "g", C.red]].map(([l, v, u, c]) => (
              <div key={l} style={{ padding: "8px 10px", background: C.surface, borderRadius: 6, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 3 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{v}<span style={{ fontSize: 10, color: C.muted }}> {u}</span></div>
              </div>
            ))}
          </div>
          {result.note && <div style={{ fontSize: 12, color: C.muted, marginBottom: result.followUp ? 8 : 0 }}>{result.note}</div>}
          {result.followUp && <div style={{ fontSize: 12, color: C.blue, padding: "8px 10px", background: "rgba(74,158,255,0.06)", borderRadius: 6, border: "1px solid rgba(74,158,255,0.15)" }}>{result.followUp}</div>}
        </div>
      )}
    </Card>
  );
};

// ─── TODO ─────────────────────────────────────────────────────────────────────
const Todo = () => {
  const [todos, setTodos] = useLS("todos", []);
  const [input, setInput] = useState("");
  const add = () => { if (!input.trim()) return; setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]); setInput(""); };
  const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = id => setTodos(todos.filter(t => t.id !== id));

  return (
    <Card>
      <Label>Tasks</Label>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Add a task..." onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1 }} />
        <Btn size="sm" variant="primary" onClick={add}>Add</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
        {todos.filter(t => !t.done).map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.surface2, borderRadius: 6, border: `1px solid ${C.border}` }}>
            <div onClick={() => toggle(t.id)} style={{ width: 15, height: 15, borderRadius: 3, border: `1px solid ${C.dim}`, cursor: "pointer", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13 }}>{t.text}</span>
            <span onClick={() => remove(t.id)} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span>
          </div>
        ))}
        {todos.filter(t => t.done).map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, opacity: 0.4 }}>
            <div onClick={() => toggle(t.id)} style={{ width: 15, height: 15, borderRadius: 3, border: `1px solid ${C.dim}`, cursor: "pointer", flexShrink: 0, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ flex: 1, fontSize: 13, textDecoration: "line-through", color: C.muted }}>{t.text}</span>
            <span onClick={() => remove(t.id)} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span>
          </div>
        ))}
        {todos.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 12 }}>No tasks</div>}
      </div>
    </Card>
  );
};

// ─── GOAL ─────────────────────────────────────────────────────────────────────
const Goal = () => {
  const [goal, setGoal] = useLS("goal_main", null);
  const [steps, setSteps] = useLS("goal_steps", []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!input.trim()) return;
    setLoading(true); setError("");
    const res = await callAI(
      `Goal: "${input.trim()}". Break into 5 to 7 concrete actionable steps with realistic time estimates. Reply ONLY valid JSON, no markdown, no explanation: {"steps":[{"text":"step description","time":"e.g. 1 week"}],"totalTime":"e.g. 2 months"}`,
      "You are a life coach. Reply ONLY with valid JSON. No markdown. No explanation. Nothing else."
    );
    const parsed = parseJSON(res);
    if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
      setGoal({ text: input.trim(), totalTime: parsed.totalTime || "TBD", created: new Date().toLocaleDateString() });
      setSteps(parsed.steps.map((s, i) => ({ ...s, id: i, done: false })));
      setInput("");
    } else {
      setError("Could not generate steps. Try rephrasing your goal.");
    }
    setLoading(false);
  };

  const toggle = id => setSteps(steps.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const done = steps.filter(s => s.done).length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;

  if (!goal) return (
    <Card>
      <Label>Goal Tracker</Label>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.7 }}>Set one meaningful goal. AI breaks it into clear steps.</div>
      <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. Run a 5K in 3 months" style={{ marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && !loading && create()} />
      {error && <div style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{error}</div>}
      <Btn variant="primary" onClick={create} disabled={loading || !input.trim()}>
        {loading ? <><Spinner />&nbsp; Breaking it down...</> : "Set Goal with AI"}
      </Btn>
    </Card>
  );

  return (
    <Card>
      <Label>Goal Tracker</Label>
      <div style={{ padding: "10px 12px", background: C.surface2, borderRadius: 6, marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{goal.text}</div>
        <div style={{ fontSize: 11, color: C.muted }}>Started {goal.created} · Est. {goal.totalTime}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{done}/{steps.length} steps</span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(pct)}%</span>
      </div>
      <Bar pct={pct} color={C.purple} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "14px 0" }}>
        {steps.map(s => (
          <div key={s.id} onClick={() => toggle(s.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", borderRadius: 6, cursor: "pointer", background: s.done ? "rgba(157,122,255,0.05)" : C.surface2, border: `1px solid ${s.done ? "rgba(157,122,255,0.2)" : C.border}`, transition: "all 0.2s" }}>
            <div style={{ width: 15, height: 15, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: `1px solid ${s.done ? C.purple : C.dim}`, background: s.done ? C.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
              {s.done && <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: s.done ? C.muted : C.text, textDecoration: s.done ? "line-through" : "none" }}>{s.text}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{s.time}</div>
            </div>
          </div>
        ))}
      </div>
      <Btn size="sm" variant="danger" onClick={() => { setGoal(null); setSteps([]); }}>Clear Goal</Btn>
    </Card>
  );
};

// ─── LOG ──────────────────────────────────────────────────────────────────────
const Log = ({ storageKey, title, placeholder }) => {
  const [entries, setEntries] = useLS(storageKey, []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", comment: "", rating: 0, poster: "" });
  const fileRef = useRef();

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => setDraft(d => ({ ...d, poster: ev.target.result })); r.readAsDataURL(file);
  };
  const save = () => {
    if (!draft.title.trim()) return;
    setEntries([{ ...draft, id: Date.now(), date: new Date().toLocaleDateString() }, ...entries]);
    setDraft({ title: "", comment: "", rating: 0, poster: "" }); setAdding(false);
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Label style={{ marginBottom: 0 }}>{title}</Label>
        <Btn size="sm" onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ Add"}</Btn>
      </div>
      {adding && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 90, border: `2px dashed ${C.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: C.surface }}>
            {draft.poster ? <img src={draft.poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: C.dim, fontSize: 12 }}>Upload poster / cover</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <Input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder={placeholder} />
          <Input value={draft.comment} onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))} placeholder="Your thoughts..." multiline rows={3} />
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4,5].map(s => (
              <div key={s} onClick={() => setDraft(d => ({ ...d, rating: s }))} style={{ cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={s <= draft.rating ? C.gold : "none"} stroke={s <= draft.rating ? C.gold : C.dim} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </div>
            ))}
          </div>
          <Btn variant="primary" onClick={save}>Save</Btn>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
        {entries.map(e => (
          <div key={e.id} style={{ display: "flex", gap: 10, padding: 12, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
            {e.poster && <img src={e.poster} alt="" style={{ width: 42, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0, border: `1px solid ${C.border}` }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
              <div style={{ display: "flex", gap: 2, marginBottom: 5 }}>{[1,2,3,4,5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= e.rating ? C.gold : "none"} stroke={s <= e.rating ? C.gold : C.dim} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}</div>
              {e.comment && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{e.comment}</div>}
              <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{e.date}</div>
            </div>
            <span onClick={() => setEntries(entries.filter(x => x.id !== e.id))} style={{ color: C.dim, cursor: "pointer", alignSelf: "flex-start", fontSize: 16 }}>×</span>
          </div>
        ))}
        {entries.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 14 }}>Nothing logged yet</div>}
      </div>
    </Card>
  );
};

// ─── BIBLE TRACKER ────────────────────────────────────────────────────────────
const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 }, { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 }, { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 }, { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 },
  { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 }, { name: "Galatians", chapters: 6 }, { name: "Philippians", chapters: 4 },
  { name: "Revelation", chapters: 22 },
];

const Bible = () => {
  const [read, setRead] = useLS("bible_read", {});
  const [selected, setSelected] = useLS("bible_book", "Matthew");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useLS("bible_notes", []);
  const [view, setView] = useState("tracker");

  const book = BIBLE_BOOKS.find(b => b.name === selected);
  const bookRead = read[selected] || [];
  const totalChapters = BIBLE_BOOKS.reduce((s, b) => s + b.chapters, 0);
  const totalRead = Object.entries(read).reduce((s, [bName, chs]) => {
    const b = BIBLE_BOOKS.find(x => x.name === bName);
    return s + (b ? Math.min(chs.length, b.chapters) : 0);
  }, 0);
  const pct = (totalRead / totalChapters) * 100;

  const toggleChapter = ch => {
    const cur = read[selected] || [];
    const updated = cur.includes(ch) ? cur.filter(c => c !== ch) : [...cur, ch];
    setRead({ ...read, [selected]: updated });
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes([{ id: Date.now(), book: selected, text: note.trim(), date: new Date().toLocaleDateString() }, ...notes]);
    setNote("");
  };

  return (
    <div className="fade-up" style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Bible Tracker</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{totalRead} / {totalChapters} chapters read</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant={view === "tracker" ? "primary" : "ghost"} onClick={() => setView("tracker")}>Chapters</Btn>
          <Btn size="sm" variant={view === "notes" ? "primary" : "ghost"} onClick={() => setView("notes")}>Notes</Btn>
        </div>
      </div>

      {/* Overall progress */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <Label style={{ marginBottom: 0 }}>Overall Progress</Label>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(pct)}%</span>
        </div>
        <Bar pct={pct} color={C.gold} />
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <StatBox label="Read" value={totalRead} color={C.gold} />
          <StatBox label="Remaining" value={totalChapters - totalRead} color={C.muted} />
          <StatBox label="Books" value={Object.keys(read).filter(b => { const bk = BIBLE_BOOKS.find(x => x.name === b); return bk && (read[b] || []).length >= bk.chapters; }).length} color={C.green} />
        </div>
      </Card>

      {view === "tracker" && (
        <>
          {/* Book selector */}
          <Card style={{ marginBottom: 14 }}>
            <Label>Select Book</Label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {BIBLE_BOOKS.map(b => {
                const bRead = (read[b.name] || []).length;
                const complete = bRead >= b.chapters;
                const partial = bRead > 0 && !complete;
                return (
                  <button key={b.name} onClick={() => setSelected(b.name)} style={{
                    padding: "4px 10px", borderRadius: 3, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                    background: selected === b.name ? "rgba(212,160,23,0.12)" : complete ? "rgba(61,220,132,0.06)" : partial ? "rgba(74,158,255,0.06)" : "transparent",
                    border: `1px solid ${selected === b.name ? "rgba(212,160,23,0.35)" : complete ? "rgba(61,220,132,0.2)" : partial ? "rgba(74,158,255,0.15)" : C.border}`,
                    color: selected === b.name ? C.gold : complete ? C.green : partial ? C.blue : C.muted,
                  }}>{b.name}</button>
                );
              })}
            </div>
          </Card>

          {/* Chapter grid */}
          {book && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Label style={{ marginBottom: 0 }}>{book.name} — {bookRead.length}/{book.chapters} chapters</Label>
                <Btn size="sm" variant="ghost" onClick={() => setRead({ ...read, [selected]: [] })}>Reset</Btn>
              </div>
              <Bar pct={(bookRead.length / book.chapters) * 100} color={C.gold} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => {
                  const done = bookRead.includes(ch);
                  return (
                    <div key={ch} onClick={() => toggleChapter(ch)} style={{
                      width: 34, height: 34, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'JetBrains Mono',monospace",
                      background: done ? "rgba(212,160,23,0.12)" : C.surface2,
                      border: `1px solid ${done ? "rgba(212,160,23,0.35)" : C.border}`,
                      color: done ? C.gold : C.muted,
                    }}>{ch}</div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {view === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <Label>Add Note — {selected}</Label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Write your reflection..." multiline rows={3} style={{ marginBottom: 10 }} />
            <Btn variant="primary" onClick={addNote} disabled={!note.trim()}>Save Note</Btn>
          </Card>
          {notes.map(n => (
            <Card key={n.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: C.gold, fontFamily: "'JetBrains Mono',monospace" }}>{n.book}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.dim }}>{n.date}</span>
                  <span onClick={() => setNotes(notes.filter(x => x.id !== n.id))} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{n.text}</div>
            </Card>
          ))}
          {notes.length === 0 && <Card style={{ textAlign: "center", padding: "32px 20px" }}><div style={{ color: C.dim, fontSize: 13 }}>No notes yet</div></Card>}
        </div>
      )}
    </div>
  );
};

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
const Journal = () => {
  const [posts, setPosts] = useLS("journal_posts", []);
  const [view, setView] = useState("list");
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState("neutral");
  const [search, setSearch] = useState("");
  const moods = ["Neutral", "Good", "Great", "Rough", "Motivated", "Tired", "Reflective"];

  const save = () => {
    if (!body.trim()) return;
    setPosts([{ id: Date.now(), title: title.trim() || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }), body: body.trim(), mood, date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), wordCount: body.trim().split(/\s+/).length }, ...posts]);
    setTitle(""); setBody(""); setMood("neutral"); setView("list");
  };

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()));

  if (view === "write") return (
    <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Btn size="sm" variant="ghost" onClick={() => setView("list")}>← Back</Btn>
        <span className="soul-badge">New Entry</span>
      </div>
      <Card>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, color: C.text, padding: "4px 0 12px", fontSize: 22, fontWeight: 700, outline: "none", marginBottom: 20, fontFamily: "inherit" }} />
        <div style={{ marginBottom: 16 }}>
          <Label style={{ marginBottom: 8 }}>Mood</Label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {moods.map(m => <button key={m} onClick={() => setMood(m)} style={{ padding: "4px 12px", borderRadius: 3, fontSize: 11, cursor: "pointer", fontFamily: "inherit", background: mood === m ? "rgba(230,57,70,0.1)" : "transparent", border: `1px solid ${mood === m ? "rgba(230,57,70,0.25)" : C.border}`, color: mood === m ? C.red : C.muted, transition: "all 0.15s" }}>{m}</button>)}
          </div>
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What's on your mind..." autoFocus style={{ width: "100%", background: "transparent", border: "none", color: C.text, fontSize: 14, lineHeight: 1.8, outline: "none", resize: "vertical", minHeight: 300, fontFamily: "inherit" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.dim }}>{body.trim() ? body.trim().split(/\s+/).length : 0} words</span>
          <Btn variant="primary" onClick={save} disabled={!body.trim()}>Save Entry</Btn>
        </div>
      </Card>
    </div>
  );

  if (view === "read" && active) return (
    <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Btn size="sm" variant="ghost" onClick={() => { setView("list"); setActive(null); }}>← Back</Btn>
        <Btn size="sm" variant="danger" onClick={() => { setPosts(posts.filter(p => p.id !== active.id)); setView("list"); setActive(null); }}>Delete</Btn>
      </div>
      <Card>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>{active.date} · {active.wordCount} words · {active.mood}</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.01em" }}>{active.title}</h1>
        <div style={{ fontSize: 15, color: "#d0d0d0", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{active.body}</div>
      </Card>
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Journal</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{posts.length} {posts.length === 1 ? "entry" : "entries"}</div>
        </div>
        <Btn variant="primary" onClick={() => setView("write")}>+ New Entry</Btn>
      </div>
      {posts.length > 4 && <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ marginBottom: 14 }} />}
      {filtered.length === 0 && <Card style={{ textAlign: "center", padding: "40px 20px" }}><div style={{ color: C.dim, fontSize: 13 }}>{posts.length === 0 ? "No entries yet. Write your first." : `No results for "${search}"`}</div></Card>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(post => (
          <Card key={post.id} onClick={() => { setActive(post); setView("read"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{post.title}</div>
              <span onClick={e => { e.stopPropagation(); setPosts(posts.filter(p => p.id !== post.id)); }} style={{ color: C.dim, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.body}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: C.dim }}>{post.date}</span>
              <span style={{ fontSize: 11, color: C.dim }}>{post.wordCount} words · {post.mood}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── EVENING REPORT ───────────────────────────────────────────────────────────
const EveningReport = ({ onClose }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [water] = useLS(`water_${todayKey()}`, 0);
  const [calories] = useLS(`calories_${todayKey()}`, []);
  const [todos] = useLS("todos", []);
  const [plans] = useLS("workout_plans", []);

  useEffect(() => {
    (async () => {
      const cal = calories.reduce((s, e) => s + (e.cal || 0), 0);
      const tasksDone = todos.filter(t => t.done).length;
      const gymDone = plans.reduce((s, p) => s + p.exercises.filter(e => e.done).length, 0);
      const gymTotal = plans.reduce((s, p) => s + p.exercises.length, 0);
      const res = await callAI(`Vince's day:\nWater: ${water}/8 cups\nCalories: ${cal} kcal\nTasks: ${tasksDone}/${todos.length}\nWorkout: ${gymDone}/${gymTotal} exercises\n\nWrite a short honest daily recap. 3-4 sentences. Acknowledge wins, gently note slips, give one forward-looking nudge. Warm, direct, not preachy.`, "Personal AI companion. Brief and warm.");
      setReport(res); setLoading(false);
    })();
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} className="fade-in">
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Label style={{ marginBottom: 0 }}>End of Day</Label>
            <span onClick={onClose} style={{ color: C.muted, cursor: "pointer", fontSize: 20 }}>×</span>
          </div>
          <div style={{ fontSize: 11, color: C.dim, fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>{new Date().toDateString().toUpperCase()}</div>
          {loading ? <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13 }}><Spinner /> Generating...</div> : <div style={{ fontSize: 14, color: "#d0d0d0", lineHeight: 1.8 }}>{report}</div>}
          <div style={{ marginTop: 18 }}><Btn onClick={onClose}>Close</Btn></div>
        </Card>
      </div>
    </div>
  );
};

// ─── QUICK STATS ─────────────────────────────────────────────────────────────
const QuickStats = () => {
  const [water] = useLS(`water_${todayKey()}`, 0);
  const [calories] = useLS(`calories_${todayKey()}`, []);
  const [todos] = useLS("todos", []);
  const [plans] = useLS("workout_plans", []);
  const cal = calories.reduce((s, e) => s + (e.cal || 0), 0);
  const gymDone = plans.reduce((s, p) => s + p.exercises.filter(e => e.done).length, 0);
  const gymTotal = plans.reduce((s, p) => s + p.exercises.length, 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
      <StatBox label="Water" value={`${water}/8`} color={C.blue} />
      <StatBox label="Calories" value={cal} color={cal > 2000 ? C.red : C.green} />
      <StatBox label="Tasks" value={`${todos.filter(t=>t.done).length}/${todos.length}`} color={C.accent} />
      <StatBox label="Workout" value={`${gymDone}/${gymTotal}`} color={C.gold} />
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const s = JSON.parse(localStorage.getItem("sb_session") || "null");
    return s?.user || null;
  });
  const [tab, setTab] = useState("home");
  const [showReport, setShowReport] = useState(false);
  const quote = getDailyQuote();
  const isEve = new Date().getHours() >= 20;

  const logout = () => { localStorage.removeItem("sb_session"); setUser(null); };

  if (!user) return <AuthScreen onLogin={u => setUser(u)} />;

  const tabs = [
    { id: "home", label: "Home" },
    { id: "fitness", label: "Fitness" },
    { id: "food", label: "Food" },
    { id: "logs", label: "Logs" },
    { id: "goals", label: "Goals" },
    { id: "bible", label: "Bible" },
    { id: "journal", label: "Journal" },
  ];

  const grid = (...children) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }} className="fade-up">
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{css}</style>

      {/* Bleach background diagonals */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: 0, left: `${20 + i * 25}%`, width: 1, height: "100vh", background: `rgba(230,57,70,${0.015 - i * 0.003})`, transform: "rotate(12deg)", transformOrigin: "top" }} />
        ))}
      </div>

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,6,8,0.97)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        {/* Quote bar */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", fontStyle: "italic" }}>
            <span style={{ color: C.gold, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontStyle: "normal", marginRight: 8 }}>{quote.author.toUpperCase()}</span>
            "{quote.text}"
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
          {/* Top bar */}
          <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Bleach char indicators */}
              <div style={{ display: "flex", gap: 4 }}>
                {BLEACH_CHARS.map(c => (
                  <div key={c.name} title={`${c.name} — ${c.role}`} style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, opacity: 0.6 }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{getGreeting()},</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "0.08em" }}>VINCE</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isEve && <Btn size="sm" variant="gold" onClick={() => setShowReport(true)}>Daily Report</Btn>}
              <Btn size="sm" variant="ghost" onClick={logout}>Sign out</Btn>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display: "flex", overflowX: "auto", borderTop: `1px solid ${C.border}` }} id="desktop-nav">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "10px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                whiteSpace: "nowrap", background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === t.id ? C.red : "transparent"}`,
                color: tab === t.id ? C.text : C.muted, fontFamily: "inherit", letterSpacing: "0.02em",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 100px", position: "relative", zIndex: 1 }}>
        {tab === "home" && <div className="fade-up"><QuickStats />{grid(<Water />, <Health />, <Todo />)}</div>}
        {tab === "fitness" && grid(<Workout />, <Water />, <Health />)}
        {tab === "food" && grid(<FoodPhoto />, <Calories />)}
        {tab === "logs" && grid(<Log storageKey="film_log" title="Film Log" placeholder="Film title..." />, <Log storageKey="book_log" title="Book & Manga Log" placeholder="Title..." />)}
        {tab === "goals" && grid(<Goal />, <Todo />)}
        {tab === "bible" && <Bible />}
        {tab === "journal" && <Journal />}
      </main>

      {/* MOBILE NAV */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(6,6,8,0.98)", backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, zIndex: 100, display: "none", padding: "6px 0 max(6px, env(safe-area-inset-bottom))" }} id="mobile-nav">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "5px 2px", fontSize: 9, fontWeight: 500, cursor: "pointer", background: "transparent", border: "none", color: tab === t.id ? C.red : C.dim, fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "color 0.15s", letterSpacing: "0.04em" }}>
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: tab === t.id ? C.red : "transparent", transition: "all 0.15s" }} />
            {t.label}
          </button>
        ))}
      </nav>

      <style>{`
        @media (max-width: 680px) {
          #mobile-nav { display: flex !important; }
          #desktop-nav { display: none !important; }
          main { padding-left: 14px !important; padding-right: 14px !important; padding-bottom: 90px !important; }
        }
      `}</style>

      {showReport && <EveningReport onClose={() => setShowReport(false)} />}
    </div>
  );
}
