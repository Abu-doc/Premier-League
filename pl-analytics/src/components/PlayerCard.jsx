import { motion } from "framer-motion";

const PlayerCard = ({ player, teamColor }) => {
  // If the player object doesn't have an ImageUrl yet, use a sleek fallback
  const defaultImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const imageSrc = player.ImageUrl || defaultImage;

  // Premium, ultra-smooth transition curve
  const smoothTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  return (
    <motion.div 
      whileHover="hover" 
      initial="initial"
      className="relative w-48 h-64 rounded-2xl overflow-hidden cursor-pointer group bg-black/40 backdrop-blur-md border border-white/10 flex flex-col justify-end p-4 transition-colors duration-500 hover:bg-black/60"
    >
      
      {/* 1. THE PLAYER IMAGE (Ultra-smooth slide & scale) */}
      <motion.div 
        variants={{
          initial: { y: 60, opacity: 0, scale: 0.95 },
          hover: { y: 0, opacity: 0.85, scale: 1 } 
        }}
        transition={smoothTransition}
        className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none overflow-hidden"
      >
        <img 
            src={imageSrc} 
            alt={player.Name} 
            className="w-full h-full object-cover object-top image-mask-bottom" 
        />
      </motion.div>

      {/* 2. THE DYNAMIC TEAM GLOW (Soft fade in) */}
      <motion.div 
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 }
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl border-2"
        style={{ borderColor: teamColor, boxShadow: `inset 0 0 30px ${teamColor}55` }}
      />

      {/* 3. THE CARD CONTENT (Always stays on top) */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between">
        
        {/* Top Section: Rating Box */}
        <div className="flex justify-end w-full">
            <motion.div 
                variants={{
                    initial: { backgroundColor: "rgba(0,0,0,0.6)", y: 0 },
                    hover: { backgroundColor: `${teamColor}44`, y: -2 }
                }}
                transition={smoothTransition}
                className="w-9 h-9 flex items-center justify-center font-black text-xs rounded-lg border backdrop-blur-sm shadow-xl"
                style={{ borderColor: teamColor, color: teamColor }}
            >
                {player.Rating}
            </motion.div>
        </div>

        {/* Bottom Section: Name & Position */}
        <div className="flex flex-col gap-1 mt-auto">
            {/* Animated Position Tag */}
            <motion.span 
                variants={{ 
                    initial: { color: "rgba(255,255,255,0.5)", x: 0 },
                    hover: { color: teamColor, x: 6 } 
                }}
                transition={smoothTransition}
                className="text-[10px] uppercase tracking-[0.2em] font-bold drop-shadow-md"
            >
                {player.Position}
            </motion.span>
            
            {/* Player Name */}
            <motion.span 
                variants={{
                    initial: { y: 0 },
                    hover: { y: -2 }
                }}
                transition={smoothTransition}
                className="text-white font-black italic text-lg leading-tight uppercase drop-shadow-lg"
            >
                {player.Name}
            </motion.span>
            
            {/* Animated Scanline / Divider */}
            <motion.div 
                variants={{ 
                    initial: { width: "20%", opacity: 0.3 },
                    hover: { width: "100%", opacity: 1 } 
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-[2px] mt-1 rounded-full"
                style={{ backgroundColor: teamColor, boxShadow: `0 0 10px ${teamColor}` }}
            />
        </div>

      </div>
    </motion.div>
  );
};

export default PlayerCard;