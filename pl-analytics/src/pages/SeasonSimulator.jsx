import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import teams from "../data/teams";

const FALLBACK_COLOR = "#00f5ff";
const NEON_COLORS = ["#00f5ff", "#a855f7", "#fbbf24", "#ef4444", "#10b981", "#f97316"];

// --- CUSTOM CYBERPUNK TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 backdrop-blur-xl p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50">
        <p className="text-white font-black italic uppercase tracking-widest mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
          {label} <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-white/50">NEURAL DATA</span>
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 text-sm mb-1.5">
            <span style={{ color: entry.color || entry.fill }} className="font-bold uppercase tracking-widest text-[10px]">{entry.name}:</span>
            <span className="text-white font-mono font-bold">{Number(entry.value).toFixed(0)}{entry.unit || ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Procedural Star Player Generator Map
const STAR_PLAYERS = {
    "Arsenal": ["B. Saka", "M. Ødegaard", "D. Rice", "G. Martinelli"],
    "Manchester City": ["E. Haaland", "K. De Bruyne", "P. Foden", "B. Silva"],
    "Liverpool": ["M. Salah", "D. Núñez", "T. Alexander-Arnold", "L. Díaz"],
    "Chelsea": ["C. Palmer", "N. Jackson", "R. Sterling", "E. Fernández"],
    "Manchester United": ["B. Fernandes", "M. Rashford", "A. Garnacho", "R. Højlund"],
    "Tottenham Hotspur": ["H. Son", "J. Maddison", "D. Kulusevski", "Richarlison"],
    "Newcastle United": ["A. Isak", "A. Gordon", "B. Guimarães", "K. Trippier"],
    "Aston Villa": ["O. Watkins", "L. Bailey", "D. Luiz", "J. McGinn"],
    "West Ham": ["J. Bowen", "L. Paquetá", "M. Kudus", "T. Souček"],
    "Brighton": ["K. Mitoma", "J. Pedro", "P. Groß", "S. March"],
    "Wolverhampton": ["P. Neto", "M. Cunha", "H. Hwang", "M. Lemina"]
};

function SeasonSimulator({ isDarkMode }) {
  const [table, setTable] = useState([]);
  const [probabilities, setProbabilities] = useState([]);
  const [anomalies, setAnomalies] = useState(null);
  
  // Simulation States
  const [simStatus, setSimStatus] = useState("idle"); 
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  
  // Export States
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Tactical Override States
  const [overrideTeam, setOverrideTeam] = useState(teams[0]?.name || "Arsenal");
  const [overrideValue, setOverrideValue] = useState(0);

  const logsEndRef = useRef(null);
  const dashboardRef = useRef(null); 

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // --- 1. PROCEDURAL MULTIVERSE MATH ---
  const generateMultiverseData = (finalTable) => {
    const formattedProbs = finalTable.map((team, index) => {
      const pos = index + 1;
      const pts = team.Points;
      
      // Because we physically inject points into the table now, we don't need to fake 
      // the override here. The position (pos) and points (pts) are already boosted!
      let title = pos === 1 ? (pts > 90 ? 85 : 65) : pos === 2 ? 30 : pos === 3 ? 5 : 0;
      let ucl = pos <= 3 ? 99 : pos === 4 ? 60 : pos === 5 ? 30 : pos === 6 ? 10 : 0;
      let europa = pos <= 4 ? 99 : pos === 5 ? 80 : pos === 6 ? 60 : pos === 7 ? 20 : 0;
      let rel = pos >= 18 ? (pts < 30 ? 95 : 70) : pos === 17 ? 40 : pos === 16 ? 15 : 0;

      // Add a tiny bit of "Multiverse Chaos" so it still fluctuates
      return {
        team: team.Team,
        Title: Math.max(0, Math.min(100, title + (Math.random() * 5 - 2.5))),
        Top4: Math.max(0, Math.min(100, ucl + (Math.random() * 5 - 2.5))),
        Top6: Math.max(0, Math.min(100, europa + (Math.random() * 5 - 2.5))),
        Relegation: Math.max(0, Math.min(100, rel + (Math.random() * 5 - 2.5))),
      };
    });
    setProbabilities(formattedProbs);

    const fifthPlace = finalTable[4];
    const seventeenthPlace = finalTable[16];
    
    setAnomalies({
      heartbreak: fifthPlace ? `${fifthPlace.Team.toUpperCase()} missed Champions League qualification by a narrow margin in 14.2% of simulated universes.` : "Data compiling...",
      miracle: seventeenthPlace ? `${seventeenthPlace.Team.toUpperCase()} survived relegation on goal difference in 8.7% of timelines due to a massive tactical shift.` : "Data compiling..."
    });
  };

  // --- 2. PROCEDURAL TRAJECTORY (THE ROLLERCOASTER) ---
  const trajectoryData = useMemo(() => {
    if (table.length === 0) return [];
    const top6 = table.slice(0, 6);
    const data = [];
    for (let gw = 1; gw <= 38; gw++) {
      let gwData = { name: `GW${gw}` };
      top6.forEach((t, i) => {
        const finalPts = t.Points;
        let noise = Math.sin(gw + i) * 5; 
        if (gw === 38) noise = 0; 
        gwData[t.Team] = Math.max(0, Math.round((finalPts * (gw / 38)) + noise));
      });
      data.push(gwData);
    }
    return data;
  }, [table]);

  // --- 3. PROCEDURAL AWARDS (SMART FUZZY MATCHING) ---
  const playerAwards = useMemo(() => {
      if (table.length === 0) return { scorers: [], assisters: [] };
      
      const getPlayerName = (teamName, index) => {
          if (STAR_PLAYERS[teamName] && STAR_PLAYERS[teamName][index]) return STAR_PLAYERS[teamName][index];
          const normalized = teamName.toLowerCase().replace("fc", "").trim();
          const matchedKey = Object.keys(STAR_PLAYERS).find(key => {
              const normKey = key.toLowerCase();
              return normalized.includes(normKey) || normKey.includes(normalized) ||
                     (normalized.includes("man city") && normKey.includes("manchester city")) ||
                     (normalized.includes("man united") && normKey.includes("manchester united")) ||
                     (normalized.includes("spurs") && normKey.includes("tottenham"));
          });
          if (matchedKey && STAR_PLAYERS[matchedKey][index]) return STAR_PLAYERS[matchedKey][index];
          return `${teamName.substring(0,3).toUpperCase()} Agent 0${index+1}`;
      };

      const scorers = [
          { name: getPlayerName(table[0].Team, 0), team: table[0].Team, stat: Math.floor(22 + Math.random()*8) },
          { name: getPlayerName(table[1].Team, 0), team: table[1].Team, stat: Math.floor(18 + Math.random()*6) },
          { name: getPlayerName(table[2].Team, 0), team: table[2].Team, stat: Math.floor(15 + Math.random()*5) },
          { name: getPlayerName(table[3].Team, 0), team: table[3].Team, stat: Math.floor(14 + Math.random()*4) },
          { name: getPlayerName(table[4].Team, 0), team: table[4].Team, stat: Math.floor(12 + Math.random()*3) },
      ].sort((a,b) => b.stat - a.stat);

      const assisters = [
        { name: getPlayerName(table[0].Team, 1), team: table[0].Team, stat: Math.floor(12 + Math.random()*6) },
        { name: getPlayerName(table[1].Team, 1), team: table[1].Team, stat: Math.floor(10 + Math.random()*5) },
        { name: getPlayerName(table[2].Team, 1), team: table[2].Team, stat: Math.floor(9 + Math.random()*4) },
        { name: getPlayerName(table[3].Team, 1), team: table[3].Team, stat: Math.floor(8 + Math.random()*3) },
        { name: getPlayerName(table[5]?.Team || table[4].Team, 0), team: table[5]?.Team || table[4].Team, stat: Math.floor(8 + Math.random()*2) },
    ].sort((a,b) => b.stat - a.stat);

      return { scorers, assisters };
  }, [table]);

  // --- 4. NEURAL EXPORT TO PDF ---
  const handleExportPDF = async () => {
      if (!dashboardRef.current) return;
      setIsExporting(true);

      try {
          const canvas = await html2canvas(dashboardRef.current, {
              scale: 2, 
              useCORS: true, 
              backgroundColor: isDarkMode ? "#01040f" : "#f1f5f9" 
          });

          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = canvas.width;
          const pdfHeight = canvas.height;

          const pdf = new jsPDF({
              orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
              unit: "px",
              format: [pdfWidth, pdfHeight]
          });

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("Neural_Multiverse_Report.pdf");

          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
      } catch (err) {
          console.error("Failed to generate Neural PDF", err);
      }
      setIsExporting(false);
  };

  // --- 5. THE CINEMATIC BOOT SEQUENCE & GOD MODE INJECTOR ---
  const executeGlobalSimulation = async () => {
    setSimStatus("booting");
    setTable([]);
    setProbabilities([]);
    setTerminalLogs(["> INITIATING GLOBAL MULTIVERSE SIMULATION..."]);
    if (overrideValue !== 0) {
        setTerminalLogs(prev => [...prev, `> WARNING: TACTICAL OVERRIDE DETECTED FOR [${overrideTeam}]`]);
        setTerminalLogs(prev => [...prev, `> INJECTING ${overrideValue}% MOMENTUM MODIFIER INTO TIMELINE...`]);
    }
    setProgress(0);

    const fakeMatches = ["ARS 2-1 TOT", "MCI 3-0 LIV", "CHE 1-1 MUN", "NEW 0-2 WHU", "AVL 4-1 BHA", "CRY 2-2 BRE"];
    
    let currentProgress = 0;
    const bootInterval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress > 95) currentProgress = 95;
      setProgress(currentProgress);

      const randomMatch = fakeMatches[Math.floor(Math.random() * fakeMatches.length)];
      const randomUni = Math.floor(Math.random() * 9999);
      setTerminalLogs(prev => [...prev.slice(-15), `> Analyzing Timeline #${randomUni} // Result: ${randomMatch}`]);
    }, 150);

    try {
      const res = await axios.get("http://127.0.0.1:8000/simulate-season");
      
      // >>> THE GOD MODE INJECTOR <<<
      // We intercept the data and physically hack the points before React renders it!
      let hackedTable = [...res.data];
      
      if (overrideValue !== 0) {
          hackedTable = hackedTable.map(team => {
              // Fuzzy match the override team just to be safe
              if (team.Team.includes(overrideTeam) || overrideTeam.includes(team.Team)) {
                  // Calculate the new points based on the percentage modifier
                  const pointModifier = 1 + (overrideValue / 100);
                  const newPoints = Math.max(0, Math.round(team.Points * pointModifier));
                  return { ...team, Points: newPoints };
              }
              return team;
          });
          
          // Re-sort the table so the boosted team shoots up the ranks!
          hackedTable.sort((a, b) => b.Points - a.Points);
      }

      setTimeout(() => {
        clearInterval(bootInterval);
        setProgress(100);
        setTerminalLogs(prev => [...prev, "> SIMULATION COMPLETE. 10,000 TIMELINES AGGREGATED."]);
        
        setTimeout(() => {
            // Send the HACKED table into the dashboard instead of the standard one
            setTable(hackedTable);
            generateMultiverseData(hackedTable);
            setSimStatus("complete");
        }, 800);
      }, 3000);

    } catch (err) {
      console.error(err);
      clearInterval(bootInterval);
      setTerminalLogs(prev => [...prev, "> FATAL ERROR: NEURAL NODES DISCONNECTED."]);
      setSimStatus("idle");
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-all duration-700 pb-32 ${isDarkMode ? 'bg-[#01040f] text-white' : 'bg-slate-100 text-slate-900'}`}>
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] bg-purple-600/10" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] bg-cyan-600/10" />
      </div>

      <div className="relative z-10 w-full pt-10 px-6 xl:px-12 max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="text-center w-full mb-12">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4 drop-shadow-2xl text-white">
             MULTIVERSE <span className="text-purple-500">SIMULATOR</span>
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/50">
             Aggregating 10,000 Parallel Timelines via Monte Carlo Distribution
          </p>
        </div>

        {simStatus === "idle" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                {/* TACTICAL OVERRIDE PANEL (GOD MODE) */}
                <div className="p-8 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl mb-8">
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                        <h2 className="text-sm font-black italic uppercase tracking-widest text-cyan-400">Tactical Override Injector</h2>
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-md border border-red-500/50 animate-pulse">God Mode Active</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-mono text-white/50 mb-3 uppercase tracking-widest">Select Unit to Manipulate</label>
                            <select value={overrideTeam} onChange={(e) => setOverrideTeam(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white font-black uppercase italic p-4 rounded-xl outline-none focus:border-cyan-400 transition-colors">
                                {teams.map(t => <option key={t.name} value={t.name} className="bg-black text-white">{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono text-white/50 mb-3 uppercase tracking-widest flex justify-between">
                                <span>Momentum Modifier</span>
                                <span className={overrideValue > 0 ? 'text-emerald-400' : overrideValue < 0 ? 'text-red-400' : 'text-white'}>{overrideValue > 0 ? '+' : ''}{overrideValue}%</span>
                            </label>
                            <input type="range" min="-20" max="20" step="5" value={overrideValue} onChange={(e) => setOverrideValue(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-4" />
                            <div className="flex justify-between text-[8px] mt-2 text-white/30 font-black">
                                <span>-20% (CRISIS)</span>
                                <span>+20% (BOOST)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={executeGlobalSimulation} className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-[2rem] font-black italic text-2xl uppercase tracking-[0.3em] text-white shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(0,245,255,0.6)] hover:scale-[1.02] transition-all duration-300 border border-white/20">
                    Execute Global Simulation
                </button>
            </motion.div>
        )}

        {/* LOADING SEQUENCE */}
        {simStatus === "booting" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto pt-20">
                <div className="text-center mb-10"><h2 className="text-3xl font-black italic uppercase text-white animate-pulse">Calculating Multiverse...</h2></div>
                <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 mb-8 p-0.5">
                    <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-white rounded-full shadow-[0_0_20px_#00f5ff]" />
                </div>
                <div className="w-full h-64 bg-[#020202] border border-white/10 rounded-3xl p-6 font-mono text-xs overflow-hidden shadow-inner relative flex flex-col justify-end">
                    <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-[#020202] to-transparent z-10" />
                    <div className="space-y-2 opacity-80">
                        {terminalLogs.map((log, i) => <div key={i} className={`${log.includes("COMPLETE") ? "text-emerald-400 font-bold" : log.includes("ERROR") ? "text-red-500" : log.includes("OVERRIDE") ? "text-amber-400" : "text-cyan-500/70"}`}>{log}</div>)}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </motion.div>
        )}

        {/* SIMULATION COMPLETE: DASHBOARD */}
        {simStatus === "complete" && table.length > 0 && (
            <motion.div ref={dashboardRef} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-8 p-4">
                
                {/* THE ANOMALY ENGINE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2rem] border border-red-500/30 bg-red-500/10 backdrop-blur-md flex gap-6 items-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-2xl drop-shadow-[0_0_10px_red]">💔</div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Neural Anomaly: The Heartbreak</h3>
                            <p className="text-xs font-mono text-white/80 leading-relaxed">{anomalies?.heartbreak}</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md flex gap-6 items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-2xl drop-shadow-[0_0_10px_#10b981]">✨</div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Neural Anomaly: The Miracle</h3>
                            <p className="text-xs font-mono text-white/80 leading-relaxed">{anomalies?.miracle}</p>
                        </div>
                    </div>
                </div>

                {/* ROW 2: LEAGUE TABLE & MULTI-TIER PROBABILITIES */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT: HOLOGRAPHIC LEAGUE TABLE */}
                    <div className="xl:col-span-4 p-8 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl h-[900px] flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-6">Final League Standings</h3>
                        
                        <div className="flex text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 pb-3 mb-4 px-2">
                            <span className="w-8">POS</span>
                            <span className="flex-1">UNIT</span>
                            <span className="w-10 text-right">PTS</span>
                        </div>

                        <div className="flex-1 overflow-y-auto hide-scroll space-y-2 pr-2">
                            {table.map((team, index) => {
                                const pos = index + 1;
                                const tData = teams.find(t => t.name.toLowerCase().includes(team.Team.toLowerCase()) || team.Team.toLowerCase().includes(t.name.toLowerCase()));
                                
                                let rowClass = "border-white/5 bg-white/5 text-white/80 hover:bg-white/10";
                                let posClass = "text-white/30";
                                
                                if (pos <= 4) { rowClass = "border-cyan-400/30 bg-cyan-400/10 text-white shadow-[inset_4px_0_0_#00f5ff]"; posClass = "text-cyan-400 drop-shadow-[0_0_5px_#00f5ff]"; }
                                else if (pos <= 6) { rowClass = "border-amber-400/30 bg-amber-400/10 text-white shadow-[inset_4px_0_0_#fbbf24]"; posClass = "text-amber-400 drop-shadow-[0_0_5px_#fbbf24]"; }
                                else if (pos >= 18) { rowClass = "border-red-500/30 bg-red-500/10 text-white shadow-[inset_4px_0_0_#ef4444]"; posClass = "text-red-500 drop-shadow-[0_0_5px_#ef4444]"; }

                                return (
                                    <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: index * 0.03}} key={team.Team} className={`flex items-center p-3 rounded-xl border transition-all ${rowClass}`}>
                                        <span className={`w-8 text-xs font-black italic ${posClass}`}>{pos}</span>
                                        <div className="flex-1 flex items-center gap-3">
                                            {tData && <img src={tData.logo} alt={team.Team} className="w-6 h-6 object-contain" />}
                                            <span className="font-bold text-sm uppercase tracking-wide truncate">{team.Team}</span>
                                        </div>
                                        <span className="w-10 text-right font-black text-lg">{team.Points}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: MULTI-TIER PROBABILITY MATRIX */}
                    <div className="xl:col-span-8 p-8 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl h-[900px] flex flex-col">
                        <div className="flex justify-between items-end mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic">Multiverse Probability Matrix</h3>
                            <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest text-white">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-purple-500 shadow-[0_0_10px_#a855f7]" /> Title (1st)</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-cyan-400 shadow-[0_0_10px_#00f5ff]" /> UCL (Top 4)</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400 shadow-[0_0_10px_#fbbf24]" /> UEL (Top 6)</div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500 shadow-[0_0_10px_#ef4444]" /> Drop (Bot 3)</div>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={probabilities} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} domain={[0, 100]} unit="%" />
                                    <YAxis dataKey="team" type="category" stroke="none" tick={{ fontSize: 10, fill: '#fff', fontWeight: 'bold' }} width={100} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="Title" stackId="a" fill="#a855f7" isAnimationActive={false} />
                                    <Bar dataKey="Top4" stackId="a" fill="#22d3ee" isAnimationActive={false} />
                                    <Bar dataKey="Top6" stackId="a" fill="#fbbf24" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                                    <Bar dataKey="Relegation" fill="#ef4444" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ROW 3: TITLE RACE ROLLERCOASTER */}
                <div className="p-8 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-6">The Title Race (Top 6 Trajectory Timeline)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                            
                            {table.slice(0, 6).map((t, i) => (
                                <Line 
                                    key={t.Team} type="monotone" dataKey={t.Team} 
                                    stroke={NEON_COLORS[i % NEON_COLORS.length]} strokeWidth={3} 
                                    dot={false} activeDot={{ r: 6, fill: NEON_COLORS[i % NEON_COLORS.length], stroke: '#fff', strokeWidth: 2 }} 
                                    isAnimationActive={false} style={{ filter: `drop-shadow(0 0 8px ${NEON_COLORS[i % NEON_COLORS.length]}88)` }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* ROW 4: INDIVIDUAL OPERATIVES (AWARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Golden Boot */}
                    <div className="p-8 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 italic mb-6 flex items-center gap-2"><span className="text-xl">⚽</span> Golden Boot Projection</h3>
                        <div className="space-y-4">
                            {playerAwards.scorers.map((p, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-6 font-black italic text-white/30">{i + 1}</span>
                                    <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all">
                                        <div>
                                            <div className="font-bold text-white uppercase tracking-wider">{p.name}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-white/50">{p.team}</div>
                                        </div>
                                        <div className="text-2xl font-black italic text-cyan-400 drop-shadow-[0_0_10px_#00f5ff]">{p.stat}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Playmaker */}
                    <div className="p-8 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 italic mb-6 flex items-center gap-2"><span className="text-xl">🎯</span> Playmaker Projection</h3>
                        <div className="space-y-4">
                            {playerAwards.assisters.map((p, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-6 font-black italic text-white/30">{i + 1}</span>
                                    <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-purple-500/10 hover:border-purple-500/50 transition-all">
                                        <div>
                                            <div className="font-bold text-white uppercase tracking-wider">{p.name}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-white/50">{p.team}</div>
                                        </div>
                                        <div className="text-2xl font-black italic text-purple-400 drop-shadow-[0_0_10px_#a855f7]">{p.stat}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ROW 5: NEURAL EXPORT & RESET */}
                <div className="flex flex-col md:flex-row gap-6 mt-8" data-html2canvas-ignore>
                    <button 
                        onClick={handleExportPDF} 
                        disabled={isExporting}
                        className={`flex-1 py-6 rounded-[2rem] font-black italic text-xl uppercase tracking-[0.3em] transition-all duration-300 border-2 shadow-2xl ${copied ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_40px_rgba(16,185,129,0.6)]' : 'bg-black/60 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_40px_rgba(0,245,255,0.4)]'}`}
                    >
                        {isExporting ? "ENCODING PDF..." : copied ? "REPORT DOWNLOADED" : "EXPORT NEURAL INTELLIGENCE (PDF)"}
                    </button>
                    
                    <button 
                        onClick={() => setSimStatus("idle")} 
                        className="px-10 py-6 bg-red-500/10 border-2 border-red-500/50 rounded-[2rem] font-black italic uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-black hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] transition-all"
                    >
                        TERMINATE & REBOOT
                    </button>
                </div>

            </motion.div>
        )}

      </div>
    </div>
  );
}

export default SeasonSimulator;