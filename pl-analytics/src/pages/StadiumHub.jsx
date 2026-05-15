import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StadiumCrestCarousel from '../components/StadiumCrestCarousel';
import StreetViewCanvas from '../components/StreetViewCanvas';
import { teams } from '../data/teams';

// --- NEW COMPONENT: Ambient Floating Data Nodes ---
const ParticleEngine = ({ color }) => {
  // We use useMemo so the particles don't randomly jump to new positions when you click a team
  const particles = useMemo(() => 
    [...Array(25)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 5
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ left: p.left, top: p.top, backgroundColor: color }}
          animate={{ y: [0, -200], opacity: [0, 0.6, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
};

const StadiumHub = () => {
  const [activeTeam, setActiveTeam] = useState(teams[0]);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  const glitchText = {
    hidden: { opacity: 0, x: -50, skewX: -20 },
    visible: { 
      opacity: [0, 1, 0, 1], x: [-20, 10, -5, 0], skewX: [-20, 10, -5, 0],
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300 } }
  };

  const executeNeuralUplink = () => {
    setIsWarping(true);
    setTimeout(() => {
      setIsWarping(false);
      setIsTourActive(true);
    }, 1100); 
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col relative w-full overflow-hidden">
      
      {/* --- NEW: 3D TACTICAL FLOOR GRID --- */}
      <div className="absolute bottom-0 left-0 w-full h-[60vh] pointer-events-none z-0 overflow-hidden" style={{ perspective: '800px' }}>
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '0px 50px'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-full h-[200%] absolute bottom-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to top, ${activeTeam.color} 1px, transparent 1px), linear-gradient(to right, ${activeTeam.color} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'rotateX(75deg) translateY(20%)',
            transformOrigin: 'bottom center',
          }}
        />
        {/* Grid fade out at the top */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#030303]" />
      </div>

      {/* --- NEW: AMBIENT PARTICLES --- */}
      <ParticleEngine color={activeTeam.color} />

      {/* --- NEW: HUD TELEMETRY OVERLAYS --- */}
      <AnimatePresence>
        {!isTourActive && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-6 right-8 font-mono text-[10px] text-right text-white/40 tracking-widest pointer-events-none z-10 hidden md:block"
          >
            <p>NEURAL.SYS // <span className="text-emerald-400">ONLINE</span></p>
            <p>TARGET: {activeTeam.name.toUpperCase()}</p>
            <p>LAT: {activeTeam.coordinates?.lat || "UNKNOWN"}</p>
            <p>LNG: {activeTeam.coordinates?.lng || "UNKNOWN"}</p>
            <p className="mt-2 animate-pulse" style={{ color: activeTeam.color }}>AWAITING UPLINK COMMAND</p>
          </motion.div>
        )}
      </AnimatePresence>


      {/* THE HOLOGRAPHIC DOCK */}
      <div className={`w-full z-40 pt-6 transition-all duration-700 ${isTourActive ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <StadiumCrestCarousel 
          teams={teams} 
          activeTeam={activeTeam} 
          setActiveTeam={(team) => {
            if (isWarping) return; 
            setActiveTeam(team);
            setIsTourActive(false); 
          }} 
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full flex items-center justify-center p-8 z-30 perspective-1000">
        
        {/* EMP SHOCKWAVE EFFECT */}
        <AnimatePresence>
          {isWarping && (
            <motion.div 
              initial={{ scale: 0, opacity: 1, borderWidth: "50px" }}
              animate={{ scale: 30, opacity: 0, borderWidth: "1px" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute z-[100] rounded-full pointer-events-none"
              style={{ width: '100px', height: '100px', borderColor: activeTeam.color, boxShadow: `0 0 50px ${activeTeam.color}` }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isTourActive && !isWarping ? (
            
            // --- THE DOSSIER ---
            <motion.div 
              key="dossier"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 relative"
            >
              
              {/* LEFT PANEL */}
              <motion.div 
                whileHover={{ y: -5, boxShadow: `0 20px 40px -20px ${activeTeam.color}50` }}
                className="bg-[#0a0a0a]/90 backdrop-blur-sm border border-white/10 rounded-[2rem] p-10 relative overflow-hidden transition-all duration-300"
              >
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, ease: "circOut" }} className="absolute top-0 left-0 h-1" style={{ backgroundColor: activeTeam.color }} />
                
                <motion.h1 variants={glitchText} initial="hidden" animate="visible" className="text-6xl font-black italic uppercase tracking-tighter mb-2" style={{ color: activeTeam.color, textShadow: `0 0 20px ${activeTeam.color}40` }}>
                  {activeTeam.name}
                </motion.h1>
                <motion.h3 variants={glitchText} initial="hidden" animate="visible" className="text-2xl font-mono text-white/80 mb-8 tracking-wide">
                  {activeTeam.stadiumName}
                </motion.h3>
                
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 font-mono text-sm relative z-10">
                  <motion.div variants={itemVariants} className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-white/40 tracking-widest">MAX CAPACITY</span>
                    <span className="font-bold text-lg">{activeTeam.capacity?.toLocaleString()}</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-white/40 tracking-widest">TACTICAL IDENTITY</span>
                    <span className="font-bold text-right" style={{ color: activeTeam.color }}>{activeTeam.tacticalStyle}</span>
                  </motion.div>
                  <motion.div variants={itemVariants} className="pt-4 text-white/60 leading-relaxed text-sm border-l-2 pl-4 transition-colors duration-500" style={{ borderColor: activeTeam.color }}>
                    {activeTeam.history}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* RIGHT PANEL: ACTION BUTTON */}
              <motion.div 
                whileHover={{ y: -5, boxShadow: `0 20px 40px -20px ${activeTeam.color}50` }}
                className="flex flex-col items-center justify-center bg-gradient-to-b from-[#111]/90 to-[#050505]/90 backdrop-blur-sm border border-white/5 rounded-[2rem] p-10 relative transition-all duration-300"
              >
                 <div className="w-24 h-24 mb-8 rounded-full border border-white/10 flex items-center justify-center relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-r-2" style={{ borderColor: activeTeam.color }} />
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTeam.color, boxShadow: `0 0 15px ${activeTeam.color}` }} />
                 </div>

                 <p className="text-center text-white/50 mb-10 font-mono text-xs uppercase tracking-widest">
                   Awaiting Authorization for <br/> <span className="text-white font-bold">{activeTeam.stadiumName}</span>
                 </p>
                 
                 <button 
                   onClick={executeNeuralUplink}
                   className="group relative px-10 py-5 bg-black rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10"
                 >
                    <motion.div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300" style={{ backgroundColor: activeTeam.color }} />
                    <span className="relative z-10 font-black tracking-[0.3em] uppercase text-sm" style={{ color: activeTeam.color }}>
                      Initialize Uplink
                    </span>
                 </button>
              </motion.div>
            </motion.div>

          ) : !isWarping && isTourActive ? (
            
            // --- THE 360° MATRIX ---
            <motion.div 
              key="tour"
              initial={{ opacity: 0, y: -50, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
              className="absolute inset-0 z-50 w-full h-full p-8 bg-[#050505]"
            >
              <button 
                onClick={() => setIsTourActive(false)}
                className="absolute top-12 left-12 z-50 px-8 py-3 bg-black/80 border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-2xl hover:scale-105"
              >
                ← Exit Uplink
              </button>
              
              <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 relative bg-black">
                {activeTeam.coordinates && (
                  <StreetViewCanvas lat={activeTeam.coordinates.lat} lng={activeTeam.coordinates.lng} heading={activeTeam.coordinates.heading} />
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StadiumHub;