import { useState, useEffect, useRef } from "react";

// ── Exercise definitions ──────────────────────────────────────────────────────

const FORM_NOTES = {
  "Sumo Squat": "Wide stance, toes angled out. Hold one dumbbell goblet-style at chest for now — progress to one in each hand at sides when 30 lbs feels easy. Knees track over toes, chest tall, gaze forward.",
  "Dumbbell Deadlift": "Hinge from hips, flat back. Keep shoulders packed down — don't shrug at the top.",
  "Standing Calf Raises": "Controlled rise and slow lower. Hold wall lightly if needed — don't grip hard (creates shoulder tension).",
  "Dumbbell Chest Press": "Shoulders pressed INTO the floor/bench throughout. Don't let them creep up toward your ears.",
  "Lateral Raises": "Shoulders DOWN before each rep — consciously drop them. Slight bend in elbow. Stop at shoulder height.",
  "Skull Crushers": "Upper arms stay vertical and still — only forearms move. Keep jaw and neck relaxed throughout.",
  "Bent-Over Row": "Shoulders DOWN — don't hike them at the top. Squeeze shoulder blades together, not up.",
  "Sumo Squat": "Wide stance, toes angled out. Progress to holding one dumbbell in each hand at sides. Knees track over toes, chest tall, gaze forward.",
  "Romanian Deadlift": "Hip hinge — push hips back, feel stretch in hamstrings. Shoulders packed down, spine neutral.",
  "Dumbbell Shoulder Press": "Don't let shoulders shrug up as you press. Keep neck long. Seated is fine.",
  "Single-Arm Row": "Full range of motion. Shoulder blade pulls back and DOWN — not up.",
  "Bicep Curls": "Slow on the way down (3 counts). Shoulders stay back and down — don't rock.",
  "Reverse Lunge": "Step back, hover knee above floor. Keep front knee over ankle. Gaze forward.",
};

const mk = (name, weight, unit, reps, sets) => ({ name, weight, unit, reps, sets, notes: FORM_NOTES[name] || "" });

// Superset pairs: exercises grouped so alternating muscles get rest
const SUPERSETS_1_4 = [
  { pair: [mk("Sumo Squat",30,"lbs (1 dumbbell)",10,2), mk("Standing Calf Raises",30,"lbs (1 dumbbell)",10,2)], label:"Superset A — Lower Body" },
  { pair: [mk("Dumbbell Deadlift",20,"lbs each hand",10,2), mk("Dumbbell Chest Press",15,"lbs each hand",12,2)], label:"Superset B — Posterior + Push" },
  { pair: [mk("Bent-Over Row",20,"lbs each hand",10,2), mk("Lateral Raises",8,"lbs each hand",10,2), mk("Bicep Curls",15,"lbs each hand",10,2)], label:"Superset C — Pull + Shoulder + Bicep" },
  { pair: [mk("Skull Crushers",8,"lbs each hand",10,2)], label:"Finisher — Triceps" },
];

const SUPERSETS_5_8 = [
  { pair: [mk("Sumo Squat",30,"lbs each hand",12,3), mk("Standing Calf Raises",30,"lbs (1 dumbbell)",12,3)], label:"Superset A — Lower Body" },
  { pair: [mk("Romanian Deadlift",20,"lbs each hand",12,3), mk("Dumbbell Chest Press",15,"lbs each hand",12,3)], label:"Superset B — Posterior + Push" },
  { pair: [mk("Single-Arm Row",20,"lbs",12,3), mk("Dumbbell Shoulder Press",10,"lbs each hand",12,3)], label:"Superset C — Pull + Push" },
  { pair: [mk("Lateral Raises",8,"lbs each hand",12,3), mk("Bicep Curls",15,"lbs each hand",12,3)], label:"Superset D — Shoulder + Bicep" },
  { pair: [mk("Skull Crushers",8,"lbs each hand",12,3)], label:"Finisher — Triceps" },
];

const SUPERSETS_9_12_A = [
  { pair: [mk("Sumo Squat",30,"lbs each hand",12,3), mk("Standing Calf Raises",30,"lbs (1 dumbbell)",12,3)], label:"Superset A — Lower Body" },
  { pair: [mk("Romanian Deadlift",20,"lbs each hand",12,3), mk("Dumbbell Chest Press",15,"lbs each hand",12,3)], label:"Superset B — Posterior + Push" },
  { pair: [mk("Dumbbell Shoulder Press",10,"lbs each hand",12,3), mk("Skull Crushers",8,"lbs each hand",12,3)], label:"Superset C — Shoulder + Tricep" },
];

const SUPERSETS_9_12_B = [
  { pair: [mk("Dumbbell Deadlift",20,"lbs each hand",12,3), mk("Reverse Lunge",15,"lbs each hand",12,3)], label:"Superset A — Lower Body" },
  { pair: [mk("Standing Calf Raises",30,"lbs (1 dumbbell)",12,3), mk("Bent-Over Row",20,"lbs each hand",12,3)], label:"Superset B — Calf + Pull" },
  { pair: [mk("Bicep Curls",15,"lbs each hand",12,3), mk("Skull Crushers",8,"lbs each hand",12,3)], label:"Superset C — Bicep + Tricep" },
];

const CORE_DEF = [
  { name:"Dead Bug", defaultReps:10, hasWeight:false, notes:"Lie on back, arms up, knees at 90°. Lower opposite arm/leg slowly without letting lower back arch. Look straight up — keep neck neutral." },
  { name:"Glute Bridge", defaultReps:12, defaultWeight:30, hasWeight:true, notes:"Weight rests on hip bones. Drive through heels. Squeeze glutes at top for 2 sec. Keep chin tucked slightly — don't crane neck back." },
  { name:"Bird Dog", defaultReps:30, hasWeight:false, isBirdDog:true, notes:"On hands and knees, wrists under shoulders. Look DOWN at the mat — neutral spine, don't lift head toward your extended hand. Extend opposite arm and leg, hold for the timer, then switch sides. Keep hips level throughout." },
  { name:"Situps", defaultReps:10, hasWeight:false, notes:"Arms crossed on chest — not behind neck. Rise slowly. Lower even slower. Keep jaw relaxed — people often clench here without realising." },
];

const HEADACHE_DEF = [
  { name:"Chin Tucks", detail:"Pull chin straight back (double chin), hold 5 sec. Releases the suboccipital muscles at the base of your skull — the #1 tension headache muscle.", reps:"10 reps" },
  { name:"Levator Scapulae Stretch", detail:"Sit tall, drop right ear to right shoulder, then turn nose slightly toward armpit. Hold. Targets the muscle running from your shoulder blade directly to the base of your skull.", reps:"30 sec each side" },
  { name:"Doorway Chest Stretch", detail:"Forearms on door frame at shoulder height, gently lean forward. Opens the chest and takes pressure off the upper traps.", reps:"30 sec" },
  { name:"Shoulder Blade Squeezes", detail:"Sit or stand tall, squeeze shoulder blades together and DOWN (not up), hold 5 sec. Strengthens the mid-back muscles that counterbalance tight upper traps.", reps:"10 reps" },
];

function getPhase(week) {
  if (week <= 4) return { label:"Weeks 1–4: Foundation", supersets: SUPERSETS_1_4 };
  if (week <= 8) return { label:"Weeks 5–8: Build", supersets: SUPERSETS_5_8 };
  return {
    label:`Weeks 9–12: ${week%2===1?"Workout A":"Workout B"}`,
    supersets: week%2===1 ? SUPERSETS_9_12_A : SUPERSETS_9_12_B
  };
}

const AWAY_GYM_SUPERSETS = [
  { pair: [
    mk("Barbell Squat", 65, "lbs total", 10, 2),
    mk("Barbell Romanian Deadlift", 75, "lbs total", 10, 2),
    mk("Barbell Calf Raises", 75, "lbs total", 10, 2),
  ], label:"Superset A — Lower Body (similar weights, minimal changes)" },
  { pair: [
    mk("Barbell Bent-Over Row", 45, "lbs (bar only)", 10, 2),
    mk("Lateral Raises", 10, "lbs each hand (short bars)", 10, 2),
    mk("Skull Crushers", 10, "lbs each hand (short bars)", 10, 2),
  ], label:"Superset B — Pull + Isolation" },
  { pair: [
    mk("Barbell Bench Press", 55, "lbs total", 10, 2),
  ], label:"Superset C — Push" },
  { pair: [
    mk("Bicep Curls", 10, "lbs each hand (short bars)", 10, 2),
  ], label:"Finisher — Bicep Curls" },
];

const JUBAIL_GYM_SUPERSETS_1_4 = (sets=2) => [
  { pair: [
    mk("Barbell Squat", 37.5, "kg", 10, sets),
    mk("Dumbbell Romanian Deadlift", 16, "kg each hand", 10, sets),
    mk("Leg Extension", 15, "kg", 10, sets),
    mk("Leg Curl", 15, "kg", 10, sets),
  ], label:"Superset A — Lower Body" },
  { pair: [
    mk("Cable Lat Pulldown", 25, "kg", 10, sets),
    mk("Cable Row", 10, "kg", 10, sets),
    mk("Bicep Curls", 6, "kg each hand", 10, sets),
  ], label:"Superset B — Pull" },
  { pair: [
    mk("Machine Chest Press", 15, "kg", 10, sets),
    mk("Standing Overhead Tricep Extension", 8, "kg (one dumbbell, both hands)", 10, sets),
  ], label:"Superset C — Push + Tricep" },
  { pair: [
    mk("Lateral Raises", 4, "kg each hand", 10, sets),
  ], label:"Finisher — Lateral Raises" },
];

const JUBAIL_GYM_SUPERSETS_5_8 = (sets=3) => [
  { pair: [
    mk("Barbell Squat", 37.5, "kg", 10, sets),
    mk("Dumbbell Romanian Deadlift", 16, "kg each hand", 10, sets),
    mk("Leg Extension", 15, "kg", 10, sets),
    mk("Leg Curl", 15, "kg", 10, sets),
  ], label:"Superset A — Lower Body" },
  { pair: [
    mk("Cable Lat Pulldown", 25, "kg", 10, sets),
    mk("Cable Row", 10, "kg", 10, sets),
    mk("Bicep Curls", 6, "kg each hand", 10, sets),
  ], label:"Superset B — Pull" },
  { pair: [
    mk("Machine Chest Press", 15, "kg", 10, sets),
    mk("Standing Overhead Tricep Extension", 8, "kg (one dumbbell, both hands)", 10, sets),
  ], label:"Superset C — Push + Tricep" },
  { pair: [
    mk("Lateral Raises", 4, "kg each hand", 10, sets),
  ], label:"Finisher — Lateral Raises" },
];

const JUBAIL_GYM_SUPERSETS_9_12_A = (sets=3) => [
  { pair: [
    mk("Barbell Squat", 37.5, "kg", 12, sets),
    mk("Dumbbell Romanian Deadlift", 16, "kg each hand", 12, sets),
    mk("Leg Extension", 15, "kg", 12, sets),
    mk("Leg Curl", 15, "kg", 12, sets),
  ], label:"Superset A — Lower Body (Workout A)" },
  { pair: [
    mk("Cable Lat Pulldown", 25, "kg", 12, sets),
    mk("Cable Row", 10, "kg", 12, sets),
    mk("Bicep Curls", 6, "kg each hand", 12, sets),
  ], label:"Superset B — Pull" },
  { pair: [
    mk("Machine Chest Press", 15, "kg", 12, sets),
    mk("Standing Overhead Tricep Extension", 8, "kg (one dumbbell, both hands)", 12, sets),
  ], label:"Superset C — Push + Tricep" },
  { pair: [
    mk("Lateral Raises", 4, "kg each hand", 12, sets),
  ], label:"Finisher — Lateral Raises" },
];

const JUBAIL_GYM_SUPERSETS_9_12_B = (sets=3) => [
  { pair: [
    mk("Barbell Squat", 37.5, "kg", 12, sets),
    mk("Dumbbell Romanian Deadlift", 16, "kg each hand", 12, sets),
    mk("Leg Extension", 15, "kg", 12, sets),
    mk("Leg Curl", 15, "kg", 12, sets),
  ], label:"Superset A — Lower Body (Workout B)" },
  { pair: [
    mk("Cable Lat Pulldown", 25, "kg", 12, sets),
    mk("Cable Row", 10, "kg", 12, sets),
    mk("Bicep Curls", 6, "kg each hand", 12, sets),
  ], label:"Superset B — Pull" },
  { pair: [
    mk("Machine Chest Press", 15, "kg", 12, sets),
    mk("Standing Overhead Tricep Extension", 8, "kg (one dumbbell, both hands)", 12, sets),
  ], label:"Superset C — Push + Tricep" },
  { pair: [
    mk("Lateral Raises", 4, "kg each hand", 12, sets),
  ], label:"Finisher — Lateral Raises" },
];

function getJubailSupersets(week) {
  const sets = week <= 4 ? 2 : 3;
  if (week <= 4) return { label:"Weeks 1–4: Foundation", supersets: JUBAIL_GYM_SUPERSETS_1_4(sets) };
  if (week <= 8) return { label:"Weeks 5–8: Build", supersets: JUBAIL_GYM_SUPERSETS_5_8(sets) };
  return {
    label:`Weeks 9–12: ${week%2===1?"Workout A":"Workout B"}`,
    supersets: week%2===1 ? JUBAIL_GYM_SUPERSETS_9_12_A(sets) : JUBAIL_GYM_SUPERSETS_9_12_B(sets)
  };
}

const JUBAIL_FORM_NOTES = {
  "Barbell Squat": "Set safety bars just below parallel in the rack. Bar across upper back (not neck). Feet shoulder-width, toes slightly out. Look FORWARD — pick a fixed point on the wall. Chest tall, core braced. Knees track over toes as you descend. Shoulders DOWN — don't shrug into the bar.",
  "Dumbbell Romanian Deadlift": "Dumbbells at sides, hinge from hips, push them back, feel stretch in hamstrings. Shoulders packed DOWN throughout. Keep weights close to legs. If you feel it in your lower back rather than hamstrings, you've gone too far.",
  "Leg Extension": "Adjust pad to just above ankle. Extend fully, hold 1 sec at top, lower slowly (3 counts). Keep back pressed to seat. Pure quad isolation — don't use momentum.",
  "Leg Curl": "Same machine as leg extension — adjust pad to just above heel. Keep hips pressed down as you curl. Squeeze at bottom, lower slowly. Neck relaxed, hands lightly on handles.",
  "Cable Lat Pulldown": "Grip bar shoulder-width, overhand. Pull to upper chest, elbows drive DOWN and back. Lean back slightly (10-15 degrees only). Shoulders DOWN as you pull — don't shrug. Lower slowly all the way for a full stretch.",
  "Cable Row": "Sit tall, slight knee bend. Pull handle to lower chest, elbows close to body. Shoulder blades squeeze DOWN and together — not up toward ears. Don't rock back. Neck neutral.",
  "Bicep Curls": "Stand tall, dumbbells at sides. Curl toward shoulder, slow on the way down (3 counts). Shoulders stay back and DOWN — don't swing or rock.",
  "Machine Chest Press": "Adjust seat so handles are at mid-chest height. Back pressed firmly into pad throughout — don't let shoulders rise. Press forward without fully locking elbows. Lower slowly. Keep jaw and neck relaxed.",
  "Standing Overhead Tricep Extension": "Stand tall, hold one dumbbell with both hands above head. Lower the dumbbell behind your head by bending at the elbows only — upper arms stay vertical and still. Press back up. Keep core braced, don't arch lower back. Shoulders DOWN — don't let them creep up as you press.",
  "Lateral Raises": "Shoulders DOWN before each rep — consciously drop them. Slight bend in elbow. Raise to shoulder height only. Don't shrug up as you lift.",
};

const AWAY_FORM_NOTES = {
  "Barbell Squat": "Feet shoulder-width or slightly wider, toes angled out slightly. Bar rests across upper back (not neck). Look FORWARD — a fixed point on the wall, not down. Chest tall, core braced. Knees track over toes as you descend. Use the cage safety bars — set them just below parallel so you can bail safely. Shoulders DOWN throughout, don't shrug into the bar.",
  "Barbell Romanian Deadlift": "Bar starts at hip height. Hinge from hips, push them back, feel the stretch in hamstrings. Shoulders packed DOWN, spine neutral throughout. Bar stays close to legs. Don't round your back — if you feel it in your lower back rather than hamstrings, you've gone too far. Look slightly forward, not up.",
  "Barbell Calf Raises": "Bar across upper back (not neck). Stand with feet hip-width. Rise slowly on toes, lower even slower — the downward phase is where the work happens. Touch the cage lightly for balance — don't grip hard as this creates shoulder tension.",
  "Barbell Bent-Over Row": "Hinge forward at hips, flat back, bar hanging at arms length. Pull bar toward lower chest/upper stomach, elbows drive back. Shoulder blades pull DOWN and together — not up toward ears. Keep neck neutral — don't crane up. Lower slowly.",
  "Lateral Raises": "Hold short bars at sides. Shoulders DOWN before each rep — consciously drop them. Slight bend in elbow. Raise to shoulder height only. Don't shrug up as you lift.",
  "Skull Crushers": "Lie on bench. Hold short bars above chest, arms extended. Upper arms stay vertical and still — only forearms hinge. Lower toward forehead slowly. Keep jaw and neck relaxed throughout.",
  "Barbell Bench Press": "Cage safety bars set just below chest height so you can bail safely without a spotter. Shoulders pressed INTO bench throughout — don't let them rise. Lower bar slowly to chest, press up. Keep jaw and neck relaxed — people grip the bar hard and tense up through the neck.",
  "Situps": "Arms crossed on chest — not behind neck. Rise slowly. Lower even slower. Keep jaw relaxed — people often clench here without realising.",
  "Barbell Bicep Curls": "Hold bar with underhand grip, shoulder-width. Curl toward chest, slow on the way down (3 counts). Shoulders stay back and DOWN — don't rock or swing. If wrists feel uncomfortable, switch to short bars at 15lbs each. The bar is 45lbs — significantly heavier than your home curls, so reduce reps if needed first session.",
};

const ALL_EX_NAMES = [...new Set([
  ...SUPERSETS_1_4,...SUPERSETS_5_8,...SUPERSETS_9_12_A,...SUPERSETS_9_12_B,...AWAY_GYM_SUPERSETS,
  ...JUBAIL_GYM_SUPERSETS_1_4(),...JUBAIL_GYM_SUPERSETS_5_8(),...JUBAIL_GYM_SUPERSETS_9_12_A(),...JUBAIL_GYM_SUPERSETS_9_12_B()
].flatMap(ss=>ss.pair).map(e=>e.name))];

// ── Storage ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "workout_tracker_v3";
const LEGACY_KEY = "workout_tracker_v1";

function migrateFromV1(current) {
  // Only run if v3 has no sessions yet
  if (current && current.sessions && current.sessions.length > 0) return current;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return current;
    const legacy = JSON.parse(raw);
    if (!legacy || !legacy.sessions || !legacy.sessions.length) return current;
    // Merge legacy sessions and weights into current (or fresh) state
    const base = current || { currentWeek:1, sessions:[], weights:{} };
    const merged = {
      ...base,
      currentWeek: legacy.currentWeek || base.currentWeek,
      weights: { ...legacy.weights, ...base.weights },
      sessions: [...(base.sessions||[]), ...legacy.sessions],
    };
    // Clean up so migration never runs again
    localStorage.removeItem(LEGACY_KEY);
    return merged;
  } catch { return current; }
}

function loadData() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    const current = r ? JSON.parse(r) : null;
    const migrated = migrateFromV1(current);
    // If migration changed anything, persist immediately
    if (migrated !== current) saveData(migrated);
    return migrated;
  } catch { return null; }
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(d)); } catch{} }

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const roundUp = n => Math.ceil(n);
const fc = f => f==="Easy"?"#4ade80":f==="Hard"?"#f87171":"#facc15";

function getSessionVolume(session) {
  return (session.supersets||[]).flatMap(ss=>ss.exercises).reduce((total,ex)=>
    total + (ex.sets||[]).reduce((a,set)=>a+(set.weight*(set.reps||0)),0), 0);
}

function getOverallProgressData(sessions) {
  return sessions.slice().reverse().map(s=>({
    date: new Date(s.date).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
    volume: getSessionVolume(s),
    gymMode: s.gymMode,
  }));
}

function getPriorExData(sessions, exName) {
  for (const s of sessions) {
    const flat = s.supersets?.flatMap(ss=>ss.exercises)||[];
    const ex = flat.find(e=>e.name===exName);
    if (ex) return ex;
  }
  return null;
}

function getPriorCoreData(sessions, coreName) {
  for (const s of sessions) {
    const c = s.core?.find(c=>c.name===coreName);
    if (c) return c;
  }
  return null;
}

function smartDefaults(exDef, priorEx, savedWeights) {
  if (!priorEx) {
    return { weight: savedWeights[exDef.name] ?? exDef.weight, reps: exDef.reps };
  }
  // Only use sets that were marked done
  const sets = (priorEx.sets || []).filter(s=>s.done!==false);
  if (!sets.length) return { weight: savedWeights[exDef.name] ?? exDef.weight, reps: exDef.reps };
  const weights = sets.map(s=>s.weight).filter(Boolean);
  const repsArr = sets.map(s=>s.reps).filter(Boolean);
  const minW = weights.length ? Math.min(...weights) : (savedWeights[exDef.name] ?? exDef.weight);
  const avgR = repsArr.length ? roundUp(repsArr.reduce((a,b)=>a+b,0)/repsArr.length) : exDef.reps;
  return { weight: minW, reps: avgR };
}

function coreSmartDefaults(coreDef, priorCore) {
  if (!priorCore) return { weight: coreDef.defaultWeight||0, reps: coreDef.defaultReps };
  const rounds = priorCore.rounds||[];
  if (!rounds.length) return { weight: coreDef.defaultWeight||0, reps: coreDef.defaultReps };
  const weights = rounds.map(r=>r.weight).filter(v=>v!=null&&v>0);
  const repsArr = rounds.map(r=>r.reps).filter(Boolean);
  const minW = weights.length ? Math.min(...weights) : (coreDef.defaultWeight||0);
  const avgR = repsArr.length ? roundUp(repsArr.reduce((a,b)=>a+b,0)/repsArr.length) : coreDef.defaultReps;
  return { weight: minW, reps: avgR };
}

// ── Styles ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#0f1117", surface:"#1a1f2e", border:"#2a2f3e",
  gold:"#c8a96e", goldLight:"#e8d5b0", text:"#f0ede8",
  soft:"#8a8a9a", muted:"#5a5a7a", green:"#4ade80",
  red:"#f87171", yellow:"#facc15",
};
const s = {
  app:{ fontFamily:"'Georgia',serif", background:C.bg, minHeight:"100vh", color:C.text, maxWidth:430, margin:"0 auto", paddingBottom:85 },
  header:{ background:`linear-gradient(135deg,${C.surface},${C.bg})`, padding:"22px 20px 14px", borderBottom:`1px solid ${C.border}` },
  title:{ fontSize:22, fontWeight:700, letterSpacing:1, color:C.goldLight, margin:0, fontFamily:"Georgia,serif" },
  sub:{ fontSize:11, color:C.soft, marginTop:4, letterSpacing:2, textTransform:"uppercase" },
  nav:{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"8px 0", zIndex:100 },
  navBtn:(a)=>({ background:"none", border:"none", color:a?C.goldLight:C.muted, fontSize:10, display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"4px 12px" }),
  card:{ background:C.surface, borderRadius:12, padding:16, margin:"10px 16px", border:`1px solid ${C.border}` },
  secTitle:{ fontSize:10, color:C.soft, letterSpacing:3, textTransform:"uppercase", marginBottom:12 },
  bigBtn:{ width:"100%", background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, color:C.bg, border:"none", borderRadius:12, padding:16, fontSize:16, fontWeight:700, cursor:"pointer", letterSpacing:1 },
  exCard:{ background:C.bg, borderRadius:10, padding:14, marginBottom:10, border:`1px solid ${C.border}` },
  exName:{ fontSize:15, fontWeight:700, color:C.goldLight, marginBottom:2 },
  exNote:{ fontSize:11, color:C.soft, marginBottom:6, fontStyle:"italic" },
  exPrior:{ fontSize:11, color:C.muted, marginBottom:8, background:"#1a1a2a", padding:"6px 8px", borderRadius:6 },
  weightRow:{ display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  weightVal:{ fontSize:16, fontWeight:700, color:C.gold, minWidth:90, textAlign:"center" },
  weightUnit:{ fontSize:10, color:C.soft, display:"block" },
  iconBtn:{ background:C.border, color:C.goldLight, border:"none", borderRadius:6, width:34, height:34, fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  setBtn:(d)=>({ background:d?"#c8a96e":C.border, color:d?C.bg:C.soft, border:"none", borderRadius:6, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }),
  feelBtn:(f,a)=>({ background:a?fc(f):C.border, color:a?C.bg:C.soft, border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }),
  checkItem:(d,gold)=>({ background:d?(gold?"#1e2a1e":"#1e2d1e"):C.bg, border:`1px solid ${d?(gold?C.gold:C.green):C.border}`, borderRadius:8, padding:12, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"flex-start", cursor:"pointer" }),
  checkbox:(d,gold)=>({ width:22, height:22, borderRadius:6, border:`2px solid ${d?(gold?C.gold:C.green):C.muted}`, background:d?(gold?C.gold:C.green):"none", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13 }),
  timerBar:{ background:C.surface, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 },
  pill:(c)=>({ background:c, color:C.bg, borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700 }),
  statBox:{ background:C.bg, borderRadius:10, padding:14, flex:1, textAlign:"center", border:`1px solid ${C.border}` },
  statNum:{ fontSize:26, fontWeight:700, color:C.gold },
  statLabel:{ fontSize:9, color:C.soft, textTransform:"uppercase", letterSpacing:2, marginTop:2 },
  histCard:{ background:C.bg, borderRadius:10, padding:14, marginBottom:10, border:`1px solid ${C.border}` },
  select:{ background:C.bg, border:`1px solid ${C.border}`, color:C.goldLight, borderRadius:8, padding:"8px 10px", fontSize:13, width:"100%" },
  textarea:{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:10, fontSize:13, fontFamily:"Georgia,serif", resize:"none", boxSizing:"border-box" },
  ssCard:{ background:"#141824", borderRadius:10, padding:14, marginBottom:12, border:`1px solid #252a3a` },
  ssLabel:{ fontSize:10, color:C.gold, letterSpacing:2, textTransform:"uppercase", marginBottom:10 },
  repsRow:{ display:"flex", alignItems:"center", gap:6, marginTop:6 },
  repsVal:{ fontSize:15, fontWeight:700, color:C.goldLight, minWidth:50, textAlign:"center" },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkoutTracker() {
  const [state, setState] = useState(() => loadData() || { currentWeek:1, sessions:[], weights:{}, awayWeights:{} });
  const [gymMode, setGymMode] = useState("home"); // "home" | "away" | "jubail"
  const [view, setView] = useState("home");
  const [session, setSession] = useState(null);
  const [restSecs, setRestSecs] = useState(30);
  const [restActive, setRestActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selEx, setSelEx] = useState(ALL_EX_NAMES[0]);
  const restRef = useRef(null);
  const sessRef = useRef(null);

  useEffect(()=>{ saveData(state); },[state]);

  useEffect(()=>{
    if(restActive){
      restRef.current=setInterval(()=>{
        setRestSecs(s=>{ if(s<=1){clearInterval(restRef.current);setRestActive(false);return 30;} return s-1; });
      },1000);
    }
    return()=>clearInterval(restRef.current);
  },[restActive]);

  useEffect(()=>{
    if(session){
      sessRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    }
    return()=>clearInterval(sessRef.current);
  },[session]);

  const getBirdDogDefault = (priorCore, fallback) => {
    const hrs = (priorCore?.rounds||[]).map(r=>r.holdSecs).filter(Boolean);
    return hrs.length ? Math.ceil(hrs.reduce((a,b)=>a+b,0)/hrs.length) : fallback;
  };

  const startWorkout = () => {
    const isAway = gymMode === "away";
    const isJubail = gymMode === "jubail";
    const phase = isAway ? { label:"Away Gym — Barbell & Short Bars", supersets: AWAY_GYM_SUPERSETS } :
                  isJubail ? getJubailSupersets(state.currentWeek) :
                  getPhase(state.currentWeek);
    const supersets = phase.supersets.map(ss=>({
      ...ss,
      exercises: ss.pair.map(exDef=>{
        const prior = getPriorExData(state.sessions.filter(s=>s.gymMode===gymMode), exDef.name);
        const weightsToUse = isAway ? (state.awayWeights||{}) : isJubail ? (state.jubailWeights||{}) : state.weights;
        const { weight, reps } = smartDefaults(exDef, prior, weightsToUse);
        return {
          ...exDef,
          notes: AWAY_FORM_NOTES[exDef.name] || JUBAIL_FORM_NOTES[exDef.name] || exDef.notes || "",
          weight, reps,
          sets: Array.from({length:exDef.sets},()=>({ weight, reps, done:false })),
          feeling: prior?.feeling||null,
          priorSets: prior?.sets||null,
          priorFeeling: prior?.feeling||null,
        };
      })
    }));
    const core = CORE_DEF.map(cd=>{
      const prior = getPriorCoreData(state.sessions, cd.name);
      const { weight, reps } = coreSmartDefaults(cd, prior);
      return {
        ...cd,
        weight, reps,
        birdDogHold: cd.isBirdDog ? getBirdDogDefault(prior, cd.defaultReps) : undefined,
        rounds: cd.isBirdDog ? [
          { holdSecs: getBirdDogDefault(prior, cd.defaultReps), done:false },
          { holdSecs: getBirdDogDefault(prior, cd.defaultReps), done:false },
        ] : [
          { weight, reps, done:false },
          { weight, reps, done:false },
        ],
        priorRounds: prior?.rounds||null,
        priorFeeling: prior?.feeling||null,
        feeling: null,
      };
    });
    setSession({
      week:state.currentWeek, phase:phase.label, gymMode, cardioDone:false, cardioDuration:null, cardioEquipment: gymMode==='jubail'?'Treadmill':gymMode==='away'?'Bike':'Elliptical',
      supersets, core,
      headache:HEADACHE_DEF.map(h=>({...h,done:false})),
      headacheToday:null, sessionNotes:"",
      date:new Date().toISOString(),
    });
    setElapsed(0);
    setView("workout");
  };

  const updateExSet = (ssIdx,exIdx,setIdx,field,val) => {
    setSession(prev=>{
      const ss=[...prev.supersets];
      const ex={...ss[ssIdx].exercises[exIdx]};
      const sets=[...ex.sets];
      sets[setIdx]={...sets[setIdx],[field]:val};
      ex.sets=sets;
      ss[ssIdx]={...ss[ssIdx],exercises:[...ss[ssIdx].exercises]};
      ss[ssIdx].exercises[exIdx]=ex;
      return{...prev,supersets:ss};
    });
  };

  const toggleSet = (ssIdx,exIdx,setIdx) => {
    setSession(prev=>{
      const ss=[...prev.supersets];
      const ex={...ss[ssIdx].exercises[exIdx]};
      const sets=[...ex.sets];
      sets[setIdx]={...sets[setIdx],done:!sets[setIdx].done};
      ex.sets=sets;
      ss[ssIdx]={...ss[ssIdx],exercises:[...ss[ssIdx].exercises.map((e,i)=>i===exIdx?ex:e)]};
      if(!sets[setIdx].done===false){ setRestActive(false); } else { setRestSecs(30); setRestActive(true); }
      return{...prev,supersets:ss};
    });
  };

  const setExFeeling = (ssIdx,exIdx,f) => {
    setSession(prev=>{
      const ss=[...prev.supersets];
      const exs=[...ss[ssIdx].exercises];
      exs[exIdx]={...exs[exIdx],feeling:f};
      ss[ssIdx]={...ss[ssIdx],exercises:exs};
      return{...prev,supersets:ss};
    });
  };

  const updateCoreRound = (cIdx,rIdx,field,val) => {
    setSession(prev=>{
      const core=[...prev.core];
      const c={...core[cIdx]};
      const rounds=[...c.rounds];
      rounds[rIdx]={...rounds[rIdx],[field]:val};
      c.rounds=rounds;
      core[cIdx]=c;
      return{...prev,core};
    });
  };

  const toggleCoreRound = (cIdx,rIdx) => {
    setSession(prev=>{
      const core=[...prev.core];
      const c={...core[cIdx]};
      const rounds=[...c.rounds];
      rounds[rIdx]={...rounds[rIdx],done:!rounds[rIdx].done};
      c.rounds=rounds;
      core[cIdx]=c;
      return{...prev,core};
    });
  };

  const setCoreFeeling = (cIdx,f) => {
    setSession(prev=>{
      const core=[...prev.core];
      core[cIdx]={...core[cIdx],feeling:f};
      return{...prev,core};
    });
  };

  const updateBirdDogHold = (cIdx,roundIdx,delta) => {
    setSession(prev=>{
      const core=[...prev.core];
      const c={...core[cIdx]};
      const rounds=[...c.rounds];
      rounds[roundIdx]={...rounds[roundIdx],holdSecs:Math.max(5,(rounds[roundIdx].holdSecs||c.birdDogHold||30)+delta)};
      c.rounds=rounds;
      core[cIdx]=c;
      return{...prev,core};
    });
  };

  const toggleHeadache = (i) => setSession(prev=>{ const h=[...prev.headache]; h[i]={...h[i],done:!h[i].done}; return{...prev,headache:h}; });
  const setHeadacheToday = (v) => setSession(prev=>({...prev,headacheToday:v}));

  const finishWorkout = () => {
    clearInterval(sessRef.current);
    const isAway = session.gymMode === "away";
    // Only count exercises where at least one set was marked done
    const doneSupersets = session.supersets.map(ss=>({
      ...ss,
      exercises: ss.exercises.map(ex=>({
        ...ex,
        sets: ex.sets.filter(s=>s.done)
      })).filter(ex=>ex.sets.length>0)
    })).filter(ss=>ss.exercises.length>0);
    const totalDoneSets = doneSupersets.flatMap(ss=>ss.exercises).flatMap(ex=>ex.sets).length;

    // Only count core exercises where at least one round was marked done
    const doneCore = (session.core||[]).map(c=>({
      ...c,
      rounds: (c.rounds||[]).filter(r=>r.done)
    })).filter(c=>c.rounds.length>0);
    const totalDoneCoreRounds = doneCore.flatMap(c=>c.rounds).length;

    const anythingDone = totalDoneSets > 0 || totalDoneCoreRounds > 0 || session.cardioDone;
    // Silently discard if nothing was done
    if(!anythingDone){ setSession(null); setView("home"); return; }
    // Only save weights for exercises with done sets
    const isJubail = session.gymMode === "jubail";
    const newWeights={...(isAway ? state.awayWeights : isJubail ? (state.jubailWeights||{}) : state.weights)};
    doneSupersets.flatMap(ss=>ss.exercises).forEach(ex=>{ newWeights[ex.name]=ex.weight; });
    const completed={...session, supersets:doneSupersets, core:doneCore, duration:elapsed};
    setState(prev=>{
      const newSessions=[completed,...prev.sessions];
      const nextWeek = newSessions.length % 3 === 0
        ? Math.min(12, prev.currentWeek + 1)
        : prev.currentWeek;
      return {
        ...prev,
        currentWeek: nextWeek,
        sessions: newSessions,
        weights: (!isAway&&!isJubail) ? newWeights : prev.weights,
        awayWeights: isAway ? newWeights : (prev.awayWeights||{}),
        jubailWeights: isJubail ? newWeights : (prev.jubailWeights||{}),
      };
    });
    setSession(null);
    setView("home");
  };

  const getStreak = () => {
    if(!state.sessions.length) return 0;
    let streak=0; const now=new Date();
    for(const s2 of state.sessions){
      const diff=Math.floor((now-new Date(s2.date))/(1000*60*60*24*7));
      if(diff<=streak+1) streak++; else break;
    }
    return streak;
  };

  const getProgressData = (name) => state.sessions
    .filter(s2=>s2.supersets?.flatMap(ss=>ss.exercises).some(e=>e.name===name))
    .map(s2=>{
      const ex=s2.supersets.flatMap(ss=>ss.exercises).find(e=>e.name===name);
      const sets=ex?.sets||[];
      const avgW=sets.length?Math.round(sets.reduce((a,s3)=>a+s3.weight,0)/sets.length):ex?.weight||0;
      const totalReps=sets.reduce((a,s3)=>a+(s3.reps||0),0);
      const volume=sets.reduce((a,s3)=>a+(s3.weight*(s3.reps||0)),0);
      return{
        date:new Date(s2.date).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
        weight:avgW, reps:totalReps, volume
      };
    }).reverse();

  // ── Nav helper ──
  const Nav = ({active}) => (
    <div style={s.nav}>
      {[["🏠","Home","home"],["🏋️","Workout","wk"],["📋","History","history"],["📈","Progress","progress"]].map(([icon,label,v])=>(
        <button key={v} style={s.navBtn(active===v)} onClick={()=>v==="wk"?startWorkout():setView(v)}>
          <span style={{fontSize:20}}>{icon}</span><span>{label}</span>
        </button>
      ))}
    </div>
  );

  // ── WORKOUT VIEW ──────────────────────────────────────────────────────────
  if(view==="workout"&&session){
    return(
      <div style={s.app}>
        {/* Sticky timer bar */}
        <div style={s.timerBar}>
          <div>
            <div style={{fontSize:10,color:C.soft,letterSpacing:2}}>SESSION TIME</div>
            <div style={{fontSize:20,fontWeight:700,color:C.goldLight,fontFamily:"monospace"}}>{fmt(elapsed)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:C.soft}}>WEEK {session.week}</div>
            <div style={{fontSize:12,color:C.gold}}>{session.phase}</div>
          </div>
          {restActive
            ? <div style={s.pill(C.red)}>Rest {fmt(restSecs)}</div>
            : <div style={s.pill(C.green)}>Go! 💪</div>}
        </div>

        <div style={{padding:"0 0 24px"}}>
          {/* Elliptical */}
          <div style={{...s.card,borderLeft:`3px solid ${session.cardioDone?C.green:C.gold}`,background:session.cardioDone?"#1e2d1e":C.surface}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}
              onClick={()=>setSession(prev=>({...prev,cardioDone:!prev.cardioDone,cardioDuration:prev.cardioDone?null:15}))}>
              <div style={s.secTitle}>🏃 Cardio Warm-Up</div>
              <div style={s.checkbox(session.cardioDone, false)}>{session.cardioDone&&"✓"}</div>
            </div>
            <div style={{fontSize:11,color:C.soft,marginBottom:6}}>EQUIPMENT</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {["Elliptical","Treadmill","Bike","Rowing Machine","Other"].map(eq=>(
                <button key={eq} style={{...s.setBtn(session.cardioEquipment===eq),fontSize:11,padding:"5px 10px"}}
                  onClick={()=>setSession(prev=>({...prev,cardioEquipment:eq}))}>
                  {eq}
                </button>
              ))}
            </div>
            {session.cardioDone&&(
              <div>
                <div style={{fontSize:11,color:C.soft,marginBottom:4}}>ACTUAL DURATION (minutes)</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button style={s.iconBtn} onClick={()=>setSession(prev=>({...prev,cardioDuration:Math.max(5,(prev.cardioDuration||15)-5)}))}>−</button>
                  <div style={{...s.weightVal,color:C.green}}>{session.cardioDuration||15} min</div>
                  <button style={s.iconBtn} onClick={()=>setSession(prev=>({...prev,cardioDuration:(prev.cardioDuration||15)+5}))}>+</button>
                </div>
              </div>
            )}
            {!session.cardioDone&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>Tap the checkbox above when done to log duration</div>}
          </div>

          {/* Supersets */}
          <div style={s.card}>
            <div style={s.secTitle}>💪 Strength — All Sets Before Moving to Core</div>
            {session.supersets.map((ss,ssIdx)=>(
              <div key={ssIdx} style={s.ssCard}>
                <div style={s.ssLabel}>{ss.label} · 30 sec rest between sets</div>
                {ss.exercises.map((ex,exIdx)=>{
                  const priorText = ex.priorSets
                    ? `Last session: ${ex.priorSets.map((s3,i)=>`Set ${i+1}: ${s3.weight}lbs × ${s3.reps}`).join(" | ")}${ex.priorFeeling?` · ${ex.priorFeeling}`:""}`
                    : null;
                  return(
                    <div key={exIdx} style={s.exCard}>
                      <div style={s.exName}>{ex.name}</div>
                      {ex.notes&&<div style={s.exNote}>📌 {ex.notes}</div>}
                      {priorText&&<div style={s.exPrior}>🗓 {priorText}</div>}

                      {/* Per-set weight + reps + done */}
                      {ex.sets.map((set,setIdx)=>(
                        <div key={setIdx} style={{background:set.done?"#1e2d1e":C.surface,borderRadius:8,padding:"10px 10px 8px",marginBottom:8,border:`1px solid ${set.done?C.green:C.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{fontSize:12,color:set.done?C.green:C.soft,fontWeight:600}}>Set {setIdx+1}</div>
                            <button style={s.setBtn(set.done)} onClick={()=>toggleSet(ssIdx,exIdx,setIdx)}>
                              {set.done?"✓ Done":"Mark Done"}
                            </button>
                          </div>
                          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                            {ex.unit&&<div>
                              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>WEIGHT</div>
                              <div style={s.weightRow}>
                                <button style={s.iconBtn} onClick={()=>updateExSet(ssIdx,exIdx,setIdx,"weight",Math.max(0,set.weight-5))}>−</button>
                                <div style={s.weightVal}>{set.weight}<span style={s.weightUnit}>{ex.unit}</span></div>
                                <button style={s.iconBtn} onClick={()=>updateExSet(ssIdx,exIdx,setIdx,"weight",set.weight+5)}>+</button>
                              </div>
                            </div>}
                            <div>
                              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>REPS</div>
                              <div style={s.repsRow}>
                                <button style={s.iconBtn} onClick={()=>updateExSet(ssIdx,exIdx,setIdx,"reps",Math.max(1,set.reps-1))}>−</button>
                                <div style={s.repsVal}>{set.reps}</div>
                                <button style={s.iconBtn} onClick={()=>updateExSet(ssIdx,exIdx,setIdx,"reps",set.reps+1)}>+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div style={{fontSize:11,color:C.soft,marginBottom:4}}>How did it feel?</div>
                      <div style={{display:"flex",gap:6}}>
                        {["Easy","Good","Hard"].map(f=>(
                          <button key={f} style={s.feelBtn(f,ex.feeling===f)} onClick={()=>setExFeeling(ssIdx,exIdx,f)}>{f}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Core — supersetted — hidden for Jubail */}
          {session.gymMode !== "jubail" && <div style={s.card}>
            <div style={s.secTitle}>🧠 Core — 2 Rounds, Supersetted</div>
            {[[0,1],[2,3]].map((pair,pairIdx)=>(
              <div key={pairIdx} style={s.ssCard}>
                <div style={s.ssLabel}>{pairIdx===0?"Core Superset A — Back Series · 30 sec rest":"Core Superset B — Floor Series · 30 sec rest"}</div>
                {pair.map(cIdx=>{
                  const c=session.core[cIdx];
                  if(!c) return null;
                  const priorText = c.priorRounds
                    ? `Last: ${c.priorRounds.map((r,i)=>c.hasWeight?`R${i+1}: ${r.weight}lbs×${r.reps}`:`R${i+1}: ${r.reps}`).join(" | ")}${c.priorFeeling?` · ${c.priorFeeling}`:""}`
                    : null;
                  return(
                    <div key={cIdx} style={s.exCard}>
                      <div style={s.exName}>{c.name}</div>
                      <div style={s.exNote}>📌 {c.notes}</div>
                      {priorText&&<div style={s.exPrior}>🗓 {priorText}</div>}

                      {c.isBirdDog&&(
                        <div style={{marginBottom:6}}>
                          <div style={{fontSize:11,color:C.soft,marginBottom:4}}>HOLD TIME PER SIDE — adjust per round below</div>
                          <div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Default this session: {c.birdDogHold||30}s (from last session average)</div>
                        </div>
                      )}

                      {c.rounds.map((round,rIdx)=>(
                        <div key={rIdx} style={{background:round.done?"#1e2d1e":C.surface,borderRadius:8,padding:"10px 10px 8px",marginBottom:8,border:`1px solid ${round.done?C.green:C.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{fontSize:12,color:round.done?C.green:C.soft,fontWeight:600}}>Round {rIdx+1}</div>
                            <button style={s.setBtn(round.done)} onClick={()=>toggleCoreRound(cIdx,rIdx)}>
                              {round.done?"✓ Done":"Mark Done"}
                            </button>
                          </div>
                          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                            {c.hasWeight&&(
                              <div>
                                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>WEIGHT</div>
                                <div style={s.weightRow}>
                                  <button style={s.iconBtn} onClick={()=>updateCoreRound(cIdx,rIdx,"weight",Math.max(0,round.weight-5))}>−</button>
                                  <div style={s.weightVal}>{round.weight}<span style={s.weightUnit}>lbs on hips</span></div>
                                  <button style={s.iconBtn} onClick={()=>updateCoreRound(cIdx,rIdx,"weight",round.weight+5)}>+</button>
                                </div>
                              </div>
                            )}
                            {c.isBirdDog ? (
                              <div>
                                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>HOLD PER SIDE</div>
                                <div style={s.repsRow}>
                                  <button style={s.iconBtn} onClick={()=>updateBirdDogHold(cIdx,rIdx,-5)}>−</button>
                                  <div style={s.repsVal}>{round.holdSecs||c.birdDogHold||30}s</div>
                                  <button style={s.iconBtn} onClick={()=>updateBirdDogHold(cIdx,rIdx,5)}>+</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{fontSize:10,color:C.muted,marginBottom:4}}>REPS</div>
                                <div style={s.repsRow}>
                                  <button style={s.iconBtn} onClick={()=>updateCoreRound(cIdx,rIdx,"reps",Math.max(1,round.reps-1))}>−</button>
                                  <div style={s.repsVal}>{round.reps}</div>
                                  <button style={s.iconBtn} onClick={()=>updateCoreRound(cIdx,rIdx,"reps",round.reps+1)}>+</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <div style={{fontSize:11,color:C.soft,marginBottom:4}}>How did it feel?</div>
                      <div style={{display:"flex",gap:6}}>
                        {["Easy","Good","Hard"].map(f=>(
                          <button key={f} style={s.feelBtn(f,c.feeling===f)} onClick={()=>setCoreFeeling(cIdx,f)}>{f}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>}

          {/* Headache prevention — hidden for Jubail */}
          {session.gymMode !== "jubail" && <div style={s.card}>
            <div style={s.secTitle}>🌿 Tension Headache Prevention</div>
            {session.headache.map((h,i)=>(
              <div key={i} style={s.checkItem(h.done,true)} onClick={()=>toggleHeadache(i)}>
                <div style={{flex:1,paddingRight:10}}>
                  <div style={{fontSize:14,color:h.done?C.gold:C.goldLight,fontWeight:600}}>{h.name}</div>
                  <div style={{fontSize:10,color:C.soft,marginTop:2}}>{h.detail}</div>
                  <div style={{fontSize:11,color:C.gold,marginTop:4}}>{h.reps}</div>
                </div>
                <div style={s.checkbox(h.done,true)}>{h.done&&"✓"}</div>
              </div>
            ))}
          </div>}

          {/* Headache log */}
          <div style={s.card}>
            <div style={s.secTitle}>📊 Headache Log</div>
            <div style={{fontSize:13,color:C.soft,marginBottom:10}}>Tension headache today?</div>
            <div style={{display:"flex",gap:10}}>
              {["Yes","No","Mild"].map(o=>(
                <button key={o} style={{...s.setBtn(session.headacheToday===o),flex:1}} onClick={()=>setHeadacheToday(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={s.card}>
            <div style={s.secTitle}>📝 Session Notes</div>
            <textarea style={s.textarea} rows={3} placeholder="Anything worth noting..."
              value={session.sessionNotes}
              onChange={e=>setSession(prev=>({...prev,sessionNotes:e.target.value}))} />
          </div>

          <div style={{padding:"0 16px"}}>
            <button style={s.bigBtn} onClick={finishWorkout}>✓ Complete Workout</button>
          </div>
        </div>
      </div>
    );
  }

  // ── HISTORY VIEW ──────────────────────────────────────────────────────────
  if(view==="history"){
    return(
      <div style={s.app}>
        <div style={s.header}><div style={s.title}>History</div><div style={s.sub}>{state.sessions.length} workouts completed</div></div>
        <div style={{padding:"12px 16px"}}>
          {!state.sessions.length&&<div style={{color:C.muted,textAlign:"center",marginTop:40,fontSize:14}}>No sessions yet!</div>}
          {state.sessions.map((s2,i)=>{
            const d=new Date(s2.date);
            const exRows=(s2.supersets||[]).flatMap(ss=>ss.exercises).map((ex,j)=>{
              const sets=ex.sets||[];
              const vol=sets.reduce((a,s3)=>a+(s3.weight*(s3.reps||0)),0);
              return(
                <div key={j} style={{padding:"4px 0",borderBottom:`1px solid ${C.surface}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.soft}}>
                    <span>{ex.name}</span>
                    <span style={{color:ex.feeling?fc(ex.feeling):C.muted}}>{ex.feeling||""}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>
                    {sets.map((s3,si)=>`S${si+1}: ${s3.weight}lbs × ${s3.reps} reps`).join("  |  ")}
                    {vol>0&&<span style={{color:C.gold,marginLeft:6}}>· {vol} lbs vol</span>}
                  </div>
                </div>
              );
            });
            return(
              <div key={i} style={s.histCard}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.goldLight}}>{d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>
                  <div style={{fontSize:11,color:C.gold}}>Week {s2.week} · {fmt(s2.duration||0)}</div>
                </div>
                <div style={{fontSize:11,color:C.soft,marginBottom:6,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  {s2.gymMode==="away"&&<span style={{background:"#1a2a3a",color:"#60a5fa",borderRadius:4,padding:"1px 6px",fontSize:10}}>Away</span>}
                  {s2.gymMode==="jubail"&&<span style={{background:"#2a1a3a",color:"#c084fc",borderRadius:4,padding:"1px 6px",fontSize:10}}>Jubail</span>}
                  {s2.cardioDone&&<span style={{background:"#1e2d1e",color:C.green,borderRadius:4,padding:"1px 6px",fontSize:10}}>🏃 {s2.cardioDuration||15}min {s2.cardioEquipment||'cardio'}</span>}
                  {s2.phase}
                </div>
                {exRows}
                {s2.headacheToday&&<div style={{marginTop:6,fontSize:11}}>Headache: <span style={{color:s2.headacheToday==="No"?C.green:C.red}}>{s2.headacheToday}</span></div>}
                {s2.sessionNotes&&<div style={{marginTop:6,fontSize:11,color:C.soft,fontStyle:"italic"}}>"{s2.sessionNotes}"</div>}
              </div>
            );
          })}
        </div>
        <Nav active="history"/>
      </div>
    );
  }

  // ── PROGRESS VIEW ─────────────────────────────────────────────────────────
  if(view==="progress"){
    const data=getProgressData(selEx);
    const overallData=getOverallProgressData(state.sessions);
    const totalVolumeAllTime=overallData.reduce((a,d)=>a+d.volume,0);
    const totalSets=state.sessions.flatMap(s=>s.supersets||[]).flatMap(ss=>ss.exercises).flatMap(ex=>ex.sets||[]).length;
    const totalCoreRounds=state.sessions.flatMap(s=>s.core||[]).flatMap(c=>c.rounds||[]).length;
    const hdata=state.sessions.filter(s2=>s2.headacheToday).map(s2=>({
      date:new Date(s2.date).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      val:s2.headacheToday
    })).reverse();

    // Reusable line chart renderer
    const LineChart = (points, color, height=100) => {
      if(!points.length) return <div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No data yet</div>;
      const vals = points.map(p=>p.volume);
      const maxV = Math.max(...vals,1);
      const minV = Math.min(...vals,0);
      const range = maxV-minV || 1;
      const w = 100; // percent-based viewbox
      const stepX = points.length>1 ? w/(points.length-1) : 0;
      const toY = v => height - ((v-minV)/range)*height;
      const pathPoints = points.map((p,i)=>`${i*stepX},${toY(p.volume)}`).join(" ");
      const areaPoints = `0,${height} ${pathPoints} ${w},${height}`;
      return (
        <div>
          <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{width:"100%",height:height,display:"block"}}>
            <polygon points={areaPoints} fill={color} opacity="0.15"/>
            <polyline points={pathPoints} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke"/>
            {points.map((p,i)=>(
              <circle key={i} cx={i*stepX} cy={toY(p.volume)} r="1.8" fill={color} vectorEffect="non-scaling-stroke"/>
            ))}
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:8,color:C.muted}}>{points[0]?.date}</span>
            {points.length>2&&<span style={{fontSize:8,color:C.muted}}>{points[Math.floor(points.length/2)]?.date}</span>}
            <span style={{fontSize:8,color:C.muted}}>{points[points.length-1]?.date}</span>
          </div>
        </div>
      );
    };

    return(
      <div style={s.app}>
        <div style={s.header}><div style={s.title}>Progress</div><div style={s.sub}>Your 12-week journey</div></div>
        <div style={{padding:"12px 16px"}}>

          {/* Overall summary */}
          <div style={s.card}>
            <div style={s.secTitle}>🏆 Overall Progress</div>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <div style={s.statBox}>
                <div style={{...s.statNum,fontSize:18}}>{totalVolumeAllTime.toLocaleString()}</div>
                <div style={s.statLabel}>Total Volume (lbs)</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statNum}>{totalSets}</div>
                <div style={s.statLabel}>Total Sets</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statNum}>{totalCoreRounds}</div>
                <div style={s.statLabel}>Core Rounds</div>
              </div>
            </div>
            <div style={{fontSize:10,color:C.soft,marginBottom:6,letterSpacing:2,textTransform:"uppercase"}}>Volume Per Session — All Exercises</div>
            {LineChart(overallData, C.gold, 90)}
          </div>

          {/* Per-exercise line chart */}
          <div style={s.card}>
            <div style={s.secTitle}>📈 Exercise Progress</div>
            <select style={s.select} value={selEx} onChange={e=>setSelEx(e.target.value)}>
              {ALL_EX_NAMES.map(n=><option key={n} value={n}>{n}</option>)}
            </select>
            {!data.length
              ? <div style={{color:C.muted,fontSize:12,marginTop:12,textAlign:"center"}}>No data yet</div>
              : <div style={{marginTop:16}}>
                  <div style={{fontSize:10,color:C.soft,marginBottom:6,letterSpacing:2,textTransform:"uppercase"}}>Volume (lbs × reps)</div>
                  {LineChart(data, C.gold, 90)}
                  <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{fontSize:12,color:C.soft,display:"flex",justifyContent:"space-between"}}>
                      <span>Weight: {data[0]?.weight} → {data[data.length-1]?.weight} lbs</span>
                      {data.length>1&&data[data.length-1].weight>data[0].weight&&<span style={{color:C.green}}>+{data[data.length-1].weight-data[0].weight} lbs</span>}
                    </div>
                    <div style={{fontSize:12,color:C.soft,display:"flex",justifyContent:"space-between"}}>
                      <span>Reps: {data[0]?.reps} → {data[data.length-1]?.reps} total reps/session</span>
                      {data.length>1&&data[data.length-1].reps>data[0].reps&&<span style={{color:C.green}}>+{data[data.length-1].reps-data[0].reps}</span>}
                    </div>
                    <div style={{fontSize:12,color:C.soft,display:"flex",justifyContent:"space-between"}}>
                      <span>Volume: {data[0]?.volume} → {data[data.length-1]?.volume} lbs</span>
                      {data.length>1&&data[data.length-1].volume>data[0].volume&&<span style={{color:C.green}}>+{data[data.length-1].volume-data[0].volume}</span>}
                    </div>
                  </div>
                </div>
            }
          </div>

          <div style={s.card}>
            <div style={s.secTitle}>🤕 Headache Tracker</div>
            {!hdata.length
              ? <div style={{color:C.muted,fontSize:12,textAlign:"center"}}>No data yet</div>
              : <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {hdata.map((d,i)=>(
                    <div key={i} style={{background:d.val==="No"?"#1e2d1e":"#2d1e1e",border:`1px solid ${d.val==="No"?C.green:C.red}`,borderRadius:8,padding:"6px 10px",fontSize:11}}>
                      <div style={{color:C.soft}}>{d.date}</div>
                      <div style={{color:d.val==="No"?C.green:C.red,fontWeight:700}}>{d.val}</div>
                    </div>
                  ))}
                </div>
            }
          </div>

          <div style={s.card}>
            <div style={s.secTitle}>🗓 Program Overview</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4}}>
              {Array.from({length:12},(_,i)=>{
                const w=i+1,done=state.sessions.some(s2=>s2.week===w),cur=w===state.currentWeek;
                return(
                  <div key={i} style={{background:done?C.gold:cur?C.surface:C.bg,border:`1px solid ${cur?C.gold:C.border}`,borderRadius:6,padding:"8px 4px",textAlign:"center"}}>
                    <div style={{fontSize:11,color:done?C.bg:cur?C.gold:C.muted,fontWeight:700}}>W{w}</div>
                    {done&&<div style={{fontSize:8,color:C.bg}}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Nav active="progress"/>
      </div>
    );
  }

  // ── HOME VIEW ─────────────────────────────────────────────────────────────
  const streak=getStreak();
  const phase=getPhase(state.currentWeek);
  const lastSession=state.sessions[0];
  const allExs=(gymMode==="away" ? AWAY_GYM_SUPERSETS : gymMode==="jubail" ? getJubailSupersets(state.currentWeek).supersets : phase.supersets).flatMap(ss=>ss.pair);

  return(
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.title}>Your Workout</div>
        <div style={s.sub}>12-Week Program · {phase.label}</div>
      </div>
      <div style={{padding:"12px 0 20px"}}>
        {/* Gym Mode Toggle */}
        <div style={{display:"flex",gap:0,margin:"0 16px 12px",background:C.border,borderRadius:10,padding:2}}>
          <button onClick={()=>setGymMode("home")} style={{flex:1,background:gymMode==="home"?C.surface:"none",color:gymMode==="home"?C.goldLight:C.muted,border:"none",borderRadius:8,padding:"8px 4px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
            🏠 Home
          </button>
          <button onClick={()=>setGymMode("away")} style={{flex:1,background:gymMode==="away"?C.surface:"none",color:gymMode==="away"?C.goldLight:C.muted,border:"none",borderRadius:8,padding:"8px 4px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
            🏋️ Away
          </button>
          <button onClick={()=>setGymMode("jubail")} style={{flex:1,background:gymMode==="jubail"?C.surface:"none",color:gymMode==="jubail"?C.goldLight:C.muted,border:"none",borderRadius:8,padding:"8px 4px",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
            🏙️ Jubail
          </button>
        </div>

        <div style={{display:"flex",gap:10,padding:"0 16px",marginBottom:4}}>
          <div style={s.statBox}><div style={s.statNum}>{state.currentWeek}</div><div style={s.statLabel}>Current Week</div></div>
          <div style={s.statBox}><div style={s.statNum}>{state.sessions.length}</div><div style={s.statLabel}>Sessions Done</div></div>
          <div style={s.statBox}><div style={s.statNum}>{streak}</div><div style={s.statLabel}>Week Streak</div></div>
        </div>
        <div style={{display:"flex",gap:10,padding:"0 16px",marginBottom:4}}>
          <div style={{...s.statBox,flex:2}}>
            <div style={{...s.statNum,fontSize:18}}>{state.sessions.reduce((total,s2)=>{
              const vol=(s2.supersets||[]).flatMap(ss=>ss.exercises).reduce((a,ex)=>(ex.sets||[]).reduce((b,set)=>b+(set.weight*(set.reps||0)),a),0);
              return total+vol;
            },0).toLocaleString()} lbs</div>
            <div style={s.statLabel}>Total Volume Lifted</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{state.sessions.filter(s2=>s2.gymMode==="away").length}</div>
            <div style={s.statLabel}>Away Sessions</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statNum}>{state.sessions.filter(s2=>s2.gymMode==="jubail").length}</div>
            <div style={s.statLabel}>Jubail Sessions</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.secTitle}>Program Progress</div>
          <div style={{background:C.bg,borderRadius:20,height:8,overflow:"hidden"}}>
            <div style={{background:`linear-gradient(90deg,${C.gold},${C.goldLight})`,width:`${(state.currentWeek/12)*100}%`,height:"100%",borderRadius:20,transition:"width 0.5s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:C.muted}}>
            <span>Week 1</span><span style={{color:C.gold}}>Week {state.currentWeek} of 12</span><span>Week 12</span>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.secTitle}>Today's Session</div>
          <div style={{fontSize:12,color:C.soft,marginBottom:10}}>{gymMode==="away" ? "Away Gym — Barbell & Short Bars" : gymMode==="jubail" ? "Jubail Gym — "+getJubailSupersets(state.currentWeek).label : phase.label}</div>
          {allExs.slice(0,4).map((ex,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.goldLight,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
              <span>{ex.name}</span>
              <span style={{color:C.gold}}>{state.weights[ex.name]??ex.weight} lbs</span>
            </div>
          ))}
          {allExs.length>4&&<div style={{fontSize:11,color:C.muted,marginTop:6}}>+{allExs.length-4} more exercises...</div>}
        </div>

        {lastSession&&(
          <div style={s.card}>
            <div style={s.secTitle}>Last Session</div>
            <div style={{fontSize:12,color:C.soft}}>
              {new Date(lastSession.date).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})} · {fmt(lastSession.duration||0)}
            </div>
            {lastSession.headacheToday&&(
              <div style={{marginTop:6,fontSize:12}}>
                Headache: <span style={{color:lastSession.headacheToday==="No"?C.green:C.red}}>{lastSession.headacheToday}</span>
              </div>
            )}
          </div>
        )}

        <div style={{padding:"0 16px"}}>
          <button style={s.bigBtn} onClick={startWorkout}>Start Workout →</button>
          <div style={{textAlign:"center",marginTop:10}}>
            <button style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer"}}
              onClick={()=>setState(prev=>({...prev,currentWeek:Math.max(1,prev.currentWeek-1)}))}>
              ← Back a week
            </button>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.secTitle}>💾 Backup & Restore</div>
          <div style={{fontSize:12,color:C.soft,marginBottom:12}}>
            Export your data regularly and save somewhere safe (Notes app, email to yourself). Paste it back to restore if you ever lose your history.
          </div>
          <button style={{...s.bigBtn,background:C.surface,color:C.goldLight,border:`1px solid ${C.border}`,marginBottom:10,fontSize:14}}
            onClick={()=>{
              const data=JSON.stringify(state,null,2);
              if(navigator.clipboard){
                navigator.clipboard.writeText(data)
                  .then(()=>alert("✓ Copied! Paste into your Notes app or email it to yourself."))
                  .catch(()=>{ const el=document.getElementById("backup-text"); if(el){el.style.display="block";el.value=data;el.select();} });
              } else {
                const el=document.getElementById("backup-text");
                if(el){el.style.display="block";el.value=data;el.select();}
              }
            }}>
            📋 Copy Backup to Clipboard
          </button>
          <textarea id="backup-text" style={{...s.textarea,display:"none",fontSize:10,height:80}} readOnly/>
          <div style={{marginTop:8}}>
            <div style={{fontSize:12,color:C.soft,marginBottom:6}}>Restore — paste your backup text here:</div>
            <textarea style={{...s.textarea,fontSize:11,height:70}} placeholder="Paste backup text here then tap Restore..." id="restore-input"/>
            <button style={{...s.bigBtn,background:"#2d1e1e",color:C.red,border:`1px solid ${C.red}`,marginTop:8,fontSize:14}}
              onClick={()=>{
                try{
                  const el=document.getElementById("restore-input");
                  const parsed=JSON.parse(el.value);
                  if(!parsed.sessions) throw new Error("Invalid");
                  if(window.confirm(`Restore ${parsed.sessions.length} sessions? This replaces your current data.`)){
                    setState(parsed); saveData(parsed); el.value="";
                    alert("✓ Restored successfully!");
                  }
                } catch(e){ alert("Doesn't look like valid backup data — make sure you pasted the full text."); }
              }}>
              Restore from Backup
            </button>
          </div>
        </div>

      </div>
      <Nav active="home"/>
    </div>
  );
}
