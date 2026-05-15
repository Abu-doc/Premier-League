import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import SplashScreen from "./components/SplashScreen";

import Dashboard from "./pages/Dashboard";
import MatchPredictor from "./pages/MatchPredictor";
import TeamAnalytics from "./pages/TeamAnalytics";
import SeasonSimulator from "./pages/SeasonSimulator";
import Squads from "./pages/Squads";
import StadiumHub from "./pages/StadiumHub"; // NEW: Imported the Stadium Hub
import SynergyMatrix from "./pages/SynergyMatrix"; // NEW: Imported the Synergy Matrix
import TemporalArchive from "./pages/TemporalArchive";
import NeuralScout from "./pages/NeuralScout";
import GladiatorArena from "./pages/GladiatorArena";
import TacticalCanvas from "./pages/TacticalCanvas";

// This wrapper handles the page-to-page transitions
function AnimatedRoutes({ isDarkMode, toggleTheme }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route 
            path="/" 
            element={<Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} 
          />
          <Route 
            path="/match" 
            element={<MatchPredictor isDarkMode={isDarkMode} />} 
          />
          <Route 
            path="/team" 
            element={<TeamAnalytics isDarkMode={isDarkMode} />} 
          />
          <Route 
            path="/season" 
            element={<SeasonSimulator isDarkMode={isDarkMode} />} 
          />
          <Route 
            path="/squads" 
            element={<Squads isDarkMode={isDarkMode} />} 
          />
          {/* NEW: Route for the Immersive Stadium Hub */}
          <Route 
            path="/stadiums" 
            element={<StadiumHub isDarkMode={isDarkMode} />} 
          />
          {/* NEW: Route for the Synergy Matrix */}
          <Route 
            path="/synergy" 
            element={<SynergyMatrix isDarkMode={isDarkMode} />} 
          />
          <Route 
             path="/archive" 
             element={<TemporalArchive isDarkMode={isDarkMode} />} 
          />
          <Route 
             path="/scout" 
            element={<NeuralScout isDarkMode={isDarkMode} />} 
          />
          <Route 
             path="/arena" 
             element={<GladiatorArena isDarkMode={isDarkMode} />} 
          />
          <Route 
            path="/canvas" 
          element={<TacticalCanvas isDarkMode={isDarkMode} />} 
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Dynamic Background Styles based on the theme
  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#030816" : "#f0f4f8",
    backgroundImage: isDarkMode 
      ? `radial-gradient(at 0% 0%, #3d195b 0, transparent 50%), 
         radial-gradient(at 100% 0%, #0544ff 0, transparent 50%),
         radial-gradient(at 50% 100%, #00f5ff 0, transparent 50%)`
      : `radial-gradient(at 0% 0%, #3d195b15 0, transparent 50%), 
         radial-gradient(at 100% 0%, #0544ff15 0, transparent 50%)`,
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={backgroundStyle}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" finishLoading={() => setShowSplash(false)} />
        ) : (
          <Router>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1 }}
              className="flex min-h-screen relative"
            >
              {/* PERSISTENT NEON ACCENT LINE (Visible in Dark Mode) */}
              {isDarkMode && (
                <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#04f5ff] z-50 opacity-50" />
              )}

              {/* SIDEBAR - Styled with Glassmorphism */}
              <div className={`relative z-30 border-r transition-colors duration-700 ${
                isDarkMode 
                  ? 'bg-black/20 backdrop-blur-3xl border-white/10' 
                  : 'bg-white/70 backdrop-blur-md border-slate-200'
              }`}>
                <Sidebar isDarkMode={isDarkMode} />
              </div>

              {/* MAIN CONTENT AREA */}
              <main className="flex-1 relative z-10 flex flex-col p-4">
                <AnimatedRoutes isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              </main>

              {/* AMBIENT LIGHTING ORBS (Visual Flair) */}
              <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-1000 ${
                  isDarkMode ? 'bg-purple-600/10 opacity-100' : 'bg-purple-400/5 opacity-50'
                }`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] transition-opacity duration-1000 ${
                  isDarkMode ? 'bg-cyan-500/10 opacity-100' : 'bg-blue-400/5 opacity-50'
                }`} />
              </div>

            </motion.div>
          </Router>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;