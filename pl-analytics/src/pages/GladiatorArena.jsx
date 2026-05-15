import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Adjust this path if your JSON is in a different spot!
import playerData from '../../../backend/processed_players.json';

// --- DYNAMIC COLOR ENGINE ---
const knownColors = {
  "Arsenal": "#ef0107",
  "Manchester City": "#6CABDD",
  "Manchester United": "#DA291C",
  "Liverpool": "#C8102E",
  "Chelsea": "#034694",
  "Tottenham Hotspur": "#132257",
  "Real Madrid": "#FEBE10",
  "Barcelona": "#A50044",
  "Bayern Munich": "#DC052D",
  "Paris SG": "#004170",
  "Juventus": "#ffffff"
};

const getClubColor = (clubName, fallback) => {
  if (knownColors[clubName]) return knownColors[clubName];
  if (!clubName) return fallback;
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) {
    hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 85%, 60%)`; 
};

// --- CUSTOM DUAL-RADAR CHART ---
const DualHolographicRadar = ({ statsA, statsB, colorA, colorB }) => {
  const size = 260;
  const center = size / 2;
  const maxRadius = 95;

  const angles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, 7 * Math.PI / 6];

  const getPoint = (val, index) => {
    const safeVal = isNaN(Number(val)) ? 50 : Number(val);
    const r = (safeVal / 100) * maxRadius;
    const x = center + r * Math.cos(angles[index]);
    const y = center + r * Math.sin(angles[index]);
    return `${x},${y}`;
  };

  const ptsA = [statsA.PAC, statsA.SHO, statsA.PAS, statsA.DRI, statsA.DEF, statsA.PHY].map((v, i) => getPoint(v, i)).join(' ');
  const ptsB = [statsB.PAC, statsB.SHO, statsB.PAS, statsB.DRI, statsB.DEF, statsB.PHY].map((v, i) => getPoint(v, i)).join(' ');
  const maxPts = [100, 100, 100, 100, 100, 100].map((v, i) => getPoint(v, i)).join(' ');

  const labels = [
    { text: 'PAC', x: center, y: center - maxRadius - 15 },
    { text: 'SHO', x: center + maxRadius + 20, y: center - maxRadius/2 },
    { text: 'PAS', x: center + maxRadius + 20, y: center + maxRadius/2 },
    { text: 'DRI', x: center, y: center + maxRadius + 15 },
    { text: 'DEF', x: center - maxRadius - 20, y: center + maxRadius/2 },
    { text: 'PHY', x: center - maxRadius - 20, y: center - maxRadius/2 },
  ];

  return (
    <div className="relative w-[260px] h-[260px] flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible" style={{ mixBlendMode: 'screen' }}>
        <polygon points={maxPts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <polygon points={[60, 60, 60, 60, 60, 60].map((v, i) => getPoint(v, i)).join(' ')} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {angles.map((angle, i) => (
          <line key={i} x1={center} y1={center} x2={center + maxRadius * Math.cos(angle)} y2={center + maxRadius * Math.sin(angle)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        <motion.polygon initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
          points={ptsB} fill={`${colorB}70`} stroke={colorB} strokeWidth="2" style={{ filter: `drop-shadow(0 0 10px ${colorB})` }}
        />
        <motion.polygon initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
          points={ptsA} fill={`${colorA}70`} stroke={colorA} strokeWidth="2" style={{ filter: `drop-shadow(0 0 10px ${colorA})` }}
        />

        {labels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} fill="rgba(255,255,255,0.8)" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{l.text}</text>
        ))}
      </svg>
    </div>
  );
};

// --- TUG OF WAR STAT BAR ---
const TugOfWarBar = ({ label, valA, valB, colorA, colorB }) => {
  const safeA = isNaN(Number(valA)) ? 50 : Number(valA);
  const safeB = isNaN(Number(valB)) ? 50 : Number(valB);
  const total = safeA + safeB || 1; 
  const pctA = (safeA / total) * 100;
  const pctB = (safeB / total) * 100;
  const isAWin = safeA > safeB;
  const isBWin = safeB > safeA;

  return (
    <div className="flex items-center w-full gap-3 group">
      <div className="w-8 text-right font-black italic text-lg transition-all" style={{ color: isAWin ? colorA : 'rgba(255,255,255,0.2)', textShadow: isAWin ? `0 0 8px ${colorA}` : 'none' }}>
        {safeA}
      </div>
      <div className="flex-1 h-2.5 bg-black/80 rounded-full flex overflow-hidden border border-white/5 relative shadow-inner">
        <motion.div initial={{ width: "50%" }} animate={{ width: `${pctA}%` }} transition={{ type: "spring", bounce: 0.3 }} className="h-full" style={{ backgroundColor: colorA, boxShadow: `0 0 10px ${colorA}` }} />
        <div className="w-[2px] h-full bg-white/20 z-10" />
        <motion.div initial={{ width: "50%" }} animate={{ width: `${pctB}%` }} transition={{ type: "spring", bounce: 0.3 }} className="h-full" style={{ backgroundColor: colorB, boxShadow: `0 0 10px ${colorB}` }} />
      </div>
      <div className="w-8 text-left font-black italic text-lg transition-all" style={{ color: isBWin ? colorB : 'rgba(255,255,255,0.2)', textShadow: isBWin ? `0 0 8px ${colorB}` : 'none' }}>
        {safeB}
      </div>
      <span className="absolute left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-white/50 bg-[#05080c] px-3 py-0.5 rounded-full border border-white/10 z-20 group-hover:text-white transition-colors uppercase">
        {label}
      </span>
    </div>
  );
};

// --- X-FACTOR BADGE GENERATOR ---
const generateXFactors = (stats) => {
  const badges = [];
  if (stats.PAC > 87) badges.push({ label: 'SPEED DEMON', icon: '⚡' });
  if (stats.SHO > 85) badges.push({ label: 'LETHAL FINISHER', icon: '🎯' });
  if (stats.PAS > 86) badges.push({ label: 'MAESTRO', icon: '👁️' });
  if (stats.DRI > 86) badges.push({ label: 'MAGICIAN', icon: '✨' });
  if (stats.DEF > 85) badges.push({ label: 'BRICK WALL', icon: '🧱' });
  if (stats.PHY > 86) badges.push({ label: 'JUGGERNAUT', icon: '🦍' });
  return badges.slice(0, 3);
};

// --- CUSTOM SEARCH DROPDOWN ---
const PlayerSearch = ({ allPlayers, onSelect, placeholder, align = "left", themeColor }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return allPlayers.filter(p => p.Name.toLowerCase().includes(q) || p.Club.toLowerCase().includes(q)).slice(0, 10);
  }, [query, allPlayers]);

  return (
    <div className="relative w-full z-50">
      <input 
        type="text" value={query} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        style={{ borderColor: `${themeColor}50`, color: themeColor }}
        className={`w-full bg-black/60 border-2 rounded-xl px-4 py-4 text-sm font-black tracking-wider focus:outline-none shadow-inner uppercase text-${align}`}
      />
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-full mt-2 w-full bg-[#05080c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar z-50"
          >
            {results.map(p => (
              <div key={p.id + p.Club} onClick={() => { onSelect(p); setQuery(""); setIsOpen(false); }} className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer flex items-center justify-between group transition-colors`}>
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-base font-black text-white group-hover:text-white truncate uppercase">{p.Name}</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-60" style={{ color: themeColor }}>{p.Club}</span>
                </div>
                <div className="shrink-0 font-black italic text-xl" style={{ color: themeColor }}>{p.Rating}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN ARENA COMPONENT ---
const GladiatorArena = () => {
  const allPlayers = useMemo(() => {
    const list = [];
    Object.keys(playerData).forEach(club => {
      playerData[club].forEach(p => list.push({ ...p, Club: club, stats: p.stats || {PAC:50,SHO:50,PAS:50,DRI:50,DEF:50,PHY:50} }));
    });
    return list.sort((a,b) => (b.Rating || 0) - (a.Rating || 0));
  }, []);

  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [verdict, setVerdict] = useState(null);

  const colorA = playerA ? getClubColor(playerA.Club, '#22d3ee') : '#22d3ee';
  const colorB = playerB ? getClubColor(playerB.Club, '#f43f5e') : '#f43f5e';

  const executeCombat = () => {
    if (!playerA || !playerB) return;
    setIsSimulating(true);
    setVerdict(null);
    setSimulationLogs([]);

    const combatLogs = [
      "INITIALIZING 10,000 MATCH NEURAL SIMULATION...",
      `ANALYZING ${playerA.Name.toUpperCase()} KINETIC PROFILE...`,
      `ANALYZING ${playerB.Name.toUpperCase()} KINETIC PROFILE...`,
      "CALCULATING 1v1 SPRINT DIFFERENTIALS...",
      "MAPPING AERIAL COMBAT PROBABILITIES...",
      "EXECUTING MONTE CARLO DUEL ENGINE...",
      "COMPILING FINAL WIN PROBABILITIES..."
    ];

    let step = 0;
    const logInterval = setInterval(() => {
      setSimulationLogs(prev => [...prev, combatLogs[step]]);
      step++;
      
      if (step >= combatLogs.length) {
        clearInterval(logInterval);
        setTimeout(() => generateVerdict(), 600);
      }
    }, 300); 
  };

  const generateVerdict = () => {
    // Sanitizes bad CSV data so we never get NaN%
    const getStat = (player, statName) => {
      const val = player?.stats?.[statName];
      return isNaN(Number(val)) ? 50 : Number(val);
    };

    let scoreA = 0; let scoreB = 0;
    let biggestAdvantage = { stat: 'PAC', diff: 0, owner: 'A' };

    const diffs = { 
      PAC: getStat(playerA, 'PAC') - getStat(playerB, 'PAC'), 
      SHO: getStat(playerA, 'SHO') - getStat(playerB, 'SHO'), 
      PAS: getStat(playerA, 'PAS') - getStat(playerB, 'PAS'), 
      DRI: getStat(playerA, 'DRI') - getStat(playerB, 'DRI'), 
      DEF: getStat(playerA, 'DEF') - getStat(playerB, 'DEF'), 
      PHY: getStat(playerA, 'PHY') - getStat(playerB, 'PHY') 
    };

    Object.keys(diffs).forEach(stat => {
      const diff = diffs[stat];
      if (diff > 0) scoreA += diff;
      else scoreB += Math.abs(diff);

      if (Math.abs(diff) > biggestAdvantage.diff) {
        biggestAdvantage = { stat, diff: Math.abs(diff), owner: diff > 0 ? 'A' : 'B' };
      }
    });

    const totalDiff = scoreA + scoreB || 1;
    let winProbA = 50 + ((scoreA - scoreB) / totalDiff) * 30; 
    winProbA = Math.max(10, Math.min(90, winProbA || 50)); 
    const winProbB = 100 - winProbA;

    const winner = winProbA > winProbB ? playerA : (winProbB > winProbA ? playerB : null);
    const winColor = winProbA > winProbB ? colorA : colorB;
    const statMap = { PAC: 'Kinetic Pace', SHO: 'Lethality', PAS: 'Distribution', DRI: 'Ball Manipulation', DEF: 'Defensive Integrity', PHY: 'Raw Physicality' };
    
    let summary = "";
    if (winner) {
      const loser = winner === playerA ? playerB : playerA;
      summary = `SIMULATION COMPLETE. Over 10,000 instances, ${winner.Name} wins ${Math.max(winProbA, winProbB).toFixed(1)}% of duels. They exploit a devastating +${biggestAdvantage.diff} advantage in ${statMap[biggestAdvantage.stat]} to neutralize ${loser.Name}.`;
    } else {
      summary = `DEADLOCK DETECTED: 50.0% Win Probability. Both assets perfectly counter each other's matrices.`;
    }

    setVerdict({ winner, summary, winProbA, winProbB, winColor });
    setIsSimulating(false);
  };

  return (
    <div className="w-full h-full max-h-[calc(100vh-2rem)] flex flex-col gap-4 text-white font-sans relative overflow-hidden bg-[#020508] rounded-2xl p-4 lg:p-6 shadow-2xl">
      
      {/* DYNAMIC AMBIENT LIGHTING */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_100%)] pointer-events-none" />
      <motion.div animate={{ backgroundColor: `${colorA}10`, boxShadow: `0 0 150px ${colorA}40` }} className="absolute top-1/2 left-0 w-1/3 h-full blur-[150px] rounded-full -translate-y-1/2 pointer-events-none z-0 transition-colors duration-700" />
      <motion.div animate={{ backgroundColor: `${colorB}10`, boxShadow: `0 0 150px ${colorB}40` }} className="absolute top-1/2 right-0 w-1/3 h-full blur-[150px] rounded-full -translate-y-1/2 pointer-events-none z-0 transition-colors duration-700" />

      {/* HEADER */}
      <div className="w-full shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 z-20 border-b border-white/10 pb-4">
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left w-full md:w-auto">
          <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-white/40 uppercase">
            10,000-MATCH COMBAT ENGINE
          </span>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-md">
            The Gladiator Arena
          </h1>
        </div>

        <button 
          onClick={executeCombat} 
          disabled={!playerA || !playerB || isSimulating}
          className="w-full md:w-auto px-10 py-4 bg-white text-black font-black italic uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed shrink-0 relative overflow-hidden group"
        >
          {isSimulating ? (
            <span className="animate-pulse text-red-500">SIMULATING...</span>
          ) : (
            <span className="relative z-10">INITIATE COMBAT</span>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full relative z-10 overflow-y-auto custom-scrollbar pr-2 pb-4">
        
        {/* TOP ROW: SELECTORS & PLAYER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 shrink-0">
          
          {/* PLAYER A */}
          <div className="flex flex-col gap-4">
            <PlayerSearch allPlayers={allPlayers} onSelect={setPlayerA} placeholder="ACQUIRE COMBATANT A..." align="left" themeColor={colorA} />
            
            <AnimatePresence mode="wait">
              {playerA && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                  style={{ borderColor: `${colorA}50`, boxShadow: `0 0 30px ${colorA}20` }}
                  className="bg-gradient-to-br from-black/80 to-[#020508] border-2 rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 text-black text-[9px] font-black italic px-4 py-1 rounded-bl-lg tracking-widest" style={{ backgroundColor: colorA, boxShadow: `0 0 10px ${colorA}` }}>CORNER A</div>
                  <div className="absolute -bottom-10 -right-10 text-9xl font-black italic opacity-5 select-none" style={{ color: colorA }}>{playerA.Position}</div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <span className="text-[10px] font-mono tracking-widest uppercase truncate" style={{ color: colorA }}>{playerA.Club}</span>
                      <h2 className="text-3xl font-black uppercase text-white tracking-tighter truncate">{playerA.Name}</h2>
                      <span className="text-xs font-mono uppercase text-white/50">{playerA.archetype}</span>
                    </div>
                    <div className="w-16 h-16 shrink-0 bg-black/50 border rounded-xl flex items-center justify-center" style={{ borderColor: colorA, boxShadow: `inset 0 0 15px ${colorA}40` }}>
                      <span className="font-black italic text-4xl" style={{ color: colorA, filter: `drop-shadow(0 0 10px ${colorA}80)` }}>{playerA.Rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 relative z-10">
                    {generateXFactors(playerA.stats).map((badge, i) => (
                       <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                         <span>{badge.icon}</span>
                         <span className="text-[8px] font-black uppercase tracking-wider text-white/80">{badge.label}</span>
                       </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PLAYER B */}
          <div className="flex flex-col gap-4">
            <PlayerSearch allPlayers={allPlayers} onSelect={setPlayerB} placeholder="ACQUIRE COMBATANT B..." align="right" themeColor={colorB} />
            
            <AnimatePresence mode="wait">
              {playerB && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
                  style={{ borderColor: `${colorB}50`, boxShadow: `0 0 30px ${colorB}20` }}
                  className="bg-gradient-to-bl from-black/80 to-[#020508] border-2 rounded-2xl p-6 relative overflow-hidden flex flex-col items-end text-right"
                >
                  <div className="absolute top-0 left-0 text-black text-[9px] font-black italic px-4 py-1 rounded-br-lg tracking-widest" style={{ backgroundColor: colorB, boxShadow: `0 0 10px ${colorB}` }}>CORNER B</div>
                  <div className="absolute -bottom-10 -left-10 text-9xl font-black italic opacity-5 select-none" style={{ color: colorB }}>{playerB.Position}</div>
                  
                  <div className="flex justify-between items-start w-full relative z-10 flex-row-reverse">
                    <div className="flex flex-col gap-1 min-w-0 pl-4 items-end">
                      <span className="text-[10px] font-mono tracking-widest uppercase truncate" style={{ color: colorB }}>{playerB.Club}</span>
                      <h2 className="text-3xl font-black uppercase text-white tracking-tighter truncate">{playerB.Name}</h2>
                      <span className="text-xs font-mono uppercase text-white/50">{playerB.archetype}</span>
                    </div>
                    <div className="w-16 h-16 shrink-0 bg-black/50 border rounded-xl flex items-center justify-center" style={{ borderColor: colorB, boxShadow: `inset 0 0 15px ${colorB}40` }}>
                      <span className="font-black italic text-4xl" style={{ color: colorB, filter: `drop-shadow(0 0 10px ${colorB}80)` }}>{playerB.Rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 relative z-10 flex-row-reverse">
                    {generateXFactors(playerB.stats).map((badge, i) => (
                       <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md flex-row-reverse">
                         <span>{badge.icon}</span>
                         <span className="text-[8px] font-black uppercase tracking-wider text-white/80">{badge.label}</span>
                       </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* BOTTOM ROW: THE COLLISION ZONE */}
        {playerA && playerB && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 lg:gap-12 mt-8">
            
            {/* LEFT: THE OVERLAPPING RADAR */}
            <div className="flex justify-center shrink-0 relative lg:w-[350px]">
               <DualHolographicRadar statsA={playerA.stats} statsB={playerB.stats} colorA={colorA} colorB={colorB} />
            </div>

            {/* RIGHT: TALE OF THE TAPE & VERDICT */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
               
               {/* 10,000 Match Sim Terminal (Shrinks when combat finishes) */}
               {(isSimulating || (!isSimulating && simulationLogs.length > 0 && !verdict)) && (
                 <div className="bg-[#03060a] border border-white/10 rounded-2xl p-4 font-mono text-[10px] md:text-xs h-24 overflow-y-auto custom-scrollbar flex flex-col gap-1 shadow-inner">
                   {simulationLogs.map((log, i) => (
                     <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-white/60">
                       <span className="text-cyan-400 mr-2">{'>'}</span>{log}
                     </motion.div>
                   ))}
                   {isSimulating && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }} className="w-2 h-3 bg-cyan-400 mt-1" />}
                 </div>
               )}

               {/* TALE OF THE TAPE (TUG OF WAR BARS) */}
               {(!isSimulating && playerA && playerB) && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-3.5 bg-black/40 p-5 rounded-2xl border border-white/5 shadow-lg">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Tale of the Tape</span>
                    {['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'].map((stat) => (
                      <TugOfWarBar key={stat} label={stat} valA={playerA.stats[stat]} valB={playerB.stats[stat]} colorA={colorA} colorB={colorB} />
                    ))}
                 </motion.div>
               )}

               {/* MATHEMATICAL VERDICT OUTPUT */}
               <AnimatePresence>
                 {verdict && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-2xl border-l-4 relative overflow-hidden bg-gradient-to-r from-black/80 to-[#020305]"
                      style={{ borderLeftColor: verdict.winColor }}
                    >
                      {/* WIN PROBABILITY DIALS */}
                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                         <div className="flex flex-col">
                           <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: colorA }}>{playerA.Name} Win %</span>
                           <span className="text-3xl font-black italic text-white">{verdict.winProbA.toFixed(1)}%</span>
                         </div>
                         <span className="text-2xl font-black italic text-white/20">VS</span>
                         <div className="flex flex-col items-end">
                           <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: colorB }}>{playerB.Name} Win %</span>
                           <span className="text-3xl font-black italic text-white">{verdict.winProbB.toFixed(1)}%</span>
                         </div>
                      </div>

                      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 block">System Output // Combat Resolution</span>
                      <p className="text-sm md:text-base font-bold leading-relaxed relative z-10 text-white/90">
                        {verdict.summary}
                      </p>
                    </motion.div>
                 )}
               </AnimatePresence>

            </div>
          </motion.div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}} />
    </div>
  );
};

export default GladiatorArena;