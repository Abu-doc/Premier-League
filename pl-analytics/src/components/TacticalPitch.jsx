import React from 'react';
import { motion } from 'framer-motion';

const TacticalPitch = ({ pitchPlayers, setPitchPlayers }) => {
  
  const formationNodes = [
    { id: 0, role: 'LW', top: '15%', left: '20%' },
    { id: 1, role: 'ST', top: '10%', left: '50%' },
    { id: 2, role: 'RW', top: '15%', left: '80%' },
    { id: 3, role: 'LCM', top: '35%', left: '30%' },
    { id: 4, role: 'CM', top: '40%', left: '50%' },
    { id: 5, role: 'RCM', top: '35%', left: '70%' },
    { id: 6, role: 'LB', top: '65%', left: '15%' },
    { id: 7, role: 'LCB', top: '70%', left: '35%' },
    { id: 8, role: 'RCB', top: '70%', left: '65%' },
    { id: 9, role: 'RB', top: '65%', left: '85%' },
    { id: 10, role: 'GK', top: '90%', left: '50%' },
  ];

  const handleDrop = (e, index) => {
    e.preventDefault();
    const playerData = e.dataTransfer.getData("player");
    if (!playerData) return;
    
    const player = JSON.parse(playerData);

    // ANTI-CLONE PROTOCOL: Check if player ID already exists on the pitch
    const isDuplicate = pitchPlayers.some(p => p !== null && p.id === player.id);
    if (isDuplicate) return; 

    const newPitch = [...pitchPlayers];
    newPitch[index] = player;
    setPitchPlayers(newPitch);
  };

  const handleRemove = (index) => {
    const newPitch = [...pitchPlayers];
    newPitch[index] = null;
    setPitchPlayers(newPitch);
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 perspective-1000">
      
      {/* THE HOLOGRAPHIC PITCH BACKGROUND */}
      <div className="absolute inset-4 max-w-2xl mx-auto border border-cyan-500/30 rounded-xl overflow-hidden bg-[#020804] shadow-[0_0_50px_rgba(6,78,59,0.2)]">
        
        {/* Tactical 3D Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* The Radar Sweep Scanner */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-cyan-400/10 to-cyan-400/40 border-b border-cyan-400 shadow-[0_5px_20px_rgba(34,211,238,0.3)] z-0"
        />

        {/* Standard Pitch Lines (Neon) */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.5)] -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.3)] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        
        {/* Penalty Areas */}
        <div className="absolute top-0 left-1/2 w-64 h-32 border border-t-0 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-64 h-32 border border-b-0 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] -translate-x-1/2" />
      </div>

      {/* THE TACTICAL NODES */}
      <div className="absolute inset-4 max-w-2xl mx-auto pointer-events-auto z-10">
        {formationNodes.map((node, index) => {
          const player = pitchPlayers[index];

          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
              style={{ top: node.top, left: node.left }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
            >
              {player ? (
                // PLAYER DEPLOYED (Hologram Lock)
                <motion.div 
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleRemove(index)}
                >
                  {/* Outer Rotating Lock Ring */}
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 rounded-full border border-dashed border-cyan-500/50"
                  />
                  
                  <div className="w-16 h-16 rounded-full border-2 border-cyan-400 bg-black/90 shadow-[0_0_25px_rgba(34,211,238,0.6)] flex flex-col items-center justify-center overflow-hidden backdrop-blur-md relative">
                     <span className="font-black italic text-cyan-400 text-xl z-10">{player.Rating}</span>
                     {/* Internal Scanline */}
                     <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(34,211,238,0.1)_2px,rgba(34,211,238,0.1)_4px)] pointer-events-none" />
                  </div>
                  
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)] px-3 py-1 rounded text-[10px] font-bold tracking-[0.2em] uppercase text-white"
                  >
                    {player.Name.split(' ').pop()}
                  </motion.div>
                  
                  {/* Delete Protocol */}
                  <div className="absolute inset-0 bg-red-600/90 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm scale-90 group-hover:scale-100 border border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Purge</span>
                  </div>
                </motion.div>
              ) : (
                // EMPTY TARGET NODE
                <div className="w-14 h-14 rounded-full border border-white/20 bg-black/40 flex items-center justify-center relative backdrop-blur-sm group transition-colors hover:border-cyan-400/50 hover:bg-cyan-900/20">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full border border-cyan-400/30" />
                  <span className="text-white/40 text-[10px] font-mono tracking-widest group-hover:text-cyan-400 transition-colors">{node.role}</span>
                  {/* Crosshair Center */}
                  <div className="absolute w-1 h-1 bg-white/20 rounded-full group-hover:bg-cyan-400 transition-colors" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalPitch;