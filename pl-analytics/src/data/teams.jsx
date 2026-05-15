export const teams = [
  { 
    name: "Arsenal", 
    logo: "/logos/arsenal.png", 
    color: "#EF0107",
    stadiumName: "Emirates Stadium",
    capacity: 60704,
    tacticalStyle: "Positional Play / High Press",
    history: "Relocating from historic Highbury in 2006, Arsenal's modern era is defined by extreme technical proficiency. The club is globally synonymous with the 2003-04 'Invincibles'—the only team to ever complete a 38-game Premier League season without a single defeat.",
    coordinates: { lat: 51.554888, lng: -0.108438, heading: 270 }
  },
  { 
    name: "Liverpool", 
    logo: "/logos/liverpool.png", 
    color: "#C8102E",
    stadiumName: "Anfield",
    capacity: 61276,
    tacticalStyle: "Heavy Metal Football / Gegenpressing",
    history: "Anfield is widely considered one of the most intimidating cauldrons in European football. Liverpool leverages this raw emotional energy to fuel a relentless, high-intensity pressing system that has secured them 6 prestigious European Cups.",
    coordinates: { lat: 53.430829, lng: -2.960830, heading: 90 }
  },
  { 
    name: "Man City", 
    logo: "/logos/man_city.png", 
    color: "#6CABDD",
    stadiumName: "Etihad Stadium",
    capacity: 53400,
    tacticalStyle: "Fluid Possession / False 9",
    history: "A club completely re-engineered by modern investment and elite coaching. Manchester City plays a mesmerizing brand of algorithmic possession football, resulting in an unprecedented era of domestic dominance and a historic Continental Treble in 2023.",
    coordinates: { lat: 53.483138, lng: -2.200395, heading: 180 }
  },
  { 
    name: "Chelsea", 
    logo: "/logos/chelsea.png", 
    color: "#034694",
    stadiumName: "Stamford Bridge",
    capacity: 40341,
    tacticalStyle: "Dynamic Wing Play / Transition",
    history: "Tucked into an upscale pocket of West London, Chelsea exploded into a global superpower at the turn of the 21st century. Their DNA is built on tactical pragmatism, defensive solidity, and devastating transitional counter-attacks.",
    coordinates: { lat: 51.481663, lng: -0.190956, heading: 0 }
  },
  { 
    name: "Tottenham", 
    logo: "/logos/tottenham.png", 
    color: "#132257",
    stadiumName: "Tottenham Hotspur Stadium",
    capacity: 62850,
    tacticalStyle: "Attacking / High Defensive Line",
    history: "Operating out of a billion-pound, state-of-the-art technological fortress built on the footprint of their old White Hart Lane ground. Spurs adhere to a historic philosophy: 'To Dare Is To Do', demanding entertaining, attacking football above all else.",
    coordinates: { lat: 51.604286, lng: -0.066355, heading: 180 }
  },
  { 
    name: "Man United", 
    logo: "/logos/man_united.png", 
    color: "#DA291C",
    stadiumName: "Old Trafford",
    capacity: 74310,
    tacticalStyle: "Fast Vertical Transitions",
    history: "The undisputed behemoth of 1990s and 2000s English football. 'The Theatre of Dreams' was the stage where Sir Alex Ferguson built dynasties relying on fearsome wing play, relentless stamina, and late-game psychological dominance.",
    coordinates: { lat: 53.463058, lng: -2.291340, heading: 90 }
  },
  { 
    name: "Newcastle", 
    logo: "/logos/newcastle.png", 
    color: "#241F20",
    stadiumName: "St. James' Park",
    capacity: 52305,
    tacticalStyle: "High Intensity / Mid-Block",
    history: "A cathedral of football towering over the city center. St. James' Park is famous for its steep stands and the Gallowgate End. Tactically, Newcastle blends traditional English physicality with modern, high-intensity transition play.",
    coordinates: { lat: 54.975342, lng: -1.621694, heading: 0 }
  },
  { 
    name: "Brighton", 
    logo: "/logos/brighton.png", 
    color: "#0057B8",
    stadiumName: "Amex Stadium",
    capacity: 31800,
    tacticalStyle: "Data-Driven / Deep Build-up",
    history: "The Seagulls represent the pinnacle of data-driven scouting and technical coaching. The Amex, completed in 2011, serves as the hub for a system that prides itself on deep build-up play and baiting the opponent's press.",
    coordinates: { lat: 50.861756, lng: -0.083733, heading: 0 }
  },
  { 
    name: "West Ham", 
    logo: "/logos/westham.png", 
    color: "#7A263A",
    stadiumName: "London Stadium",
    capacity: 62500,
    tacticalStyle: "Deep Block / Set-Piece Threat",
    history: "Originally built for the 2012 Olympics, this massive venue has become a fortress for the Hammers. Their tactical identity revolves around a disciplined low block and being arguably the most dangerous set-piece team in the league.",
    coordinates: { lat: 51.538743, lng: -0.016597, heading: 90 }
  },
  { 
    name: "Aston Villa", 
    logo: "/logos/villa.png", 
    color: "#670E36",
    stadiumName: "Villa Park",
    capacity: 42682,
    tacticalStyle: "Compact Structure / Counter-Attack",
    history: "One of the most historic grounds in England, Villa Park has hosted more FA Cup semi-finals than any other stadium. Villa's game is built on a high defensive line and clinical vertical passing through the middle.",
    coordinates: { lat: 52.509090, lng: -1.884767, heading: 0 }
  },
  { 
    name: "Wolves", 
    logo: "/logos/wolves.png", 
    color: "#FDB913",
    stadiumName: "Molineux",
    capacity: 32050,
    tacticalStyle: "Wing-Back Overloads",
    history: "Molineux was one of the first stadiums to install floodlights in the 1950s. Wolves traditionally utilize a robust 3-man defensive chain, relying on wing-backs to provide width and transition speed on the break.",
    coordinates: { lat: 52.590238, lng: -2.130386, heading: 0 }
  },
  { 
    name: "Everton", 
    logo: "/logos/everton.png", 
    color: "#003399",
    stadiumName: "Goodison Park",
    capacity: 39414,
    tacticalStyle: "Direct / Physical Aggression",
    history: "Known as 'The Grand Old Lady', Goodison Park is a classic example of traditional English stadium architecture. Everton's style at home is famously aggressive, relying on a raucous atmosphere and a direct, physical attacking front.",
    coordinates: { lat: 53.438755, lng: -2.966324, heading: 270 }
  },
  { 
    name: "Brentford", 
    logo: "/logos/brentford.png", 
    color: "#E30613",
    stadiumName: "Gtech Community Stadium",
    capacity: 17250,
    tacticalStyle: "Algorithmic Scouting / High Press",
    history: "A mathematical anomaly in modern football. Brentford achieved a miraculous rise from the lower divisions using heavy data-analytics and strict 'Moneyball' principles, executing brilliant set-piece routines in this intimate new venue.",
    coordinates: { lat: 51.490705, lng: -0.289053, heading: 0 }
  },
  { 
    name: "Fulham", 
    logo: "/logos/fulham.png", 
    color: "#000000",
    stadiumName: "Craven Cottage",
    capacity: 25700,
    tacticalStyle: "Fluid Midfield Rotation",
    history: "London's oldest professional club. Craven Cottage is situated directly on the banks of the River Thames. Fulham’s tactical identity is built on a technical, ball-retention midfield and overlapping fullbacks.",
    coordinates: { lat: 51.474929, lng: -0.221616, heading: 180 }
  },
  { 
    name: "Crystal Palace", 
    logo: "/logos/crystalpalace.png", 
    color: "#1E41FF",
    stadiumName: "Selhurst Park",
    capacity: 25486,
    tacticalStyle: "Wide Isolation / Pace",
    history: "Powered by the relentless drumming of the 'Holmesdale Fanatics', Selhurst Park is famously loud. Palace’s tactics focus on creating 1v1 situations for their pacey wingers to exploit isolated fullbacks.",
    coordinates: { lat: 51.398242, lng: -0.085526, heading: 0 }
  },
  { 
    name: "Bournemouth", 
    logo: "/logos/bournemouth.png", 
    color: "#DA291C",
    stadiumName: "Vitality Stadium",
    capacity: 11307,
    tacticalStyle: "Aggressive Man-to-Man Press",
    history: "Operating out of the league's most intimate venue, Bournemouth punches above their weight by employing an aggressive, brave, man-to-man pressing system across the entire pitch.",
    coordinates: { lat: 50.735235, lng: -1.838304, heading: 90 }
  },
  { 
    name: "Burnley", 
    logo: "/logos/burnley.png", 
    color: "#6C1D45",
    stadiumName: "Turf Moor",
    capacity: 21944,
    tacticalStyle: "Low Block / Direct Play",
    history: "A founding member of the Football League, Burnley is woven into the fabric of Lancashire. Historically reliant on an impenetrable low block and direct, vertical target-man mechanics at their intimidating home ground.",
    coordinates: { lat: 53.789124, lng: -2.230198, heading: 270 }
  },
  { 
    name: "Nott'm Forest", 
    logo: "/logos/nottingham.png", 
    color: "#E00000",
    stadiumName: "City Ground",
    capacity: 30445,
    tacticalStyle: "Counter-Attack / Wing Speed",
    history: "A historic giant, Forest is famous for back-to-back European Cups. The City Ground, situated on the banks of the Trent, is the stage for a system built on lightning-fast transitions and wing speed.",
    coordinates: { lat: 52.939967, lng: -1.132845, heading: 90 }
  },
  { 
    name: "Leeds United", 
    logo: "/logos/leeds.png", 
    color: "#1D428A", 
    stadiumName: "Elland Road",
    capacity: 37792,
    tacticalStyle: "High Octane / Chaos",
    history: "One of the most visceral atmospheres in England. Leeds United’s identity is synonymous with a high-octane, chaotic style that demands relentless stamina and vertical intensity from every player on the pitch.",
    coordinates: { lat: 53.777823, lng: -1.572115, heading: 180 }
  },
  { 
    name: "Sunderland", 
    logo: "/logos/sunderland.png", 
    color: "#EB172B", 
    stadiumName: "Stadium of Light",
    capacity: 49000,
    tacticalStyle: "Wide Play / Physicality",
    history: "A traditional Northern powerhouse, the Stadium of Light is the largest stadium in the north-east. Sunderland’s style relies on wide attacking play and utilizing the massive pitch to stretch opponent defenses.",
    coordinates: { lat: 54.914612, lng: -1.388371, heading: 0 }
  }
];

export default teams;