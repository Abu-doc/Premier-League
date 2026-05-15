import { Link, useLocation } from "react-router-dom";

function Sidebar({ isDarkMode }) {
  const location = useLocation();

  const navItem = (path, label) => {
    const active = location.pathname === path;

    return (
      <Link
        to={path}
        className={`block px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300
        ${
          active
            ? isDarkMode 
                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,245,255,0.2)]" 
                : "bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm"
            : isDarkMode
                ? "text-white/40 hover:text-white hover:bg-white/5"
                : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="w-64 h-screen p-6 flex flex-col justify-between border-r border-white/5">

      {/* LOGO + TITLE */}
      <div>

        <div className="flex items-center gap-3 mb-12 px-2">
          <img
            src="/logos/premier-league.png"
            alt="PL Logo"
            className={`w-10 h-10 object-contain transition-all ${isDarkMode ? 'filter invert brightness-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter leading-tight">
              Neural
            </h1>
            <span className={`text-[10px] uppercase font-mono tracking-[0.3em] ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
              Engine v2.0
            </span>
          </div>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          {navItem("/", "Dashboard")}
          {navItem("/match", "Match Predictor")}
          {navItem("/team", "Team Analytics")}
          {navItem("/season", "Season Simulator")}
          {navItem("/squads", "Squad Database")}
          {navItem("/synergy", "Synergy Matrix")}
          {navItem("/arena", "Player Arena")}
          {navItem("/stadiums", "Stadium Hub")}
          {navItem("/archive", "Temporal Archive")}
          {navItem("/scout", "Transfer Oracle")}
          {navItem("/canvas", "Tactical Canvas")}
         
          
        </nav>

      </div>

      {/* FOOTER STATUS INDICATOR */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className={`text-[9px] font-mono uppercase tracking-widest ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>
                Nodes Online
            </span>
        </div>
      </div>

    </div>
  );
}

export default Sidebar;