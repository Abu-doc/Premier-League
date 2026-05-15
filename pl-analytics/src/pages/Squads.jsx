import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import PlayerCard from "../components/PlayerCard";
import teams from "../data/teams"; 

const FALLBACK_COLOR = "#00f5ff"; 

function Squads({ isDarkMode }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Premium, ultra-smooth transition curve (Matches PlayerCard)
  const smoothTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };
  const pageTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };

  // Fetch Squad Data
  useEffect(() => {
    if (selectedTeam) {
      setIsLoading(true);
      setSquad([]); 
      
      axios.get(`http://127.0.0.1:8000/get-squad?team=${selectedTeam.name}`)
        .then(res => {
          const order = { "GK": 0, "DEF": 1, "MID": 2, "FWD": 3 };
          const sortedSquad = res.data.sort((a, b) => order[a.Position] - order[b.Position]);
          setSquad(sortedSquad);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching squad:", err);
          setIsLoading(false);
        });
    }
  }, [selectedTeam]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden pt-20 pb-32 transition-colors duration-700 ${isDarkMode ? 'bg-[#01040f] text-white' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
        <h1 className="text-[20vw] font-black italic tracking-tighter uppercase whitespace-nowrap text-white">
          {selectedTeam ? selectedTeam.name : "DATABASE"}
        </h1>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter drop-shadow-2xl text-white">
            SQUADS <span className="text-cyan-400">HUB</span>
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 mt-2">
            Select a unit to access tactical profiles
          </p>
        </div>

        <AnimatePresence mode="wait">
          
          {/* PHASE 1: ULTRA-SMOOTH TEAM GRID VIEW */}
          {!selectedTeam ? (
            <motion.div 
              key="team-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={pageTransition}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8"
            >
              {teams.map((team, idx) => (
                <motion.button
                  key={team.name}
                  onClick={() => setSelectedTeam(team)}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0, transition: { delay: idx * 0.04, ...smoothTransition } },
                    hover: { y: -8, scale: 1.02, transition: smoothTransition },
                    tap: { scale: 0.95, transition: { duration: 0.2 } }
                  }}
                  className="flex flex-col items-center justify-center p-8 rounded-3xl bg-black/20 border border-white/5 backdrop-blur-md relative overflow-hidden group cursor-pointer"
                >
                  
                  {/* Smooth Background Glow */}
                  <motion.div 
                    variants={{
                        initial: { opacity: 0 },
                        hover: { opacity: 0.15 }
                    }}
                    transition={smoothTransition}
                    className="absolute inset-0 blur-2xl rounded-3xl pointer-events-none" 
                    style={{ backgroundColor: team.color || FALLBACK_COLOR }} 
                  />
                  
                  {/* Smooth Image Reveal (Grayscale to Color) */}
                  <motion.img 
                    src={team.logo} 
                    alt={team.name} 
                    variants={{
                        initial: { filter: "grayscale(100%) brightness(0.8)", scale: 1 },
                        hover: { filter: "grayscale(0%) brightness(1)", scale: 1.1 }
                    }}
                    transition={smoothTransition}
                    className="w-24 h-24 object-contain drop-shadow-2xl z-10 relative" 
                  />
                  
                  {/* Smooth Text Glow */}
                  <motion.span 
                    variants={{
                        initial: { color: "rgba(255,255,255,0.4)" },
                        hover: { color: "rgba(255,255,255,1)" }
                    }}
                    transition={smoothTransition}
                    className="mt-6 text-[10px] font-black uppercase tracking-widest z-10 relative"
                  >
                    {team.name}
                  </motion.span>
                </motion.button>
              ))}
            </motion.div>
          ) : (

            /* PHASE 2: SQUAD ROSTER VIEW */
            <motion.div 
              key="squad-view"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 50 }}
              transition={pageTransition}
              className="flex flex-col items-center w-full"
            >
              
              {/* Toolbar: Back Button & Selected Team Info */}
              <div className="w-full flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors duration-300"
                >
                  <span className="text-xl">←</span> Return to Grid
                </button>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tight">
                      {selectedTeam.name}
                    </h2>
                    <span className="text-[10px] uppercase font-mono tracking-widest" style={{ color: selectedTeam.color || FALLBACK_COLOR }}>
                      {squad.length} Active Personnel
                    </span>
                  </div>
                  <img src={selectedTeam.logo} className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 border-4 border-t-cyan-400 border-white/10 rounded-full mb-6" style={{ borderTopColor: selectedTeam.color || FALLBACK_COLOR }} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] animate-pulse text-white">Extracting Neural Files...</span>
                </div>
              ) : (

                /* Player Grid using the PlayerCard component */
                <motion.div 
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full justify-items-center"
                >
                  {squad.map((player) => (
                    <motion.div
                      key={player.Name}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: smoothTransition }
                      }}
                    >
                      <PlayerCard 
                        player={player} 
                        teamColor={selectedTeam.color || FALLBACK_COLOR} 
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default Squads;