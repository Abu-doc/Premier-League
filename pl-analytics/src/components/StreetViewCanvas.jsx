import React, { useEffect, useRef, useState } from 'react';

const StreetViewCanvas = ({ lat, lng, heading }) => {
  const panoramaRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check if the script tag is missing from index.html
    if (!window.google || !window.google.maps) {
      console.error("CRITICAL: Google Maps script not found in window.");
      setError("Google API Script Missing. Check index.html");
      return;
    }

    try {
      // 2. Force initialization
      const panorama = new window.google.maps.StreetViewPanorama(
        panoramaRef.current,
        {
          position: { lat: lat, lng: lng },
          pov: { heading: heading, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          zoomControl: false,
          panControl: false,
          fullscreenControl: false,
          linksControl: true,
          backgroundColor: '#0a0a0a',
        }
      );

      // Cleanup on exit
      return () => {
        if (panorama) panorama.setVisible(false);
        if (panoramaRef.current) panoramaRef.current.innerHTML = '';
      };
    } catch (err) {
      console.error("Failed to initialize StreetView:", err);
      setError("Failed to mount 360 Canvas.");
    }
  }, [lat, lng, heading]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0a0a]">
      {/* If it errors out, show this instead of a blank screen */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-900/20 text-red-400 font-mono">
          [SYS_ERROR]: {error}
        </div>
      )}
      
      {/* Visual scanning overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      
      {/* The Map Anchor - Forced to absolute 100% so it cannot collapse */}
      <div 
        ref={panoramaRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
        <span className="font-mono text-[10px] text-white/50 tracking-[0.2em] uppercase">
          Geospatial Link Established
        </span>
      </div>
    </div>
  );
};

export default StreetViewCanvas;