import React from 'react';

const StadiumCrestCarousel = ({ teams, activeTeam, setActiveTeam }) => {
  return (
    <div className="w-full flex justify-center py-6 overflow-x-auto hide-scrollbar bg-black/40 border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center gap-8 px-8">
        {teams.map((team) => {
          const isActive = activeTeam?.name === team.name;

          return (
            <div
              key={team.name}
              onClick={() => setActiveTeam(team)}
              className={`relative cursor-pointer flex flex-col items-center transition-all duration-300 ease-out ${
                isActive ? 'scale-125 z-10 opacity-100' : 'scale-100 opacity-40 hover:opacity-100 hover:scale-110'
              }`}
            >
              {/* THE FIX IS HERE: team.logo instead of team.logoUrl */}
              <img
                src={team.logo} 
                alt={team.name}
                className="w-16 h-16 object-contain relative z-10 drop-shadow-2xl"
              />
              {isActive && (
                <div
                  className="w-2 h-2 rounded-full mt-4 absolute -bottom-6 transition-colors duration-300"
                  style={{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}` }}
                />
              )}
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default StadiumCrestCarousel;