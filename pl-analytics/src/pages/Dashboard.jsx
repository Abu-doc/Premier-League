import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ScatterChart, Scatter, ZAxis, LineChart, Line
} from "recharts";

const NEON_CYAN = "#00f5ff";
const VIBRANT_PURPLE = "#7000ff";

// --- DYNAMIC DATA ---
const tickerNews = [
  "SIMULATION 4.2: MAN CITY REMAIN TITLE FAVORITES AT 60.4%",
  "NEURAL FEED: ARSENAL DEFENSIVE BLOCK EFFICIENCY INCREASED BY 4.2%",
  "MATCHDAY PREDICTION: 72% PROBABILITY OF OVER 2.5 GOALS IN NEXT FIXTURES",
  "SYSTEM STATUS: ALL POISSON NODES OPERATIONAL /// LIVE DATA INGEST ACTIVE",
];

const diagnosticLogs = [
  "[SYS]: Neural Engine v4.2 Initialized.",
  "[DATA]: Processing 10k Poisson iterations for Selected Matrix.",
  "[COMPUTING]: Calculating lambda_Home weightings...",
  "[INTEL]: Haaland xG index calibrated to 2.4.",
  "[SYS]: Connection to Uvicorn stable at 127.0.0.1:8000.",
  "[ALERT]: Goal probability spiked in Offensive Zone 14.",
  "[DATA]: Real-time Poisson parameters synced.",
  "[SYS]: Analyzing Defensive Aggression Patterns...",
  "[INTEL]: High volatility detected in Chelsea defensive line.",
  "[COMPUTING]: Normalizing Yellow Card distribution...",
  "[DATA]: Simulation stable. Awaiting user input.",
];

const statsCarousel = [
  { 
    title: "Golden Boot Race", 
    players: [
      { name: "Haaland", val: "27", label: "Goals", img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png" },
      { name: "Salah", val: "22", label: "Goals", img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p118748.png" },
      { name: "Saka", val: "19", label: "Goals", img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p223340.png" }
    ],
    playerRadar: [
      { subject: 'Finish', A: 145 }, { subject: 'xG', A: 140 }, { subject: 'Speed', A: 130 }, { subject: 'Power', A: 120 }, { subject: 'Ariel', A: 110 }
    ]
  },
  { 
    title: "Creative Masters", 
    players: [
      { name: "De Bruyne", val: "18", label: "Assists", img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p61365.png" },
      { name: "Palmer", val: "15", label: "Assists", img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p473023.png" },
      { name: "Odegaard", val: "12", label: "Assists", img: "https://resources.premierleague.com/premierleague/photos/players/250x250/p141741.png" }
    ],
    playerRadar: [
      { subject: 'Vision', A: 148 }, { subject: 'Pass', A: 145 }, { subject: 'Tech', A: 140 }, { subject: 'Cross', A: 120 }, { subject: 'Drill', A: 115 }
    ]
  }
];

function Dashboard({ isDarkMode, toggleTheme }) {
  const [allTeams, setAllTeams] = useState([]);
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [attackMod, setAttackMod] = useState(1.0);
  const [defenseMod, setDefenseMod] = useState(1.0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/team-strengths");
        const sorted = [...res.data].sort((a, b) => b.HomeAttack - a.HomeAttack);
        setAllTeams(sorted);
        setTeamA(sorted[0]);
        setTeamB(sorted[1]);
      } catch (err) { console.error(err); }
    };
    fetchData();
    const interval = setInterval(() => setCarouselIndex(prev => (prev + 1) % statsCarousel.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const radarData = (teamA && teamB) ? [
    { subject: 'Attack', A: teamA.HomeAttack * 60 * attackMod, B: teamB.HomeAttack * 60 },
    { subject: 'Defense', A: (1 / teamA.HomeDefense) * 100 * defenseMod, B: (1 / teamB.HomeDefense) * 100 },
    { subject: 'Consistency', A: 85, B: 80 },
    { subject: 'Form', A: 92, B: 88 },
    { subject: 'xG Index', A: (teamA.HomeAttack / teamA.HomeDefense) * 45, B: (teamB.HomeAttack / teamB.HomeDefense) * 45 },
  ] : [];

  return (
    <div className={`p-4 pl-24 space-y-16 relative pb-64 overflow-x-hidden ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      
      {/* 1. HEADER */}
      <div className={`p-10 rounded-[3.5rem] border backdrop-blur-2xl flex justify-between items-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl shadow-black' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex items-center gap-10">
          <button onClick={toggleTheme} className="text-6xl cursor-pointer hover:rotate-12 transition">⚽️</button>
          <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">PL <span className="text-cyan-500">ULTRA</span></h1>
        </div>
        <div className="hidden lg:flex flex-col items-end gap-3">
            <span className="text-xs font-black uppercase text-cyan-400 italic">Live Win Probability</span>
            <div className="w-80 h-4 bg-gray-700/30 rounded-full overflow-hidden flex border border-white/10">
                <motion.div animate={{ width: `${45 * attackMod}%` }} className="h-full bg-cyan-500 shadow-[0_0_15px_#00f5ff]" />
                <div style={{ width: '25%' }} className="h-full bg-slate-500" />
                <motion.div animate={{ width: `${30 / defenseMod}%` }} className="h-full bg-purple-600 shadow-[0_0_15px_#7000ff]" />
            </div>
        </div>
      </div>

      {/* 2. DIAGNOSTIC ROW */}
      <div className="lg:col-span-12 p-10 rounded-[4rem] border border-cyan-500/30 bg-black/80 backdrop-blur-3xl font-mono space-y-4 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
             <span className="text-green-500 font-bold uppercase tracking-widest text-lg italic">Command Line Diagnostic</span>
             <span className="flex items-center gap-3 text-red-500 text-xs font-black uppercase animate-pulse">● Live Stream</span>
          </div>
          <div className="h-40 overflow-y-auto custom-scrollbar text-white/90 space-y-4 text-base">
            {diagnosticLogs.map((log, i) => (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                <span className="text-cyan-500 mr-4">{"#"}</span>{log}
              </motion.p>
            ))}
          </div>
      </div>

      {/* 3. THE "TACTICAL ENGINE" ROW (RADAR & OVERDRIVE SIDE BY SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ENGINE OVERDRIVE */}
        <div className={`lg:col-span-4 p-10 rounded-[3.5rem] border backdrop-blur-3xl flex flex-col gap-10 ${isDarkMode ? 'bg-black/60 border-cyan-500/20 shadow-2xl shadow-black' : 'bg-slate-50 border-slate-300 shadow-lg'}`}>
          <h2 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em]">Engine Overdrive</h2>
          <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500"><span>Attack Boost</span><span className="text-cyan-400">x{attackMod.toFixed(1)}</span></div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={attackMod} onChange={(e) => setAttackMod(parseFloat(e.target.value))} className="w-full accent-cyan-500 cursor-pointer" />
            </div>
            <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500"><span>Defense Shield</span><span className="text-purple-500">x{defenseMod.toFixed(1)}</span></div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={defenseMod} onChange={(e) => setDefenseMod(parseFloat(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
            </div>
          </div>
          <div className={`mt-auto p-5 rounded-3xl border ${isDarkMode ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-white border-slate-200'}`}>
             <p className="text-[10px] font-mono text-cyan-500 leading-relaxed uppercase italic">
                [GOD_MODE]: Real-time lambda modification enabled.
             </p>
          </div>
        </div>

        {/* VS RADAR */}
        <div className={`lg:col-span-8 p-10 rounded-[3.5rem] border backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl'}`}>
           <div className="flex justify-between items-center mb-8 relative z-10">
              <select className={`bg-transparent font-black uppercase text-sm outline-none cursor-pointer ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} value={teamA?.Team} onChange={(e) => setTeamA(allTeams.find(t => t.Team === e.target.value))}>
                {allTeams.map(t => <option key={t.Team} value={t.Team} className="bg-black text-white">{t.Team}</option>)}
              </select>
              <span className="text-2xl font-black italic text-gray-400">VS</span>
              <select className={`bg-transparent font-black uppercase text-sm outline-none text-right cursor-pointer ${isDarkMode ? 'text-purple-500' : 'text-purple-600'}`} value={teamB?.Team} onChange={(e) => setTeamB(allTeams.find(t => t.Team === e.target.value))}>
                {allTeams.map(t => <option key={t.Team} value={t.Team} className="bg-black text-white">{t.Team}</option>)}
              </select>
           </div>
           <ResponsiveContainer width="100%" height={320}>
             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
               <PolarGrid stroke="#88888844" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
               <Radar name="Team A" dataKey="A" stroke={NEON_CYAN} fill={NEON_CYAN} fillOpacity={0.5} />
               <Radar name="Team B" dataKey="B" stroke={VIBRANT_PURPLE} fill={VIBRANT_PURPLE} fillOpacity={0.3} />
               <Tooltip content={<CustomMatrixTooltip isDarkMode={isDarkMode} />} />
             </RadarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* 4. PERFORMANCE MATRIX FULL WIDTH */}
      <div className={`p-10 rounded-[3.5rem] border backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
          <h2 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em] mb-8 italic">Global Neural Matrix</h2>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={allTeams.slice(0, 15)}>
              <XAxis dataKey="Team" hide />
              <Area type="monotone" dataKey="HomeAttack" stroke={NEON_CYAN} strokeWidth={5} fillOpacity={0.1} fill={NEON_CYAN} />
              <Area type="monotone" dataKey="HomeDefense" stroke={VIBRANT_PURPLE} strokeWidth={2} fill="none" strokeDasharray="10 10" />
              <Tooltip content={<CustomMatrixTooltip isDarkMode={isDarkMode} />} />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      {/* 5. THREAT & POWER RATIO ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-8 p-10 rounded-[4rem] border backdrop-blur-3xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
           <h2 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em] mb-10 text-center">Threat Landscape (Atk vs Def Stability)</h2>
           <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="HomeAttack" name="Attack" stroke="#94a3b8" />
                <YAxis type="number" dataKey="HomeDefense" name="Defense" stroke="#94a3b8" />
                <ZAxis type="number" range={[100, 500]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomMatrixTooltip isDarkMode={isDarkMode} />} />
                <Scatter name="Teams" data={allTeams} fill={NEON_CYAN}>
                  {allTeams.map((entry, index) => <Cell key={`cell-${index}`} fill={index < 3 ? NEON_CYAN : VIBRANT_PURPLE} />)}
                </Scatter>
              </ScatterChart>
           </ResponsiveContainer>
        </div>

        <div className={`lg:col-span-4 p-10 rounded-[4rem] border backdrop-blur-3xl ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white shadow-xl border-slate-200'}`}>
            <h2 className="text-xs font-black text-purple-400 uppercase tracking-[0.4em] mb-10 text-center">Golden Power Ratio</h2>
            <ResponsiveContainer width="100%" height={320}>
               <BarChart data={allTeams.slice(0, 5)} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="Team" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip content={<CustomMatrixTooltip isDarkMode={isDarkMode} />} />
                  <Bar dataKey="HomeAttack" stackId="a" fill={NEON_CYAN} />
                  <Bar dataKey="HomeDefense" stackId="a" fill={VIBRANT_PURPLE} radius={[0, 10, 10, 0]} />
               </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 6. FORM VOLATILITY */}
      <div className={`p-10 rounded-[4rem] border backdrop-blur-3xl ${isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl shadow-black' : 'bg-white shadow-xl'}`}>
        <h2 className="text-xs font-black text-purple-400 uppercase tracking-[0.4em] mb-10 text-center italic">Neural Form Volatility</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={allTeams.slice(0, 15)}>
            <XAxis dataKey="Team" hide />
            <Tooltip content={<CustomMatrixTooltip isDarkMode={isDarkMode} />} />
            <Line type="stepAfter" dataKey="HomeAttack" stroke={NEON_CYAN} strokeWidth={4} dot={{ r: 6, fill: NEON_CYAN }} />
            <Line type="monotone" dataKey="HomeDefense" stroke={VIBRANT_PURPLE} strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 7. DISCIPLINE SUITE */}
      <div className={`p-12 rounded-[4rem] border backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white shadow-xl'}`}>
          <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.6em] italic mb-12 text-center underline decoration-red-500/30 underline-offset-8">Discipline & Aggression Suite</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="flex flex-col items-center justify-center space-y-12 border-r border-gray-500/10 pr-8">
               <div className="flex gap-10">
                  <div className="flex flex-col items-center group">
                    <div className="w-20 h-28 bg-red-600 rounded shadow-[0_0_50px_#ef4444]" />
                    <p className="mt-6 text-4xl font-black italic">7</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Chelsea (Reds)</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-20 h-28 bg-yellow-400 rounded shadow-[0_0_50px_#fbbf24]" />
                    <p className="mt-6 text-4xl font-black italic">83</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Spurs (Yellows)</p>
                  </div>
               </div>
            </div>
            <div className="flex flex-col space-y-6">
               {[{n: "Marc Cucurella", v: "12 YEL"}, {n: "Nicolas Jackson", v: "10 YEL"}, {n: "Casemiro", v: "2 RED"}].map((p, i) => (
                 <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                   <p className="font-bold text-sm uppercase">{p.n}</p>
                   <span className="font-black text-xs text-white bg-red-500/60 px-3 py-1 rounded-full">{p.v}</span>
                 </div>
               ))}
            </div>
            <div className="flex flex-col items-center">
               <div className="relative w-full h-48 bg-green-900/20 border-2 border-white/10 rounded-lg flex items-center justify-center">
                  <div className="absolute w-full h-[2px] bg-white/10 top-1/2" />
                  <div className="absolute w-24 h-24 border-2 border-white/10 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} className="absolute top-1/4 left-1/2 w-4 h-4 bg-yellow-400 rounded-full blur-[4px] opacity-60" />
                  <motion.div animate={{ scale: [1, 2, 1] }} className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-600 rounded-full blur-[6px] opacity-80" />
               </div>
            </div>
          </div>
      </div>

      {/* 8. PLAYER SPOTLIGHT & CHAMPION PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className={`lg:col-span-8 p-10 rounded-[4rem] border backdrop-blur-3xl relative overflow-hidden bg-gradient-to-br ${isDarkMode ? 'from-black/60 to-purple-900/20' : 'bg-white shadow-xl'}`}>
           <AnimatePresence mode="wait">
             <motion.div key={carouselIndex} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.7 }} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[350px]">
                <div className="flex flex-col items-center">
                   <h2 className="text-xs font-black text-cyan-400 tracking-[0.5em] uppercase mb-10">{statsCarousel[carouselIndex].title}</h2>
                   <div className="flex justify-center items-end gap-6 h-full pb-6">
                      {statsCarousel[carouselIndex].players.map((p, i) => (
                        <div key={p.name} className="flex flex-col items-center">
                           <img src={p.img} className={`rounded-full border-2 ${i === 0 ? 'w-28 h-28 border-cyan-400 shadow-[0_0_30px_#00f5ff]' : 'w-20 h-20 border-white/20 opacity-40'}`} />
                           <p className="text-xs font-black mt-12 uppercase">{p.name}</p>
                           <p className="text-4xl font-black">{p.val}</p>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="flex flex-col items-center">
                   <h2 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] mb-6">Simulation Radar</h2>
                   <ResponsiveContainer width="100%" height={220}>
                     <RadarChart data={statsCarousel[carouselIndex].playerRadar}>
                        <PolarGrid stroke="#88888844" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <Radar dataKey="A" stroke={VIBRANT_PURPLE} fill={VIBRANT_PURPLE} fillOpacity={0.5} />
                     </RadarChart>
                   </ResponsiveContainer>
                </div>
             </motion.div>
           </AnimatePresence>
         </div>

         <div className={`lg:col-span-4 p-10 rounded-[4rem] border backdrop-blur-3xl flex flex-col justify-center items-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
            <h2 className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em] mb-10">Champion Chance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={allTeams.slice(0, 4).map((t, i) => ({ name: t.Team, value: 40 - i*10 }))} innerRadius={70} outerRadius={100} dataKey="value" stroke="none">
                  {allTeams.slice(0, 4).map((_, i) => <Cell key={i} fill={[NEON_CYAN, VIBRANT_PURPLE, "#0544ff", "#1e293b"][i]} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip isDarkMode={isDarkMode} />} />
              </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      <button onClick={() => setShowTable(true)} className="w-full py-8 rounded-[3.5rem] bg-white/5 border border-white/10 text-sm font-black uppercase tracking-[0.8em] hover:bg-cyan-500 hover:text-black transition-all duration-700 cursor-pointer shadow-2xl">Access Global Intel Registry</button>

      {/* FOOTER TICKER */}
      <div className="fixed bottom-0 left-0 w-full bg-[#12051f] py-5 border-t border-cyan-400/30 z-[100] overflow-hidden flex items-center shadow-2xl">
        <div className="bg-cyan-400 text-black px-10 py-2 text-[12px] font-black uppercase italic skew-x-12 ml-10 shadow-lg">LIVE INTEL</div>
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="flex">
            {[...tickerNews, ...tickerNews].map((news, i) => (
              <span key={i} className="mx-16 text-white font-mono text-[13px] font-bold uppercase opacity-80">{news} <span className="text-cyan-400 ml-10 opacity-30">///</span></span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* REFINED MODAL (Visibility Fix) */}
      <AnimatePresence>
        {showTable && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/90 pl-[260px]">
            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className={`w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[4rem] border shadow-2xl flex flex-col ${isDarkMode ? 'bg-[#030816] border-white/10' : 'bg-white border-slate-300'}`}>
              <div className="p-8 border-b border-gray-500/10 flex justify-between items-center">
                <h2 className={`text-2xl font-black italic uppercase italic tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Intelligence <span className="text-cyan-500">Registry</span></h2>
                <button onClick={() => setShowTable(false)} className={`text-2xl hover:text-red-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <table className="w-full text-left">
                  <thead><tr className={`text-[10px] font-black uppercase tracking-widest border-b border-gray-500/20 pb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><th>Rank</th><th>Club</th><th className="text-right">Power</th></tr></thead>
                  <tbody className={`divide-y border-gray-500/10 ${isDarkMode ? 'divide-white/5' : 'divide-slate-200'}`}>
                    {allTeams.map((t, i) => (
                      <tr key={t.Team} className="hover:bg-cyan-500/10 transition-colors">
                        <td className="py-4 opacity-50 font-mono">{i + 1}</td>
                        <td className={`py-4 font-black italic uppercase text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.Team}</td>
                        <td className="py-4 text-right font-black italic text-2xl text-cyan-500">{((t.HomeAttack + (1 / t.HomeDefense)) * 5).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- GLASSMORPHISM TOOLTIPS ---
const CustomMatrixTooltip = ({ active, payload, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-6 rounded-[2.5rem] border backdrop-blur-3xl shadow-2xl ${isDarkMode ? 'bg-black/90 border-cyan-500/50 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-gray-500/20 pb-2 italic text-cyan-400">{payload[0].payload.Team || "Subject"}</p>
        <p className="text-2xl font-black italic">Atk: {payload[0].value.toFixed(2)}</p>
        {payload[1] && <p className="text-lg font-black italic text-purple-500">Def: {payload[1].value.toFixed(2)}</p>}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload, isDarkMode }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-3xl border backdrop-blur-3xl shadow-2xl ${isDarkMode ? 'bg-black/90 border-cyan-500/50 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
          <p className="text-xs font-black uppercase text-cyan-400">{payload[0].name}</p>
          <p className="text-xl font-black italic">{payload[0].value}% Chance</p>
        </div>
      );
    }
    return null;
};

export default Dashboard;