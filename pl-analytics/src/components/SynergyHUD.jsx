import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SynergyHUD = ({ pitchPlayers }) => {
  const [scores, setScores] = useState({ att: 0, con: 0, def: 0, ovr: 0 });
  const [rawTalent, setRawTalent] = useState(0);
  const [logs, setLogs] = useState([{ text: "> NEURAL ENGINE STANDBY...", type: "neutral" }]);
  const [displayScore, setDisplayScore] = useState(0);
  const [isGalactico, setIsGalactico] = useState(false);

  useEffect(() => {
    const activePlayers = pitchPlayers.filter(p => p !== null);

    if (activePlayers.length === 0) {
      setScores({ att: 0, con: 0, def: 0, ovr: 0 });
      setRawTalent(0);
      setDisplayScore(0);
      setIsGalactico(false);
      setLogs([{ text: "> AWAITING DEPLOYMENT...", type: "neutral" }]);
      return;
    }

    // 1. Calculate Raw Stats
    let baseAtt = activePlayers.reduce((acc, p) => acc + (p.stats.SHO + p.stats.PAC) / 2, 0) / activePlayers.length;
    let baseCon = activePlayers.reduce((acc, p) => acc + p.stats.PAS, 0) / activePlayers.length;
    let baseDef = activePlayers.reduce((acc, p) => acc + (p.stats.DEF + p.stats.PHY) / 2, 0) / activePlayers.length;
    
    // Calculate Raw Talent Average
    const currentRawTalent = Math.round(activePlayers.reduce((acc, p) => acc + p.Rating, 0) / activePlayers.length);
    setRawTalent(currentRawTalent);

    const counts = {};
    activePlayers.forEach(p => { counts[p.archetype] = (counts[p.archetype] || 0) + 1; });

    let currentLogs = [];
    
    // 2. THE GALÁCTICO PROTOCOL: Check if team is Elite
    const isElite = currentRawTalent >= 84;
    setIsGalactico(isElite);
    const nerfMultiplier = isElite ? 0.5 : 1.0; // Elite teams only take 50% of the penalty

    if (isElite) {
      currentLogs.push({ text: "★ GALÁCTICO PROTOCOL ENGAGED: Elite adaptability active.", type: "system" });
    }

    // 3. Apply Buffs (Positive Synergy)
    if (counts["Target Man"] >= 1 && (counts["Poacher"] >= 1 || counts["Inside Forward"] >= 1)) {
      baseAtt *= 1.10;
      currentLogs.push({ text: "> SPEARHEAD LINK ACTIVE: +10% ATT", type: "buff" });
    }
    if (counts["Advanced Playmaker"] === 1 && counts["Box-to-Box"] >= 1) {
      baseCon *= 1.15;
      currentLogs.push({ text: "> ENGINE ROOM SYNCED: +15% CON", type: "buff" });
    }
    if (counts["Anchor/Destroyer"] >= 1 && (counts["Traditional Stopper"] >= 1 || counts["Ball-Playing Defender"] >= 1)) {
      baseDef *= 1.15;
      currentLogs.push({ text: "> TACTICAL SHIELD DEPLOYED: +15% DEF", type: "buff" });
    }

    // 4. Apply Nerfs (Negative Synergy) with Elite Intelligence mitigation
    if (counts["Advanced Playmaker"] >= 2) {
      const penalty = 0.20 * nerfMultiplier;
      baseCon *= (1 - penalty);
      currentLogs.push({ text: `! SPATIAL CONGESTION: -${penalty * 100}% CON ${isElite ? '(Mitigated)' : ''}`, type: "nerf" });
    }
    if (activePlayers.length >= 6 && !counts["Anchor/Destroyer"]) {
      const penalty = 0.25 * nerfMultiplier;
      baseDef *= (1 - penalty);
      currentLogs.push({ text: `! MIDFIELD EXPOSED: -${penalty * 100}% DEF ${isElite ? '(Mitigated)' : ''}`, type: "nerf" });
    }
    if (counts["Target Man"] >= 2) {
      const penalty = 0.15 * nerfMultiplier;
      baseAtt *= (1 - penalty);
      currentLogs.push({ text: `! STATIC FRONTLINE: -${penalty * 100}% ATT ${isElite ? '(Mitigated)' : ''}`, type: "nerf" });
    }

    if (currentLogs.length === 0 || (currentLogs.length === 1 && isElite)) {
      currentLogs.push({ text: "> PARSING TACTICAL GEOMETRY...", type: "neutral" });
    }

    // 5. Calculate Target Score & Apply TALENT FLOOR
    let tacticalScore = Math.round((baseAtt + baseCon + baseDef) / 3);
    const talentFloor = currentRawTalent - 8;
    
    if (tacticalScore < talentFloor && activePlayers.length >= 5) {
      tacticalScore = talentFloor;
      currentLogs.push({ text: "⚠️ TALENT OVERRIDE: Raw skill preventing system collapse.", type: "system" });
    }

    const targetScore = Math.min(tacticalScore, 99);

    setScores({
      att: Math.min(Math.round(baseAtt), 99),
      con: Math.min(Math.round(baseCon), 99),
      def: Math.min(Math.round(baseDef), 99),
      ovr: targetScore
    });
    setLogs(currentLogs);

    // DECRYPTION ANIMATION EFFECT
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayScore(Math.floor(Math.random() * 99));
      iterations++;
      if (iterations >= 10) {
        clearInterval(interval);
        setDisplayScore(targetScore);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [pitchPlayers]);

  const getScoreColor = (score) => {
    if (score >= 85) return "bg-emerald-400 shadow-[0_0_15px_#34d399]";
    if (score >= 70) return "bg-cyan-400 shadow-[0_0_15px_#22d3ee]";
    if (score >= 50) return "bg-yellow-400 shadow-[0_0_15px_#facc15]";
    return "bg-red-500 shadow-[0_0_15px_#ef4444]";
  };

  const getTextColor = (score) => {
    if (score >= 85) return "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]";
    if (score >= 70) return "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]";
    if (score >= 50) return "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]";
    return "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]";
  };

  const activeCount = pitchPlayers.filter(p => p !== null).length;
  const hexHash = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();

  return (
    <div className="w-full h-full flex items-center justify-between gap-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent">
      
      {/* Background Tech Scanlines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] pointer-events-none" />
      <div className="absolute top-2 right-4 text-[8px] font-mono text-cyan-400/30 opacity-80 select-none">
        {hexHash} // AUTH: ROOT // SYS.ON
      </div>

      {/* LEFT: Dual Metric Display (Raw Talent vs Efficiency) */}
      <div className="flex gap-6 items-center min-w-[200px] relative z-10 pl-2">
        {/* RAW TALENT */}
        <div className="flex flex-col items-center">
          <span className="text-white/30 font-mono text-[9px] tracking-[0.2em] uppercase mb-1">Raw Talent</span>
          <div className="text-4xl font-black italic tracking-tighter text-white/50">
            {rawTalent > 0 ? rawTalent : "00"}
          </div>
        </div>
        
        {/* Divider / Multiplier visual */}
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent flex items-center justify-center relative">
          {isGalactico && (
             <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1 }}
               className="absolute bg-black border border-amber-400 text-amber-400 text-[8px] font-black px-1 rounded shadow-[0_0_10px_rgba(251,191,36,0.5)] z-20"
             >
               ELITE
             </motion.div>
          )}
        </div>

        {/* FINAL EFFICIENCY */}
        <div className="flex flex-col items-center relative">
          <span className="text-cyan-400/80 font-mono text-[10px] tracking-[0.3em] uppercase mb-1 drop-shadow-[0_0_5px_#22d3ee]">Efficiency</span>
          <div className={`text-6xl font-black italic tracking-tighter transition-colors duration-300 ${displayScore > 0 ? getTextColor(displayScore) : 'text-white/10'}`}>
            {displayScore > 0 ? displayScore : "00"}
          </div>
          {/* Status Bar */}
          <div className="absolute -bottom-3 w-full h-1 bg-white/10 rounded-full overflow-hidden flex">
            <motion.div animate={{ width: `${(activeCount / 11) * 100}%` }} className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          </div>
        </div>
      </div>

      {/* MIDDLE: Laser Progress Bars */}
      <div className="flex-1 flex flex-col gap-4 border-l border-white/5 pl-6 relative z-10">
        {[
          { label: "OFS / THT", name: "ATTACK THREAT", val: scores.att },
          { label: "MID / CTR", name: "SYSTEM CONTROL", val: scores.con },
          { label: "DEF / SHL", name: "DEFENSIVE SHIELD", val: scores.def }
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-3 group">
            <div className="flex flex-col w-32">
              <span className="text-[8px] font-mono text-white/30">{stat.label}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-cyan-400 transition-colors">{stat.name}</span>
            </div>
            
            <div className="flex-1 h-2 bg-[#050505] rounded-full overflow-hidden border border-white/10 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stat.val}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className={`h-full relative ${getScoreColor(stat.val)}`}
              >
                <div className="absolute top-0 right-0 w-3 h-full bg-white opacity-80 blur-[2px]" />
              </motion.div>
            </div>
            
            <div className={`w-8 text-right font-mono font-black italic text-lg ${stat.val > 0 ? 'text-white drop-shadow-md' : 'text-white/20'}`}>
              {stat.val > 0 ? stat.val : "-"}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: The Terminal Output Screen */}
      <div className="w-[340px] h-full bg-[#03080c] border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.05)_inset] rounded-lg p-3 flex flex-col relative z-10 overflow-hidden">
        
        {/* Terminal Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2 mb-2 bg-[#03080c] z-20">
           <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
             TACTICAL.LOG
           </span>
        </div>

        {/* Scrolling Log Output */}
        <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-2 pb-2">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div 
                key={i + log.text + Math.random()} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[9.5px] font-mono leading-relaxed border-l-2 pl-2 py-0.5 ${
                  log.type === "buff" ? "text-emerald-400 border-emerald-400 bg-emerald-400/5" : 
                  log.type === "nerf" ? "text-red-400 border-red-400 bg-red-400/5" : 
                  log.type === "system" ? "text-amber-400 border-amber-400 bg-amber-400/5 font-bold" :
                  "text-cyan-400/60 border-cyan-400/30"
                }`}
              >
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default SynergyHUD;