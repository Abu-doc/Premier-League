import { motion } from "framer-motion";
import { useEffect } from "react";

const SplashScreen = ({ finishLoading }) => {
  useEffect(() => {
    // 3.5 seconds is the perfect length for a "Broadcast Intro"
    const timer = setTimeout(finishLoading, 3500);
    return () => clearTimeout(timer);
  }, [finishLoading]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "brightness(2) blur(20px)" }}
      transition={{ duration: 0.9, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ 
        // VIBRANT MESH GRADIENT (Matches the energy of your image)
        background: "linear-gradient(135deg, #3d195b 0%, #0544ff 50%, #7000ff 100%)" 
      }}
    >
      {/* GLOWING AMBIENT ORBS */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] right-[-10%] w-full h-full bg-[#00f5ff]/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-[#ff00c8]/10 blur-[100px] rounded-full" />
      </div>

      {/* THE ICONIC NEON STRIP (From your image) */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "120%", opacity: 1 }}
        transition={{ duration: 1.2, ease: "circOut", delay: 0.2 }}
        className="absolute top-1/2 left-[-10%] h-[3px] bg-[#00f5ff] shadow-[0_0_20px_#00f5ff,0_0_40px_#00f5ff,0_0_60px_rgba(0,245,255,0.5)] z-20"
      />

      {/* CONTENT WRAPPER */}
      <div className="relative z-30 flex flex-col items-center">
        {/* Lion Logo with a "Rising" effect */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.4
          }}
          className="bg-white p-6 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.4)] mb-8 border-[4px] border-cyan-400/50"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg"
            alt="Premier League"
            className="w-28 h-28"
          />
        </motion.div>

        {/* Text Reveal with Spacing Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <motion.h1 
            initial={{ letterSpacing: "1.5em" }}
            animate={{ letterSpacing: "0.4em" }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-white text-2xl font-black italic uppercase drop-shadow-2xl"
          >
            IT'S IN THE <span className="text-[#00f5ff]">GAME</span>
          </motion.h1>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/50 to-transparent mt-4"
          />
        </motion.div>
      </div>

      {/* SWEEPING SCANLINE EFFECT */}
      <motion.div 
        initial={{ x: "-150%" }}
        animate={{ x: "150%" }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
      />
    </motion.div>
  );
};

export default SplashScreen;