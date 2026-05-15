import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Adjust this path if your JSON is in a different spot!
import playerData from '../../../backend/processed_players.json';

// --- CUSTOM SVG RADAR CHART COMPONENT ---
const HolographicRadar = ({ stats }) => {
  const size = 200;
  const center = size / 2;
  const maxRadius = 80;

  const angles = [
    -Math.PI / 2,         // Top (PAC)
    -Math.PI / 6,         // Top Right (SHO)
    Math.PI / 6,          // Bottom Right (PAS)
    Math.PI / 2,          // Bottom (DRI)
    5 * Math.PI / 6,      // Bottom Left (DEF)
    7 * Math.PI / 6       // Top Left (PHY)
  ];

  const getPoint = (val, index) => {
    const safeVal = val || 0; // Guardrail against undefined
    const r = (safeVal / 100) * maxRadius;
    const x = center + r * Math.cos(angles[index]);
    const y = center + r * Math.sin(angles[index]);
    return `${x},${y}`;
  };

  const statValues = [stats.PAC, stats.SHO, stats.PAS, stats.DRI, stats.DEF, stats.PHY];
  const points = statValues.map((v, i) => getPoint(v, i)).join(' ');
  const maxPoints = [100, 100, 100, 100, 100, 100].map((v, i) => getPoint(v, i)).join(' ');

  const labels = [
    { text: 'PAC', x: center, y: center - maxRadius - 10 },
    { text: 'SHO', x: center + maxRadius + 15, y: center - maxRadius/2 },
    { text: 'PAS', x: center + maxRadius + 15, y: center + maxRadius/2 },
    { text: 'DRI', x: center, y: center + maxRadius + 15 },
    { text: 'DEF', x: center - maxRadius - 15, y: center + maxRadius/2 },
    { text: 'PHY', x: center - maxRadius - 15, y: center - maxRadius/2 },
  ];

  return (
    <div className="relative w-[200px] h-[200px] flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        <polygon points={maxPoints} fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
        <polygon points={[60, 60, 60, 60, 60, 60].map((v, i) => getPoint(v, i)).join(' ')} fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
        
        {angles.map((angle, i) => (
          <line key={i} x1={center} y1={center} x2={center + maxRadius * Math.cos(angle)} y2={center + maxRadius * Math.sin(angle)} stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
        ))}

        <motion.polygon 
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          points={points} fill="rgba(34,211,238,0.2)" stroke="#22d3ee" strokeWidth="2"
          className="drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        />

        {statValues.map((v, i) => {
          const pt = getPoint(v, i).split(',');
          return <circle key={i} cx={pt[0]} cy={pt[1]} r="3" fill="#fff" className="drop-shadow-[0_0_5px_#fff]" />
        })}

        {labels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle" alignmentBaseline="middle">{l.text}</text>
        ))}
      </svg>
    </div>
  );
};

// --- MAIN SCOUT COMPONENT ---
const NeuralScout = () => {
  const allClubs = Object.keys(playerData).sort();
  
  // THE FIX: Smart fallback if "Manchester United" doesn't exist exactly like that in the JSON
  const defaultClub = allClubs.includes("Manchester United") ? "Manchester United" : allClubs[0];
  const [selectedClub, setSelectedClub] = useState(defaultClub);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState(null);

  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const [directive, setDirective] = useState({ position: "ANY", primaryTrait: "PAC", secondaryTrait: "SHO" });

  // --- ENGINE DIAGNOSTICS (With Guardrails) ---
  const analyzeTeamDNA = (squad) => {
    // Guard against undefined squad
    const safeSquad = squad || [];
    const active = [...safeSquad].sort((a, b) => (b.Rating || 0) - (a.Rating || 0)).slice(0, 11);
    
    // Guard against empty clubs
    if (!active.length) {
      return { 
        active: [], 
        dna: { PAC: 0, SHO: 0, PAS: 0, DRI: 0, DEF: 0, PHY: 0 }, 
        criticalFlaw: 'UNKNOWN', 
        weakScore: 0, 
        ovr: 0 
      };
    }

    const avg = (stat) => Math.round(active.reduce((acc, p) => acc + (p.stats?.[stat] || 50), 0) / active.length);
    const dna = { PAC: avg('PAC'), SHO: avg('SHO'), PAS: avg('PAS'), DRI: avg('DRI'), DEF: avg('DEF'), PHY: avg('PHY') };
    
    let criticalFlaw = 'PAC';
    let minVal = dna.PAC;
    Object.keys(dna).forEach(key => { if(dna[key] < minVal) { minVal = dna[key]; criticalFlaw = key; } });

    const ovr = Math.round(active.reduce((acc, p) => acc + (p.Rating || 50), 0) / active.length);

    return { active, dna, criticalFlaw, weakScore: minVal, ovr };
  };

  const currentTeamData = useMemo(() => analyzeTeamDNA(playerData[selectedClub]), [selectedClub]);

  // --- THE ORACLE MATCHING ALGORITHM ---
  const calculateSynergy = (squad) => {
    const activePlayers = [...squad].sort((a, b) => (b.Rating || 0) - (a.Rating || 0)).slice(0, 11);
    if (!activePlayers.length) return { att: 0, con: 0, def: 0, ovr: 0, weakLink: 'INSUFFICIENT DATA', weakScore: 0 };

    let baseAtt = activePlayers.reduce((acc, p) => acc + ((p.stats?.SHO || 50) + (p.stats?.PAC || 50)) / 2, 0) / activePlayers.length;
    let baseCon = activePlayers.reduce((acc, p) => acc + (p.stats?.PAS || 50), 0) / activePlayers.length;
    let baseDef = activePlayers.reduce((acc, p) => acc + ((p.stats?.DEF || 50) + (p.stats?.PHY || 50)) / 2, 0) / activePlayers.length;
    
    const currentRawTalent = Math.round(activePlayers.reduce((acc, p) => acc + (p.Rating || 50), 0) / activePlayers.length);
    const counts = {};
    activePlayers.forEach(p => { counts[p.archetype || "Utility Player"] = (counts[p.archetype || "Utility Player"] || 0) + 1; });

    const isElite = currentRawTalent >= 84;
    const nerfMultiplier = isElite ? 0.5 : 1.0; 

    if (counts["Target Man"] >= 1 && (counts["Poacher"] >= 1 || counts["Inside Forward"] >= 1)) baseAtt *= 1.10;
    if (counts["Advanced Playmaker"] === 1 && counts["Box-to-Box"] >= 1) baseCon *= 1.15;
    if (counts["Anchor/Destroyer"] >= 1 && (counts["Traditional Stopper"] >= 1 || counts["Ball-Playing Defender"] >= 1)) baseDef *= 1.15;

    if (counts["Advanced Playmaker"] >= 2) baseCon *= (1 - (0.20 * nerfMultiplier));
    if (activePlayers.length >= 6 && !counts["Anchor/Destroyer"]) baseDef *= (1 - (0.25 * nerfMultiplier));
    if (counts["Target Man"] >= 2) baseAtt *= (1 - (0.15 * nerfMultiplier));

    let tacticalScore = Math.round((baseAtt + baseCon + baseDef) / 3);
    const talentFloor = currentRawTalent - 8;
    if (tacticalScore < talentFloor && activePlayers.length >= 5) tacticalScore = talentFloor;

    const stats = { att: Math.min(Math.round(baseAtt), 99), con: Math.min(Math.round(baseCon), 99), def: Math.min(Math.round(baseDef), 99), ovr: Math.min(tacticalScore, 99) };

    let weakLink = 'ATTACK THREAT';
    let weakScore = stats.att;
    if (stats.con < weakScore) { weakLink = 'SYSTEM CONTROL'; weakScore = stats.con; }
    if (stats.def < weakScore) { weakLink = 'DEFENSIVE SHIELD'; weakScore = stats.def; }

    return { ...stats, weakLink, weakScore };
  };

  const runScoutProtocol = () => {
    setIsScanning(true);
    setResults(null);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(interval); finalizeScout(); return 100; }
        return prev + (Math.random() * 12);
      });
    }, 80);
  };

  const finalizeScout = () => {
    const currentSquad = playerData[selectedClub] || [];
    const currentSynergy = calculateSynergy(currentSquad);
    const teamArchetypes = currentSquad.map(p => p.archetype);

    const targetPositions = {
      'DEFENSIVE SHIELD': ['CB', 'CDM', 'LB', 'RB', 'LWB', 'RWB'],
      'SYSTEM CONTROL': ['CM', 'CAM', 'CDM', 'LM', 'RM'],
      'ATTACK THREAT': ['ST', 'CF', 'LW', 'RW', 'CAM']
    };
    const neededPositions = targetPositions[currentSynergy.weakLink] || [];

    let globalTargets = [];
    Object.keys(playerData).forEach(club => {
      if (club !== selectedClub) playerData[club].forEach(p => globalTargets.push({ ...p, currentClub: club }));
    });

    const evaluated = globalTargets.map(candidate => {
      let score = 0;
      let verdict = "";
      
      if (isOverrideActive && directive.position !== "ANY") {
        if (!candidate.Position || !candidate.Position.includes(directive.position)) return { ...candidate, scoutScore: -1000 };
      }

      const safeStats = candidate.stats || { PAC:50, SHO:50, PAS:50, DRI:50, DEF:50, PHY:50 };
      const targetFlaw = isOverrideActive ? directive.primaryTrait : currentTeamData.criticalFlaw;
      const secondaryFlaw = isOverrideActive ? directive.secondaryTrait : null;

      score += ((safeStats[targetFlaw] || 50) * 3);
      if (secondaryFlaw) score += ((safeStats[secondaryFlaw] || 50) * 1.5);
      score += (candidate.Rating || 50) * 0.5;

      if (isOverrideActive) {
        verdict = `DIRECTIVE MATCH: ${safeStats[targetFlaw]} ${targetFlaw} + ${safeStats[secondaryFlaw]} ${secondaryFlaw}`;
      } else {
        if (safeStats[targetFlaw] > 85) verdict = `CRITICAL FLAW REPAIRED: Elite ${targetFlaw} Matrix`;
        else verdict = `TACTICAL BAND-AID: Upgraded ${targetFlaw} Metrics`;
      }

      const sortedSquad = [...currentSquad].sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
      const hypotheticalSquad = [...sortedSquad.slice(0, 10), candidate]; 
      const newSynergy = calculateSynergy(hypotheticalSquad);
      
      const ovrDelta = newSynergy.ovr - currentSynergy.ovr;
      const attDelta = newSynergy.att - currentSynergy.att;
      const conDelta = newSynergy.con - currentSynergy.con;
      const defDelta = newSynergy.def - currentSynergy.def;

      if (!isOverrideActive) {
         if (!neededPositions.includes(candidate.Position)) score -= 1000;
         else score += 100;
         
         if (!teamArchetypes.includes(candidate.archetype)) {
            score += 60; 
            verdict += " + Rare Archetype";
         }
         
         score += (ovrDelta * 25); 
         if (currentSynergy.weakLink === 'ATTACK THREAT') score += attDelta * 20;
         if (currentSynergy.weakLink === 'SYSTEM CONTROL') score += conDelta * 20;
         if (currentSynergy.weakLink === 'DEFENSIVE SHIELD') score += defDelta * 20;
      }

      score += (Math.random() * 10);
      const baseMatch = 70 + (Math.min(score / 400, 1) * 29);
      const matchPercent = Math.max(0, Math.min(99.9, baseMatch)).toFixed(1);

      return { ...candidate, newSynergy, deltas: { ovr: ovrDelta, att: attDelta, con: conDelta, def: defDelta }, scoutScore: score, analysisVerdict: verdict, matchPercent };
    });

    const topSignings = evaluated.filter(t => t.scoutScore > 0).sort((a, b) => b.scoutScore - a.scoutScore).slice(0, 3);
    setResults({ topSignings });
    setTimeout(() => setIsScanning(false), 600);
  };

  const traitOptions = [{val: 'PAC', label: 'Pace'}, {val: 'SHO', label: 'Shooting'}, {val: 'PAS', label: 'Passing'}, {val: 'DRI', label: 'Dribbling'}, {val: 'DEF', label: 'Defense'}, {val: 'PHY', label: 'Physicality'}];
  const posOptions = ['ANY', 'ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'];
  const hexHash = Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();

  return (
    <div className="w-full h-full max-h-[calc(100vh-2rem)] flex flex-col gap-4 text-white font-sans relative overflow-hidden bg-[#020508] rounded-2xl p-4 md:p-6 shadow-2xl">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

      <div className="w-full shrink-0 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
        <div className="flex flex-col gap-1 w-full md:w-auto text-center md:text-left">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase flex items-center justify-center md:justify-start gap-2">
            <div className={`w-2 h-2 bg-cyan-400 rounded-full ${isScanning ? 'animate-ping' : 'animate-pulse'}`} />
            GLOBAL SCOUTING NETWORK
          </span>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase drop-shadow-md">Transfer Oracle</h1>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <select value={selectedClub} onChange={(e) => { setSelectedClub(e.target.value); setResults(null); }} disabled={isScanning} className="flex-1 md:w-72 bg-black/80 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm font-bold tracking-wider text-cyan-50 focus:outline-none focus:border-cyan-400 uppercase shadow-inner">
            {allClubs.map(club => <option key={club} value={club}>{club}</option>)}
          </select>
          <button onClick={runScoutProtocol} disabled={isScanning} className="px-6 md:px-8 py-3 bg-cyan-500 text-black font-black italic uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-50 shrink-0">
            {isScanning ? 'Scanning...' : 'Initiate'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(10px)" }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-8 rounded-2xl">
            <div className="w-64 h-64 relative flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-dashed border-cyan-500/50 rounded-full" />
               <motion.div animate={{ rotate: -180 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-6 border-2 border-cyan-400/80 rounded-full border-b-transparent border-l-transparent shadow-[0_0_20px_#22d3ee]" />
               <div className="text-5xl font-black italic text-cyan-400 drop-shadow-[0_0_15px_#22d3ee] z-10">{Math.floor(scanProgress)}%</div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-mono text-cyan-400 tracking-widest uppercase text-sm animate-pulse">Running Tactical Void Search...</span>
              <span className="font-mono text-[10px] text-red-400/80 tracking-widest">0x{hexHash} // BYPASSING GLOBAL FIREWALLS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isScanning && currentTeamData && (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0 w-full relative z-10">
          
          {/* LEFT: DNA RADAR & OVERRIDE PANEL */}
          <div className="w-full xl:w-[350px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 h-full">
            
            <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden shadow-lg shrink-0">
               <div className="absolute top-0 right-0 bg-cyan-900/40 text-cyan-400 text-[8px] font-mono tracking-widest px-3 py-1 rounded-bl-lg border-b border-l border-cyan-500/20">TEAM DNA</div>
               <HolographicRadar stats={currentTeamData.dna} />
               <div className="w-full mt-4 bg-red-950/20 border border-red-500/20 rounded-lg p-3 flex flex-col items-center text-center">
                  <span className="text-[9px] font-mono text-red-400/60 uppercase tracking-widest mb-1">Detected Critical Flaw</span>
                  <span className="text-lg font-black tracking-widest text-red-400 uppercase">{currentTeamData.criticalFlaw} DEFICIT</span>
               </div>
            </div>

            <div className={`bg-black/60 border rounded-2xl p-5 flex flex-col gap-4 transition-all shrink-0 ${isOverrideActive ? 'border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border-white/10'}`}>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className={`text-xs font-black uppercase tracking-widest ${isOverrideActive ? 'text-amber-400' : 'text-white/40'}`}>Manual Override</span>
                <button onClick={() => setIsOverrideActive(!isOverrideActive)} className={`w-10 h-5 rounded-full relative transition-colors ${isOverrideActive ? 'bg-amber-500' : 'bg-white/10'}`}>
                  <motion.div animate={{ x: isOverrideActive ? 20 : 2 }} className="w-4 h-4 bg-white rounded-full absolute top-0.5" />
                </button>
              </div>

              {isOverrideActive ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-white/40 uppercase">Target Position</span>
                    <select value={directive.position} onChange={(e) => setDirective({...directive, position: e.target.value})} className="bg-black border border-amber-500/30 rounded-lg px-3 py-2 text-xs font-mono text-amber-50 focus:outline-none">
                      {posOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-white/40 uppercase">Primary Trait</span>
                      <select value={directive.primaryTrait} onChange={(e) => setDirective({...directive, primaryTrait: e.target.value})} className="bg-black border border-amber-500/30 rounded-lg px-3 py-2 text-xs font-mono text-amber-50 focus:outline-none">
                        {traitOptions.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-white/40 uppercase">Secondary</span>
                      <select value={directive.secondaryTrait} onChange={(e) => setDirective({...directive, secondaryTrait: e.target.value})} className="bg-black border border-amber-500/30 rounded-lg px-3 py-2 text-xs font-mono text-amber-50 focus:outline-none">
                        {traitOptions.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <span className="text-[10px] font-mono text-white/30 text-center leading-relaxed">Override offline. The Oracle will automatically target the team's critical flaw.</span>
              )}
            </div>
          </div>

          {/* RIGHT: RESULTS GRID */}
          <div className="flex-1 bg-black/40 border border-cyan-500/20 rounded-2xl p-4 md:p-6 overflow-hidden flex flex-col min-w-0">
            {results ? (
              <div className="h-full flex flex-col gap-4">
                <h2 className="text-xl font-black italic text-white tracking-wide uppercase flex items-center justify-between border-b border-white/10 pb-2">
                  Acquisition Targets
                  <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded bg-cyan-900/20">3 MATCHES FOUND</span>
                </h2>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                  <div className="flex flex-col gap-4 h-full">
                    {results.topSignings.map((player, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }}
                        key={player.id + idx}
                        className={`flex flex-col md:flex-row items-center gap-4 rounded-2xl p-4 md:p-5 relative overflow-hidden border transition-all ${
                          idx === 0 ? 'bg-gradient-to-r from-[#1a1405] to-black border-amber-500/60 shadow-[0_0_20px_rgba(251,191,36,0.15)]' : 'bg-gradient-to-r from-[#03060a] to-black border-cyan-500/30'
                        }`}
                      >
                        {idx === 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 shadow-[0_0_15px_#fbbf24]" />}
                        {idx !== 0 && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />}

                        <div className="flex items-center gap-4 w-full md:w-auto md:border-r border-white/10 md:pr-6 shrink-0">
                          <span className={`text-4xl font-black italic opacity-20 ${idx === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>0{idx + 1}</span>
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${idx === 0 ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' : 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400'}`}>
                            <span className="font-black italic text-2xl">{player.Rating}</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0 w-full">
                           <span className={`text-[9px] font-mono uppercase tracking-widest truncate ${idx === 0 ? 'text-amber-400/60' : 'text-cyan-400/60'}`}>{player.currentClub}</span>
                           <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tighter truncate">{player.Name}</h3>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 text-white/80">{player.Position}</span>
                             <span className="text-[10px] font-mono text-white/40">{player.archetype}</span>
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                           <div className="flex flex-col items-end">
                             <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Compatibility Match</span>
                             <div className={`text-2xl font-black italic flex items-center gap-1 ${idx === 0 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-white'}`}>
                               <Counter target={parseFloat(player.matchPercent)} />%
                             </div>
                           </div>
                           <span className={`text-[9px] font-mono px-3 py-1.5 rounded-md border text-right max-w-[200px] leading-tight ${idx === 0 ? 'bg-amber-900/10 border-amber-500/30 text-amber-200/80' : 'bg-cyan-900/10 border-cyan-500/20 text-cyan-200/60'}`}>
                             {player.analysisVerdict}
                           </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                 <div className="w-16 h-16 border border-cyan-500/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-cyan-500/10 rounded-full animate-pulse" />
                 </div>
                 <span className="font-mono text-cyan-400/40 text-sm tracking-widest uppercase">Select Target Directives</span>
              </div>
            )}
          </div>

        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 4px; }
      `}} />
    </div>
  );
};

const Counter = ({ target }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(target);
    if (start === end || isNaN(end)) return;
    const incrementTime = (1000 / 60);
    const step = end / 30; 
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end.toFixed(1)); clearInterval(timer); }
      else setCount(start.toFixed(1));
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
};

export default NeuralScout;