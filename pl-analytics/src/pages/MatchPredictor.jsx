import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import teams from "../data/teams";

const FALLBACK_COLOR = "#00f5ff";

const tickerNews = [
  "SYSTEM STATUS: MONTE CARLO NODES OPERATIONAL",
  "NEURAL FEED: CALCULATING LIVE GOAL PROBABILITY BASED ON POISSON LAMBDA",
  "MATCH ENGINE: SIMULATING 10,000 ITERATIONS FOR ACCURACY",
  "TACTICAL OVERRIDE: PLAYER RATINGS IMPACTING XG LAMBDA REAL-TIME",
];

const GOAL_METHODS = ["Clinical Finish", "Header from Corner", "Long-range Screamer", "Penalty", "Tap-in", "Deflected Shot"];
const CARD_REASONS = ["Tactical Foul", "Dissent", "Late Challenge", "Handball"];

const FORMATIONS = {
  "4-3-3": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "CM", top: 50, left: 30 }, { pos: "CDM", top: 55, left: 50 }, { pos: "CM", top: 50, left: 70 },
    { pos: "LW", top: 25, left: 20 }, { pos: "ST", top: 18, left: 50 }, { pos: "RW", top: 25, left: 80 },
  ],
  "4-4-2": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "LM", top: 48, left: 15 }, { pos: "CM", top: 50, left: 38 }, { pos: "CM", top: 50, left: 62 }, { pos: "RM", top: 48, left: 85 },
    { pos: "ST", top: 20, left: 35 }, { pos: "ST", top: 20, left: 65 },
  ],
  "4-2-3-1": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "CDM", top: 55, left: 35 }, { pos: "CDM", top: 55, left: 65 },
    { pos: "LAM", top: 35, left: 20 }, { pos: "CAM", top: 38, left: 50 }, { pos: "RAM", top: 35, left: 80 },
    { pos: "ST", top: 18, left: 50 },
  ],
  "3-5-2": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "CB", top: 75, left: 25 }, { pos: "CB", top: 78, left: 50 }, { pos: "CB", top: 75, left: 75 },
    { pos: "LWB", top: 50, left: 10 }, { pos: "RWB", top: 50, left: 90 },
    { pos: "CM", top: 45, left: 30 }, { pos: "CDM", top: 55, left: 50 }, { pos: "CM", top: 45, left: 70 },
    { pos: "ST", top: 20, left: 35 }, { pos: "ST", top: 20, left: 65 },
  ],
  "5-3-2": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 10 }, { pos: "CB", top: 75, left: 30 }, { pos: "CB", top: 78, left: 50 }, { pos: "CB", top: 75, left: 70 }, { pos: "RB", top: 70, left: 90 },
    { pos: "CM", top: 45, left: 30 }, { pos: "CDM", top: 52, left: 50 }, { pos: "CM", top: 45, left: 70 },
    { pos: "ST", top: 20, left: 35 }, { pos: "ST", top: 20, left: 65 },
  ],
  "4-1-4-1": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "CDM", top: 60, left: 50 },
    { pos: "LM", top: 40, left: 15 }, { pos: "CM", top: 42, left: 38 }, { pos: "CM", top: 42, left: 62 }, { pos: "RM", top: 40, left: 85 },
    { pos: "ST", top: 18, left: 50 },
  ],
  "3-4-3": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "CB", top: 75, left: 25 }, { pos: "CB", top: 78, left: 50 }, { pos: "CB", top: 75, left: 75 },
    { pos: "LWB", top: 50, left: 12 }, { pos: "CM", top: 52, left: 38 }, { pos: "CM", top: 52, left: 62 }, { pos: "RWB", top: 50, left: 88 },
    { pos: "LW", top: 22, left: 20 }, { pos: "ST", top: 18, left: 50 }, { pos: "RW", top: 22, left: 80 },
  ],
  "5-4-1": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 10 }, { pos: "CB", top: 75, left: 30 }, { pos: "CB", top: 78, left: 50 }, { pos: "CB", top: 75, left: 70 }, { pos: "RB", top: 70, left: 90 },
    { pos: "LM", top: 48, left: 15 }, { pos: "CM", top: 50, left: 38 }, { pos: "CM", top: 50, left: 62 }, { pos: "RM", top: 48, left: 85 },
    { pos: "ST", top: 20, left: 50 },
  ],
  "4-4-1-1": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "LM", top: 48, left: 15 }, { pos: "CM", top: 50, left: 38 }, { pos: "CM", top: 50, left: 62 }, { pos: "RM", top: 48, left: 85 },
    { pos: "CF", top: 32, left: 50 },
    { pos: "ST", top: 18, left: 50 },
  ],
  "3-4-2-1": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "CB", top: 75, left: 25 }, { pos: "CB", top: 78, left: 50 }, { pos: "CB", top: 75, left: 75 },
    { pos: "LWB", top: 50, left: 12 }, { pos: "CM", top: 52, left: 38 }, { pos: "CM", top: 52, left: 62 }, { pos: "RWB", top: 50, left: 88 },
    { pos: "CAM", top: 32, left: 32 }, { pos: "CAM", top: 32, left: 68 },
    { pos: "ST", top: 18, left: 50 },
  ],
  "4-5-1": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "LM", top: 45, left: 15 }, { pos: "CM", top: 50, left: 32 }, { pos: "CDM", top: 55, left: 50 }, { pos: "CM", top: 50, left: 68 }, { pos: "RM", top: 45, left: 85 },
    { pos: "ST", top: 18, left: 50 },
  ],
  "4-2-2-2": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 70, left: 15 }, { pos: "CB", top: 75, left: 38 }, { pos: "CB", top: 75, left: 62 }, { pos: "RB", top: 70, left: 85 },
    { pos: "CDM", top: 55, left: 35 }, { pos: "CDM", top: 55, left: 65 },
    { pos: "CAM", top: 38, left: 30 }, { pos: "CAM", top: 38, left: 70 },
    { pos: "ST", top: 20, left: 35 }, { pos: "ST", top: 20, left: 65 },
  ]
};

const NARRATIVE_BANK = {
  openers: [
    "A night of pure tactical warfare at the stadium.",
    "Chaos erupted from the opening whistle in this high-stakes encounter.",
    "A match defined by narrow margins and clinical execution.",
    "The algorithm suggests a masterpiece in the making; the stage is set.",
    "The noise is deafening as both sets of players emerge into the arena."
  ],
  GOAL: [
    "The deadlock was broken by {player}, who unleashed a {reason}.",
    "Unbelievable scenes! {player} found the back of the net with a {reason}.",
    "Precision and power: {player} strikes home a {reason}.",
    "The keeper was a mere spectator for that {reason} from {player}.",
    "Tactical perfection. A team move finished ruthlessly by {player} via {reason}.",
  ],
  YELLOW: [
    "Tensions flared as {player} was booked for a {reason}.",
    "The referee reached for the pocket; {player} cautioned after a {reason}.",
    "Discipline wavered in the heat of the moment, leading to a yellow card for {player}.",
  ],
  SUB: [
    "Tactical adjustment: {player} enters the fray.",
    "Fresh legs required. {player} introduced to shift the momentum.",
    "The manager looks to the bench, sending on {player}."
  ],
  closers: [
    "The final whistle marks the end of a breathtaking display of football.",
    "Tactical dominance secured the result today.",
    "A result that will be analyzed by the neural nodes for weeks to come.",
    "The numbers don't lie—the better team walked away with the points today.",
  ]
};

function MatchPredictor({ isDarkMode }) {
  const [home, setHome] = useState(null);
  const [away, setAway] = useState(null);
  const [homeSquad, setHomeSquad] = useState([]);
  const [awaySquad, setAwaySquad] = useState([]);
  
  // Tactical Selection States
  const [homeXI, setHomeXI] = useState(Array(11).fill(null));
  const [awayXI, setAwayXI] = useState(Array(11).fill(null));
  const [homeBench, setHomeBench] = useState(Array(5).fill(null));
  const [awayBench, setAwayBench] = useState(Array(5).fill(null));
  
  const [activeSide, setActiveSide] = useState("home"); 
  const [activeSlot, setActiveSlot] = useState(0); 
  const [activeList, setActiveList] = useState("XI"); 
  const [formation, setFormation] = useState("4-3-3");
  
  // Simulation States
  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [result, setResult] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [postMatchStats, setPostMatchStats] = useState(null);

  const [matchEvents, setMatchEvents] = useState([]); 
  const [isHalftime, setIsHalftime] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [finalNarrative, setFinalNarrative] = useState(""); 
  
  const simInterval = useRef(null);
  const resultRef = useRef(null);
  const matchEventsRef = useRef(matchEvents);
  const teamScrollRef = useRef(null);
  
  // NEW: Stoppage Time Tracker
  const stoppageTimeRef = useRef(0);

  const slamTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };

  // --- REFS FOR LIVE ENGINE STATE ---
  const homeXIRef = useRef(homeXI);
  const awayXIRef = useRef(awayXI);
  const homeBenchRef = useRef(homeBench);
  const awayBenchRef = useRef(awayBench);

  useEffect(() => { resultRef.current = result; }, [result]);
  useEffect(() => { matchEventsRef.current = matchEvents; }, [matchEvents]);
  useEffect(() => { homeXIRef.current = homeXI; }, [homeXI]);
  useEffect(() => { awayXIRef.current = awayXI; }, [awayXI]);
  useEffect(() => { homeBenchRef.current = homeBench; }, [homeBench]);
  useEffect(() => { awayBenchRef.current = awayBench; }, [awayBench]);

  const sortSquad = (squad) => {
    const order = { "FWD": 0, "MID": 1, "DEF": 2, "GK": 3 };
    return [...squad].sort((a, b) => order[a.Position] - order[b.Position]);
  };

  // --- SMOOTH SCROLLING FOR TEAMS CAROUSEL ---
  const scrollTeams = (direction) => {
    if (teamScrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      teamScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handlePlayerPick = (playerName, rosterSide) => {
    if (isSimulating) return;

    let targetSide = activeSide;
    if (rosterSide !== activeSide) {
        targetSide = rosterSide;
        setActiveSide(rosterSide);
    }

    const currentXI = targetSide === "home" ? homeXI : awayXI;
    const currentBench = targetSide === "home" ? homeBench : awayBench;
    const setXI = targetSide === "home" ? setHomeXI : setAwayXI;
    const setBench = targetSide === "home" ? setHomeBench : setAwayBench;

    if (currentXI.includes(playerName)) {
        let newXI = [...currentXI];
        newXI[newXI.indexOf(playerName)] = null;
        setXI(newXI);
        return;
    }
    if (currentBench.includes(playerName)) {
        let newBench = [...currentBench];
        newBench[newBench.indexOf(playerName)] = null;
        setBench(newBench);
        return;
    }

    if (activeList === "XI" && activeSlot !== null) {
        let newXI = [...currentXI];
        newXI[activeSlot] = playerName;
        setXI(newXI);

        const nextEmpty = newXI.findIndex((p, idx) => p === null && idx > activeSlot);
        if (nextEmpty !== -1) setActiveSlot(nextEmpty);
        else if (newXI.includes(null)) setActiveSlot(newXI.findIndex(p => p === null));
        else {
            setActiveList("BENCH");
            setActiveSlot(0);
        }
    } else if (activeList === "BENCH" && activeSlot !== null) {
        let newBench = [...currentBench];
        newBench[activeSlot] = playerName;
        setBench(newBench);

        const nextEmpty = newBench.findIndex((p, idx) => p === null && idx > activeSlot);
        if (nextEmpty !== -1) setActiveSlot(nextEmpty);
        else if (newBench.includes(null)) setActiveSlot(newBench.findIndex(p => p === null));
        else {
            if (targetSide === "home" && (awayXI.includes(null) || awayBench.includes(null))) {
                setActiveSide("away");
                setActiveList(awayXI.includes(null) ? "XI" : "BENCH");
                setActiveSlot(0);
            } else {
                setActiveSlot(null);
            }
        }
    }
  };

  const generateNarrativeReport = (events) => {
    if (events.length === 0) return "A quiet tactical stalemate with no major incidents.";
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let story = random(NARRATIVE_BANK.openers) + " ";
    const highlights = events.filter(e => e.type !== 'SUB').slice(-3); 
    highlights.forEach(ev => {
      let template = random(NARRATIVE_BANK[ev.type]);
      story += template.replace("{player}", ev.player).replace("{reason}", ev.reason.toLowerCase()) + " ";
    });
    story += random(NARRATIVE_BANK.closers);
    return story;
  };

  const generatePostMatchStats = () => {
    const hWinProb = resultRef.current ? resultRef.current.home_win : 0.5;
    const aWinProb = resultRef.current ? resultRef.current.away_win : 0.5;

    let hPoss = 50 + (hWinProb - aWinProb) * 20 + (homeScore - awayScore) * 2;
    hPoss = Math.max(35, Math.min(65, Math.round(hPoss)));
    const aPoss = 100 - hPoss;

    const hShots = Math.max(homeScore, Math.round((hPoss * 0.25) + Math.random() * 6));
    const aShots = Math.max(awayScore, Math.round((aPoss * 0.25) + Math.random() * 6));
    
    const hPass = Math.round(75 + (hPoss * 0.15) + Math.random() * 5);
    const aPass = Math.round(75 + (aPoss * 0.15) + Math.random() * 5);

    const hTackles = Math.round(12 + (aPoss * 0.2) + Math.random() * 5);
    const aTackles = Math.round(12 + (hPoss * 0.2) + Math.random() * 5);

    const hXG = (homeScore * 0.65 + hShots * 0.08 + Math.random() * 0.5).toFixed(2);
    const aXG = (awayScore * 0.65 + aShots * 0.08 + Math.random() * 0.5).toFixed(2);

    const momentum = Array.from({length: 18}).map((_, i) => {
        const minStart = i * 5;
        const minEnd = (i + 1) * 5;
        let hMom = Math.random() * 30 + 10;
        let aMom = Math.random() * 30 + 10;

        matchEventsRef.current.forEach(ev => {
            if (ev.min >= minStart && ev.min < minEnd) {
                if (ev.team === 'home') hMom += (ev.type === 'GOAL' ? 60 : 30);
                else aMom += (ev.type === 'GOAL' ? 60 : 30);
            }
        });

        const total = hMom + aMom;
        return {
            time: `${minEnd}'`,
            h: (hMom / total) * 100,
            a: (aMom / total) * 100
        };
    });

    return {
        possession: { h: hPoss, a: aPoss },
        bars: [
            { label: "Expected Goals (xG)", h: hXG, a: aXG, max: Math.max(hXG, aXG, 3) },
            { label: "Total Shots", h: hShots, a: aShots, max: Math.max(hShots, aShots, 10) },
            { label: "Pass Accuracy %", h: hPass, a: aPass, max: 100 },
            { label: "Tackles Won", h: hTackles, a: aTackles, max: Math.max(hTackles, aTackles, 15) }
        ],
        momentum
    };
  };

  const startSimulation = () => {
    if (simInterval.current) clearInterval(simInterval.current);
    if (minute >= 90 + stoppageTimeRef.current && minute > 0) { 
        setMinute(0); setHomeScore(0); setAwayScore(0); setMatchEvents([]); 
        setIsHalftime(false); setFinalNarrative(""); setPostMatchStats(null);
        stoppageTimeRef.current = 0; // Reset extra time
    } else if (isHalftime) {
        setIsHalftime(false); setMinute(46); 
    }
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simInterval.current) clearInterval(simInterval.current);
  };

  useEffect(() => {
    if (isSimulating && minute < 105) { // Safe upper bound to accommodate stoppage time
      if (simInterval.current) clearInterval(simInterval.current);
      simInterval.current = setInterval(() => {
        setMinute(prev => {
            if (prev === 45 && !isHalftime) { stopSimulation(); setIsHalftime(true); return 45; }
            
            // --- STOPPAGE TIME GENERATION ---
            let currentStoppage = stoppageTimeRef.current;
            if (prev === 90 && currentStoppage === 0) {
                currentStoppage = Math.floor(Math.random() * 5) + 2; // Generates 2 to 6 minutes of Extra Time
                stoppageTimeRef.current = currentStoppage;
            }

            const nextMin = prev + 1;
            const liveResult = resultRef.current;
            
            if (liveResult) {
              const remaining = Math.max(1, 90 + currentStoppage - nextMin);
              const hProb = liveResult.home_xg_remaining / remaining;
              const aProb = liveResult.away_xg_remaining / remaining;
              if (Math.random() < hProb) triggerEvent('home', 'GOAL', nextMin);
              if (Math.random() < aProb) triggerEvent('away', 'GOAL', nextMin);
              if (Math.random() < 0.008) triggerEvent(Math.random() > 0.5 ? 'home' : 'away', 'YELLOW', nextMin);
              
              if ([65, 75, 82].includes(nextMin)) {
                 if (Math.random() < 0.4) triggerEvent('home', 'SUB', nextMin);
                 if (Math.random() < 0.4) triggerEvent('away', 'SUB', nextMin);
              }
            }
            
            const maxMin = 90 + currentStoppage;
            if (nextMin >= maxMin && prev >= 90) { stopSimulation(); return maxMin; }
            return nextMin;
        });
      }, 250); 
    } else {
      stopSimulation();
    }
    return () => { if (simInterval.current) clearInterval(simInterval.current); };
  }, [isSimulating, isHalftime]);

  useEffect(() => {
    if (minute === 45 && isHalftime) {
        setFinalNarrative(generateNarrativeReport(matchEvents));
    }
    if (minute >= 90 + stoppageTimeRef.current && minute > 0 && !isSimulating) {
        setFinalNarrative(generateNarrativeReport(matchEvents));
        if (!postMatchStats) setPostMatchStats(generatePostMatchStats());
    }
  }, [isHalftime, minute, isSimulating]);

  const triggerEvent = (side, type, currentMin) => {
    const currentXI = side === 'home' ? homeXIRef.current : awayXIRef.current;
    const currentBench = side === 'home' ? homeBenchRef.current : awayBenchRef.current;
    const setXI = side === 'home' ? setHomeXI : setAwayXI;
    const setBench = side === 'home' ? setHomeBench : setAwayBench;
    const squadData = side === 'home' ? homeSquad : awaySquad;

    const xiNames = currentXI.filter(p => p !== null);
    
    if (type === "SUB") {
        const availableSubs = currentBench.filter(p => p !== null);
        if (availableSubs.length === 0) return;

        const subIn = availableSubs[Math.floor(Math.random() * availableSubs.length)];
        const subInRecord = squadData.find(p => p.Name === subIn);
        const isSubInGK = subInRecord && subInRecord.Position === "GK";

        let eligibleToSubOut = [];
        if (isSubInGK) {
             eligibleToSubOut = xiNames.filter(name => {
                 const p = squadData.find(x => x.Name === name);
                 return p && p.Position === "GK";
             });
        } else {
             eligibleToSubOut = xiNames.filter(name => {
                 const p = squadData.find(x => x.Name === name);
                 return p && p.Position !== "GK";
             });
        }
        
        if (eligibleToSubOut.length === 0) return;

        const playerOff = eligibleToSubOut[Math.floor(Math.random() * eligibleToSubOut.length)];

        let newXI = [...currentXI];
        newXI[newXI.indexOf(playerOff)] = subIn;
        setXI(newXI);

        let newBench = [...currentBench];
        newBench[newBench.indexOf(subIn)] = null;
        setBench(newBench);

        if (side === 'home') {
             homeXIRef.current = newXI; homeBenchRef.current = newBench;
        } else {
             awayXIRef.current = newXI; awayBenchRef.current = newBench;
        }

        setMatchEvents(prev => [...prev, {
          min: currentMin, type, team: side, icon: "🔄",
          player: `${subIn} IN, ${playerOff} OUT`, reason: "Tactical Swap"
        }]);
        return;
    }

    let eligibleNames = xiNames;
    if (type === "GOAL") {
        const outfielders = xiNames.filter(name => {
            const playerRecord = squadData.find(p => p.Name === name);
            return playerRecord && playerRecord.Position !== "GK";
        });
        if (outfielders.length > 0) eligibleNames = outfielders;
    }

    const actor = eligibleNames[Math.floor(Math.random() * eligibleNames.length)] || "System Unit";
    const reason = type === "GOAL" ? GOAL_METHODS[Math.floor(Math.random() * GOAL_METHODS.length)] : CARD_REASONS[Math.floor(Math.random() * CARD_REASONS.length)];

    setMatchEvents(prev => [...prev, {
      min: currentMin, type, team: side, icon: type === "GOAL" ? "⚽" : "🟨",
      player: actor, reason
    }]);

    if (type === "GOAL") {
      if (side === 'home') setHomeScore(s => s + 1);
      else setAwayScore(s => s + 1);
    }
  };

  const handleTeamClick = (team) => {
    stoppageTimeRef.current = 0; // Reset extra time on new match
    if (!home) setHome(team);
    else if (!away && team.name !== home.name) setAway(team);
    else { 
        setHome(team); setAway(null); setMinute(0); setHomeScore(0); setAwayScore(0);
        setHomeXI(Array(11).fill(null)); setAwayXI(Array(11).fill(null)); 
        setHomeBench(Array(5).fill(null)); setAwayBench(Array(5).fill(null));
        setMatchEvents([]); setResult(null); setHeatmap([]); setPostMatchStats(null);
        setIsHalftime(false); setFinalNarrative(""); setActiveSlot(0); setActiveList("XI");
    }
  };

  useEffect(() => {
    const validHome = homeXI.filter(p => p !== null);
    const validAway = awayXI.filter(p => p !== null);
    if (home && away && validHome.length === 11 && validAway.length === 11) {
      axios.post("http://127.0.0.1:8000/predict-match", {
        home_team: home.name, away_team: away.name,
        home_lineup: validHome, away_lineup: validAway,
        current_home_score: homeScore, current_away_score: awayScore, minute
      }).then(res => {
        setResult(res.data);
        axios.get(`http://127.0.0.1:8000/match-heatmap?home_team=${home.name}&away_team=${away.name}&h_score=${homeScore}&a_score=${awayScore}&min=${minute}`)
          .then(heat => setHeatmap(heat.data));
      });
    }
  }, [home, away, homeScore, awayScore, minute, homeXI, awayXI]);

  useEffect(() => {
    if (home) axios.get(`http://127.0.0.1:8000/get-squad?team=${home.name}`).then(res => setHomeSquad(sortSquad(res.data)));
    if (away) axios.get(`http://127.0.0.1:8000/get-squad?team=${away.name}`).then(res => setAwaySquad(sortSquad(res.data)));
  }, [home, away]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-all duration-700 ${isDarkMode ? 'bg-[#01040f] text-white' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* BULLETPROOF SCROLLBAR HIDER */}
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BACKGROUND LOGOS */}
      <div className="fixed inset-0 z-0 pointer-events-none flex">
        <div className="w-1/2 relative flex items-center justify-center border-r border-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {home && <motion.img key={home.name} initial={{ x: -150, opacity: 0 }} animate={{ x: 0, opacity: 0.12 }} exit={{ x: -150, opacity: 0 }} transition={slamTransition} src={home.logo} className="absolute w-[80%] grayscale invert mix-blend-overlay" />}
          </AnimatePresence>
        </div>
        <div className="w-1/2 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {away && <motion.img key={away.name} initial={{ x: 150, opacity: 0 }} animate={{ x: 0, opacity: 0.12 }} exit={{ x: 150, opacity: 0 }} transition={slamTransition} src={away.logo} className="absolute w-[80%] grayscale invert mix-blend-overlay" />}
          </AnimatePresence>
        </div>
      </div>

      {/* MAIN WRAPPER */}
      <div className="relative z-10 w-full pb-48">
        
        {/* HEADER & NEW TEAM CAROUSEL */}
        <div className="pt-10 pb-6 text-center w-full">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-8 drop-shadow-2xl text-white">NEURAL <span className="text-cyan-400">ENGINE</span></h1>
          
          <div className="relative max-w-7xl mx-auto px-12 group mb-8">
            <button 
              onClick={() => scrollTeams("left")} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/80 border border-white/10 rounded-full text-white hover:text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_#00f5ff] backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            >
              &#10094;
            </button>

            <div 
              ref={teamScrollRef}
              className="flex justify-start gap-4 overflow-x-auto hide-scroll py-4 px-2 snap-x snap-mandatory scroll-smooth"
            >
              {teams.map((t) => (
                <motion.div 
                  key={t.name} 
                  whileHover={{ scale: 1.15, y: -5 }} 
                  onClick={() => handleTeamClick(t)} 
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer border-2 transition-all snap-center ${
                      home?.name === t.name ? `border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_#00f5ff44]` 
                    : away?.name === t.name ? `border-purple-500 bg-purple-500/20 shadow-[0_0_20px_#7000ff44]` 
                    : 'border-white/10 bg-black/40 hover:bg-white/5'
                  }`}
                  style={home?.name === t.name && t.color ? { borderColor: t.color, backgroundColor: `${t.color}33`, boxShadow: `0 0 20px ${t.color}44` } : 
                         away?.name === t.name && t.color ? { borderColor: t.color, backgroundColor: `${t.color}33`, boxShadow: `0 0 20px ${t.color}44` } : {}}
                >
                  <img src={t.logo} className="w-10 h-10 object-contain drop-shadow-lg" alt={t.name} />
                </motion.div>
              ))}
            </div>

            <button 
              onClick={() => scrollTeams("right")} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/80 border border-white/10 rounded-full text-white hover:text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_#00f5ff] backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
            >
              &#10095;
            </button>
            
            <div className={`absolute top-0 left-8 w-16 h-full bg-gradient-to-r ${isDarkMode ? 'from-[#01040f]' : 'from-slate-100'} to-transparent pointer-events-none z-10`} />
            <div className={`absolute top-0 right-8 w-16 h-full bg-gradient-to-l ${isDarkMode ? 'from-[#01040f]' : 'from-slate-100'} to-transparent pointer-events-none z-10`} />
          </div>
        </div>

        {/* MAIN MATCH UI GRID */}
        <div className="grid grid-cols-4 w-full px-6 xl:px-10 items-start gap-6 mt-10">
          
          {/* HOME ROSTER */}
          <div className="col-span-1 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {home && (
                <motion.div key={home.name} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={slamTransition} className="mb-6">
                  <img src={home.logo} className="w-32 h-32 object-contain drop-shadow-[0_0_30px_#00f5ff66]" style={{ filter: `drop-shadow(0 0 30px ${home.color || FALLBACK_COLOR}66)` }} />
                </motion.div>
              )}
            </AnimatePresence>
            {home && (
              <div className={`w-full p-4 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md transition-all ${activeSide === 'home' ? 'border-cyan-400/50 shadow-[0_0_20px_#00f5ff22]' : ''}`} style={activeSide === 'home' ? { borderColor: `${home.color || FALLBACK_COLOR}88`, boxShadow: `0 0 20px ${home.color || FALLBACK_COLOR}22` } : {}} onClick={() => {setActiveSide("home"); setActiveList("XI");}}>
                <h3 className="font-black italic mb-4 uppercase text-[10px] tracking-widest text-center" style={{ color: home.color || FALLBACK_COLOR }}>
                    {home.name} Units {!homeXI.includes(null) && !homeBench.includes(null) && <span className="text-white ml-2">✓ LOCKED</span>}
                </h3>
                <div className="space-y-1.5 h-[550px] overflow-y-auto hide-scroll pr-1">
                  {homeSquad.map(p => {
                    const isXI = homeXI.includes(p.Name);
                    const isBench = homeBench.includes(p.Name);
                    return (
                        <button key={p.Name} onClick={() => handlePlayerPick(p.Name, "home")} className={`w-full p-2.5 rounded-xl border text-[10px] text-left transition-all ${isXI ? 'border-cyan-400 bg-cyan-400/20 shadow-md' : isBench ? 'border-emerald-400 bg-emerald-400/20 shadow-md' : 'border-white/5 opacity-40 hover:opacity-100'}`} style={isXI ? { borderColor: home.color || FALLBACK_COLOR, backgroundColor: `${home.color || FALLBACK_COLOR}33` } : {}}>
                        <span className="font-bold text-white">{p.Name}</span> 
                        <span className="float-right opacity-50 text-white">{isBench ? 'SUB' : p.Position} | {p.Rating}</span>
                        </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CENTER ARENA */}
          <div className="col-span-2 relative min-h-[600px] flex flex-col items-center">
            <AnimatePresence mode="wait">
              {(home && away && !isSimulating && minute === 0) ? (
                <motion.div key="pitch-view" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(20px)" }} className="w-full flex flex-col items-center">
                  
                  <div className="flex gap-2 mb-6 overflow-x-auto hide-scroll w-full max-w-[450px] py-2">
                    {Object.keys(FORMATIONS).map(f => (
                      <button key={f} onClick={() => setFormation(f)} className={`px-4 py-1.5 rounded-full text-[9px] whitespace-nowrap font-black border transition-all ${formation === f ? 'bg-cyan-400 text-black border-cyan-400' : 'border-white/20 text-white opacity-40 hover:opacity-100'}`}>{f}</button>
                    ))}
                  </div>

                  <div className="relative w-[420px] h-[520px] bg-gradient-to-b from-emerald-900/40 to-black/80 border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/5 rounded-full" />
                    
                    {FORMATIONS[formation].map((slot, i) => {
                      const filledName = activeSide === 'home' ? homeXI[i] : awayXI[i];
                      const isActive = activeList === "XI" && activeSlot === i;
                      const isHome = activeSide === "home";
                      const activeColor = isHome ? (home.color || FALLBACK_COLOR) : (away.color || "#7000ff");
                      
                      return (
                        <motion.div key={i} style={{ top: `${slot.top}%`, left: `${slot.left}%` }} onClick={() => {setActiveSide(activeSide); setActiveList("XI"); setActiveSlot(i);}} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10">
                          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all ${isActive ? `scale-125 border-white bg-white text-black shadow-[0_0_20px_white]` : filledName ? `border-white text-black` : 'border-white/20 text-white/30 bg-black/40'}`} style={filledName && !isActive ? { backgroundColor: activeColor } : {}}>
                            {filledName ? '✓' : slot.pos}
                          </div>
                          {filledName && <span className={`text-[7px] mt-1 font-black whitespace-nowrap bg-black/90 px-1.5 py-0.5 rounded uppercase tracking-tighter`} style={{ color: activeColor }}>{filledName}</span>}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* BENCH UI */}
                  {(!homeXI.includes(null) || !awayXI.includes(null)) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-[420px] p-4 bg-black/40 rounded-3xl border border-white/10 backdrop-blur-md">
                        <h4 className="text-center text-[9px] uppercase font-black tracking-widest text-emerald-400 mb-3">Tactical Substitutes (5)</h4>
                        <div className="flex justify-center gap-3">
                            {Array(5).fill(null).map((_, i) => {
                                const filledName = activeSide === 'home' ? homeBench[i] : awayBench[i];
                                const isActive = activeList === "BENCH" && activeSlot === i;
                                return (
                                    <div key={i} onClick={() => {setActiveList("BENCH"); setActiveSlot(i);}} className="flex flex-col items-center cursor-pointer w-16">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[8px] font-black transition-all ${isActive ? 'scale-110 border-white bg-white text-black shadow-[0_0_15px_white]' : filledName ? 'bg-emerald-400 border-white text-black' : 'border-white/20 text-white/30 bg-black'}`}>
                                            {filledName ? '✓' : `SUB`}
                                        </div>
                                        {filledName && <span className="text-[6px] mt-1 font-black truncate w-full text-center bg-black/80 px-1 rounded text-emerald-400">{filledName}</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                  )}

                  {(!homeXI.includes(null) && !awayXI.includes(null) && !homeBench.includes(null) && !awayBench.includes(null)) && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startSimulation} className="mt-8 px-14 py-4 bg-cyan-400 text-black font-black italic rounded-2xl shadow-[0_0_30px_#00f5ff] uppercase tracking-widest text-sm">Execute Neural Sim</motion.button>
                  )}
                </motion.div>
              ) : (!home || !away) ? (
                <div className="flex items-center justify-center h-full opacity-20 text-4xl font-black italic text-white uppercase tracking-tighter text-center pt-32">Choose Your Opponents</div>
              ) : (
                <motion.div key="sim-view" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center pt-10 text-white">
                  <div className="text-[12rem] font-black italic flex gap-10 leading-none drop-shadow-2xl">
                    <motion.span key={`h-${homeScore}`}>{Number(homeScore)}</motion.span>
                    <span className="opacity-10 text-6xl mt-8">:</span>
                    <motion.span key={`a-${awayScore}`}>{Number(awayScore)}</motion.span>
                  </div>

                  <div className="w-[450px] h-[160px] overflow-y-auto hide-scroll flex flex-col gap-2 mb-6 bg-white/5 border border-white/10 rounded-3xl p-4 shadow-inner relative backdrop-blur-sm">
                      <AnimatePresence>
                          {matchEvents.length === 0 ? (
                              <div className="m-auto text-[10px] text-white/30 uppercase tracking-widest italic font-black">Scanning for Neural Events...</div>
                          ) : (
                              matchEvents.slice().reverse().map((ev, i) => {
                                const evColor = ev.team === 'home' ? (home.color || FALLBACK_COLOR) : (away.color || '#7000ff');
                                return (
                                  <motion.div key={`${ev.min}-${i}`} initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}} className="flex justify-between items-center p-3 rounded-2xl border bg-black/40" style={{ borderColor: `${evColor}44`, color: evColor }}>
                                      <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-black bg-black/50 px-2 py-1 rounded-lg text-white shadow-inner">{ev.min}'</span>
                                          <span className="text-[10px] font-bold uppercase tracking-wider">{ev.player}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <span className="text-[8px] uppercase tracking-widest text-white/50">{ev.reason}</span>
                                          <span className="text-lg drop-shadow-md">{ev.icon}</span>
                                      </div>
                                  </motion.div>
                                );
                              })
                          )}
                      </AnimatePresence>
                  </div>

                  <div className="w-[450px] space-y-6">
                      
                      {/* DYNAMIC EXTRA TIME CLOCK */}
                      <div className="relative pt-4 pb-2">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black font-black px-4 py-1 text-[10px] italic rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 whitespace-nowrap flex items-center gap-2">
                              {minute > 90 ? (
                                  <>
                                      <span className="text-red-600 animate-pulse">+{stoppageTimeRef.current} MINS</span>
                                      <span>90+{minute - 90}' MIN</span>
                                  </>
                              ) : minute === 90 && stoppageTimeRef.current > 0 ? (
                                  <>
                                      <span className="text-red-600 animate-pulse">+{stoppageTimeRef.current} MINS</span>
                                      <span>90' MIN</span>
                                  </>
                              ) : (
                                  <span>{minute}' MIN</span>
                              )}
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden shadow-inner flex">
                              <motion.div animate={{ width: `${Math.min(100, (minute / 90) * 100)}%` }} className={`h-full shadow-[0_0_15px_white] ${minute > 90 ? 'bg-red-500' : 'bg-white'}`} />
                          </div>
                      </div>

                      <button onClick={isSimulating ? stopSimulation : startSimulation} className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.3em] transition-all border-2 ${isSimulating ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-cyan-500 border-cyan-300 text-black shadow-xl hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] hover:scale-105'}`}>
                        {isSimulating ? "PAUSE SIM" : isHalftime ? "START 2ND HALF" : (minute >= 90 + stoppageTimeRef.current && minute > 0 ? "RE-EXECUTE SIM" : "EXECUTE NEURAL SIM")}
                      </button>

                      {(isHalftime || (minute >= 90 + stoppageTimeRef.current && minute > 0)) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-black/60 rounded-3xl border border-cyan-500/30 font-mono text-[11px] leading-relaxed backdrop-blur-xl shadow-2xl">
                            <div className="text-cyan-400 mb-3 uppercase font-black border-b border-white/10 pb-2 flex justify-between items-center">
                              <span>Neural_Narrative_Output</span>
                              <span className="bg-cyan-500 text-black px-2 py-0.5 rounded-sm">{(minute >= 90 + stoppageTimeRef.current && minute > 0) ? "FINAL" : "HT"}</span>
                            </div>
                            <p className="text-white text-center italic mt-4 mb-2">"{finalNarrative || "Synthesizing tactical summary..."}"</p>
                        </motion.div>
                      )}
                      
                      {result && (
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/50 px-2">
                                <span>{home.name} Win</span>
                                <span>Draw</span>
                                <span>{away.name} Win</span>
                            </div>
                            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                                <motion.div animate={{ width: `${result.home_win * 100}%` }} className="h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: home.color || FALLBACK_COLOR }} />
                                <motion.div animate={{ width: `${result.draw * 100}%` }} className="h-full bg-slate-700" />
                                <motion.div animate={{ width: `${result.away_win * 100}%` }} className="h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: away.color || "#7000ff" }} />
                            </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AWAY SIDE */}
          <div className="col-span-1 flex flex-col items-center">
             <AnimatePresence mode="wait">
              {away && (
                <motion.div key={away.name} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={slamTransition} className="mb-6">
                  <img src={away.logo} className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(112,0,255,0.4)]" style={{ filter: `drop-shadow(0 0 30px ${away.color || "#7000ff"}66)` }} />
                </motion.div>
              )}
            </AnimatePresence>
            {away && (
              <div className={`w-full p-4 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md transition-all ${activeSide === 'away' ? 'border-purple-500/50 shadow-[0_0_20px_#7000ff22]' : ''}`} style={activeSide === 'away' ? { borderColor: `${away.color || "#7000ff"}88`, boxShadow: `0 0 20px ${away.color || "#7000ff"}22` } : {}} onClick={() => {setActiveSide("away"); setActiveList("XI");}}>
                <h3 className="font-black italic mb-4 uppercase text-[10px] tracking-widest text-center" style={{ color: away.color || "#7000ff" }}>
                    {away.name} Units {!awayXI.includes(null) && !awayBench.includes(null) && <span className="text-white ml-2">✓ LOCKED</span>}
                </h3>
                <div className="space-y-1.5 h-[550px] overflow-y-auto hide-scroll pr-1">
                  {awaySquad.map(p => {
                    const isXI = awayXI.includes(p.Name);
                    const isBench = awayBench.includes(p.Name);
                    return (
                        <button key={p.Name} onClick={() => handlePlayerPick(p.Name, "away")} className={`w-full p-2.5 rounded-xl border text-[10px] text-left transition-all ${isXI ? 'border-purple-500 bg-purple-500/20 shadow-md' : isBench ? 'border-emerald-400 bg-emerald-400/20 shadow-md' : 'border-white/5 opacity-40 hover:opacity-100'}`} style={isXI ? { borderColor: away.color || "#7000ff", backgroundColor: `${away.color || "#7000ff"}33` } : {}}>
                        <span className="font-bold text-white">{p.Name}</span> 
                        <span className="float-right opacity-50 text-white">{isBench ? 'SUB' : p.Position} | {p.Rating}</span>
                        </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* POST-MATCH ANALYTICS DASHBOARD & HEATMAP */}
        <AnimatePresence>
          {home && away && heatmap.length > 0 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-10 mt-16 pb-20 max-w-6xl mx-auto flex flex-col gap-6">
              
              <AnimatePresence>
                  {minute >= 90 + stoppageTimeRef.current && minute > 0 && postMatchStats && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-3 gap-6 overflow-hidden">
                          
                          <div className="col-span-1 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl bg-black/40 shadow-2xl flex flex-col items-center justify-center relative">
                              <h3 className="absolute top-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic">Ball Possession</h3>
                              <svg width="200" height="200" viewBox="0 0 42 42" className="mt-6">
                                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke={away.color || "#7000ff"} strokeWidth="4" />
                                  <motion.circle cx="21" cy="21" r="15.9155" fill="transparent" stroke={home.color || FALLBACK_COLOR} strokeWidth="4"
                                      strokeDasharray={`${postMatchStats.possession.h} ${postMatchStats.possession.a}`} strokeDashoffset="25"
                                      initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${postMatchStats.possession.h} ${postMatchStats.possession.a}` }} transition={{ duration: 1.5, ease: "easeOut" }}
                                  />
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center mt-6">
                                  <span className="text-3xl font-black italic text-white" style={{ filter: `drop-shadow(0 0 10px ${home.color || FALLBACK_COLOR})` }}>{postMatchStats.possession.h}%</span>
                                  <span className="text-xs font-bold text-white/50">{postMatchStats.possession.a}%</span>
                              </div>
                          </div>

                          <div className="col-span-2 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl bg-black/40 shadow-2xl flex flex-col justify-center gap-6">
                              <h3 className="text-center text-[10px] font-black uppercase tracking-[0.8em] text-white/50 italic mb-2">Tactical Breakdown</h3>
                              {postMatchStats.bars.map((stat, i) => (
                                  <div key={i} className="flex justify-between items-center text-white">
                                      <span className="w-12 text-right text-sm font-black" style={{ color: home.color || FALLBACK_COLOR }}>{stat.h}</span>
                                      <div className="flex-1 flex mx-4 items-center gap-2">
                                          <div className="flex-1 bg-white/5 h-2.5 rounded-l-full overflow-hidden flex justify-end">
                                              <motion.div initial={{width: 0}} animate={{width: `${(stat.h / stat.max) * 100}%`}} transition={{duration: 1, delay: i * 0.1}} className="h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: home.color || FALLBACK_COLOR }} />
                                          </div>
                                          <span className="px-2 text-[9px] uppercase tracking-widest opacity-50 w-40 text-center">{stat.label}</span>
                                          <div className="flex-1 bg-white/5 h-2.5 rounded-r-full overflow-hidden">
                                              <motion.div initial={{width: 0}} animate={{width: `${(stat.a / stat.max) * 100}%`}} transition={{duration: 1, delay: i * 0.1}} className="h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: away.color || "#7000ff" }} />
                                          </div>
                                      </div>
                                      <span className="w-12 text-left text-sm font-black" style={{ color: away.color || "#7000ff" }}>{stat.a}</span>
                                  </div>
                              ))}
                          </div>

                          <div className="col-span-3 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl bg-black/40 shadow-2xl">
                               <h3 className="text-center text-[10px] font-black uppercase tracking-[0.8em] text-white/50 italic mb-6">Momentum Timeline</h3>
                               <div className="flex items-end justify-between h-32 gap-1.5 px-4 border-b border-white/10 pb-2 relative">
                                   <div className="absolute w-full h-[1px] bg-white/20 top-1/2 left-0 -translate-y-1/2 z-0" />
                                   
                                   {postMatchStats.momentum.map((m, i) => (
                                       <div key={i} className="w-full h-full flex flex-col justify-end group z-10">
                                           <div className="h-1/2 flex flex-col justify-end">
                                               <motion.div initial={{height: 0}} animate={{height: `${m.h}%`}} transition={{duration: 1}} className="w-full rounded-t-sm opacity-80 group-hover:opacity-100" style={{ backgroundColor: home.color || FALLBACK_COLOR, boxShadow: `0 0 10px ${home.color || FALLBACK_COLOR}44` }} />
                                           </div>
                                           <div className="h-1/2 flex flex-col justify-start">
                                               <motion.div initial={{height: 0}} animate={{height: `${m.a}%`}} transition={{duration: 1}} className="w-full rounded-b-sm opacity-80 group-hover:opacity-100" style={{ backgroundColor: away.color || "#7000ff", boxShadow: `0 0 10px ${away.color || "#7000ff"}44` }} />
                                           </div>
                                           <span className="text-[8px] text-center mt-2 opacity-30 group-hover:opacity-100 font-mono text-white">{m.time}</span>
                                       </div>
                                   ))}
                               </div>
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>

              <div className="p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl bg-black/40 shadow-2xl">
                <h3 className="text-center text-[10px] font-black uppercase tracking-[0.8em] text-white/50 mb-8 italic">Neural Outcome Matrix (Heatmap)</h3>
                <div className="grid grid-cols-6 gap-4">
                  {heatmap.slice(0, 18).map((cell, i) => (
                    <div key={`heat-${i}`} className={`p-4 rounded-2xl border flex flex-col items-center transition-all ${cell.prob > 10 ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/5 bg-black/10 opacity-30'}`}>
                      <span className="text-2xl font-black italic text-white">{cell.x}-{cell.y}</span>
                      <span className="text-[10px] font-bold text-cyan-400">{cell.prob}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 w-full py-4 border-t z-[100] bg-[#01040f] border-cyan-400/20 flex items-center">
        <div className="bg-cyan-400 text-black px-6 py-1 text-[11px] font-black italic skew-x-12 ml-6 z-10 uppercase tracking-[0.2em]">Neural_Feed</div>
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} className="flex">
            {tickerNews.map((news, i) => <span key={`ticker-${i}`} className="mx-16 text-white font-mono text-[10px] uppercase opacity-60 tracking-widest">{news} <span className="text-cyan-400 ml-6 opacity-30">///</span></span>)}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MatchPredictor;