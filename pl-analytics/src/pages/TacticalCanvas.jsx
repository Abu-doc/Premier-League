import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Adjust this path if your JSON is in a different spot!
import playerData from '../../../backend/processed_players.json';

// --- DYNAMIC COLOR ENGINE ---
const knownColors = {
  "Arsenal": "#ef0107", "Manchester City": "#6CABDD", "Manchester United": "#DA291C",
  "Liverpool": "#C8102E", "Chelsea": "#034694", "Tottenham Hotspur": "#132257",
  "Real Madrid": "#FEBE10", "Barcelona": "#A50044", "Bayern Munich": "#DC052D",
  "Paris SG": "#004170", "Juventus": "#ffffff"
};

const getClubColor = (clubName, fallback) => {
  if (knownColors[clubName]) return knownColors[clubName];
  if (!clubName) return fallback;
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 85%, 60%)`; 
};

// Default 4-3-3 Coordinates
const POS_COORDS = [
  { top: '85%', left: '50%', role: 'GK' },
  { top: '70%', left: '20%', role: 'LB' },
  { top: '75%', left: '38%', role: 'CB' },
  { top: '75%', left: '62%', role: 'CB' },
  { top: '70%', left: '80%', role: 'RB' },
  { top: '55%', left: '50%', role: 'CDM' },
  { top: '45%', left: '30%', role: 'CM' },
  { top: '45%', left: '70%', role: 'CM' },
  { top: '25%', left: '20%', role: 'LW' },
  { top: '25%', left: '80%', role: 'RW' },
  { top: '15%', left: '50%', role: 'ST' }
];

const TacticalCanvas = () => {
  const allClubs = Object.keys(playerData).sort();
  const defaultClub = allClubs.includes("Arsenal") ? "Arsenal" : allClubs[0];
  const [selectedClub, setSelectedClub] = useState(defaultClub);
  const clubColor = getClubColor(selectedClub, '#22d3ee');
  const pitchRef = useRef(null);

  // Tactical State
  const [tactics, setTactics] = useState({ line: 50, width: 50, tempo: 50 });
  const [engineFeedback, setEngineFeedback] = useState([]);
  const [cohesionScore, setCohesionScore] = useState(100);
  const [tacticalIdentity, setTacticalIdentity] = useState("Balanced Approach");

  // Roster State
  const [pitchPlayers, setPitchPlayers] = useState([]);
  const [benchPlayers, setBenchPlayers] = useState([]);
  const [selectedForSwap, setSelectedForSwap] = useState(null);

  // --- SMART LINEUP INITIALIZATION ---
  useEffect(() => {
    const squad = [...(playerData[selectedClub] || [])].sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
    
    const top11 = squad.slice(0, 11);
    const bench = squad.slice(11);

    const sortedForPitch = top11.sort((a, b) => {
      const isGkA = a.Position === 'GK' || (a.archetype && a.archetype.includes('Keeper')) || (a.archetype && a.archetype.includes('Stopper'));
      const isGkB = b.Position === 'GK' || (b.archetype && b.archetype.includes('Keeper')) || (b.archetype && b.archetype.includes('Stopper'));
      if (isGkA && !isGkB) return -1;
      if (isGkB && !isGkA) return 1;

      const scoreA = (a.stats?.DEF || 0) - (a.stats?.SHO || 0);
      const scoreB = (b.stats?.DEF || 0) - (b.stats?.SHO || 0);
      return scoreB - scoreA; 
    });

    const initialPitch = sortedForPitch.map((p, i) => ({
      ...p,
      pitchPos: POS_COORDS[i] || { top: '50%', left: '50%', role: 'UTIL' }
    }));
    
    setPitchPlayers(initialPitch);
    setBenchPlayers(bench);
    setSelectedForSwap(null);
  }, [selectedClub]);

  // --- INTERCONNECTED NEURAL ENGINE (V2.0 - Fully Reactive) ---
  useEffect(() => {
    if (pitchPlayers.length !== 11) return;

    let score = 100;
    const warnings = [];
    const { line, width, tempo } = tactics;

    // Stat Extraction based on SPATIAL position on the pitch
    const safeStat = (p, stat) => p.stats?.[stat] || 50;
    const defs = pitchPlayers.filter(p => parseFloat(p.pitchPos.top) > 60);
    const mids = pitchPlayers.filter(p => parseFloat(p.pitchPos.top) <= 60 && parseFloat(p.pitchPos.top) >= 35);
    const atts = pitchPlayers.filter(p => parseFloat(p.pitchPos.top) < 35);

    const avgDefPace = defs.reduce((sum, p) => sum + safeStat(p, 'PAC'), 0) / Math.max(defs.length, 1);
    const avgDefPhy = defs.reduce((sum, p) => sum + safeStat(p, 'PHY'), 0) / Math.max(defs.length, 1);
    const avgMidPass = mids.reduce((sum, p) => sum + safeStat(p, 'PAS'), 0) / Math.max(mids.length, 1);
    const avgMidPhy = mids.reduce((sum, p) => sum + safeStat(p, 'PHY'), 0) / Math.max(mids.length, 1);
    const avgAttPace = atts.reduce((sum, p) => sum + safeStat(p, 'PAC'), 0) / Math.max(atts.length, 1);

    // 1. INDEPENDENT SLIDER EVALUATIONS (Always Trigger)
    
    // Line Evaluation
    if (line > 65) {
      if (avgDefPace < 75) { warnings.push({ type: 'CRITICAL', msg: `SUICIDE LINE: Center Back average pace (${Math.round(avgDefPace)}) is too low for a high block.` }); score -= 15; }
      else { warnings.push({ type: 'OPTIMAL', msg: `PACE SECURED: Defense can comfortably hold a high line.` }); score += 5; }
    } else if (line < 35) {
      if (avgDefPhy < 80) { warnings.push({ type: 'WARNING', msg: `SOFT BLOCK: Low block requires immense physical presence to clear boxes. Defense PHY is vulnerable.` }); score -= 10; }
      else { warnings.push({ type: 'OPTIMAL', msg: `BRICK WALL: Defensive physicality is optimal for a low block.` }); score += 5; }
    }

    // Width Evaluation
    if (width > 65) {
      if (avgAttPace < 80) { warnings.push({ type: 'WARNING', msg: `FLANK EXPOSURE: Wide play demanded, but wide players lack top-tier pace to exploit space.` }); score -= 10; }
      else { warnings.push({ type: 'OPTIMAL', msg: `STRETCHING PLAY: Attackers have elite pace to isolate fullbacks.` }); score += 5; }
    } else if (width < 35) {
      if (avgMidPass < 80) { warnings.push({ type: 'CRITICAL', msg: `CONGESTION: Narrow width requires elite tight-space passing. Midfield falls short.` }); score -= 15; }
      else { warnings.push({ type: 'OPTIMAL', msg: `OVERLOAD SECURED: Midfield passing is elite enough to slice through narrow corridors.` }); score += 5; }
    }

    // Tempo Evaluation
    if (tempo > 65) {
      if (avgMidPass < 75) { warnings.push({ type: 'CRITICAL', msg: `TURNOVER RISK: High tempo requires elite distribution. Midfield passing is too erratic.` }); score -= 15; }
    } else if (tempo < 35) {
      if (avgMidPass >= 80) { warnings.push({ type: 'OPTIMAL', msg: `TIKI-TAKA: Elite midfield control perfect for slow, methodical build-up.` }); score += 5; }
    }

    // 2. COMBINED TACTICAL IDENTITY
    let identity = "Balanced Approach";
    if (line > 65 && tempo > 65) identity = "Heavy Metal / Gegenpress";
    else if (line > 65 && tempo < 40) identity = "High Possession / Control";
    else if (line < 35 && tempo > 65) identity = "Deep Counter-Attack";
    else if (line < 35 && tempo < 40) identity = "Catenaccio / Park The Bus";
    
    setTacticalIdentity(identity);

    // 3. IDENTITY SYNERGY BONUSES/PENALTIES
    if (identity === "Heavy Metal / Gegenpress" && avgMidPhy < 75) {
      warnings.push({ type: 'WARNING', msg: `ENGINE ROOM FATIGUE: Midfield lacks the Stamina/PHY for 90 minutes of Gegenpressing.` }); score -= 10;
    }
    if (identity === "Deep Counter-Attack" && avgAttPace > 85 && avgMidPass > 80) {
      warnings.push({ type: 'OPTIMAL', msg: `LETHAL TRANSITIONS: Perfect synergy of deep passing and forward speed.` }); score += 10;
    }

    setCohesionScore(Math.max(10, Math.min(100, score)));
    
    // Sort warnings so Criticals appear at the top
    const priority = { 'CRITICAL': 1, 'WARNING': 2, 'OPTIMAL': 3 };
    warnings.sort((a, b) => priority[a.type] - priority[b.type]);
    setEngineFeedback(warnings);
  }, [tactics, pitchPlayers]);

  // --- SQUAD SWAP LOGIC ---
  const handleBenchClick = (benchPlayer) => {
    if (!selectedForSwap) return;
    const targetPitchPlayer = pitchPlayers.find(p => p.id === selectedForSwap);
    
    const newPitch = pitchPlayers.map(p => {
      if (p.id === selectedForSwap) return { ...benchPlayer, pitchPos: p.pitchPos }; 
      return p;
    });

    const newBench = benchPlayers.filter(p => p.id !== benchPlayer.id);
    newBench.push(targetPitchPlayer);
    newBench.sort((a,b) => (b.Rating || 0) - (a.Rating || 0));

    setPitchPlayers(newPitch);
    setBenchPlayers(newBench);
    setSelectedForSwap(null); 
  };

  const hexHash = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();

  return (
    <div className="w-full h-full max-h-[calc(100vh-2rem)] flex flex-col gap-4 text-white font-sans relative overflow-hidden bg-[#020508] rounded-2xl p-4 lg:p-6 shadow-2xl">
      
      {/* AMBIENT LIGHTING */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_100%)] pointer-events-none" />
      <motion.div animate={{ backgroundColor: `${clubColor}10` }} className="absolute top-0 left-0 w-full h-32 blur-[100px] pointer-events-none z-0 transition-colors duration-700" />

      {/* HEADER ROW */}
      <div className="w-full shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 z-20 border-b border-white/10 pb-4">
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase" style={{ color: clubColor }}>
            0x{hexHash} // TACTICAL ARCHITECTURE HUB
          </span>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-md">
            The Chalkboard
          </h1>
        </div>
        
        <select 
          value={selectedClub} 
          onChange={(e) => setTactics({ line: 50, width: 50, tempo: 50 }) || setSelectedClub(e.target.value)} 
          className="w-full md:w-72 bg-black/80 border-2 rounded-xl px-4 py-3 text-sm font-black tracking-wider text-white focus:outline-none uppercase shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors"
          style={{ borderColor: `${clubColor}50`, color: clubColor }}
        >
          {allClubs.map(club => <option key={club} value={club}>{club}</option>)}
        </select>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 w-full relative z-10">
        
        {/* LEFT: THE INTERACTIVE PITCH */}
        <div className="flex-1 min-h-[400px] lg:min-h-0 bg-gradient-to-b from-[#0a1510] to-[#050a08] border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner group p-4">
          
          <div ref={pitchRef} className="w-full max-w-[420px] aspect-[2/3] border-2 border-white/20 relative" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 20%)' }}>
             <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/20 -translate-y-1/2" />
             <div className="absolute top-0 left-1/2 w-48 h-24 border-2 border-t-0 border-white/20 -translate-x-1/2" />
             <div className="absolute bottom-0 left-1/2 w-48 h-24 border-2 border-b-0 border-white/20 -translate-x-1/2" />
             <div className="absolute top-0 left-1/2 w-20 h-8 border-2 border-t-0 border-white/20 -translate-x-1/2" />
             <div className="absolute bottom-0 left-1/2 w-20 h-8 border-2 border-b-0 border-white/20 -translate-x-1/2" />

             {pitchPlayers.map((player) => {
               const isSelected = selectedForSwap === player.id;
               const defaultRole = POS_COORDS.find(c => c.top === player.pitchPos.top && c.left === player.pitchPos.left)?.role || "UTIL";

               return (
                 <motion.div
                   key={player.id}
                   drag
                   dragConstraints={pitchRef}
                   dragElastic={0}
                   dragMomentum={false}
                   onClick={() => setSelectedForSwap(isSelected ? null : player.id)}
                   initial={player.pitchPos}
                   onDragEnd={(e, info) => {
                      const rect = pitchRef.current.getBoundingClientRect();
                      const x = info.point.x - rect.left;
                      const y = info.point.y - rect.top;
                      const topPct = `${(y / rect.height) * 100}%`;
                      const leftPct = `${(x / rect.width) * 100}%`;
                      
                      setPitchPlayers(prev => prev.map(p => p.id === player.id ? { ...p, pitchPos: { top: topPct, left: leftPct, role: defaultRole } } : p));
                   }}
                   className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer border-2 z-20 transition-colors ${
                     isSelected ? 'scale-125 z-50 animate-pulse' : 'hover:scale-110 hover:z-40'
                   }`}
                   style={{ backgroundColor: isSelected ? clubColor : '#111', borderColor: clubColor, boxShadow: isSelected ? `0 0 20px ${clubColor}` : `0 5px 15px rgba(0,0,0,0.8)` }}
                 >
                   <span className={`text-[9px] md:text-[10px] font-black italic select-none ${isSelected ? 'text-black' : 'text-white'}`}>{defaultRole}</span>
                   <div className="absolute top-[110%] bg-black/80 border border-white/10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider whitespace-nowrap opacity-70 group-hover:opacity-100 pointer-events-none">
                     {player.Name.split(' ').pop()}
                   </div>
                 </motion.div>
               );
             })}
          </div>

          <AnimatePresence>
            {selectedForSwap && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 px-6 py-2 rounded-full shadow-2xl z-50 pointer-events-none flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: clubColor }} />
                 <span className="text-xs font-mono tracking-widest uppercase text-white">Select Bench Player to Swap</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: TACTICS & SQUAD HUB */}
        <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
          
          {/* TACTICAL DIRECTIVES (SLIDERS) */}
          <div className="bg-[#05080c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-5 shadow-lg">
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <h2 className="text-sm font-mono tracking-widest text-white/40 uppercase">Global Directives</h2>
              <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-white/5 border border-white/10" style={{ color: clubColor }}>{tacticalIdentity}</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-white/80">
                <span>Defensive Line</span>
                <span style={{ color: clubColor }}>{tactics.line}</span>
              </div>
              <input type="range" min="0" max="100" value={tactics.line} onChange={(e) => setTactics({...tactics, line: Number(e.target.value)})} className="w-full" style={{ accentColor: clubColor }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-white/80">
                <span>Width</span>
                <span style={{ color: clubColor }}>{tactics.width}</span>
              </div>
              <input type="range" min="0" max="100" value={tactics.width} onChange={(e) => setTactics({...tactics, width: Number(e.target.value)})} className="w-full" style={{ accentColor: clubColor }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-black uppercase text-white/80">
                <span>Tempo</span>
                <span style={{ color: clubColor }}>{tactics.tempo}</span>
              </div>
              <input type="range" min="0" max="100" value={tactics.tempo} onChange={(e) => setTactics({...tactics, tempo: Number(e.target.value)})} className="w-full" style={{ accentColor: clubColor }} />
            </div>
          </div>

          {/* ENGINE FEEDBACK (COHESION) */}
          <div className="bg-gradient-to-b from-[#0a0f16] to-[#020305] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl shrink-0">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
               <div className="flex flex-col gap-0.5">
                 <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">System Cohesion</span>
                 <span className="text-[9px] text-white/50 uppercase">Tactics vs DNA Matrix</span>
               </div>
               <div className={`text-4xl font-black italic drop-shadow-[0_0_10px_currentColor] ${cohesionScore >= 80 ? 'text-emerald-400' : cohesionScore >= 50 ? 'text-amber-400' : 'text-red-500'}`}>
                 {cohesionScore}%
               </div>
            </div>

            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
               {engineFeedback.length === 0 && <div className="text-xs font-mono text-white/30 text-center py-4">SYSTEM NOMINAL.</div>}
               <AnimatePresence>
                 {engineFeedback.map((fb, idx) => (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={idx} 
                     className={`p-2.5 rounded border-l-2 text-[10px] font-mono leading-relaxed bg-black/60 ${
                       fb.type === 'CRITICAL' ? 'border-red-500 text-red-300' : fb.type === 'OPTIMAL' ? 'border-emerald-500 text-emerald-300' : 'border-amber-500 text-amber-300'
                     }`}
                   >
                     <span className="font-bold opacity-70 mb-0.5 block tracking-widest">[{fb.type}]</span>
                     {fb.msg}
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </div>

          {/* SQUAD ROSTER (BENCH) */}
          <div className="flex-1 bg-[#05080c] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-lg min-h-[200px]">
             <div className="p-3 border-b border-white/5 bg-black/40 flex justify-between items-center shrink-0">
                <span className="text-xs font-mono tracking-widest text-white/40 uppercase">Reserves</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">{benchPlayers.length}</span>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
               {benchPlayers.map((player) => (
                 <div 
                   key={player.id} 
                   onClick={() => handleBenchClick(player)}
                   className={`flex items-center justify-between p-2 rounded-lg border border-transparent hover:bg-white/5 transition-colors ${selectedForSwap ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-900/20' : 'cursor-default'}`}
                 >
                   <div className="flex items-center gap-3 min-w-0 pr-2">
                     <div className="w-8 h-8 rounded bg-black flex items-center justify-center font-black italic text-[9px] shrink-0 border border-white/10" style={{ color: clubColor }}>
                       {player.Position && player.Position !== "SUB" && player.Position !== "RES" ? player.Position : "RES"}
                     </div>
                     <div className="flex flex-col min-w-0">
                       <span className="text-xs font-black uppercase text-white truncate">{player.Name}</span>
                       <span className="text-[9px] font-mono text-white/40 truncate">{player.archetype}</span>
                     </div>
                   </div>
                   <div className="text-sm font-black italic text-white/80 shrink-0">{player.Rating}</div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: currentColor; cursor: pointer; box-shadow: 0 0 10px currentColor; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}} />
    </div>
  );
};

export default TacticalCanvas;