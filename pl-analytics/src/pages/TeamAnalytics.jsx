import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, ScatterChart, Scatter, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, ReferenceLine,
  AreaChart, Area, PieChart, Pie
} from "recharts";
import teams from "../data/teams";

const FALLBACK_COLOR = "#00f5ff";

// --- CUSTOM CYBERPUNK TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/10 backdrop-blur-md p-4 rounded-xl shadow-2xl z-50">
        <p className="text-white font-black italic uppercase tracking-widest mb-2 border-b border-white/10 pb-2">{label || payload[0]?.payload?.name || "DATA"}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <span style={{ color: entry.color || entry.fill || FALLBACK_COLOR }} className="font-bold uppercase tracking-widest text-[10px]">{entry.name}:</span>
            <span className="text-white font-mono">{Number(entry.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function TeamAnalytics({ isDarkMode }) {
  const [teamsData, setTeamsData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamForm, setTeamForm] = useState([]);
  const [keyOperatives, setKeyOperatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Terminal Typing State
  const [terminalText, setTerminalText] = useState("");
  const [displayedTerminal, setDisplayedTerminal] = useState("");

  const teamScrollRef = useRef(null);
  const smoothTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  // 1. Initial Fetch
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/team-strengths")
      .then(res => setTeamsData(res.data))
      .catch(err => console.error("Error fetching strengths:", err));
  }, []);

  // 2. ULTRA-FAST Terminal Typewriter Effect
  useEffect(() => {
    if (!terminalText) return;
    let i = 0;
    setDisplayedTerminal("");
    const timer = setInterval(() => {
      i += 4; 
      setDisplayedTerminal(terminalText.substring(0, i));
      if (i >= terminalText.length) clearInterval(timer);
    }, 10);
    return () => clearInterval(timer);
  }, [terminalText]);

  // 3. FAST CONCURRENT FETCHING LOGIC
  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    setIsLoading(true);
    setTeamForm([]);
    setKeyOperatives([]);
    setTerminalText("");
    setDisplayedTerminal("");

    try {
      const [formRes, squadRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/team-form?team=${team.name}`).catch(() => ({ data: [] })),
        axios.get(`http://127.0.0.1:8000/get-squad?team=${team.name}`).catch(() => ({ data: [] }))
      ]);

      const currentForm = Array.isArray(formRes.data) ? formRes.data : [];
      setTeamForm(currentForm);

      const currentSquad = Array.isArray(squadRes.data) ? squadRes.data.sort((a, b) => Number(b.Rating) - Number(a.Rating)).slice(0, 3) : [];
      setKeyOperatives(currentSquad);

      // Generate Terminal Text
      const stats = teamsData.find(t => t.Team === team.name);
      const rating = calculateRating(stats);
      const formString = currentForm.length > 0 ? currentForm.slice(0,5).join("-") : "DATA UNAVAILABLE";
      const attackStat = Number(stats?.HomeAttack || 0);
      const defStat = Number(stats?.HomeDefense || 0);
      
      const summary = `> INITIATING NEURAL SCAN: ${team.name.toUpperCase()}...\n> OVERALL RATING: ${rating}\n> RECENT FORM PROTOCOL: [${formString}]\n> TACTICAL DIAGNOSTIC: ${attackStat > 1.5 ? 'High-yield offensive unit detected.' : 'Conservative attacking metrics.'} ${defStat < 1.0 ? 'Fortified defensive structure.' : 'Vulnerabilities detected in defensive transition.'}\n> RECOMMENDED COUNTER-MEASURE: Exploit numerical overloads in wide areas during transition phases.`;
      
      setTerminalText(summary);
    } catch (err) {
      console.error("Error fetching team details:", err);
      setTerminalText("> ERROR: NEURAL LINK SEVERED. UNABLE TO GENERATE SUMMARY.");
    }
    setIsLoading(false);
  };

  const scrollTeams = (direction) => {
    if (teamScrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      teamScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const activeColor = selectedTeam?.color || FALLBACK_COLOR;
  const targetStats = teamsData.find(t => t.Team === selectedTeam?.name);

  const calculateRating = (stats) => {
    if (!stats) return 0;
    const att = Number(stats.HomeAttack);
    const def = Number(stats.HomeDefense);
    const base = (att * 40) + (20 / Math.max(def, 0.1));
    return Math.min(99, Math.max(50, Math.round(base)));
  };

  // --- MEMOIZED PROCEDURAL DATA (Stops the Dancing Graph Bug!) ---
  const deltaData = useMemo(() => {
    if (!targetStats) return [];
    const att = Number(targetStats.HomeAttack);
    return Array.from({length: 5}).map((_, i) => {
      const actual = Math.max(0, Math.round(att + (Math.random() * 2 - 1)));
      const xG = Math.max(0, actual + (Math.random() * 1.5 - 0.5)).toFixed(2);
      return { match: `M${i+1}`, Actual: actual, xG: Number(xG) };
    });
  }, [targetStats]);

  const threatData = useMemo(() => {
    if (!selectedTeam) return [];
    const seed = selectedTeam.name.length;
    let left = 25 + (seed * 2) % 20;
    let right = 25 + (seed * 3) % 20;
    let center = 100 - left - right;
    return [
      { name: "Left Flank", value: left, color: activeColor },
      { name: "Central", value: center, color: "#ffffff" },
      { name: "Right Flank", value: right, color: `${activeColor}66` }
    ];
  }, [selectedTeam, activeColor]);

  const avgAttack = teamsData.reduce((acc, curr) => acc + Number(curr.HomeAttack), 0) / (teamsData.length || 1);
  const avgDefense = teamsData.reduce((acc, curr) => acc + Number(curr.HomeDefense), 0) / (teamsData.length || 1);
  
  const scatterData = useMemo(() => teamsData.map(t => ({
    name: t.Team, 
    attack: Number(t.HomeAttack), 
    defense: Number(t.HomeDefense), 
    isTarget: selectedTeam && t.Team === selectedTeam?.name
  })), [teamsData, selectedTeam]);

  const radarData = useMemo(() => targetStats ? [
    { metric: "Home Attack", team: Number(targetStats.HomeAttack), avg: avgAttack },
    { metric: "Home Defense", team: Number(targetStats.HomeDefense), avg: avgDefense },
    { metric: "Away Attack", team: Number(targetStats.HomeAttack) * 0.8, avg: avgAttack * 0.8 }, 
    { metric: "Away Defense", team: Number(targetStats.HomeDefense) * 1.2, avg: avgDefense * 1.2 },
  ] : [], [targetStats, avgAttack, avgDefense]);

  const topAttackers = useMemo(() => [...teamsData]
    .sort((a, b) => Number(b.HomeAttack) - Number(a.HomeAttack))
    .slice(0, 8)
    .map(t => ({
      name: t.Team, 
      Attack: Number(t.HomeAttack), 
      isTarget: selectedTeam && t.Team === selectedTeam?.name
    })), [teamsData, selectedTeam]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-all duration-700 pb-32 ${isDarkMode ? 'bg-[#01040f] text-white' : 'bg-slate-100 text-slate-900'}`}>
      
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="relative z-10 w-full pt-10">
        
        {/* HEADER & CAROUSEL */}
        <div className="text-center w-full mb-10">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-8 drop-shadow-2xl text-white">TACTICAL <span className="text-cyan-400">ANALYTICS</span></h1>
          
          <div className="relative max-w-7xl mx-auto px-12 group">
            <button onClick={() => scrollTeams("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/80 border border-white/10 rounded-full text-white hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100">&#10094;</button>

            <div ref={teamScrollRef} className="flex justify-start gap-4 overflow-x-auto hide-scroll py-4 px-2 snap-x snap-mandatory scroll-smooth">
              {teams.map((t) => (
                <motion.div 
                  key={t.name} whileHover={{ scale: 1.15, y: -5 }} onClick={() => handleTeamSelect(t)} 
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer border-2 transition-all snap-center ${
                    selectedTeam?.name === t.name ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.4)]' : 'border-white/10 bg-black/40 hover:bg-white/5'
                  }`}
                  style={selectedTeam?.name === t.name ? { borderColor: t.color, backgroundColor: `${t.color}33`, boxShadow: `0 0 20px ${t.color}55` } : {}}
                >
                  <img src={t.logo} className={`w-10 h-10 object-contain drop-shadow-lg transition-all ${selectedTeam?.name !== t.name ? 'grayscale opacity-50' : ''}`} alt={t.name} />
                </motion.div>
              ))}
            </div>

            <button onClick={() => scrollTeams("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/80 border border-white/10 rounded-full text-white hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100">&#10095;</button>
            <div className={`absolute top-0 left-8 w-16 h-full bg-gradient-to-r ${isDarkMode ? 'from-[#01040f]' : 'from-slate-100'} to-transparent pointer-events-none z-10`} />
            <div className={`absolute top-0 right-8 w-16 h-full bg-gradient-to-l ${isDarkMode ? 'from-[#01040f]' : 'from-slate-100'} to-transparent pointer-events-none z-10`} />
          </div>
        </div>

        {/* MAIN DASHBOARD */}
        <AnimatePresence mode="wait">
          {!selectedTeam ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-64 opacity-20 text-4xl font-black italic uppercase tracking-tighter text-white">
               Select a unit to initiate analysis
            </motion.div>
          ) : (
            <motion.div key={selectedTeam.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={smoothTransition} className="max-w-7xl mx-auto px-10 space-y-6">
              
              {/* ROW 1: HERO PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="col-span-1 p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl flex items-center justify-between overflow-hidden relative group">
                  <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 blur-2xl" style={{ backgroundColor: activeColor }} />
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1">{selectedTeam.name}</h2>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">Neural Profile Active</span>
                  </div>
                  <div className="relative z-10 w-24 h-24 rounded-full border-4 flex items-center justify-center bg-black/60 shadow-2xl" style={{ borderColor: activeColor, boxShadow: `0 0 30px ${activeColor}44` }}>
                     <span className="text-3xl font-black italic text-white drop-shadow-md">{calculateRating(targetStats)}</span>
                     <span className="absolute -bottom-2 bg-[#01040f] px-2 text-[8px] font-bold uppercase tracking-widest text-white/50">OVR</span>
                  </div>
                </div>

                <div className="col-span-2 p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl flex flex-col justify-center relative">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic absolute top-8 left-8">Momentum Circuit (Last 5)</h3>
                  {isLoading ? (
                     <div className="h-12 w-full flex items-center justify-center animate-pulse text-[10px] font-mono tracking-widest text-white/30">Extracting match logs...</div>
                  ) : teamForm.length === 0 ? (
                     <div className="h-12 w-full flex items-center justify-center text-[10px] font-mono tracking-widest text-red-400">DATA UNAVAILABLE IN NEURAL DB</div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {teamForm.slice(0, 5).map((result, i) => (
                        <div key={i} className="flex items-center">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, ...smoothTransition }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                              result === 'W' ? 'text-emerald-400 border-emerald-400 bg-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 
                              result === 'L' ? 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
                              'text-yellow-400 border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                            }`}
                          >
                            {result}
                          </motion.div>
                          {i < Math.min(teamForm.length, 5) - 1 && <motion.div initial={{ width: 0 }} animate={{ width: "2rem" }} transition={{ delay: (i * 0.1) + 0.1 }} className="h-[2px] bg-white/10" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2: KEY OPERATIVES & NEURAL TERMINAL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Key Operatives */}
                <div className="col-span-2 p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl relative min-h-[200px]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-6">Core Processing Units (Top Operatives)</h3>
                  {isLoading ? (
                     <div className="flex items-center justify-center animate-pulse text-[10px] font-mono tracking-widest text-white/30 h-24">Scanning Roster...</div>
                  ) : keyOperatives.length === 0 ? (
                     <div className="flex items-center justify-center text-[10px] font-mono tracking-widest text-red-400 h-24">SQUAD DATA UNAVAILABLE</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {keyOperatives.map((player, i) => (
                        <motion.div key={player.Name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: activeColor }} />
                           <img src={player.ImageUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-white/10 group-hover:border-white/50 transition-all" alt={player.Name} />
                           <span className="text-white font-black italic uppercase text-sm leading-tight">{player.Name}</span>
                           <span className="text-[9px] uppercase tracking-widest text-white/50 mt-1">{player.Position}</span>
                           <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-md bg-black/60 border border-white/10" style={{ color: activeColor }}>{player.Rating}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Neural Terminal */}
                <div className="col-span-1 p-6 rounded-[3rem] border border-white/5 bg-[#050505] shadow-inner relative overflow-hidden flex flex-col min-h-[200px]">
                   <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-[8px] font-mono text-white/30 tracking-widest uppercase">Terminal_v2.0</span>
                   </div>
                   <p className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed opacity-90 flex-1 overflow-y-auto hide-scroll">
                     {displayedTerminal}
                     <span className="animate-pulse bg-emerald-400 w-2 h-4 inline-block align-middle ml-1" />
                   </p>
                </div>
              </div>

              {/* ROW 3: PERFORMANCE DELTA & THREAT VECTORS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Performance Delta (Area Chart) */}
                <div className="col-span-2 p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl h-[350px] flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-2">Performance Delta (xG vs Actual)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={deltaData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorXG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="match" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="xG" stroke={activeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorXG)" isAnimationActive={false} />
                      <Area type="step" dataKey="Actual" stroke="#ffffff" strokeWidth={2} fill="none" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Threat Vectors (Donut Chart) */}
                <div className="col-span-1 p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl h-[350px] flex flex-col items-center justify-center relative">
                  <h3 className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic">Tactical Vectors</h3>
                  <ResponsiveContainer width="100%" height="100%" className="mt-8">
                    <PieChart>
                      <Pie data={threatData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={false}>
                        {threatData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}88)` }} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} cursor={false} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-8 flex gap-4 text-[8px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: activeColor}}/> Left</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white"/> Center</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: `${activeColor}66`}}/> Right</div>
                  </div>
                </div>

              </div>

              {/* ROW 4: QUADRANT & RADAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* THE QUADRANT */}
                <div className="p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl h-[400px] flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-6">Tactical Landscape</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" dataKey="attack" name="Attack xG" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis type="number" dataKey="defense" name="Defense xGA" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
                      <ReferenceLine x={avgAttack} stroke="rgba(255,255,255,0.1)" />
                      <ReferenceLine y={avgDefense} stroke="rgba(255,255,255,0.1)" />
                      <Scatter data={scatterData} isAnimationActive={false}>
                        {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isTarget ? activeColor : "rgba(255,255,255,0.1)"} style={entry.isTarget ? { filter: `drop-shadow(0 0 10px ${activeColor})` } : {}} r={entry.isTarget ? 10 : 5} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* NEURAL RADAR */}
                <div className="p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl h-[400px] flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 blur-3xl pointer-events-none" style={{ backgroundColor: activeColor }} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-2 relative z-10">Unit Signature vs League Avg</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Radar name="League Avg" dataKey="avg" stroke="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.05)" fillOpacity={1} isAnimationActive={false} />
                      <Radar name={selectedTeam.name} dataKey="team" stroke={activeColor} fill={activeColor} fillOpacity={0.4} style={{ filter: `drop-shadow(0 0 10px ${activeColor}88)` }} isAnimationActive={false} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

              </div>

              {/* ROW 5: TOP LEAGUE ATTACKERS */}
              <div className="p-8 rounded-[3rem] border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl h-[400px] flex flex-col">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic mb-6">Offensive Power Rankings (Top 8)</h3>
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topAttackers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9, fill: '#888', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                    <Bar dataKey="Attack" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {topAttackers.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isTarget ? activeColor : "rgba(255,255,255,0.1)"} 
                          style={entry.isTarget ? { filter: `drop-shadow(0 0 10px ${activeColor}66)` } : {}}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default TeamAnalytics;