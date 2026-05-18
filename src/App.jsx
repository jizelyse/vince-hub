import { useState, useEffect, useRef } from "react";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: "☀️" };
  if (h < 17) return { text: "Good afternoon", icon: "🌤️" };
  if (h < 21) return { text: "Good evening", icon: "🌙" };
  return { text: "Good night", icon: "🌌" };
};

const isEvening = () => new Date().getHours() >= 20;

const useLS = (key, init) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  const save = v => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, save];
};

const Stars = ({ n, set }) =>
  [1,2,3,4,5].map(s => (
    <span key={s} onClick={() => set && set(s)} style={{
      cursor: set ? "pointer" : "default",
      color: s <= n ? "#C0C0C0" : "#2a2a2a",
      fontSize: 17, marginRight: 2,
      textShadow: s <= n ? "0 0 8px rgba(192,192,192,0.6)" : "none",
      transition: "all 0.15s",
    }}>★</span>
  ));

const Glass = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.028)",
    border: "1px solid rgba(192,192,192,0.13)",
    borderRadius: 16,
    backdropFilter: "blur(14px)",
    boxShadow: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
    padding: "20px",
    ...style,
  }}>{children}</div>
);

const Sec = ({ icon, title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#A8A8A8" }}>{title}</span>
    </div>
    {sub && <div style={{ color: "#555", fontSize: 11, letterSpacing: 1, marginTop: 3, marginLeft: 26 }}>{sub}</div>}
  </div>
);

const Btn = ({ onClick, children, danger, small, full, style = {}, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: danger ? "rgba(200,50,50,0.12)" : "rgba(192,192,192,0.07)",
    border: `1px solid ${danger ? "rgba(200,50,50,0.35)" : "rgba(192,192,192,0.22)"}`,
    color: danger ? "#e88" : "#B8B8B8",
    borderRadius: 8,
    padding: small ? "5px 13px" : "9px 20px",
    fontSize: small ? 11 : 12,
    fontFamily: "'Orbitron',monospace",
    letterSpacing: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.18s",
    width: full ? "100%" : "auto",
    ...style,
  }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = danger ? "rgba(200,50,50,0.25)" : "rgba(192,192,192,0.14)"; e.currentTarget.style.boxShadow = `0 0 14px ${danger ? "rgba(200,50,50,0.3)" : "rgba(192,192,192,0.18)"}`; }}}
    onMouseLeave={e => { e.currentTarget.style.background = danger ? "rgba(200,50,50,0.12)" : "rgba(192,192,192,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
  >{children}</button>
);

const Inp = ({ value, onChange, placeholder, type = "text", style = {}, onKeyDown }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
    style={{ background: "rgba(255,255,255,0.038)", border: "1px solid rgba(192,192,192,0.16)", borderRadius: 8, color: "#ddd", padding: "9px 13px", fontSize: 12, fontFamily: "'Space Mono',monospace", outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.2s", ...style }}
  />
);

const Bar = ({ pct, color = "linear-gradient(90deg,#C0C0C0,#e8e8e8)", glow = "rgba(192,192,192,0.35)" }) => (
  <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 14 }}>
    <div style={{ height: "100%", width: `${Math.min(100,pct)}%`, background: color, borderRadius: 4, transition: "width 0.4s", boxShadow: pct > 0 ? `0 0 8px ${glow}` : "none" }} />
  </div>
);

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const callAI = async (messages, system = "") => {
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
  }));
  const body = { contents };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
};

// ── WATER ──────────────────────────────────────────────────────────────
const Water = () => {
  const today = new Date().toDateString();
  const [log, setLog] = useLS("water_log", {});
  const cups = log[today] || 0;
  const goal = 8;
  return (
    <Glass>
      <Sec icon="💧" title="Water Intake" sub={`${cups} / ${goal} cups today`} />
      <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 38, borderRadius: "0 0 8px 8px", background: i < cups ? "linear-gradient(180deg,rgba(100,180,255,0.8),rgba(50,110,220,0.6))" : "rgba(255,255,255,0.04)", border: `1px solid ${i < cups ? "rgba(100,180,255,0.4)" : "rgba(192,192,192,0.08)"}`, boxShadow: i < cups ? "0 0 10px rgba(100,180,255,0.25)" : "none", transition: "all 0.3s" }} />
        ))}
      </div>
      <Bar pct={(cups/goal)*100} color="linear-gradient(90deg,#3b82f6,#60a5fa)" glow="rgba(96,165,250,0.4)" />
      <div style={{ display: "flex", gap: 8 }}>
        <Btn small onClick={() => setLog({ ...log, [today]: cups + 1 })}>+ Cup</Btn>
        <Btn small danger onClick={() => setLog({ ...log, [today]: Math.max(0, cups - 1) })}>– Remove</Btn>
      </div>
    </Glass>
  );
};

// ── HEALTH / BMI ────────────────────────────────────────────────────────
const Health = () => {
  const [stats, setStats] = useLS("health_stats", { weight: "", height: "", age: "" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stats);
  const bmi = stats.weight && stats.height ? (parseFloat(stats.weight) / ((parseFloat(stats.height) / 100) ** 2)).toFixed(1) : null;
  const bmiInfo = bmi ? (bmi < 18.5 ? ["Underweight", "#60a5fa"] : bmi < 25 ? ["Normal", "#4ade80"] : bmi < 30 ? ["Overweight", "#fbbf24"] : ["Obese", "#f87171"]) : null;
  return (
    <Glass>
      <Sec icon="📊" title="Health Stats" />
      {!editing ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[["Weight", stats.weight ? `${stats.weight}kg` : "—"], ["Height", stats.height ? `${stats.height}cm` : "—"], ["Age", stats.age || "—"]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center", padding: "10px 4px", background: "rgba(255,255,255,0.025)", borderRadius: 10, border: "1px solid rgba(192,192,192,0.08)" }}>
                <div style={{ color: "#555", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron',monospace", marginBottom: 4 }}>{l.toUpperCase()}</div>
                <div style={{ color: "#B8B8B8", fontSize: 15, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
          {bmi && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "rgba(255,255,255,0.025)", borderRadius: 10, border: "1px solid rgba(192,192,192,0.08)", marginBottom: 12 }}>
              <div>
                <div style={{ color: "#555", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron',monospace" }}>BMI</div>
                <div style={{ color: bmiInfo[1], fontSize: 26, fontWeight: 800, fontFamily: "'Orbitron',monospace" }}>{bmi}</div>
              </div>
              <div style={{ color: bmiInfo[1], fontSize: 13 }}>{bmiInfo[0]}</div>
            </div>
          )}
          <Btn small onClick={() => { setDraft(stats); setEditing(true); }}>Edit Stats</Btn>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {["weight", "height", "age"].map(k => (
            <div key={k}>
              <div style={{ color: "#555", fontSize: 10, letterSpacing: 1, fontFamily: "'Orbitron',monospace", marginBottom: 4 }}>{k.toUpperCase()} {k === "weight" ? "(kg)" : k === "height" ? "(cm)" : ""}</div>
              <Inp type="number" value={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.value })} placeholder={k} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={() => { setStats(draft); setEditing(false); }}>Save</Btn>
            <Btn small danger onClick={() => setEditing(false)}>Cancel</Btn>
          </div>
        </div>
      )}
    </Glass>
  );
};

// ── WORKOUT ─────────────────────────────────────────────────────────────
const Workout = () => {
  const [plans, setPlans] = useLS("workout_plans", [
    { id: 1, name: "Push Day", exercises: [{ id: 1, name: "Bench Press 4×8", done: false }, { id: 2, name: "Overhead Press 3×10", done: false }, { id: 3, name: "Tricep Dips 3×12", done: false }] },
    { id: 2, name: "Pull Day", exercises: [{ id: 1, name: "Deadlift 4×5", done: false }, { id: 2, name: "Pull-ups 4×8", done: false }, { id: 3, name: "Barbell Row 3×10", done: false }] },
    { id: 3, name: "Leg Day", exercises: [{ id: 1, name: "Squat 4×6", done: false }, { id: 2, name: "Romanian DL 3×10", done: false }, { id: 3, name: "Leg Press 3×12", done: false }] },
  ]);
  const [active, setActive] = useState(0);
  const [newEx, setNewEx] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const plan = plans[active];
  const done = plan?.exercises.filter(e => e.done).length || 0;
  const total = plan?.exercises.length || 0;

  const toggle = id => setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: p.exercises.map(e => e.id === id ? { ...e, done: !e.done } : e) }));
  const addEx = () => { if (!newEx.trim()) return; setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: [...p.exercises, { id: Date.now(), name: newEx.trim(), done: false }] })); setNewEx(""); };
  const addPlan = () => { if (!newPlan.trim()) return; setPlans([...plans, { id: Date.now(), name: newPlan.trim(), exercises: [] }]); setNewPlan(""); };
  const resetDay = () => setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: p.exercises.map(e => ({ ...e, done: false })) }));
  const delEx = id => setPlans(plans.map((p, i) => i !== active ? p : { ...p, exercises: p.exercises.filter(e => e.id !== id) }));

  return (
    <Glass>
      <Sec icon="🏋️" title="Workout Tracker" sub={plan ? `${done}/${total} complete` : ""} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {plans.map((p, i) => (
          <button key={p.id} onClick={() => setActive(i)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 10, fontFamily: "'Orbitron',monospace", letterSpacing: 1, cursor: "pointer", background: i === active ? "rgba(192,192,192,0.13)" : "transparent", border: `1px solid ${i === active ? "rgba(192,192,192,0.4)" : "rgba(192,192,192,0.12)"}`, color: i === active ? "#ddd" : "#666", transition: "all 0.2s" }}>{p.name}</button>
        ))}
      </div>
      {plan && (
        <>
          <Bar pct={total ? (done / total) * 100 : 0} />
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
            {plan.exercises.map(ex => (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, cursor: "pointer", background: ex.done ? "rgba(192,192,192,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${ex.done ? "rgba(192,192,192,0.25)" : "rgba(192,192,192,0.07)"}`, transition: "all 0.2s" }}>
                <div onClick={() => toggle(ex.id)} style={{ width: 17, height: 17, borderRadius: 4, border: `1px solid ${ex.done ? "#aaa" : "#333"}`, background: ex.done ? "rgba(192,192,192,0.25)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: ex.done ? "0 0 6px rgba(192,192,192,0.25)" : "none", cursor: "pointer" }}>
                  {ex.done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                </div>
                <span onClick={() => toggle(ex.id)} style={{ color: ex.done ? "#666" : "#ccc", fontSize: 12, flex: 1, textDecoration: ex.done ? "line-through" : "none" }}>{ex.name}</span>
                <span onClick={() => delEx(ex.id)} style={{ color: "#333", cursor: "pointer", fontSize: 13 }}>×</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <Inp value={newEx} onChange={e => setNewEx(e.target.value)} placeholder="Add exercise..." onKeyDown={e => e.key === "Enter" && addEx()} />
            <Btn small onClick={addEx}>Add</Btn>
          </div>
          <Btn small danger onClick={resetDay}>Reset Day</Btn>
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Inp value={newPlan} onChange={e => setNewPlan(e.target.value)} placeholder="New plan name..." onKeyDown={e => e.key === "Enter" && addPlan()} />
        <Btn small onClick={addPlan}>+ Plan</Btn>
      </div>
    </Glass>
  );
};

// ── CALORIES ────────────────────────────────────────────────────────────
const Calories = () => {
  const today = new Date().toDateString();
  const [log, setLog] = useLS("calorie_log", {});
  const [goalCal] = useLS("calorie_goal", 2200);
  const [food, setFood] = useState("");
  const [cals, setCals] = useState("");
  const [prot, setProt] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const entries = log[today] || [];
  const totalCal = entries.reduce((s, e) => s + (e.cal || 0), 0);
  const totalProt = entries.reduce((s, e) => s + (e.prot || 0), 0);
  const pct = (totalCal / goalCal) * 100;

  const aiGuess = async () => {
    if (!food.trim()) return;
    setLoading(true); setHint("");
    try {
      const res = await callAI([{ role: "user", content: `Estimate calories and protein for: "${food}". Typical home serving. JSON only: {"calories":number,"protein":number,"note":"brief context"}` }], "Nutrition expert. JSON only, no markdown.");
      const p = JSON.parse(res.replace(/```json|```/g, "").trim());
      setCals(String(p.calories)); setProt(String(p.protein)); setHint(p.note || "");
    } catch { setHint("Couldn't estimate — fill manually."); }
    setLoading(false);
  };

  const add = () => {
    if (!food || !cals) return;
    setLog({ ...log, [today]: [...entries, { id: Date.now(), name: food, cal: parseInt(cals), prot: parseInt(prot) || 0 }] });
    setFood(""); setCals(""); setProt(""); setHint("");
  };

  return (
    <Glass>
      <Sec icon="🔥" title="Calories" sub={`${totalCal} / ${goalCal} kcal · ${totalProt}g protein`} />
      <Bar pct={pct} color={pct > 90 ? "linear-gradient(90deg,#f87171,#ef4444)" : "linear-gradient(90deg,#4ade80,#22c55e)"} glow="rgba(74,222,128,0.35)" />
      <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        <Inp value={food} onChange={e => setFood(e.target.value)} placeholder="Food item..." style={{ flex: 2 }} onKeyDown={e => e.key === "Enter" && aiGuess()} />
        <Btn small onClick={aiGuess} disabled={loading}>{loading ? "..." : "🤖 AI"}</Btn>
      </div>
      {hint && <div style={{ color: "#888", fontSize: 11, marginBottom: 8, fontStyle: "italic" }}>💡 {hint}</div>}
      <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
        <Inp type="number" value={cals} onChange={e => setCals(e.target.value)} placeholder="Calories" />
        <Inp type="number" value={prot} onChange={e => setProt(e.target.value)} placeholder="Protein (g)" />
        <Btn small onClick={add}>Add</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 180, overflowY: "auto" }}>
        {entries.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 11px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(192,192,192,0.07)" }}>
            <span style={{ color: "#bbb", fontSize: 12 }}>{e.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#666", fontSize: 11 }}>{e.cal} kcal · {e.prot}g</span>
              <span onClick={() => setLog({ ...log, [today]: entries.filter(x => x.id !== e.id) })} style={{ color: "#444", cursor: "pointer" }}>×</span>
            </div>
          </div>
        ))}
        {entries.length === 0 && <div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: 10 }}>Nothing logged yet</div>}
      </div>
    </Glass>
  );
};

// ── TODO ────────────────────────────────────────────────────────────────
const Todo = () => {
  const [todos, setTodos] = useLS("todos", []);
  const [input, setInput] = useState("");
  const add = () => { if (!input.trim()) return; setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]); setInput(""); };
  const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = id => setTodos(todos.filter(t => t.id !== id));
  const pending = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  return (
    <Glass>
      <Sec icon="✅" title="Task List" sub={`${pending.length} remaining · ${done.length} done`} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Inp value={input} onChange={e => setInput(e.target.value)} placeholder="Add a task..." onKeyDown={e => e.key === "Enter" && add()} />
        <Btn small onClick={add}>Add</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
        {pending.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 9, border: "1px solid rgba(192,192,192,0.08)" }}>
            <div onClick={() => toggle(t.id)} style={{ width: 16, height: 16, borderRadius: 4, border: "1px solid #3a3a3a", cursor: "pointer", flexShrink: 0 }} />
            <span style={{ color: "#ccc", fontSize: 12, flex: 1 }}>{t.text}</span>
            <span onClick={() => remove(t.id)} style={{ color: "#333", cursor: "pointer" }}>×</span>
          </div>
        ))}
        {done.map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, opacity: 0.45, border: "1px solid rgba(192,192,192,0.04)" }}>
            <div onClick={() => toggle(t.id)} style={{ width: 16, height: 16, borderRadius: 4, border: "1px solid #3a3a3a", background: "rgba(192,192,192,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ color: "#888", fontSize: 10 }}>✓</span>
            </div>
            <span style={{ color: "#555", fontSize: 12, flex: 1, textDecoration: "line-through" }}>{t.text}</span>
            <span onClick={() => remove(t.id)} style={{ color: "#2a2a2a", cursor: "pointer" }}>×</span>
          </div>
        ))}
        {todos.length === 0 && <div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: 12 }}>You're clear — add something 🫡</div>}
      </div>
    </Glass>
  );
};

// ── GOAL TRACKER ────────────────────────────────────────────────────────
const Goal = () => {
  const [goal, setGoal] = useLS("main_goal", null);
  const [steps, setSteps] = useLS("goal_steps", []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await callAI([{ role: "user", content: `Goal: "${input.trim()}". Break into 5-7 actionable steps with time estimates. JSON only: {"steps":[{"text":"step","time":"duration","done":false}],"totalTime":"overall estimate"}` }], "Life coach. JSON only, no markdown.");
      const p = JSON.parse(res.replace(/```json|```/g, "").trim());
      setGoal({ text: input.trim(), totalTime: p.totalTime, created: new Date().toDateString() });
      setSteps(p.steps.map((s, i) => ({ ...s, id: i })));
    } catch { }
    setLoading(false); setInput("");
  };

  const toggle = id => setSteps(steps.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const done = steps.filter(s => s.done).length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;

  return (
    <Glass>
      <Sec icon="🎯" title="Goal Tracker" sub={goal ? `${done}/${steps.length} steps · ${goal.totalTime}` : "Set one goal"} />
      {!goal ? (
        <div>
          <div style={{ color: "#555", fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>Set one meaningful goal. AI breaks it into real, feasible steps.</div>
          <Inp value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. Run a 5K in 3 months" style={{ marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && create()} />
          <Btn onClick={create} disabled={loading}>{loading ? "Breaking it down..." : "🤖 Set Goal"}</Btn>
        </div>
      ) : (
        <>
          <div style={{ padding: "11px 14px", background: "rgba(192,192,192,0.05)", borderRadius: 10, marginBottom: 12, border: "1px solid rgba(192,192,192,0.13)" }}>
            <div style={{ color: "#C0C0C0", fontSize: 13, fontWeight: 600 }}>{goal.text}</div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 3 }}>Started {goal.created} · Est. {goal.totalTime}</div>
          </div>
          <Bar pct={pct} color="linear-gradient(90deg,#a78bfa,#c4b5fd)" glow="rgba(167,139,250,0.4)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {steps.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "10px 13px", borderRadius: 10, cursor: "pointer", background: s.done ? "rgba(167,139,250,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${s.done ? "rgba(167,139,250,0.28)" : "rgba(192,192,192,0.07)"}`, transition: "all 0.2s" }}>
                <div style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: `1px solid ${s.done ? "#a78bfa" : "#333"}`, background: s.done ? "rgba(167,139,250,0.28)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: s.done ? "0 0 6px rgba(167,139,250,0.35)" : "none" }}>
                  {s.done && <span style={{ color: "#c4b5fd", fontSize: 10 }}>✓</span>}
                </div>
                <div>
                  <div style={{ color: s.done ? "#666" : "#ccc", fontSize: 12, textDecoration: s.done ? "line-through" : "none" }}>{s.text}</div>
                  <div style={{ color: "#444", fontSize: 10, marginTop: 2 }}>⏱ {s.time}</div>
                </div>
              </div>
            ))}
          </div>
          <Btn small danger onClick={() => { setGoal(null); setSteps([]); }}>Clear Goal</Btn>
        </>
      )}
    </Glass>
  );
};

// ── LOG (FILM / BOOK) ───────────────────────────────────────────────────
const Log = ({ storageKey, title, icon, placeholder }) => {
  const [entries, setEntries] = useLS(storageKey, []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", comment: "", rating: 0, poster: "" });
  const fileRef = useRef();

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => setDraft(d => ({ ...d, poster: ev.target.result }));
    r.readAsDataURL(file);
  };

  const save = () => {
    if (!draft.title.trim()) return;
    setEntries([{ ...draft, id: Date.now(), date: new Date().toDateString() }, ...entries]);
    setDraft({ title: "", comment: "", rating: 0, poster: "" }); setAdding(false);
  };

  return (
    <Glass>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <Sec icon={icon} title={title} sub={`${entries.length} logged`} />
        <Btn small onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ Add"}</Btn>
      </div>
      {adding && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(192,192,192,0.1)" }}>
          <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 110, border: "2px dashed rgba(192,192,192,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
            {draft.poster ? <img src={draft.poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#444", fontSize: 12 }}>📷 Upload Poster / Cover</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <Inp value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder={placeholder} />
          <Inp value={draft.comment} onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))} placeholder="Your thoughts..." />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#666", fontSize: 11 }}>Rating:</span>
            <Stars n={draft.rating} set={s => setDraft(d => ({ ...d, rating: s }))} />
          </div>
          <Btn onClick={save}>Save</Btn>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, maxHeight: 340, overflowY: "auto" }}>
        {entries.map(e => (
          <div key={e.id} style={{ display: "flex", gap: 11, padding: 11, background: "rgba(255,255,255,0.02)", borderRadius: 11, border: "1px solid rgba(192,192,192,0.07)" }}>
            {e.poster && <img src={e.poster} alt="" style={{ width: 46, height: 66, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: "1px solid rgba(192,192,192,0.12)" }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#C0C0C0", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{e.title}</div>
              <div style={{ marginBottom: 4 }}><Stars n={e.rating} /></div>
              {e.comment && <div style={{ color: "#777", fontSize: 12, lineHeight: 1.5 }}>{e.comment}</div>}
              <div style={{ color: "#3a3a3a", fontSize: 10, marginTop: 4 }}>{e.date}</div>
            </div>
            <span onClick={() => setEntries(entries.filter(x => x.id !== e.id))} style={{ color: "#2a2a2a", cursor: "pointer", alignSelf: "flex-start" }}>×</span>
          </div>
        ))}
        {entries.length === 0 && <div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: 12 }}>Nothing logged yet</div>}
      </div>
    </Glass>
  );
};

// ── AI FOOD PHOTO ────────────────────────────────────────────────────────
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
    try {
      const base64 = img.split(",")[1];
      const mediaType = img.split(";")[0].split(":")[1];
      const prompt = `Analyze this food photo.${note ? ` Context: "${note}"` : ""} Best estimate for what is visible. JSON only, no markdown: {"food":"name","calories":number,"protein":number,"carbs":number,"fat":number,"note":"uncertainty or tip","followUp":"one clarifying question if uncertain"}`;
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [
            { inline_data: { mime_type: mediaType, data: base64 } },
            { text: prompt }
          ]}]
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setResult({ food: "Unknown", calories: 0, protein: 0, carbs: 0, fat: 0, note: "Couldn't analyze." }); }
    setLoading(false);
  };

  return (
    <Glass>
      <Sec icon="📸" title="AI Food Scanner" sub="Photo → macros estimate" />
      <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 130, border: "2px dashed rgba(192,192,192,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: 11, background: "rgba(255,255,255,0.02)" }}>
        {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center", color: "#444" }}><div style={{ fontSize: 28 }}>📷</div><div style={{ fontSize: 12, marginTop: 5 }}>Tap to upload food photo</div></div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {img && <>
        <Inp value={note} onChange={e => setNote(e.target.value)} placeholder="Any context? (e.g. homemade, large portion)" style={{ marginBottom: 9 }} />
        <Btn full onClick={analyze} disabled={loading} style={{ marginBottom: 14 }}>{loading ? "Analyzing..." : "🤖 Analyze Food"}</Btn>
      </>}
      {result && (
        <div style={{ padding: 13, background: "rgba(255,255,255,0.025)", borderRadius: 12, border: "1px solid rgba(192,192,192,0.13)" }}>
          <div style={{ color: "#C0C0C0", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{result.food}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[["Calories", result.calories, "kcal", "#f97316"], ["Protein", result.protein, "g", "#4ade80"], ["Carbs", result.carbs, "g", "#60a5fa"], ["Fat", result.fat, "g", "#fbbf24"]].map(([l, v, u, c]) => (
              <div key={l} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(192,192,192,0.07)" }}>
                <div style={{ color: "#555", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron',monospace" }}>{l.toUpperCase()}</div>
                <div style={{ color: c, fontSize: 18, fontWeight: 800 }}>{v}<span style={{ fontSize: 10, color: "#666" }}> {u}</span></div>
              </div>
            ))}
          </div>
          {result.note && <div style={{ color: "#888", fontSize: 11, fontStyle: "italic", marginBottom: result.followUp ? 8 : 0 }}>💡 {result.note}</div>}
          {result.followUp && <div style={{ color: "#60a5fa", fontSize: 12, padding: "8px 10px", background: "rgba(96,165,250,0.07)", borderRadius: 8, border: "1px solid rgba(96,165,250,0.18)" }}>❓ {result.followUp}</div>}
        </div>
      )}
    </Glass>
  );
};

// ── EVENING REPORT MODAL ─────────────────────────────────────────────────
const EveningModal = ({ onClose }) => {
  const today = new Date().toDateString();
  const [waterLog] = useLS("water_log", {});
  const [calorieLog] = useLS("calorie_log", {});
  const [todos] = useLS("todos", []);
  const [workoutPlans] = useLS("workout_plans", []);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const water = waterLog[today] || 0;
      const cal = (calorieLog[today] || []).reduce((s, e) => s + (e.cal || 0), 0);
      const tasksDone = todos.filter(t => t.done).length;
      const tasksTotal = todos.length;
      const gymDone = workoutPlans.reduce((s, p) => s + p.exercises.filter(e => e.done).length, 0);
      const gymTotal = workoutPlans.reduce((s, p) => s + p.exercises.length, 0);
      const res = await callAI(
        [{ role: "user", content: `Vince's day:\nWater: ${water}/8 cups\nCalories: ${cal} kcal\nTasks: ${tasksDone}/${tasksTotal} done\nWorkout: ${gymDone}/${gymTotal} exercises done\n\nWrite a short personal daily summary. 3-4 sentences. Acknowledge wins, gently note slips without judgment, give one forward-looking nudge. Warm, direct, coach energy. No bullet points.` }],
        "You are Vince's personal AI companion. Be real, brief, warm. Never preachy."
      );
      setReport(res); setLoading(false);
    })();
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
      <Glass style={{ maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, letterSpacing: 2, color: "#A8A8A8" }}>🌙 END OF DAY</div>
          <span onClick={onClose} style={{ color: "#444", cursor: "pointer", fontSize: 20 }}>×</span>
        </div>
        <div style={{ color: "#555", fontSize: 11, letterSpacing: 1, marginBottom: 16 }}>{new Date().toDateString().toUpperCase()}</div>
        {loading
          ? <div style={{ color: "#444", fontSize: 13, padding: "20px 0", textAlign: "center" }}>Generating your report...</div>
          : <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.75 }}>{report}</div>
        }
        <div style={{ marginTop: 18 }}><Btn onClick={onClose}>Close</Btn></div>
      </Glass>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  const { text: greet, icon: greetIcon } = getGreeting();
  const [tab, setTab] = useState("home");
  const [showReport, setShowReport] = useState(false);

  const tabs = [
    { id: "home", label: "Home", icon: "⬡" },
    { id: "fitness", label: "Fitness", icon: "🏋️" },
    { id: "food", label: "Food", icon: "🍽️" },
    { id: "logs", label: "Logs", icon: "📚" },
    { id: "goals", label: "Goals", icon: "🎯" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#C0C0C0", fontFamily: "'Space Mono',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(192,192,192,0.12);border-radius:2px}
        input::placeholder{color:#333}
        input:focus{border-color:rgba(192,192,192,0.38)!important;outline:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .grid{animation:fadeUp 0.35s ease both}
      `}</style>

      {/* bg grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(192,192,192,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(192,192,192,0.025) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -180, left: "50%", transform: "translateX(-50%)", width: 700, height: 380, background: "radial-gradient(ellipse,rgba(192,192,192,0.035) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, padding: "14px 22px", background: "rgba(6,6,6,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(192,192,192,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 17 }}>{greetIcon}</span>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, letterSpacing: 2, color: "#666" }}>{greet},</span>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, letterSpacing: 4, color: "#C0C0C0", textShadow: "0 0 24px rgba(192,192,192,0.28)" }}>VINCE</span>
          </div>
          <div style={{ color: "#3a3a3a", fontSize: 9, letterSpacing: 2, marginTop: 2 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</div>
        </div>
        {isEvening() && <Btn small onClick={() => setShowReport(true)}>🌙 Report</Btn>}
      </header>

      {/* NAV */}
      <nav style={{ display: "flex", gap: 4, padding: "10px 22px", borderBottom: "1px solid rgba(192,192,192,0.05)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 15px", borderRadius: 20, fontSize: 10, cursor: "pointer", fontFamily: "'Orbitron',monospace", letterSpacing: 1, whiteSpace: "nowrap", background: tab === t.id ? "rgba(192,192,192,0.1)" : "transparent", border: `1px solid ${tab === t.id ? "rgba(192,192,192,0.3)" : "rgba(192,192,192,0.07)"}`, color: tab === t.id ? "#ddd" : "#555", transition: "all 0.18s", boxShadow: tab === t.id ? "0 0 10px rgba(192,192,192,0.07)" : "none" }}>{t.icon} {t.label}</button>
        ))}
      </nav>

      {/* MAIN */}
      <main style={{ padding: "18px 22px", maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {tab === "home" && (
          <div className="grid">
            {/* Quick Stats */}
            <Glass style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, letterSpacing: 2, color: "#555", marginBottom: 14 }}>TODAY'S OVERVIEW</div>
              <QuickStats />
            </Glass>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
              <Water />
              <Health />
              <Todo />
            </div>
          </div>
        )}

        {tab === "fitness" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }} className="grid">
            <Workout />
            <Water />
            <Health />
          </div>
        )}

        {tab === "food" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 14 }} className="grid">
            <FoodPhoto />
            <Calories />
          </div>
        )}

        {tab === "logs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }} className="grid">
            <Log storageKey="film_log" title="Film Log" icon="🎬" placeholder="Film title..." />
            <Log storageKey="book_log" title="Book & Manga Log" icon="📖" placeholder="Book / manga / manhwa title..." />
          </div>
        )}

        {tab === "goals" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }} className="grid">
            <Goal />
            <Todo />
          </div>
        )}
      </main>

      {showReport && <EveningModal onClose={() => setShowReport(false)} />}
    </div>
  );
}

// Quick Stats helper
function QuickStats() {
  const today = new Date().toDateString();
  const [waterLog] = useLS("water_log", {});
  const [calorieLog] = useLS("calorie_log", {});
  const [todos] = useLS("todos", []);
  const [workoutPlans] = useLS("workout_plans", []);
  const water = waterLog[today] || 0;
  const cal = (calorieLog[today] || []).reduce((s, e) => s + (e.cal || 0), 0);
  const tasksDone = todos.filter(t => t.done).length;
  const gymDone = workoutPlans.reduce((s, p) => s + p.exercises.filter(e => e.done).length, 0);
  const gymTotal = workoutPlans.reduce((s, p) => s + p.exercises.length, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
      {[
        { label: "WATER", val: `${water}/8`, unit: "cups", color: "#60a5fa" },
        { label: "CALORIES", val: cal, unit: "kcal", color: "#4ade80" },
        { label: "TASKS", val: `${tasksDone}/${todos.length}`, unit: "done", color: "#C0C0C0" },
        { label: "WORKOUT", val: `${gymDone}/${gymTotal}`, unit: "sets", color: "#fbbf24" },
      ].map(({ label, val, unit, color }) => (
        <div key={label} style={{ textAlign: "center", padding: "11px 6px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(192,192,192,0.07)" }}>
          <div style={{ color: "#444", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron',monospace", marginBottom: 5 }}>{label}</div>
          <div style={{ color, fontSize: 19, fontWeight: 800, fontFamily: "'Orbitron',monospace" }}>{val}</div>
          <div style={{ color: "#333", fontSize: 9, marginTop: 2 }}>{unit}</div>
        </div>
      ))}
    </div>
  );
}
