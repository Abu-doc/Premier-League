import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlayerTerminal from '../components/PlayerTerminal';
import TacticalPitch from '../components/TacticalPitch';
import SynergyHUD from '../components/SynergyHUD';

const SynergyMatrix = () => {
  const [isGlobalMode, setIsGlobalMode] = useState(false);
  const [pitchPlayers, setPitchPlayers] = useState(Array(11).fill(null));
  const [activeClub, setActiveClub] = useState("Arsenal");

  // THE BOARD WIPE PROTOCOL
  // Triggers instantly if the user changes clubs or toggles the network mode
  useEffect(() => {
    setPitchPlayers(Array(11).fill(null));
  }, [activeClub, isGlobalMode]);

  return (
    <div className="h-[calc(100vh-2rem)] w-full text-white flex flex-col xl:flex-row gap-4 xl:gap-6 overflow-hidden font-sans relative">
      
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none z-0" />

      {/* LEFT COLUMN: The Pitch & The HUD */}
      <div className="flex-1 flex flex-col gap-4 xl:gap-6 z-10 min-w-0">
        
        {/* TOP: The Math Output (SynergyHUD) */}
        <div className="shrink-0 h-auto xl:h-48 bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] p-4 xl:p-6 shadow-2xl flex items-center justify-center overflow-hidden">
           <SynergyHUD pitchPlayers={pitchPlayers} />
        </div>

        {/* BOTTOM: The Glowing Pitch (TacticalPitch) */}
        <div className="flex-1 min-h-0 bg-[#111] border border-white/5 rounded-[1.5rem] p-4 shadow-2xl relative flex items-center justify-center overflow-hidden">
           <TacticalPitch pitchPlayers={pitchPlayers} setPitchPlayers={setPitchPlayers} />
        </div>

      </div>

      {/* RIGHT COLUMN: The Player Roster */}
      <div className="w-full xl:w-[340px] shrink-0 bg-gradient-to-b from-[#111] to-[#050505] border border-white/10 rounded-[1.5rem] p-4 xl:p-5 shadow-2xl z-10 flex flex-col h-full overflow-hidden">
         <PlayerTerminal 
               isGlobalMode={isGlobalMode} 
               setIsGlobalMode={setIsGlobalMode}
               activeClub={activeClub}
               setActiveClub={setActiveClub}
             />
      </div>

    </div>
  );
};

export default SynergyMatrix;