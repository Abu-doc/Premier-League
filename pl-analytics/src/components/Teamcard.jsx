import { motion, AnimatePresence } from "framer-motion";

function TeamCard({ team, selected, onClick, isDarkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotateY: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative cursor-pointer group perspective-1000"
    >
      {/* THE MAIN SHARD CONTAINER */}
      <div 
        style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)" }}
        className={`relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-500 border-2
          ${selected 
            ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(0,245,255,0.4)]" 
            : isDarkMode 
              ? "bg-white/5 border-white/10 grayscale opacity-60 hover:opacity-100 hover:grayscale-0" 
              : "bg-slate-100 border-slate-300 grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
          }
        `}
      >
        {/* SCANNING LASER EFFECT (Only on Hover/Selected) */}
        <motion.div 
          animate={{ y: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 w-full h-[20%] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent pointer-events-none"
        />

        {/* LOGO */}
        <motion.img
          src={team.logo}
          alt={team.name}
          animate={{ 
            filter: selected ? "drop-shadow(0 0 10px rgba(0, 245, 255, 0.8))" : "none",
            scale: selected ? 1.15 : 1
          }}
          className="w-12 h-12 object-contain z-10"
        />

        {/* TEAM INITIALS OR SHORT NAME */}
        <p className={`mt-2 text-[9px] font-black tracking-tighter transition-all
          ${selected ? "text-cyan-400 opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-100"}
        `}>
          {team.name.substring(0, 3).toUpperCase()}
        </p>
      </div>

      {/* FLOATING STATUS LIGHT (Corner indicator) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-black z-30 shadow-[0_0_10px_#00f5ff]"
          >
             <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-75" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TeamCard;