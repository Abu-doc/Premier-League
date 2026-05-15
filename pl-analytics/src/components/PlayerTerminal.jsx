import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Ensure this path exactly matches wherever your backend file is located
import playerData from '../../../backend/processed_players.json';

const PlayerTerminal = ({ isGlobalMode, setIsGlobalMode, activeClub, setActiveClub }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Get a list of all team names for the dropdown
  const allClubs = Object.keys(playerData);

  // Flatten the database if in Global Mode, otherwise just show the active club
  const displayedPlayers = isGlobalMode 
    ? Object.values(playerData).flat()
    : playerData[activeClub] || [];

  // Filter by search term
  const filteredPlayers = displayedPlayers.filter(p => 
    p.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col gap-4">
      
      {/* TERMINAL HEADER & TOGGLE */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
        <h2 className="font-black italic uppercase tracking-tighter text-xl text-white/90">
          Neural Database
        </h2>
        
        {/* The Cyber-Toggle */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setIsGlobalMode(false)}
            className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${!isGlobalMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/40 hover:text-white'}`}
          >
            Club Hub
          </button>
          <button 
            onClick={() => setIsGlobalMode(true)}
            className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${isGlobalMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/40 hover:text-white'}`}
          >
            Global Network
          </button>
        </div>

        {/* Club Selector (Only visible in Club Hub mode) */}
        <AnimatePresence>
          {!isGlobalMode && (
            <motion.select 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              value={activeClub}
              onChange={(e) => setActiveClub(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-sm font-mono text-white/80 focus:outline-none focus:border-cyan-500/50"
            >
              {allClubs.map(club => (
                <option key={club} value={club}>{club}</option>
              ))}
            </motion.select>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <input 
          type="text" 
          placeholder="SEARCH ASSETS..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-sm font-mono text-white/80 focus:outline-none focus:border-white/30 placeholder:text-white/20"
        />
      </div>

      {/* THE ROSTER (Scrollable List) */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {filteredPlayers.map((player) => (
            <motion.div 
              layout
              draggable
              onDragStart={(e) => e.dataTransfer.setData("player", JSON.stringify(player))}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={player.id}
              className="group relative bg-[#0a0a0a] border border-white/5 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-white/20 transition-all overflow-hidden"
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white/90">{player.Name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                      {player.Position}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/70 truncate max-w-[120px]">
                      {player.archetype}
                    </span>
                  </div>
                </div>
                
                {/* Overall Rating Badge */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/10 text-lg font-black italic text-white">
                  {player.Rating}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
};

export default PlayerTerminal;