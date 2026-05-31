import { useState, useEffect, useRef, useCallback } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
const VINCE_EMAIL = "vince@vincehub.com";

// ─── FORTUNES (expanded) ──────────────────────────────────────────────────────
const FORTUNES = [
  // Vinland Saga
  { text: "A true warrior needs no sword.", source: "Askeladd — Vinland Saga" },
  { text: "You have no enemies. No one has the right to take a life.", source: "Thors — Vinland Saga" },
  { text: "Surpass your limits. Right here. Right now.", source: "Thorfinn — Vinland Saga" },
  { text: "I have no enemies. That is my pride.", source: "Thorfinn — Vinland Saga" },
  { text: "Go on living. Find your true fight.", source: "Askeladd — Vinland Saga" },
  { text: "Strength without purpose is just violence.", source: "Thors — Vinland Saga" },
  { text: "You've finally found it. Your own fight.", source: "Askeladd — Vinland Saga" },
  { text: "What does it mean to be strong? Think about it.", source: "Thors — Vinland Saga" },
  { text: "Run as far as you can. Live.", source: "Thors — Vinland Saga" },
  { text: "A man's worth isn't in his sword arm.", source: "Thors — Vinland Saga" },
  { text: "Do you have a place you truly want to protect?", source: "Thorfinn — Vinland Saga" },
  { text: "The world is not cut with a sword. It is cut with words.", source: "Askeladd — Vinland Saga" },
  { text: "Keep moving forward. That is all.", source: "Askeladd — Vinland Saga" },
  { text: "Don't waste your time fighting. Use it to live.", source: "Thors — Vinland Saga" },
  { text: "A real warrior doesn't need a sword.", source: "Thors — Vinland Saga" },
  { text: "If you want to be a king, you need the heart of a king first.", source: "Askeladd — Vinland Saga" },
  { text: "Prove yourself. Not to anyone else. To yourself.", source: "Thorfinn — Vinland Saga" },
  { text: "There's no such thing as a pure, righteous war.", source: "Askeladd — Vinland Saga" },
  // Bleach
  { text: "Admiration is the furthest thing from understanding.", source: "Aizen — Bleach" },
  { text: "The difference between the victor and the vanquished is resolve.", source: "Byakuya — Bleach" },
  { text: "We stand in awe before that which cannot be seen.", source: "Rukia — Bleach" },
  { text: "If fate is a millstone, then we are the grist.", source: "Ichigo — Bleach" },
  { text: "No matter how strong an enemy may be, there is always a way.", source: "Urahara — Bleach" },
  { text: "We are all alone. That is why we need each other.", source: "Rukia — Bleach" },
  { text: "If only you could feel what I feel, you would understand.", source: "Aizen — Bleach" },
  { text: "For I am strong enough alone.", source: "Byakuya — Bleach" },
  { text: "The pain of not being able to save someone stays forever.", source: "Ichigo — Bleach" },
  { text: "Death and pain are just the price of a good fight.", source: "Kenpachi — Bleach" },
  { text: "Fear is necessary for evolution.", source: "Aizen — Bleach" },
  { text: "There is nothing more important than the pride of a warrior.", source: "Byakuya — Bleach" },
  { text: "An excellent loser knows how to lose gracefully.", source: "Urahara — Bleach" },
  { text: "Even if no one believes in you, stand up and do it anyway.", source: "Ichigo — Bleach" },
  { text: "Those who do not fear the sword they wield have no right to wield one.", source: "Yamamoto — Bleach" },
  // Bible
  { text: "I can do all things through Christ who strengthens me.", source: "Philippians 4:13" },
  { text: "Be strong in the Lord and in his mighty power.", source: "Ephesians 6:10" },
  { text: "Trust in the Lord with all your heart.", source: "Proverbs 3:5" },
  { text: "For God has not given us a spirit of fear, but of power.", source: "2 Timothy 1:7" },
  { text: "Be still, and know that I am God.", source: "Psalm 46:10" },
  { text: "He gives strength to the weary.", source: "Isaiah 40:29" },
  { text: "With God all things are possible.", source: "Matthew 19:26" },
  { text: "The Lord is close to the brokenhearted.", source: "Psalm 34:18" },
  { text: "And we know that in all things God works for the good.", source: "Romans 8:28" },
  { text: "Do not be anxious about anything.", source: "Philippians 4:6" },
  { text: "The Lord is my shepherd; I shall not want.", source: "Psalm 23:1" },
  { text: "Cast all your anxiety on him because he cares for you.", source: "1 Peter 5:7" },
  { text: "Even youths grow tired and weary, but those who hope in the Lord will soar.", source: "Isaiah 40:31" },
  { text: "Be strong and courageous. Do not be afraid.", source: "Joshua 1:9" },
  { text: "No weapon formed against you shall prosper.", source: "Isaiah 54:17" },
  { text: "For I know the plans I have for you, plans to prosper you.", source: "Jeremiah 29:11" },
  { text: "The Lord will fight for you; you need only to be still.", source: "Exodus 14:14" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", source: "Proverbs 16:3" },
  { text: "Delight yourself in the Lord and he will give you the desires of your heart.", source: "Psalm 37:4" },
  { text: "Greater is he that is in you, than he that is in the world.", source: "1 John 4:4" },
];
const getDailyFortune = () => FORTUNES[Math.floor(Date.now() / 86400000) % FORTUNES.length];

// ─── SOLAR SYSTEM ─────────────────────────────────────────────────────────────
const SOLAR_OBJECTS = [
  { id: "star1", name: "Proxima", sessionsNeeded: 1, color: "#ffaa44", type: "star", desc: "Your first star. The journey begins." },
  { id: "mercury", name: "Mercury", sessionsNeeded: 2, color: "#b0b0b0", type: "planet", desc: "Swift and close to the sun." },
  { id: "venus", name: "Venus", sessionsNeeded: 3, color: "#e8c86a", type: "planet", desc: "Brilliant and fierce." },
  { id: "earth", name: "Earth", sessionsNeeded: 5, color: "#4a9eff", type: "planet", desc: "Home. Worth protecting." },
  { id: "mars", name: "Mars", sessionsNeeded: 7, color: "#cc4422", type: "planet", desc: "The red warrior." },
  { id: "star2", name: "Sirius", sessionsNeeded: 10, color: "#aaddff", type: "star", desc: "The brightest in the sky." },
  { id: "jupiter", name: "Jupiter", sessionsNeeded: 13, color: "#c8a87a", type: "planet", desc: "King of planets." },
  { id: "saturn", name: "Saturn", sessionsNeeded: 16, color: "#e0d090", type: "planet", desc: "Crowned with rings." },
  { id: "neptune", name: "Neptune", sessionsNeeded: 25, color: "#4060ff", type: "planet", desc: "Deep and mysterious." },
  { id: "star3", name: "Betelgeuse", sessionsNeeded: 30, color: "#ff6633", type: "star", desc: "A supergiant on the edge of time." },
];

// ─── SUPABASE DB ──────────────────────────────────────────────────────────────
const getSession = () => JSON.parse(localStorage.getItem("sb_session") || "null");

const sbFetch = async (path, opts = {}) => {
  const session = getSession();
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${session?.access_token || SUPABASE_KEY}`,
    ...opts.headers,
  };
  const res = await fetch(`${SUPABASE_URL}${path}`, { ...opts, headers });
  if (res.status === 204) return null;
  return res.json();
};

const dbSave = async (table, userId, key, value) => {
  try {
    await sbFetch(`/rest/v1/${table}`, {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: userId, key, value: JSON.stringify(value), updated_at: new Date().toISOString() }),
    });
  } catch (e) { console.warn("DB save failed:", e); }
};

const dbLoad = async (table, userId, key) => {
  try {
    const rows = await sbFetch(`/rest/v1/${table}?user_id=eq.${userId}&key=eq.${key}&select=value`);
    if (rows && rows.length > 0) return JSON.parse(rows[0].value);
  } catch (e) { console.warn("DB load failed:", e); }
  return null;
};

const sbAuth = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ─── SYNCED STORAGE HOOK ──────────────────────────────────────────────────────
// Uses localStorage + Supabase. Reads local immediately, syncs to/from DB.
const useSynced = (key, init, userId) => {
  const lsKey = `vince_${key}`;
  const [val, setValRaw] = useState(() => {
    try { const s = localStorage.getItem(lsKey); return s ? JSON.parse(s) : init; } catch { return init; }
  });

  // Load from DB on mount
  useEffect(() => {
    if (!userId) return;
    dbLoad("user_data", userId, key).then(remote => {
      if (remote !== null && remote !== undefined) {
        setValRaw(remote);
        localStorage.setItem(lsKey, JSON.stringify(remote));
      }
    });
  }, [userId, key]);

  const save = useCallback((v) => {
    setValRaw(prev => {
      const newVal = typeof v === "function" ? v(prev) : v;
      localStorage.setItem(lsKey, JSON.stringify(newVal));
      if (userId) dbSave("user_data", userId, key, newVal);
      return newVal;
    });
  }, [userId, key, lsKey]);

  return [val, save];
};

// ─── AI ───────────────────────────────────────────────────────────────────────
const callAI = async (prompt, system = "") => {
  try {
    if (!GEMINI_KEY) return "[AI unavailable: no API key set]";
    const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    const res = await fetch(GEMINI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error) return `[AI error: ${data.error.message || "unknown error"}]`;
    return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "[No response from AI]";
  } catch (e) { return `[AI request failed: ${e.message}]`; }
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

// ─── UTILS ───────────────────────────────────────────────────────────────────
const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; if (h < 21) return "Good evening"; return "Good night"; };
const todayKey = () => new Date().toISOString().split("T")[0];

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#03030a", surface: "#080812", surface2: "#0d0d1a", surface3: "#111122",
  border: "rgba(30,60,120,0.25)", borderHi: "rgba(40,80,160,0.5)",
  text: "#e8eaf6", muted: "#4a5080", dim: "#1a1a30",
  accent: "#7090ff", accentGlow: "rgba(70,120,255,0.12)",
  blue: "#4a78ff", blueGlow: "rgba(74,120,255,0.18)",
  silver: "#a0b0d0", chrome: "linear-gradient(135deg, #8090b0, #c0d0f0, #8090b0)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1a1a40; border-radius: 2px; }
  input::placeholder, textarea::placeholder { color: ${C.muted}; }
  input:focus, textarea:focus { outline: none; }
  button { font-family: inherit; cursor: pointer; border: none; background: none; }
  * { -webkit-tap-highlight-color: transparent; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none} }
  @keyframes fadeIn { from{opacity:0}to{opacity:1} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)} }
  @keyframes unlockPop { 0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1} }
  .fade-up { animation: fadeUp 0.3s ease both; }
  .fade-in { animation: fadeIn 0.25s ease both; }
`;

// ─── PLANET ───────────────────────────────────────────────────────────────────
const NeptunePlanet = ({ size = 200 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ filter: "drop-shadow(0 0 40px rgba(40,80,255,0.55))" }}>
    <defs>
      <radialGradient id="neptGrad" cx="38%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#6090ff" /><stop offset="35%" stopColor="#2050e0" />
        <stop offset="70%" stopColor="#0828a0" /><stop offset="100%" stopColor="#010820" />
      </radialGradient>
      <radialGradient id="neptGlow" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="rgba(40,80,255,0.3)" />
      </radialGradient>
      <clipPath id="neptClip"><circle cx="100" cy="100" r="80" /></clipPath>
      <filter id="atmBlur"><feGaussianBlur stdDeviation="3" /></filter>
    </defs>
    <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(60,120,255,0.15)" strokeWidth="8" filter="url(#atmBlur)" />
    <circle cx="100" cy="100" r="80" fill="url(#neptGrad)" />
    <g clipPath="url(#neptClip)" opacity="0.3">
      <ellipse cx="100" cy="70" rx="95" ry="14" fill="rgba(120,180,255,0.5)" transform="rotate(-8,100,70)" />
      <ellipse cx="100" cy="95" rx="88" ry="9" fill="rgba(90,150,255,0.35)" transform="rotate(-5,100,95)" />
      <ellipse cx="100" cy="118" rx="92" ry="11" fill="rgba(70,120,230,0.4)" transform="rotate(-10,100,118)" />
    </g>
    <ellipse cx="76" cy="70" rx="30" ry="20" fill="rgba(160,210,255,0.12)" transform="rotate(-20,76,70)" clipPath="url(#neptClip)" />
    <circle cx="100" cy="100" r="80" fill="url(#neptGlow)" />
  </svg>
);

const SmallPlanet = ({ color, size = 40, glow }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <defs><radialGradient id={`pg${size}${color.replace(/[^a-z0-9]/gi,"")}`} cx="35%" cy="32%" r="65%"><stop offset="0%" stopColor={color} stopOpacity="0.9" /><stop offset="100%" stopColor="#000" stopOpacity="0.8" /></radialGradient></defs>
    <circle cx="20" cy="20" r="18" fill={`url(#pg${size}${color.replace(/[^a-z0-9]/gi,"")})`} style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : {}} />
  </svg>
);

const StarShape = ({ color, size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="8" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})`, animation: "pulse 2s ease-in-out infinite" }} />
    <circle cx="20" cy="20" r="14" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
  </svg>
);

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", transition: "all 0.2s", position: "relative", overflow: "hidden", ...(onClick ? { cursor: "pointer" } : {}), ...style }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.boxShadow = `0 0 20px ${C.blueGlow}`; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; } : undefined}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${C.accent}30,transparent)`, pointerEvents: "none" }} />
    {children}
  </div>
);

const Label = ({ children, style = {} }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 10, fontFamily: "'JetBrains Mono',monospace", ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "default", size = "md", full, disabled, style = {} }) => {
  const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 4, fontWeight: 500, transition: "all 0.15s", fontSize: size === "sm" ? 11 : 12, padding: size === "sm" ? "5px 12px" : "8px 16px", width: full ? "100%" : "auto", opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: "inherit" };
  const v = { default: { background: C.surface2, border: `1px solid ${C.border}`, color: C.silver }, primary: { background: "rgba(40,80,200,0.15)", border: `1px solid ${C.blue}40`, color: C.accent }, ghost: { background: "transparent", border: "1px solid transparent", color: C.muted }, danger: { background: "rgba(200,40,40,0.08)", border: "1px solid rgba(200,40,40,0.2)", color: "#f08080" } };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v[variant], ...style }} onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.boxShadow = `0 0 12px ${C.blueGlow}`; }}} onMouseLeave={e => { if (!disabled) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "none"; }}}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, type = "text", onKeyDown, style = {}, multiline, rows = 4 }) => {
  const base = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "9px 12px", fontSize: 13, transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit", ...(multiline ? { resize: "vertical" } : {}), ...style };
  const focus = e => { e.target.style.borderColor = C.borderHi; e.target.style.boxShadow = `0 0 0 2px ${C.blueGlow}`; };
  const blur = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };
  if (multiline) return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base} onFocus={focus} onBlur={blur} />;
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={base} onFocus={focus} onBlur={blur} />;
};

const Bar = ({ pct, color = C.accent }) => (
  <div style={{ height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 1, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: color, transition: "width 0.5s ease", borderRadius: 1, boxShadow: `0 0 6px ${color}60` }} />
  </div>
);

const Spinner = () => <div style={{ width: 14, height: 14, border: `2px solid ${C.dim}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;

const StatBox = ({ label, value, color = C.text }) => (
  <div style={{ textAlign: "center", padding: "12px 6px", background: C.surface2, borderRadius: 6, border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", color: C.muted, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</div>
  </div>
);

// ─── FORTUNE COOKIE (centered popup) ─────────────────────────────────────────
const FortuneCookie = () => {
  const [open, setOpen] = useState(false);
  const [cracked, setCracked] = useState(false);
  const fortune = getDailyFortune();
  return (
    <>
      <button onClick={() => { setOpen(true); setCracked(false); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, fontSize: 11, padding: "4px 10px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.silver; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>Fortune</button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }} className="fade-in" onClick={() => !cracked && setCracked(true)}>
          <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            {!cracked ? (
              <div style={{ cursor: "pointer" }} onClick={() => setCracked(true)}>
                <svg width="140" height="90" viewBox="0 0 140 90" style={{ filter: `drop-shadow(0 0 20px ${C.blueGlow})` }}>
                  <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2a3060" /><stop offset="50%" stopColor="#3a4080" /><stop offset="100%" stopColor="#1a2040" /></linearGradient></defs>
                  <ellipse cx="70" cy="45" rx="65" ry="35" fill="url(#cg)" stroke={C.accent} strokeWidth="1" opacity="0.85" />
                  <ellipse cx="70" cy="45" rx="48" ry="24" fill="none" stroke={C.accent} strokeWidth="0.5" opacity="0.4" />
                  <line x1="70" y1="12" x2="70" y2="78" stroke={C.accent} strokeWidth="0.5" opacity="0.3" />
                </svg>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 16, fontFamily: "'JetBrains Mono',monospace" }}>Tap to crack open</div>
              </div>
            ) : (
              <div className="fade-up">
                <div style={{ padding: "24px 28px", background: C.surface, border: `1px solid ${C.borderHi}`, borderRadius: 8, boxShadow: `0 0 40px ${C.blueGlow}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: C.muted, fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>DAILY FORTUNE</div>
                  <div style={{ fontSize: 18, fontWeight: 400, color: C.text, lineHeight: 1.7, marginBottom: 16 }}>"{fortune.text}"</div>
                  <div style={{ fontSize: 12, color: C.accent, fontFamily: "'JetBrains Mono',monospace" }}>— {fortune.source}</div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "8px 24px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handle = async () => {
    if (!password) return;
    setLoading(true); setError("");
    const data = await sbAuth(VINCE_EMAIL, password);
    if (data.access_token) { localStorage.setItem("sb_session", JSON.stringify(data)); onLogin(data.user); }
    else setError("Wrong password.");
    setLoading(false);
  };
  const stars = Array.from({ length: 80 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() > 0.85 ? 2 : 1, opacity: 0.2 + Math.random() * 0.7 }));
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #050818 0%, #000 70%)", pointerEvents: "none" }} />
      {stars.map(s => <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: `rgba(255,255,255,${s.opacity})`, borderRadius: "50%", top: `${s.y}%`, left: `${s.x}%`, pointerEvents: "none" }} />)}
      <div style={{ position: "relative", textAlign: "center", width: "100%", maxWidth: 400 }} className="fade-up">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}><NeptunePlanet size={200} /></div>
        <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: "0.06em", color: "#fff", fontFamily: "'Inter',sans-serif", marginBottom: 28 }}>Welcome Vince</div>
        <div style={{ position: "relative", maxWidth: 300, margin: "0 auto" }}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} placeholder="password..." style={{ width: "100%", background: "rgba(120,120,130,0.22)", border: "none", borderRadius: 50, color: "#fff", padding: "15px 24px", fontSize: 16, fontFamily: "'Inter',sans-serif", outline: "none", textAlign: "center", backdropFilter: "blur(10px)", letterSpacing: "0.04em", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)", transition: "all 0.2s" }} onFocus={e => { e.target.style.background = "rgba(140,140,160,0.32)"; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 30px rgba(40,80,255,0.2)"; }} onBlur={e => { e.target.style.background = "rgba(120,120,130,0.22)"; e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)"; }} />
          {loading && <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)" }}><Spinner /></div>}
        </div>
        {error && <div style={{ color: "rgba(255,120,120,0.9)", fontSize: 13, marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
};

// ─── HOME ─────────────────────────────────────────────────────────────────────
const Home = ({ userId, onNavigate }) => {
  const [todos, setTodos] = useSynced("todos", [], userId);
  const [ideas, setIdeas] = useSynced("quick_ideas", [], userId);
  const [idea, setIdea] = useState("");
  const [input, setInput] = useState("");
  const add = () => { if (!input.trim()) return; setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]); setInput(""); };
  const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = id => setTodos(todos.filter(t => t.id !== id));
  const addIdea = () => { if (!idea.trim()) return; setIdeas([{ id: Date.now(), text: idea.trim(), date: new Date().toLocaleDateString() }, ...ideas]); setIdea(""); };

  return (
    <div className="fade-up">
      {/* Neptune centered */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <NeptunePlanet size={160} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 14 }}>
        {/* Tasks */}
        <Card>
          <Label>Daily Tasks</Label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Add a task..." onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1 }} />
            <Btn size="sm" variant="primary" onClick={add}>Add</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
            {todos.filter(t => !t.done).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.surface2, borderRadius: 6, border: `1px solid ${C.border}` }}>
                <div onClick={() => toggle(t.id)} style={{ width: 15, height: 15, borderRadius: 3, border: `1px solid ${C.muted}`, cursor: "pointer", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13 }}>{t.text}</span>
                <span onClick={() => remove(t.id)} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span>
              </div>
            ))}
            {todos.filter(t => t.done).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, opacity: 0.4 }}>
                <div onClick={() => toggle(t.id)} style={{ width: 15, height: 15, borderRadius: 3, border: `1px solid ${C.muted}`, cursor: "pointer", flexShrink: 0, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ flex: 1, fontSize: 13, textDecoration: "line-through", color: C.muted }}>{t.text}</span>
                <span onClick={() => remove(t.id)} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span>
              </div>
            ))}
            {todos.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 12 }}>No tasks yet</div>}
          </div>
        </Card>

        {/* Quick Ideas */}
        <Card>
          <Label>Quick Ideas</Label>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <Input value={idea} onChange={e => setIdea(e.target.value)} placeholder="Jot it down..." onKeyDown={e => e.key === "Enter" && addIdea()} style={{ flex: 1, fontSize: 12 }} />
            <Btn size="sm" variant="primary" onClick={addIdea}>+</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 240, overflowY: "auto" }}>
            {ideas.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 10px", background: C.surface2, borderRadius: 5, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, flex: 1 }}>{i.text}</span>
                <span onClick={() => setIdeas(ideas.filter(x => x.id !== i.id))} style={{ color: C.dim, cursor: "pointer", fontSize: 14, marginLeft: 8 }}>×</span>
              </div>
            ))}
            {ideas.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 8 }}>Nothing yet</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── WATER ───────────────────────────────────────────────────────────────────
const Water = ({ userId }) => {
  const [cups, setCups] = useSynced(`water_${todayKey()}`, 0, userId);
  const goal = 8;
  return (
    <Card>
      <Label>Water Intake</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: C.blue, fontFamily: "'JetBrains Mono',monospace" }}>{cups}</span>
        <span style={{ color: C.muted, fontSize: 13 }}>/ {goal} cups</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {Array.from({ length: goal }).map((_, i) => <div key={i} style={{ flex: 1, height: 28, borderRadius: 3, background: i < cups ? `${C.blue}88` : C.surface2, border: `1px solid ${i < cups ? C.blue + "44" : C.border}`, transition: "all 0.2s" }} />)}
      </div>
      <Bar pct={(cups / goal) * 100} color={C.blue} />
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Btn size="sm" variant="primary" onClick={() => setCups(Math.min(goal, cups + 1))}>+ Add</Btn>
        <Btn size="sm" variant="ghost" onClick={() => setCups(Math.max(0, cups - 1))}>Remove</Btn>
      </div>
    </Card>
  );
};

// ─── HEALTH ──────────────────────────────────────────────────────────────────
const Health = ({ userId }) => {
  const [stats, setStats] = useSynced("health_stats", { weight: "", height: "", age: "" }, userId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stats);
  const bmi = stats.weight && stats.height ? (parseFloat(stats.weight) / ((parseFloat(stats.height) / 100) ** 2)).toFixed(1) : null;
  const bmiInfo = bmi ? (bmi < 18.5 ? ["Underweight", C.blue] : bmi < 25 ? ["Normal", "#50c878"] : bmi < 30 ? ["Overweight", "#8080ff"] : ["High", "#8060a0"]) : null;
  return (
    <Card>
      <Label>Health Stats</Label>
      {!editing ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <StatBox label="Weight" value={stats.weight ? `${stats.weight}kg` : "—"} color={C.silver} />
            <StatBox label="Height" value={stats.height ? `${stats.height}cm` : "—"} color={C.silver} />
            <StatBox label="Age" value={stats.age || "—"} color={C.silver} />
          </div>
          {bmi && <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: C.surface2, borderRadius: 6, marginBottom: 12, border: `1px solid ${C.border}` }}><div><div style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>BMI</div><div style={{ fontSize: 24, fontWeight: 800, color: bmiInfo[1], fontFamily: "'JetBrains Mono',monospace" }}>{bmi}</div></div><div style={{ color: bmiInfo[1], fontSize: 13 }}>{bmiInfo[0]}</div></div>}
          <Btn size="sm" onClick={() => { setDraft(stats); setEditing(true); }}>Edit</Btn>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["weight", "Weight (kg)"], ["height", "Height (cm)"], ["age", "Age"]].map(([k, lbl]) => <div key={k}><Label style={{ marginBottom: 6 }}>{lbl}</Label><Input type="number" value={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.value })} placeholder={lbl} /></div>)}
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
const Workout = ({ userId }) => {
  const defaultPlans = [
    { id: 1, name: "Push", exercises: [{ id: 1, name: "Bench Press 4x8", done: false }, { id: 2, name: "Overhead Press 3x10", done: false }, { id: 3, name: "Tricep Dips 3x12", done: false }] },
    { id: 2, name: "Pull", exercises: [{ id: 1, name: "Deadlift 4x5", done: false }, { id: 2, name: "Pull-ups 4x8", done: false }, { id: 3, name: "Barbell Row 3x10", done: false }] },
    { id: 3, name: "Legs", exercises: [{ id: 1, name: "Squat 4x6", done: false }, { id: 2, name: "Romanian DL 3x10", done: false }, { id: 3, name: "Leg Press 3x12", done: false }] },
  ];
  const [plans, setPlans] = useSynced("workout_plans", defaultPlans, userId);
  const [active, setActive] = useState(0);
  const [newEx, setNewEx] = useState(""); const [newPlan, setNewPlan] = useState("");
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
        {plans.map((p, i) => <button key={p.id} onClick={() => setActive(i)} style={{ padding: "4px 12px", borderRadius: 3, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.06em", fontFamily: "inherit", background: i === active ? C.accentGlow : "transparent", border: `1px solid ${i === active ? C.borderHi : C.border}`, color: i === active ? C.accent : C.muted }}>{p.name.toUpperCase()}</button>)}
      </div>
      {plan && (<>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{done}/{total}</span><Btn size="sm" variant="ghost" onClick={reset}>Reset</Btn></div>
        <Bar pct={total ? (done / total) * 100 : 0} color={C.accent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "14px 0" }}>
          {plan.exercises.map(ex => (
            <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, background: ex.done ? C.accentGlow : C.surface2, border: `1px solid ${ex.done ? C.borderHi : C.border}`, transition: "all 0.2s", cursor: "pointer" }} onClick={() => toggle(ex.id)}>
              <div style={{ width: 15, height: 15, borderRadius: 2, flexShrink: 0, border: `1px solid ${ex.done ? C.accent : C.muted}`, background: ex.done ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                {ex.done && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke={C.bg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ flex: 1, fontSize: 13, color: ex.done ? C.muted : C.text, textDecoration: ex.done ? "line-through" : "none" }}>{ex.name}</span>
              <span onClick={e => { e.stopPropagation(); delEx(ex.id); }} style={{ color: C.dim, fontSize: 16 }}>×</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}><Input value={newEx} onChange={e => setNewEx(e.target.value)} placeholder="Add exercise..." onKeyDown={e => e.key === "Enter" && addEx()} style={{ flex: 1 }} /><Btn size="sm" variant="primary" onClick={addEx}>Add</Btn></div>
      </>)}
      <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}><Input value={newPlan} onChange={e => setNewPlan(e.target.value)} placeholder="New plan..." onKeyDown={e => e.key === "Enter" && addPlan()} style={{ flex: 1 }} /><Btn size="sm" onClick={addPlan}>+ Plan</Btn></div>
    </Card>
  );
};

// ─── CALORIES ────────────────────────────────────────────────────────────────
const Calories = ({ userId }) => {
  const [entries, setEntries] = useSynced(`calories_${todayKey()}`, [], userId);
  const goalCal = 2200;
  const [food, setFood] = useState(""); const [cals, setCals] = useState(""); const [prot, setProt] = useState(""); const [hint, setHint] = useState(""); const [loading, setLoading] = useState(false);
  const totalCal = entries.reduce((s, e) => s + (e.cal || 0), 0);
  const totalProt = entries.reduce((s, e) => s + (e.prot || 0), 0);
  const aiGuess = async () => {
    if (!food.trim()) return; setLoading(true); setHint("");
    const res = await callAI(`Estimate the calories and protein for: "${food}". Typical Filipino or Asian home serving. Respond with ONLY valid JSON: {"calories":number,"protein":number,"note":"brief"}`, "Nutrition expert. Valid JSON only.");
    const p = parseJSON(res);
    if (p && typeof p.calories === "number") { setCals(String(p.calories)); setProt(String(p.protein || 0)); setHint(p.note || ""); }
    else setHint("Could not estimate — fill manually.");
    setLoading(false);
  };
  const add = () => { if (!food.trim() || !cals) return; setEntries([...entries, { id: Date.now(), name: food, cal: parseInt(cals) || 0, prot: parseInt(prot) || 0 }]); setFood(""); setCals(""); setProt(""); setHint(""); };
  return (
    <Card>
      <Label>Calorie Tracker</Label>
      <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
        <div><div style={{ fontSize: 32, fontWeight: 800, color: C.blue, fontFamily: "'JetBrains Mono',monospace" }}>{totalCal}</div><div style={{ fontSize: 11, color: C.muted }}>of {goalCal} kcal</div></div>
        <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 20 }}><div style={{ fontSize: 32, fontWeight: 800, color: C.silver, fontFamily: "'JetBrains Mono',monospace" }}>{totalProt}g</div><div style={{ fontSize: 11, color: C.muted }}>protein</div></div>
      </div>
      <Bar pct={(totalCal / goalCal) * 100} color={C.blue} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        <div style={{ display: "flex", gap: 8 }}><Input value={food} onChange={e => setFood(e.target.value)} placeholder="Food item..." style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && aiGuess()} /><Btn size="sm" variant="primary" onClick={aiGuess} disabled={loading}>{loading ? <Spinner /> : "AI"}</Btn></div>
        {hint && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>{hint}</div>}
        <div style={{ display: "flex", gap: 8 }}><Input type="number" value={cals} onChange={e => setCals(e.target.value)} placeholder="kcal" /><Input type="number" value={prot} onChange={e => setProt(e.target.value)} placeholder="protein g" /><Btn size="sm" variant="primary" onClick={add}>Add</Btn></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 14, maxHeight: 160, overflowY: "auto" }}>
        {entries.map(e => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: C.surface2, borderRadius: 5, border: `1px solid ${C.border}` }}><span style={{ fontSize: 12 }}>{e.name}</span><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{e.cal}kcal · {e.prot}g</span><span onClick={() => setEntries(entries.filter(x => x.id !== e.id))} style={{ color: C.dim, cursor: "pointer", fontSize: 16 }}>×</span></div></div>))}
        {entries.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 10 }}>Nothing logged</div>}
      </div>
    </Card>
  );
};

// ─── FOOD PHOTO ───────────────────────────────────────────────────────────────
const FoodPhoto = ({ userId }) => {
  const [img, setImg] = useState(null); const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [note, setNote] = useState("");
  const fileRef = useRef();
  const handleFile = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => { setImg(ev.target.result); setResult(null); }; r.readAsDataURL(file); };
  const analyze = async () => {
    if (!img) return; setLoading(true); setResult(null);
    const base64 = img.split(",")[1]; const mimeType = img.split(";")[0].split(":")[1];
    const res = await callAIVision(base64, mimeType, `Analyze this food.${note ? ` Context: "${note}"` : ""} Reply ONLY valid JSON: {"food":"name","calories":number,"protein":number,"carbs":number,"fat":number,"note":"brief","followUp":"question if uncertain, else empty"}`);
    setResult(parseJSON(res) || { food: "Unknown", calories: 0, protein: 0, carbs: 0, fat: 0, note: "Could not analyze." });
    setLoading(false);
  };
  return (
    <Card>
      <Label>AI Food Scanner</Label>
      <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 150, border: `2px dashed ${C.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", marginBottom: 12, background: C.surface2, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
        {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center", color: C.muted }}><div style={{ fontSize: 22, marginBottom: 6 }}>+</div><div style={{ fontSize: 12 }}>Upload food photo</div></div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {img && (<><Input value={note} onChange={e => setNote(e.target.value)} placeholder="Context? (homemade, restaurant, large portion)" style={{ marginBottom: 10 }} /><Btn variant="primary" full onClick={analyze} disabled={loading}>{loading ? <><Spinner />&nbsp;Analyzing...</> : "Analyze Food"}</Btn></>)}
      {result && (
        <div style={{ marginTop: 14, padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{result.food}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[["Calories", result.calories, "kcal", C.silver], ["Protein", result.protein, "g", C.blue], ["Carbs", result.carbs, "g", C.accent], ["Fat", result.fat, "g", C.muted]].map(([l, v, u, c]) => (
              <div key={l} style={{ padding: "8px 10px", background: C.surface, borderRadius: 6, border: `1px solid ${C.border}` }}><div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 3 }}>{l.toUpperCase()}</div><div style={{ fontSize: 18, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{v}<span style={{ fontSize: 10, color: C.muted }}> {u}</span></div></div>
            ))}
          </div>
          {result.note && <div style={{ fontSize: 12, color: C.muted, marginBottom: result.followUp ? 8 : 0 }}>{result.note}</div>}
          {result.followUp && <div style={{ fontSize: 12, color: C.accent, padding: "8px 10px", background: C.accentGlow, borderRadius: 6, border: `1px solid ${C.borderHi}` }}>{result.followUp}</div>}
        </div>
      )}
    </Card>
  );
};

// ─── GOAL ─────────────────────────────────────────────────────────────────────
const GoalTracker = ({ userId }) => {
  const [goal, setGoal] = useSynced("goal_main", null, userId);
  const [steps, setSteps] = useSynced("goal_steps", [], userId);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const create = async () => {
    if (!input.trim()) return; setLoading(true); setError("");
    const res = await callAI(`Goal: "${input.trim()}". Break into 5-7 concrete actionable steps with realistic time estimates. Respond ONLY with valid JSON: {"steps":[{"text":"step","time":"time estimate"}],"totalTime":"total"}`, "Life coach. Valid JSON only. No markdown.");
    const parsed = parseJSON(res);
    if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) { setGoal({ text: input.trim(), totalTime: parsed.totalTime || "TBD", created: new Date().toLocaleDateString() }); setSteps(parsed.steps.map((s, i) => ({ ...s, id: i, done: false }))); setInput(""); }
    else setError("Could not generate. Try rephrasing.");
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
      {error && <div style={{ fontSize: 12, color: "#f08080", marginBottom: 10 }}>{error}</div>}
      <Btn variant="primary" onClick={create} disabled={loading || !input.trim()}>{loading ? <><Spinner />&nbsp;Breaking it down...</> : "Set Goal with AI"}</Btn>
    </Card>
  );
  return (
    <Card>
      <Label>Goal Tracker</Label>
      <div style={{ padding: "10px 12px", background: C.surface2, borderRadius: 6, marginBottom: 14, border: `1px solid ${C.border}` }}><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{goal.text}</div><div style={{ fontSize: 11, color: C.muted }}>Started {goal.created} · Est. {goal.totalTime}</div></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: C.muted }}>{done}/{steps.length} steps</span><span style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(pct)}%</span></div>
      <Bar pct={pct} color={C.accent} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "14px 0" }}>
        {steps.map(s => (
          <div key={s.id} onClick={() => toggle(s.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 6, cursor: "pointer", background: s.done ? C.accentGlow : C.surface2, border: `1px solid ${s.done ? C.borderHi : C.border}`, transition: "all 0.2s" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: `1px solid ${s.done ? C.accent : C.muted}`, background: s.done ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>{s.done && <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke={C.bg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: s.done ? C.muted : C.text, textDecoration: s.done ? "line-through" : "none" }}>{s.text}</div><div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{s.time}</div></div>
          </div>
        ))}
      </div>
      <Btn size="sm" variant="danger" onClick={() => { setGoal(null); setSteps([]); }}>Clear Goal</Btn>
    </Card>
  );
};

// ─── LOGS ─────────────────────────────────────────────────────────────────────
const LogBox = ({ logKey, title, onDelete, userId }) => {
  const [entries, setEntries] = useSynced(`log_${logKey}`, [], userId);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", comment: "", rating: 0, poster: "" });
  const fileRef = useRef();
  const handleFile = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => setDraft(d => ({ ...d, poster: ev.target.result })); r.readAsDataURL(file); };
  const save = () => { if (!draft.title.trim()) return; setEntries([{ ...draft, id: Date.now(), date: new Date().toLocaleDateString() }, ...entries]); setDraft({ title: "", comment: "", rating: 0, poster: "" }); setAdding(false); };
  return (
    <div style={{ marginBottom: 10, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.surface }}>
      {/* Accordion header — always visible, click to expand */}
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", userSelect: "none", transition: "background 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = C.surface2}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontSize: 10, color: C.muted, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "2px 8px", fontFamily: "'JetBrains Mono',monospace" }}>{entries.length}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onDelete && <span onClick={e => { e.stopPropagation(); if (window.confirm("Delete this log?")) onDelete(); }} style={{ fontSize: 10, color: "#f08080", cursor: "pointer" }}>Delete</span>}
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: C.muted }}>
            <path d="M2 4l5 5 5-5" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn size="sm" variant="primary" onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ Add"}</Btn>
          </div>
          {adding && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 90, border: `2px dashed ${C.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: C.surface }}>
                {draft.poster ? <img src={draft.poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: C.muted, fontSize: 12 }}>Upload poster / cover</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
              <Input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Title..." />
              <Input value={draft.comment} onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))} placeholder="Your thoughts..." multiline rows={2} />
              <div style={{ display: "flex", gap: 4 }}>{[1,2,3,4,5].map(s => <div key={s} onClick={() => setDraft(d => ({ ...d, rating: s }))} style={{ cursor: "pointer" }}><svg width="16" height="16" viewBox="0 0 24 24" fill={s <= draft.rating ? C.silver : "none"} stroke={s <= draft.rating ? C.silver : C.muted} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg></div>)}</div>
              <Btn variant="primary" onClick={save}>Save</Btn>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map(e => (
              <div key={e.id} style={{ display: "flex", gap: 10, padding: 12, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
                {e.poster && <img src={e.poster} alt="" style={{ width: 42, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0, border: `1px solid ${C.border}` }} />}
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{e.title}</div><div style={{ display: "flex", gap: 2, marginBottom: 4 }}>{[1,2,3,4,5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= e.rating ? C.silver : "none"} stroke={s <= e.rating ? C.silver : C.dim} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}</div>{e.comment && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{e.comment}</div>}<div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{e.date}</div></div>
                <span onClick={() => setEntries(entries.filter(x => x.id !== e.id))} style={{ color: C.dim, cursor: "pointer", alignSelf: "flex-start", fontSize: 16 }}>×</span>
              </div>
            ))}
            {entries.length === 0 && <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 14 }}>Nothing logged yet</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const Logs = ({ userId }) => {
  const [logDefs, setLogDefs] = useSynced("log_definitions", [{ key: "film", title: "Film Log" }, { key: "book", title: "Book & Manga Log" }], userId);
  const [newName, setNewName] = useState(""); const [adding, setAdding] = useState(false);
  const addLog = () => { if (!newName.trim()) return; setLogDefs([...logDefs, { key: `custom_${Date.now()}`, title: newName.trim() }]); setNewName(""); setAdding(false); };
  const deleteLog = key => setLogDefs(logDefs.filter(l => l.key !== key));
  return (
    <div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 20, fontWeight: 700 }}>Logs</div><Btn size="sm" variant="primary" onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ New Log"}</Btn></div>
      {adding && <Card style={{ marginBottom: 14 }}><Label>New Log Name</Label><div style={{ display: "flex", gap: 8 }}><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Game Log, Music Log..." onKeyDown={e => e.key === "Enter" && addLog()} style={{ flex: 1 }} /><Btn size="sm" variant="primary" onClick={addLog}>Create</Btn></div></Card>}
      {logDefs.map(l => <LogBox key={l.key} logKey={l.key} title={l.title} onDelete={l.key.startsWith("custom_") ? () => deleteLog(l.key) : null} userId={userId} />)}
    </div>
  );
};

// ─── OBSIDIAN NOTES + JOURNAL ────────────────────────────────────────────────
const NotesAndJournal = ({ userId }) => {
  const [subTab, setSubTab] = useState("notes");
  const [notes, setNotes] = useSynced("obsidian_notes", [], userId);
  const [activeNote, setActiveNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBlocks, setNoteBlocks] = useState([]); // rich blocks: {id, type:"text"|"image"|"url"|"video", content, data}
  const [noteTags, setNoteTags] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [noteFont, setNoteFont] = useSynced("note_font", { family:"'JetBrains Mono',monospace", size:14, lineH:1.85, spacing:0 }, userId);
  const noteFileRef = useRef();
  const [insertAfter, setInsertAfter] = useState(null); // block id to insert after
  const [urlDraft, setUrlDraft] = useState("");

  // Journal
  const [posts, setPosts] = useSynced("journal_posts", [], userId);
  const [journalView, setJournalView] = useState("list");
  const [activePost, setActivePost] = useState(null);
  const [jTitle, setJTitle] = useState(""); const [jBody, setJBody] = useState(""); const [jMood, setJMood] = useState("Neutral"); const [jSearch, setJSearch] = useState("");
  const [jAttachments, setJAttachments] = useState([]);
  const jFileRef = useRef();
  const [jUrlInput, setJUrlInput] = useState("");
  const moods = ["Neutral","Good","Great","Rough","Motivated","Tired","Reflective"];

  // ── block helpers ──
  const mkBlock = (type, content="", data="") => ({ id: Date.now()+Math.random(), type, content, data });

  const openNote = (note) => {
    setActiveNote(note);
    setNoteTitle(note.title || "");
    setNoteTags(note.tags || "");
    setIsPreview(false);
    // support legacy notes that stored body as string
    if (Array.isArray(note.blocks)) setNoteBlocks(note.blocks);
    else setNoteBlocks([mkBlock("text", note.body || "")]);
  };

  const saveNote = () => {
    const updated = { ...activeNote, title: noteTitle||"Untitled", blocks: noteBlocks, body: noteBlocks.filter(b=>b.type==="text").map(b=>b.content).join("\n\n"), tags: noteTags, updated: new Date().toLocaleDateString() };
    if (activeNote.id === "new") { const n={...updated,id:Date.now(),created:new Date().toLocaleDateString()}; setNotes([n,...notes]); setActiveNote(n); }
    else setNotes(notes.map(n => n.id===activeNote.id ? updated : n));
  };
  const newNote = () => openNote({ id:"new", title:"", blocks:[mkBlock("text","")], tags:"", created:new Date().toLocaleDateString(), updated:new Date().toLocaleDateString() });
  const deleteNote = id => { setNotes(notes.filter(n=>n.id!==id)); setActiveNote(null); };

  const updateBlock = (id, field, val) => setNoteBlocks(bs => bs.map(b => b.id===id ? {...b,[field]:val} : b));
  const deleteBlock = id => setNoteBlocks(bs => bs.filter(b=>b.id!==id));
  const addBlockAfter = (afterId, block) => setNoteBlocks(bs => {
    const i = bs.findIndex(b=>b.id===afterId);
    const next = [...bs]; next.splice(i+1,0,block); return next;
  });
  const addBlockAtEnd = (block) => setNoteBlocks(bs => [...bs, block]);

  const insertMedia = (afterId, type, data, name="") => {
    const block = mkBlock(type, name, data);
    if (afterId != null) addBlockAfter(afterId, block);
    else addBlockAtEnd(block);
  };

  const handleNoteFile = (e, afterId) => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader();
      if (file.type.startsWith("image/")) { r.onload = ev => insertMedia(afterId,"image",ev.target.result,file.name); r.readAsDataURL(file); }
      else if (file.type.startsWith("video/")) { r.onload = ev => insertMedia(afterId,"video",ev.target.result,file.name); r.readAsDataURL(file); }
    });
    e.target.value = "";
  };

  const insertUrl = (afterId) => {
    if (!urlDraft.trim()) return;
    const u = urlDraft.trim();
    const isYT = /youtu(be\.com|\.be)/.test(u);
    const isVimeo = /vimeo\.com/.test(u);
    const isImg = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(u);
    const type = (isYT||isVimeo) ? "video" : isImg ? "image" : "url";
    insertMedia(afterId, type, u, u);
    setUrlDraft("");
    setInsertAfter(null);
  };

  // ── markdown renderer (for preview) ──
  const renderMd = (text) => {
    if (!text) return "";
    return text
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/^######\s+(.+)$/gm,"<h6>$1</h6>").replace(/^#####\s+(.+)$/gm,"<h5>$1</h5>")
      .replace(/^####\s+(.+)$/gm,"<h4>$1</h4>").replace(/^###\s+(.+)$/gm,"<h3>$1</h3>")
      .replace(/^##\s+(.+)$/gm,"<h2>$1</h2>").replace(/^#\s+(.+)$/gm,"<h1>$1</h1>")
      .replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/~~(.+?)~~/g,"<del>$1</del>")
      .replace(/`([^`\n]+)`/g,"<code>$1</code>")
      .replace(/^```[\w]*\n?([\s\S]*?)```/gm,"<pre><code>$1</code></pre>")
      .replace(/^-{3,}$/gm,"<hr/>").replace(/^>\s+(.+)$/gm,"<blockquote>$1</blockquote>")
      .replace(/^-\s+\[x\]\s+(.+)$/gm,'<div class="cb"><input type="checkbox" checked disabled/> $1</div>')
      .replace(/^-\s+\[\s?\]\s+(.+)$/gm,'<div class="cb"><input type="checkbox" disabled/> $1</div>')
      .replace(/^[-*]\s+(.+)$/gm,"<li>$1</li>")
      .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank">$1</a>')
      .replace(/\n\n+/g,"</p><p>");
  };

  const getYTEmbed = (url) => {
    const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };
  const getVimeoEmbed = (url) => {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  };

  const filteredNotes = notes.filter(n => n.title?.toLowerCase().includes(noteSearch.toLowerCase()) || n.body?.toLowerCase().includes(noteSearch.toLowerCase()) || n.tags?.toLowerCase().includes(noteSearch.toLowerCase()));
  const filteredPosts = posts.filter(p => p.title?.toLowerCase().includes(jSearch.toLowerCase()) || p.body?.toLowerCase().includes(jSearch.toLowerCase()));

  const handleJFile = e => { Array.from(e.target.files).forEach(file => { if (file.type.startsWith("image/")||file.type.startsWith("video/")) { const r=new FileReader(); r.onload=ev=>setJAttachments(a=>[...a,{type:file.type.startsWith("video/")?"video":"image",name:file.name,data:ev.target.result}]); r.readAsDataURL(file); } else setJAttachments(a=>[...a,{type:"file",name:file.name}]); }); };
  const addJUrl = () => { if (!jUrlInput.trim()) return; setJAttachments(a=>[...a,{type:"url",name:jUrlInput.trim(),data:jUrlInput.trim()}]); setJUrlInput(""); };
  const saveJournal = () => {
    if (!jBody.trim()) return;
    const post = { id:Date.now(), title:jTitle.trim()||new Date().toLocaleDateString("en-US",{month:"long",day:"numeric"}), body:jBody.trim(), mood:jMood, date:new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}), wordCount:jBody.trim().split(/\s+/).length, attachments:jAttachments };
    setPosts([post,...posts]); setJTitle(""); setJBody(""); setJMood("Neutral"); setJAttachments([]); setJournalView("list");
  };

  const fontFamilies = [
    { label:"Mono (default)", value:"'JetBrains Mono',monospace" },
    { label:"Sans-serif", value:"system-ui,sans-serif" },
    { label:"Serif", value:"Georgia,serif" },
    { label:"Dyslexic-friendly", value:"'Verdana',sans-serif" },
  ];

  const mdCss = `
    .md-preview{font-size:${noteFont.size}px;line-height:${noteFont.lineH};color:#c0c8e0;letter-spacing:${noteFont.spacing}em;font-family:${noteFont.family}}
    .md-preview h1{font-size:1.7em;font-weight:700;margin:.5em 0 .25em;color:#e8eaf6;border-bottom:1px solid rgba(30,60,120,.35);padding-bottom:.2em}
    .md-preview h2{font-size:1.35em;font-weight:600;margin:.7em 0 .2em;color:#d0d8f0}
    .md-preview h3{font-size:1.1em;font-weight:600;margin:.6em 0 .15em;color:#b0bcdc}
    .md-preview h4,.md-preview h5,.md-preview h6{font-size:1em;font-weight:600;color:#9099c0;margin:.4em 0}
    .md-preview p{margin:.4em 0}
    .md-preview strong{color:#e8eaf6;font-weight:700}.md-preview em{color:#b0c0e0;font-style:italic}.md-preview del{color:#604060;text-decoration:line-through}
    .md-preview code{background:rgba(40,60,120,.3);border:1px solid rgba(40,80,160,.25);border-radius:3px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:.85em;color:#88aaff}
    .md-preview pre{background:rgba(5,5,20,.85);border:1px solid rgba(30,60,120,.3);border-radius:6px;padding:14px 16px;overflow-x:auto;margin:.7em 0}
    .md-preview pre code{background:none;border:none;padding:0;font-size:.9em;color:#a0b8ff}
    .md-preview blockquote{border-left:3px solid #4a78ff;margin:.7em 0;padding:5px 14px;background:rgba(40,80,200,.08);color:#8090c0;border-radius:0 4px 4px 0}
    .md-preview hr{border:none;border-top:1px solid rgba(30,60,120,.3);margin:1.1em 0}
    .md-preview li{margin:.25em 0;line-height:1.7;list-style:disc;margin-left:1.4em}
    .md-preview a{color:#6090ff;text-decoration:none}.md-preview a:hover{text-decoration:underline}
    .md-preview .cb{display:flex;align-items:center;gap:6px;margin:.25em 0}.md-preview .cb input{accent-color:#4a78ff}
    .note-block-text{font-family:${noteFont.family};font-size:${noteFont.size}px;line-height:${noteFont.lineH};letter-spacing:${noteFont.spacing}em;color:#c8d0e8;background:transparent;border:none;width:100%;resize:none;outline:none;white-space:pre-wrap;padding:0}
    .note-block-text::placeholder{color:#2a2a4a}
    .block-toolbar{opacity:0;transition:opacity .15s}.block-row:hover .block-toolbar{opacity:1}
  `;

  // ── Block renderer in edit mode ──
  const BlockEditor = ({ block, afterId }) => {
    const textRef = useRef();
    const autoResize = (el) => { if(el){el.style.height="auto";el.style.height=el.scrollHeight+"px";} };
    useEffect(()=>{ if(block.type==="text"&&textRef.current) autoResize(textRef.current); },[block.content]);

    return (
      <div className="block-row" style={{ position:"relative", marginBottom:4 }}>
        {block.type==="text" && (
          <div style={{ display:"flex", gap:0 }}>
            <textarea ref={textRef} className="note-block-text" value={block.content} rows={1}
              onChange={e=>{updateBlock(block.id,"content",e.target.value);autoResize(e.target);}}
              onKeyDown={e=>{
                if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addBlockAfter(block.id,mkBlock("text",""));}
                if(e.key==="Backspace"&&block.content===""){ e.preventDefault(); deleteBlock(block.id); }
              }}
              placeholder="Write here... (markdown supported)"
            />
            <div className="block-toolbar" style={{ display:"flex", flexDirection:"column", gap:2, marginLeft:6, flexShrink:0 }}>
              <button onClick={()=>setInsertAfter(insertAfter===block.id?null:block.id)} style={{ background:insertAfter===block.id?"rgba(74,120,255,0.2)":"transparent", border:`1px solid ${insertAfter===block.id?"#4a78ff":C.border}`, color:insertAfter===block.id?C.accent:C.muted, borderRadius:3, fontSize:10, padding:"2px 5px", cursor:"pointer" }} title="Insert media here">+</button>
              <button onClick={()=>deleteBlock(block.id)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:"#f08080", borderRadius:3, fontSize:10, padding:"2px 5px", cursor:"pointer" }}>×</button>
            </div>
          </div>
        )}
        {block.type==="image" && (
          <div style={{ position:"relative", marginBottom:8 }}>
            <img src={block.data} alt={block.content||"image"} style={{ maxWidth:"100%", borderRadius:6, display:"block", border:`1px solid ${C.border}` }} />
            {block.content && <div style={{ fontSize:11, color:C.dim, marginTop:4, fontStyle:"italic" }}>{block.content}</div>}
            <button onClick={()=>deleteBlock(block.id)} style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", borderRadius:"50%", width:22, height:22, cursor:"pointer", fontSize:12 }}>×</button>
          </div>
        )}
        {block.type==="video" && (()=>{
          const ytEmbed=getYTEmbed(block.data); const vmEmbed=getVimeoEmbed(block.data);
          return (
            <div style={{ position:"relative", marginBottom:8 }}>
              {(ytEmbed||vmEmbed)
                ? <iframe src={ytEmbed||vmEmbed} style={{ width:"100%", aspectRatio:"16/9", borderRadius:6, border:`1px solid ${C.border}` }} allowFullScreen title="video" />
                : <video src={block.data} controls style={{ maxWidth:"100%", borderRadius:6, border:`1px solid ${C.border}` }} />
              }
              <button onClick={()=>deleteBlock(block.id)} style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", borderRadius:"50%", width:22, height:22, cursor:"pointer", fontSize:12 }}>×</button>
            </div>
          );
        })()}
        {block.type==="url" && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:C.surface2, borderRadius:6, border:`1px solid ${C.border}`, marginBottom:8, position:"relative" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 10l4-4M5 7a3 3 0 004.24 4.24l1.42-1.42A3 3 0 006.76 5.34L5.34 6.76" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <a href={block.data} target="_blank" rel="noopener noreferrer" style={{ color:C.accent, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{block.content||block.data}</a>
            <button onClick={()=>deleteBlock(block.id)} style={{ background:"transparent", border:"none", color:C.dim, cursor:"pointer", fontSize:16, flexShrink:0 }}>×</button>
          </div>
        )}

        {/* Inline insert panel */}
        {insertAfter===block.id && (
          <div style={{ background:C.surface2, border:`1px solid ${C.borderHi}`, borderRadius:6, padding:"10px 12px", marginBottom:8, display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
            <input ref={noteFileRef} type="file" multiple accept="image/*,video/*" style={{ display:"none" }} onChange={e=>handleNoteFile(e,block.id)} />
            <button onClick={()=>noteFileRef.current.click()} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"4px 10px", borderRadius:3, fontSize:11, cursor:"pointer" }}>📎 Image / Video</button>
            <input value={urlDraft} onChange={e=>setUrlDraft(e.target.value)} placeholder="Paste YouTube, image, or any URL..." onKeyDown={e=>e.key==="Enter"&&insertUrl(block.id)} style={{ flex:1, minWidth:160, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:3, color:C.text, padding:"4px 8px", fontSize:11, outline:"none", fontFamily:"inherit" }} />
            <button onClick={()=>insertUrl(block.id)} style={{ background:C.accentGlow, border:`1px solid ${C.borderHi}`, color:C.accent, padding:"4px 10px", borderRadius:3, fontSize:11, cursor:"pointer" }}>Embed</button>
            <button onClick={()=>setInsertAfter(null)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"4px 8px", borderRadius:3, fontSize:11, cursor:"pointer" }}>Cancel</button>
          </div>
        )}
      </div>
    );
  };

  // ── Block renderer in preview mode ──
  const BlockPreview = ({ block }) => {
    if (block.type==="text") return <div className="md-preview" dangerouslySetInnerHTML={{ __html:renderMd(block.content) }} style={{ marginBottom:6 }} />;
    if (block.type==="image") return <div style={{ marginBottom:12 }}><img src={block.data} alt={block.content||""} style={{ maxWidth:"100%", borderRadius:6, border:`1px solid ${C.border}` }} />{block.content&&<div style={{ fontSize:11,color:C.dim,marginTop:4,fontStyle:"italic" }}>{block.content}</div>}</div>;
    if (block.type==="video") { const yt=getYTEmbed(block.data),vm=getVimeoEmbed(block.data); return <div style={{ marginBottom:12 }}>{(yt||vm)?<iframe src={yt||vm} style={{ width:"100%",aspectRatio:"16/9",borderRadius:6,border:`1px solid ${C.border}` }} allowFullScreen title="video" />:<video src={block.data} controls style={{ maxWidth:"100%",borderRadius:6 }} />}</div>; }
    if (block.type==="url") return <div style={{ margin:"8px 0 12px",padding:"8px 12px",background:C.surface2,borderRadius:6,border:`1px solid ${C.border}` }}><a href={block.data} target="_blank" rel="noopener noreferrer" style={{ color:C.accent,fontSize:13 }}>🔗 {block.content||block.data}</a></div>;
    return null;
  };

  // ── Font Settings panel ──
  const FontSettings = () => (
    <div style={{ position:"absolute", top:"100%", right:0, zIndex:50, background:"#0a0a1e", border:`1px solid ${C.borderHi}`, borderRadius:8, padding:16, width:240, boxShadow:"0 8px 32px rgba(0,0,0,0.6)" }}>
      <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:10, letterSpacing:"0.1em" }}>FONT SETTINGS</div>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, color:C.dim, marginBottom:4 }}>Font Family</div>
        {fontFamilies.map(f=><button key={f.value} onClick={()=>setNoteFont(prev=>({...prev,family:f.value}))} style={{ display:"block", width:"100%", textAlign:"left", padding:"5px 8px", borderRadius:3, border:`1px solid ${noteFont.family===f.value?C.borderHi:C.border}`, background:noteFont.family===f.value?C.accentGlow:"transparent", color:noteFont.family===f.value?C.accent:C.muted, fontSize:11, cursor:"pointer", marginBottom:3, fontFamily:f.value }}>{f.label}</button>)}
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, color:C.dim, marginBottom:4 }}>Font Size: {noteFont.size}px</div>
        <input type="range" min={11} max={22} value={noteFont.size} onChange={e=>setNoteFont(p=>({...p,size:+e.target.value}))} style={{ width:"100%", accentColor:C.accent }} />
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:10, color:C.dim, marginBottom:4 }}>Line Height: {noteFont.lineH}</div>
        <input type="range" min={1.2} max={3} step={0.05} value={noteFont.lineH} onChange={e=>setNoteFont(p=>({...p,lineH:+e.target.value}))} style={{ width:"100%", accentColor:C.accent }} />
      </div>
      <div>
        <div style={{ fontSize:10, color:C.dim, marginBottom:4 }}>Letter Spacing: {noteFont.spacing}em</div>
        <input type="range" min={-0.05} max={0.2} step={0.01} value={noteFont.spacing} onChange={e=>setNoteFont(p=>({...p,spacing:+e.target.value}))} style={{ width:"100%", accentColor:C.accent }} />
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={isFullscreen?{position:"fixed",inset:0,zIndex:200,background:C.bg,display:"flex",flexDirection:"column"}:{}}>
      <style>{mdCss}</style>

      {!isFullscreen && (
        <div style={{ display:"flex", gap:8, marginBottom:16, borderBottom:`1px solid ${C.border}`, paddingBottom:12 }}>
          {["notes","journal"].map(t=>(
            <button key={t} onClick={()=>setSubTab(t)} style={{ padding:"5px 14px", borderRadius:4, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:500, background:subTab===t?C.accentGlow:"transparent", color:subTab===t?C.accent:C.muted, borderBottom:`2px solid ${subTab===t?C.accent:"transparent"}`, transition:"all .15s", textTransform:"capitalize" }}>{t}</button>
          ))}
        </div>
      )}

      {subTab==="notes" && (
        <div style={{ display:"flex", height:isFullscreen?"100vh":"calc(100vh - 210px)", minHeight:500, border:`1px solid ${C.border}`, borderRadius:isFullscreen?0:8, overflow:"hidden" }}>

          {/* Sidebar */}
          {!isFullscreen && (
            <div style={{ width:220, flexShrink:0, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", background:"#05050e" }}>
              <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>NOTES</span>
                <button onClick={newNote} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:20, lineHeight:1, padding:"0 2px" }}>+</button>
              </div>
              <div style={{ padding:"7px 10px", borderBottom:`1px solid ${C.border}` }}>
                <input value={noteSearch} onChange={e=>setNoteSearch(e.target.value)} placeholder="Search..." style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:4, color:C.text, padding:"5px 8px", fontSize:11, outline:"none", fontFamily:"inherit" }} />
              </div>
              <div style={{ flex:1, overflowY:"auto" }}>
                {filteredNotes.length===0 && <div style={{ padding:"20px 12px", color:C.dim, fontSize:11, textAlign:"center" }}>No notes.<br/><span style={{ color:C.accent, cursor:"pointer" }} onClick={newNote}>Create one</span></div>}
                {filteredNotes.map(n=>(
                  <div key={n.id} onClick={()=>openNote(n)} style={{ padding:"9px 14px", cursor:"pointer", borderBottom:`1px solid rgba(30,60,120,0.1)`, background:activeNote?.id===n.id?"rgba(74,120,255,0.08)":"transparent", borderLeft:`2px solid ${activeNote?.id===n.id?C.accent:"transparent"}`, transition:"all .1s" }}>
                    <div style={{ fontSize:12, fontWeight:500, color:activeNote?.id===n.id?C.accent:C.text, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.title||"Untitled"}</div>
                    <div style={{ fontSize:10, color:C.dim }}>{n.updated}</div>
                    {n.tags&&<div style={{ fontSize:9, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.tags}</div>}
                  </div>
                ))}
              </div>
              <div style={{ padding:"8px 12px", borderTop:`1px solid ${C.border}`, fontSize:10, color:C.dim }}>{notes.length} {notes.length===1?"note":"notes"}</div>
            </div>
          )}

          {/* Editor pane */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.surface }}>
            {activeNote ? (
              <>
                {/* Toolbar */}
                <div style={{ padding:"8px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:6, flexShrink:0, background:"#07071a", flexWrap:"wrap" }}>
                  {isFullscreen && <button onClick={()=>setIsFullscreen(false)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12, fontFamily:"inherit", marginRight:4 }}>← Back</button>}
                  <input value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Untitled" style={{ background:"transparent", border:"none", color:C.text, fontSize:14, fontWeight:600, outline:"none", flex:1, minWidth:80, fontFamily:"inherit" }} />
                  <div style={{ display:"flex", gap:5, flexShrink:0, alignItems:"center", position:"relative" }}>
                    <button onClick={()=>setIsPreview(!isPreview)} style={{ background:isPreview?C.accentGlow:"transparent", border:`1px solid ${isPreview?C.borderHi:C.border}`, color:isPreview?C.accent:C.muted, padding:"3px 9px", borderRadius:3, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>{isPreview?"Edit":"Read"}</button>
                    <button onClick={()=>setShowSettings(!showSettings)} style={{ background:showSettings?C.accentGlow:"transparent", border:`1px solid ${showSettings?C.borderHi:C.border}`, color:showSettings?C.accent:C.muted, padding:"3px 8px", borderRadius:3, fontSize:10, cursor:"pointer" }} title="Font settings">Aa</button>
                    <button onClick={()=>setIsFullscreen(!isFullscreen)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"3px 8px", borderRadius:3, fontSize:11, cursor:"pointer" }}>{isFullscreen?"⊡":"⛶"}</button>
                    <Btn size="sm" variant="primary" onClick={saveNote}>Save</Btn>
                    {activeNote.id!=="new"&&<Btn size="sm" variant="danger" onClick={()=>deleteNote(activeNote.id)}>Delete</Btn>}
                    {!isFullscreen&&<button onClick={()=>setActiveNote(null)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, padding:"0 2px" }}>×</button>}
                    {showSettings && <FontSettings />}
                  </div>
                </div>
                {/* Tags */}
                <div style={{ padding:"5px 16px", borderBottom:`1px solid ${C.border}`, background:"#07071a", flexShrink:0 }}>
                  <input value={noteTags} onChange={e=>setNoteTags(e.target.value)} placeholder="tags: #work #ideas..." style={{ width:"100%", background:"transparent", border:"none", color:C.muted, fontSize:11, outline:"none", fontFamily:"'JetBrains Mono',monospace" }} />
                </div>
                {/* Content */}
                <div style={{ flex:1, overflow:"auto", padding:"20px 28px" }}>
                  {isPreview
                    ? <div style={{ maxWidth:720, margin:"0 auto" }}>{noteBlocks.map(b=><BlockPreview key={b.id} block={b} />)}</div>
                    : <div style={{ maxWidth:720, margin:"0 auto" }}>
                        {noteBlocks.map(b=><BlockEditor key={b.id} block={b} afterId={b.id} />)}
                        {/* Add block at end */}
                        <div style={{ display:"flex", gap:8, marginTop:12, paddingTop:12, borderTop:`1px dashed rgba(30,60,120,0.2)` }}>
                          <button onClick={()=>addBlockAtEnd(mkBlock("text",""))} style={{ background:"transparent", border:`1px dashed ${C.border}`, color:C.dim, padding:"5px 12px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>+ Text</button>
                          <button onClick={()=>{setInsertAfter("__end__");noteFileRef.current.click();}} style={{ background:"transparent", border:`1px dashed ${C.border}`, color:C.dim, padding:"5px 12px", borderRadius:4, fontSize:11, cursor:"pointer" }}>+ Image/Video</button>
                          <div style={{ display:"flex", gap:4, flex:1 }}>
                            <input value={insertAfter==="__end__"?"":urlDraft} onChange={e=>{setUrlDraft(e.target.value);setInsertAfter("__end__");}} placeholder="+ Paste URL to embed..." onKeyDown={e=>e.key==="Enter"&&insertUrl(null)} style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px dashed ${C.border}`, borderRadius:4, color:C.text, padding:"5px 8px", fontSize:11, outline:"none", fontFamily:"inherit" }} />
                          </div>
                        </div>
                        <input ref={noteFileRef} type="file" multiple accept="image/*,video/*" style={{ display:"none" }} onChange={e=>handleNoteFile(e, insertAfter==="__end__"?null:insertAfter)} />
                      </div>
                  }
                </div>
              </>
            ) : (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:C.dim, gap:12 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="10" y="8" width="28" height="32" rx="3" stroke={C.dim} strokeWidth="1.5"/><line x1="16" y1="16" x2="32" y2="16" stroke={C.dim} strokeWidth="1.5"/><line x1="16" y1="22" x2="32" y2="22" stroke={C.dim} strokeWidth="1.5"/><line x1="16" y1="28" x2="24" y2="28" stroke={C.dim} strokeWidth="1.5"/></svg>
                <div style={{ fontSize:13 }}>Select a note or</div>
                <button onClick={newNote} style={{ background:C.accentGlow, border:`1px solid ${C.borderHi}`, color:C.accent, padding:"7px 20px", borderRadius:4, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>New Note</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── JOURNAL ── */}
      {subTab==="journal" && (
        <>
          {journalView==="list" && (
            <div style={{ maxWidth:680, margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div><div style={{ fontSize:20, fontWeight:700 }}>Journal</div><div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{posts.length} {posts.length===1?"entry":"entries"}</div></div>
                <Btn variant="primary" onClick={()=>{setJTitle("");setJBody("");setJMood("Neutral");setJAttachments([]);setJournalView("write");}}>+ New Entry</Btn>
              </div>
              {posts.length>4&&<Input value={jSearch} onChange={e=>setJSearch(e.target.value)} placeholder="Search..." style={{ marginBottom:14 }} />}
              {filteredPosts.length===0&&<Card style={{ textAlign:"center", padding:"40px 20px" }}><div style={{ color:C.dim, fontSize:13 }}>{posts.length===0?"No entries yet.":"No results"}</div></Card>}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filteredPosts.map(post=>(
                  <Card key={post.id} onClick={()=>{setActivePost(post);setJournalView("read");}}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}><div style={{ fontSize:14, fontWeight:600 }}>{post.title}</div><span onClick={e=>{e.stopPropagation();setPosts(posts.filter(p=>p.id!==post.id));}} style={{ color:C.dim, cursor:"pointer", fontSize:18, padding:"0 4px" }}>×</span></div>
                    <div style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:10, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.body}</div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:C.dim }}>{post.date}</span><span style={{ fontSize:11, color:C.dim }}>{post.wordCount} words · {post.mood}</span></div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {journalView==="write" && (
            <div style={{ maxWidth:680, margin:"0 auto" }}>
              <div style={{ marginBottom:20 }}><Btn size="sm" variant="ghost" onClick={()=>setJournalView("list")}>← Back</Btn></div>
              <Card>
                <input value={jTitle} onChange={e=>setJTitle(e.target.value)} placeholder="Title..." style={{ width:"100%", background:"transparent", border:"none", borderBottom:`1px solid ${C.border}`, color:C.text, padding:"4px 0 12px", fontSize:22, fontWeight:700, outline:"none", marginBottom:16, fontFamily:"inherit" }} />
                <div style={{ marginBottom:14 }}><Label style={{ marginBottom:8 }}>Mood</Label><div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{moods.map(m=><button key={m} onClick={()=>setJMood(m)} style={{ padding:"4px 12px", borderRadius:3, fontSize:11, cursor:"pointer", fontFamily:"inherit", background:jMood===m?C.accentGlow:"transparent", border:`1px solid ${jMood===m?C.borderHi:C.border}`, color:jMood===m?C.accent:C.muted }}>{m}</button>)}</div></div>
                <textarea value={jBody} onChange={e=>setJBody(e.target.value)} placeholder="What's on your mind..." autoFocus style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontSize:14, lineHeight:1.8, outline:"none", resize:"vertical", minHeight:240, fontFamily:"inherit" }} />
                <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                    <Btn size="sm" variant="ghost" onClick={()=>jFileRef.current.click()}>+ Photo / Video / File</Btn>
                    <div style={{ display:"flex", gap:6, flex:1, minWidth:180 }}>
                      <Input value={jUrlInput} onChange={e=>setJUrlInput(e.target.value)} placeholder="Paste URL..." style={{ flex:1, fontSize:12 }} onKeyDown={e=>e.key==="Enter"&&addJUrl()} />
                      <Btn size="sm" onClick={addJUrl}>Add</Btn>
                    </div>
                  </div>
                  <input ref={jFileRef} type="file" multiple accept="image/*,video/*,.pdf,.txt" style={{ display:"none" }} onChange={handleJFile} />
                  {jAttachments.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>{jAttachments.map((a,i)=><div key={i} style={{ position:"relative", background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>{a.type==="image"&&<img src={a.data} alt={a.name} style={{ width:80, height:60, objectFit:"cover", display:"block" }} />}{a.type==="url"&&<a href={a.data} target="_blank" rel="noopener noreferrer" style={{ display:"block", padding:"6px 10px", fontSize:11, color:C.accent, maxWidth:160 }}>{a.name}</a>}<div onClick={()=>setJAttachments(prev=>prev.filter((_,idx)=>idx!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.7)", color:"#fff", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:10 }}>×</div></div>)}</div>}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, paddingTop:14, borderTop:`1px solid ${C.border}` }}><span style={{ fontSize:12, color:C.dim }}>{jBody.trim()?jBody.trim().split(/\s+/).length:0} words</span><Btn variant="primary" onClick={saveJournal} disabled={!jBody.trim()}>Save Entry</Btn></div>
              </Card>
            </div>
          )}
          {journalView==="read" && activePost && (
            <div style={{ maxWidth:680, margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}><Btn size="sm" variant="ghost" onClick={()=>{setJournalView("list");setActivePost(null);}}>← Back</Btn><Btn size="sm" variant="danger" onClick={()=>{setPosts(posts.filter(p=>p.id!==activePost.id));setJournalView("list");setActivePost(null);}}>Delete</Btn></div>
              <Card><div style={{ fontSize:11, color:C.muted, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>{activePost.date} · {activePost.wordCount} words · {activePost.mood}</div><h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>{activePost.title}</h1><div style={{ fontSize:15, color:"#c0c8e0", lineHeight:1.9, whiteSpace:"pre-wrap" }}>{activePost.body}</div></Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => { const s=JSON.parse(localStorage.getItem("sb_session")||"null"); return s?.user||null; });
  const [tab, setTab] = useState("home");
  const [showReport, setShowReport] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = () => { localStorage.removeItem("sb_session"); setUser(null); };
  const [bgTheme, setBgTheme] = useSynced("bg_theme", "default", user?.id);

  if (!user) return <AuthScreen onLogin={u=>setUser(u)} />;

  const tabs = [
    { id:"home", label:"Home" },
    { id:"fitness", label:"Fitness" },
    { id:"food", label:"Food" },
    { id:"logs", label:"Logs" },
    { id:"goals", label:"Goals" },
    { id:"focus", label:"Focus" },
    { id:"bible", label:"Bible" },
    { id:"notes", label:"Notes" },
    { id:"archive", label:"Archive" },
  ];

  const bgThemes = {
    default: { bg:C.bg, grid:C.border, glow:C.blueGlow },
    midnight: { bg:"#000008", grid:"rgba(20,0,60,0.6)", glow:"rgba(80,0,200,0.15)" },
    forest: { bg:"#030e06", grid:"rgba(0,40,10,0.5)", glow:"rgba(0,120,40,0.12)" },
    crimson: { bg:"#0a0003", grid:"rgba(60,0,10,0.5)", glow:"rgba(180,0,40,0.12)" },
    slate: { bg:"#060810", grid:"rgba(20,30,60,0.5)", glow:"rgba(60,80,160,0.12)" },
    obsidian: { bg:"#050505", grid:"rgba(30,30,30,0.4)", glow:"rgba(120,120,120,0.08)" },
  };
  const theme = bgThemes[bgTheme] || bgThemes.default;
  const currentTab = tabs.find(t=>t.id===tab);

  return (
    <div style={{ minHeight:"100vh", background:theme.bg, position:"relative" }}>
      <style>{css}</style>
      <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(${theme.grid} 1px,transparent 1px),linear-gradient(90deg,${theme.grid} 1px,transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0, opacity:0.4 }} />
      <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:600, height:300, background:`radial-gradient(ellipse,${theme.glow} 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />

      <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(3,3,10,0.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center" }}>
                <svg width="44" height="30" viewBox="0 0 220 150" style={{ filter:"drop-shadow(0 0 8px rgba(200,160,40,0.7))" }}>
                  <defs>
                    <radialGradient id="ovalOut" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#c8860a"/><stop offset="40%" stopColor="#e8a020"/><stop offset="70%" stopColor="#b06010"/><stop offset="100%" stopColor="#301000"/>
                    </radialGradient>
                    <radialGradient id="ovalIn" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#d4940e"/><stop offset="60%" stopColor="#c07808"/><stop offset="100%" stopColor="#1a0800"/>
                    </radialGradient>
                    <linearGradient id="ovalShine" x1="20%" y1="10%" x2="80%" y2="60%">
                      <stop offset="0%" stopColor="rgba(255,220,100,0.55)"/><stop offset="100%" stopColor="rgba(255,180,20,0)"/>
                    </linearGradient>
                    <clipPath id="innerOval"><ellipse cx="110" cy="75" rx="85" ry="50"/></clipPath>
                  </defs>
                  <ellipse cx="110" cy="75" rx="108" ry="68" fill="url(#ovalOut)"/>
                  <ellipse cx="110" cy="75" rx="98" ry="60" fill="#0a0500"/>
                  <ellipse cx="110" cy="75" rx="85" ry="50" fill="url(#ovalIn)"/>
                  <g clipPath="url(#innerOval)" fill="#050200">
                    <ellipse cx="110" cy="82" rx="18" ry="22"/>
                    <polygon points="110,30 103,52 117,52"/>
                    <polygon points="98,36 88,52 108,52"/>
                    <polygon points="122,36 112,52 132,52"/>
                    <path d="M92 68 C75 55 45 48 25 60 C35 60 45 64 50 70 C38 68 28 72 22 80 C34 76 46 75 55 78 C48 82 42 90 44 100 C50 92 58 86 68 82 C72 88 74 96 74 104 C76 96 78 88 82 82 C88 86 92 90 92 96 Z"/>
                    <path d="M128 68 C145 55 175 48 195 60 C185 60 175 64 170 70 C182 68 192 72 198 80 C186 76 174 75 165 78 C172 82 178 90 176 100 C170 92 162 86 152 82 C148 88 146 96 146 104 C144 96 142 88 138 82 C132 86 128 90 128 96 Z"/>
                    <path d="M102 104 C105 96 110 92 110 92 C110 92 115 96 118 104 C115 100 110 98 110 98 C110 98 105 100 102 104 Z" fill="#c07808"/>
                  </g>
                  <ellipse cx="110" cy="75" rx="85" ry="50" fill="url(#ovalShine)"/>
                  <ellipse cx="110" cy="75" rx="108" ry="68" fill="none" stroke="rgba(255,220,80,0.3)" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>{getGreeting()},</div>
                <div style={{ fontSize:14, fontWeight:800, letterSpacing:"0.1em", background:C.chrome, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VINCE</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <FortuneCookie />
              <Btn size="sm" variant="primary" onClick={()=>setShowReport(true)}>Report</Btn>
              {/* Theme picker */}
              <div style={{ position:"relative" }} id="theme-picker">
                <button onClick={()=>document.getElementById("theme-dropdown").classList.toggle("open")} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, padding:"4px 8px", cursor:"pointer", fontSize:11 }} title="Change background">🎨</button>
                <div id="theme-dropdown" style={{ position:"absolute", right:0, top:"calc(100% + 6px)", background:"#0a0a1e", border:`1px solid ${C.borderHi}`, borderRadius:8, padding:10, zIndex:200, display:"none", minWidth:140 }}>
                  <style>{`#theme-dropdown.open{display:block!important}`}</style>
                  <div style={{ fontSize:10, color:C.dim, marginBottom:6, letterSpacing:"0.1em" }}>BACKGROUND</div>
                  {Object.keys(bgThemes).map(k=>(
                    <button key={k} onClick={()=>{setBgTheme(k);document.getElementById("theme-dropdown").classList.remove("open");}} style={{ display:"block", width:"100%", textAlign:"left", padding:"5px 8px", borderRadius:3, border:`1px solid ${bgTheme===k?C.borderHi:C.border}`, background:bgTheme===k?C.accentGlow:"transparent", color:bgTheme===k?C.accent:C.muted, fontSize:11, cursor:"pointer", marginBottom:3, textTransform:"capitalize" }}>{k}</button>
                  ))}
                </div>
              </div>
              <Btn size="sm" variant="ghost" onClick={logout}>Exit</Btn>
            </div>
          </div>
          {/* Desktop nav */}
          <div style={{ display:"flex", borderTop:`1px solid ${C.border}`, overflowX:"auto" }} id="desktop-nav">
            {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"10px 14px", fontSize:11, fontWeight:500, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap", background:"transparent", border:"none", borderBottom:`2px solid ${tab===t.id?C.accent:"transparent"}`, color:tab===t.id?C.accent:C.muted, fontFamily:"inherit", letterSpacing:"0.04em" }}>{t.label}</button>)}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:960, margin:"0 auto", padding:"24px 20px 120px", position:"relative", zIndex:1 }}>
        {tab==="home"&&<Home userId={user.id} onNavigate={setTab}/>}
        {tab==="fitness"&&<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:14 }} className="fade-up"><Workout userId={user.id}/><Water userId={user.id}/><Health userId={user.id}/></div>}
        {tab==="food"&&<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:14 }} className="fade-up"><FoodPhoto userId={user.id}/><Calories userId={user.id}/></div>}
        {tab==="logs"&&<Logs userId={user.id}/>}
        {tab==="goals"&&<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:14 }} className="fade-up"><GoalTracker userId={user.id}/></div>}
        {tab==="focus"&&<FocusTimer userId={user.id}/>}
        {tab==="bible"&&<Bible userId={user.id}/>}
        {tab==="notes"&&<NotesAndJournal userId={user.id}/>}
        {tab==="archive"&&<ReportArchive userId={user.id}/>}
      </main>

      {/* ── MOBILE: hamburger dropdown nav ── */}
      <div id="mobile-nav-container" style={{ display:"none" }}>
        {/* Fixed bottom bar with hamburger */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(3,3,10,0.98)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, zIndex:100, padding:"0 16px", paddingBottom:"max(12px, env(safe-area-inset-bottom))", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.accent, letterSpacing:"0.04em" }}>{currentTab?.label||"Home"}</div>
          <button onClick={()=>setMobileMenuOpen(o=>!o)} style={{ background:mobileMenuOpen?C.accentGlow:"transparent", border:`1px solid ${mobileMenuOpen?C.borderHi:C.border}`, borderRadius:6, color:mobileMenuOpen?C.accent:C.muted, padding:"8px 14px", cursor:"pointer", display:"flex", flexDirection:"column", gap:4, alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:18, height:1.5, background:mobileMenuOpen?C.accent:C.muted, borderRadius:2, transition:"all 0.2s", transform:mobileMenuOpen?"rotate(45deg) translate(4px,4px)":"none" }} />
            <div style={{ width:18, height:1.5, background:mobileMenuOpen?C.accent:C.muted, borderRadius:2, transition:"all 0.2s", opacity:mobileMenuOpen?0:1 }} />
            <div style={{ width:18, height:1.5, background:mobileMenuOpen?C.accent:C.muted, borderRadius:2, transition:"all 0.2s", transform:mobileMenuOpen?"rotate(-45deg) translate(4px,-4px)":"none" }} />
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div style={{ position:"fixed", bottom:56, left:0, right:0, zIndex:99, background:"rgba(3,3,10,0.98)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, padding:"8px 0" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2, padding:"0 8px" }}>
              {tabs.map(t=>(
                <button key={t.id} onClick={()=>{setTab(t.id);setMobileMenuOpen(false);}} style={{ padding:"12px 8px", fontSize:12, fontWeight:500, cursor:"pointer", background:tab===t.id?C.accentGlow:"transparent", border:`1px solid ${tab===t.id?C.borderHi:"transparent"}`, borderRadius:6, color:tab===t.id?C.accent:C.muted, fontFamily:"inherit", textAlign:"center", transition:"all 0.15s", margin:2 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 680px) {
          #mobile-nav-container { display: block !important; }
          #desktop-nav { display: none !important; }
          main { padding-left: 14px !important; padding-right: 14px !important; padding-bottom: 80px !important; }
        }
      `}</style>

      {showReport&&<EveningReport onClose={()=>setShowReport(false)} userId={user.id}/>}
    </div>
  );
}
