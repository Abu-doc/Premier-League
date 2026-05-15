import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

const TemporalArchive = () => {
  const [matchData, setMatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState("EPL_2015");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    Papa.parse('/EPL_cleaned_dataset.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const validData = results.data.filter(row => row.Season && row.HomeTeam);
        setMatchData(validData);
        setLoading(false);
      }
    });
  }, []);

  const allSeasons = useMemo(() => {
    if (!matchData.length) return [];
    return [...new Set(matchData.map(m => m.Season))].sort();
  }, [matchData]);

  const currentSeasonMatches = useMemo(() => {
    return matchData.filter(m => m.Season === activeSeason);
  }, [matchData, activeSeason]);

  const seasonStats = useMemo(() => {
    if (!currentSeasonMatches.length) return { totalGoals: 0, biggestWin: null };
    
    let totalGoals = 0;
    let biggestWin = { home: '', away: '', hg: 0, ag: 0, diff: 0 };

    currentSeasonMatches.forEach(m => {
      totalGoals += (m.FTHG + m.FTAG);
      const diff = Math.abs(m.FTHG - m.FTAG);
      if (diff > biggestWin.diff) {
        biggestWin = { home: m.HomeTeam, away: m.AwayTeam, hg: m.FTHG, ag: m.FTAG, diff };
      }
    });

    return { totalGoals, biggestWin };
  }, [currentSeasonMatches]);

  const pointsTable = useMemo(() => {
    if (!currentSeasonMatches.length) return [];
    const table = {};

    currentSeasonMatches.forEach(match => {
      const home = match.HomeTeam;
      const away = match.AwayTeam;
      const hg = match.FTHG;
      const ag = match.FTAG;

      if (!table[home]) table[home] = { name: home, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] };
      if (!table[away]) table[away] = { name: away, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] };

      table[home].p += 1; table[away].p += 1;
      table[home].gf += hg; table[away].gf += ag;
      table[home].ga += ag; table[away].ga += hg;

      if (hg > ag) {
        table[home].w += 1; table[home].pts += 3; table[home].form.push('W');
        table[away].l += 1; table[away].form.push('L');
      } else if (hg < ag) {
        table[away].w += 1; table[away].pts += 3; table[away].form.push('W');
        table[home].l += 1; table[home].form.push('L');
      } else {
        table[home].d += 1; table[home].pts += 1; table[home].form.push('D');
        table[away].d += 1; table[away].pts += 1; table[away].form.push('D');
      }
    });

    return Object.values(table).map(t => {
      t.gd = t.gf - t.ga;
      t.form = t.form.slice(-5);
      return t;
    }).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }, [currentSeasonMatches]);

  const displayedMatches = useMemo(() => {
    return currentSeasonMatches.filter(match => {
      const home = match.HomeTeam.toLowerCase();
      const away = match.AwayTeam.toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = home.includes(term) || away.includes(term);
      const matchesTeamClick = selectedTeam ? (match.HomeTeam === selectedTeam || match.AwayTeam === selectedTeam) : true;
      return matchesSearch && matchesTeamClick;
    });
  }, [currentSeasonMatches, searchTerm, selectedTeam]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center font-mono text-cyan-400 text-xl tracking-widest bg-[#050505]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full mb-4" />
      </div>
    );
  }

  const displayYear = activeSeason.replace('EPL_', '');

  return (
    // THE FIX: absolute inset-0 anchors this container to the parent, preventing it from stretching the webpage.
    <div className="absolute inset-0 flex flex-col gap-4 text-white font-sans overflow-hidden bg-[#050505] rounded-xl p-2 md:p-4">
      
      {/* MASSIVE AMBIENT TYPOGRAPHY BACKGROUND */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black italic text-white/[0.02] pointer-events-none select-none z-0 tracking-tighter whitespace-nowrap">
        {displayYear}
      </div>

      {/* TOP ROW: THE CYBER-DIAL TIMELINE (Fixed at top) */}
      <div className="w-full shrink-0 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl relative z-10 flex flex-col gap-3">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] md:text-xs font-mono tracking-widest text-cyan-400 uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
            TEMPORAL ARCHIVE OVERRIDE
          </span>
          <div className="hidden lg:flex gap-8">
             <div className="flex flex-col items-end">
               <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Season Goals</span>
               <span className="font-black italic text-cyan-400 text-lg">{seasonStats.totalGoals}</span>
             </div>
             {seasonStats.biggestWin && (
               <div className="flex flex-col items-end border-l border-white/10 pl-8">
                 <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Biggest Demolition</span>
                 <span className="font-bold text-white/80 text-lg truncate max-w-[300px]">
                   {seasonStats.biggestWin.home} {seasonStats.biggestWin.hg}-{seasonStats.biggestWin.ag} {seasonStats.biggestWin.away}
                 </span>
               </div>
             )}
          </div>
        </div>
        
        {/* Horizontal scroll for the timeline */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-2 w-full">
          {allSeasons.map((season) => {
            const yearText = season.replace('EPL_', '');
            const isActive = activeSeason === season;
            return (
              <button
                key={season}
                onClick={() => { setActiveSeason(season); setSelectedTeam(null); }}
                className={`min-w-[90px] shrink-0 py-2 rounded-xl font-black italic tracking-widest transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105 z-10' 
                    : 'bg-black/50 text-white/40 border border-white/10 hover:text-white hover:border-cyan-400/50'
                }`}
              >
                {yearText}
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA: SCROLLS UP AND DOWN IN THE REMAINING SPACE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-10 w-full min-h-0 min-w-0 pr-2">
        
        {/* THE HOLOGRAPHIC POINTS TABLE */}
        <div className="w-full shrink-0 flex flex-col bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between md:items-center bg-gradient-to-r from-black to-transparent">
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">League Standings</h2>
            {selectedTeam && (
               <button onClick={() => setSelectedTeam(null)} className="text-[10px] md:text-xs font-mono text-red-400 border border-red-400/30 px-4 py-2 rounded bg-red-900/20 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                 Clear Team Filter [X]
               </button>
            )}
          </div>
          
          {/* Table container with internal horizontal scroll to protect layout */}
          <div className="w-full overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#050505]/95 backdrop-blur-md text-[10px] font-mono tracking-widest text-white/40 border-b border-white/10 uppercase">
                <tr>
                  <th className="p-4 pl-6">#</th>
                  <th className="p-4 w-1/4">Club</th>
                  <th className="p-4 text-center">Played</th>
                  <th className="p-4 text-center">Won</th>
                  <th className="p-4 text-center">Drawn</th>
                  <th className="p-4 text-center">Lost</th>
                  <th className="p-4 text-center">GD</th>
                  <th className="p-4 text-center min-w-[120px]">Form (L5)</th>
                  <th className="p-4 text-center text-cyan-400 font-bold pr-6">PTS</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {pointsTable.map((team, index) => {
                    const rank = index + 1;
                    const isChampion = rank === 1;
                    const isUCL = rank > 1 && rank <= 4;
                    const isRelegated = rank >= 18;
                    const isSelected = selectedTeam === team.name;

                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.01 }}
                        key={team.name}
                        onClick={() => setSelectedTeam(team.name)}
                        className={`border-b border-white/5 text-sm md:text-base cursor-pointer transition-all duration-200 group relative ${
                          isSelected ? 'bg-cyan-900/40' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="p-4 pl-6 font-mono text-white/50 relative">
                          {isChampion && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 shadow-[0_0_15px_#fbbf24]" />}
                          {isUCL && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />}
                          {isRelegated && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_#ef4444]" />}
                          {rank}
                        </td>
                        <td className="p-4 font-black text-base md:text-lg tracking-wide flex items-center gap-3">
                          <span className={`transition-colors ${isChampion ? 'text-amber-400' : isUCL ? 'text-cyan-100 group-hover:text-cyan-300' : isRelegated ? 'text-red-200/80 group-hover:text-red-400' : 'text-white/90 group-hover:text-white'}`}>
                            {team.name}
                          </span>
                          {isChampion && <span className="hidden sm:inline-block text-[8px] md:text-[10px] font-black italic bg-amber-400 text-black px-2 py-0.5 rounded uppercase tracking-widest shadow-[0_0_10px_#fbbf24]">CHAMPION</span>}
                        </td>
                        <td className="p-4 text-center text-white/40 font-mono">{team.p}</td>
                        <td className="p-4 text-center text-emerald-400/80 font-mono">{team.w}</td>
                        <td className="p-4 text-center text-yellow-400/80 font-mono">{team.d}</td>
                        <td className="p-4 text-center text-red-400/80 font-mono">{team.l}</td>
                        <td className="p-4 text-center font-mono text-white/60">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        
                        <td className="p-4 flex justify-center items-center gap-1.5">
                          {team.form.map((result, i) => (
                            <div key={i} className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                              result === 'W' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 
                              result === 'D' ? 'bg-slate-500' : 'bg-red-500 shadow-[0_0_5px_#ef4444]'
                            }`} title={result} />
                          ))}
                        </td>

                        <td className={`p-4 pr-6 text-center font-black italic text-xl md:text-2xl ${isChampion ? 'text-amber-400 drop-shadow-[0_0_8px_#fbbf24]' : 'text-cyan-400'}`}>
                          {team.pts}
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* THE NEON MATCH GRID */}
        <div className="w-full shrink-0 flex flex-col gap-6 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between border-b border-white/10 pb-6 w-full">
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Match Archives</h2>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <input 
                type="text" 
                placeholder="SEARCH FIXTURES..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 lg:w-[300px] bg-black/80 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-cyan-400/80 transition-all placeholder:text-white/20 text-white shadow-inner min-w-0"
              />
              <div className="hidden sm:flex flex-col items-center justify-center border border-cyan-500/30 px-6 py-1 rounded-xl bg-cyan-900/20 min-w-[100px] shrink-0">
                <span className="text-[9px] font-mono tracking-widest text-cyan-400/60 uppercase">Matches</span>
                <span className="font-black text-xl text-cyan-400 italic">{displayedMatches.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 w-full min-w-0">
            <AnimatePresence>
              {displayedMatches.map((match, idx) => {
                const totalGoals = match.FTHG + match.FTAG;
                const isClassic = totalGoals >= 5;

                return (
                  <motion.div 
                    layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    key={idx}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`relative p-4 md:p-6 rounded-2xl flex items-center justify-between bg-black border overflow-hidden cursor-default transition-all ${
                      isClassic ? 'border-amber-500/50 shadow-[0_5px_20px_rgba(251,191,36,0.15)]' : 'border-white/5 shadow-lg hover:border-cyan-500/30 hover:shadow-[0_5px_20px_rgba(34,211,238,0.1)]'
                    }`}
                  >
                    {isClassic && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-400 text-black text-[8px] font-black italic px-4 py-0.5 rounded-b shadow-[0_0_15px_#fbbf24] tracking-widest z-10">
                        CLASSIC MATCH 
                      </div>
                    )}
                    
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/10 tracking-[0.2em] hidden sm:block">{match.Date}</span>

                    <div className="flex-1 flex flex-col items-end z-10 min-w-0">
                      <span className="text-sm md:text-xl font-black text-white/90 truncate w-full text-right uppercase tracking-tighter">{match.HomeTeam}</span>
                      <span className={`text-[8px] md:text-[10px] font-mono mt-1 px-1.5 rounded ${match.FTHG > match.FTAG ? 'text-emerald-400 bg-emerald-900/30' : 'text-white/30 bg-white/5'}`}>HOME</span>
                    </div>

                    <div className="px-4 md:px-6 flex items-center justify-center gap-2 md:gap-4 z-10 shrink-0">
                      <span className={`text-3xl md:text-5xl font-black italic ${match.FTHG > match.FTAG ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/30'}`}>{match.FTHG}</span>
                      <div className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full" />
                      <span className={`text-3xl md:text-5xl font-black italic ${match.FTAG > match.FTHG ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/30'}`}>{match.FTAG}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-start z-10 min-w-0">
                      <span className="text-sm md:text-xl font-black text-white/90 truncate w-full text-left uppercase tracking-tighter">{match.AwayTeam}</span>
                      <span className={`text-[8px] md:text-[10px] font-mono mt-1 px-1.5 rounded ${match.FTAG > match.FTHG ? 'text-emerald-400 bg-emerald-900/30' : 'text-white/30 bg-white/5'}`}>AWAY</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          
          {displayedMatches.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-white/20 font-mono gap-4 w-full">
              <div className="text-4xl">ø</div>
              NO MATCH ASSETS FOUND
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.8); }
      `}} />
    </div>
  );
};

export default TemporalArchive;