import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { PREMIUM_THEMES } from "../theme/colors";

const FerrariSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Carbon fiber hexagon pattern */}
    {Array.from({ length: 12 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const x = col * 52 + (row % 2 === 0 ? 0 : 26);
        const y = row * 44;
        const points = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 60 - 30) * Math.PI / 180;
          return `${x + 22 * Math.cos(angle)},${y + 22 * Math.sin(angle)}`;
        }).join(" ");
        return <polygon key={`${row}-${col}`} points={points} fill="none" stroke="#FF2020" strokeWidth="0.4" opacity="0.15" />;
      })
    )}
    {/* Prancing Horse silhouette */}
    <g transform="translate(140, 280) scale(1.2)" opacity="0.12" fill="#FF2020">
      <path d="M60,10 C55,5 45,8 40,15 C35,8 25,5 20,10 C10,20 15,40 25,45 L20,80 L30,80 L35,55 L45,75 L55,75 L50,50 C65,45 75,30 60,10 Z" />
    </g>
    {/* FERRARI watermark */}
    <text x="200" y="500" textAnchor="middle" fill="#FF2020" opacity="0.06" fontSize="48" fontWeight="900" fontFamily="sans-serif" letterSpacing="8">FERRARI</text>
    <text x="200" y="560" textAnchor="middle" fill="#FF2020" opacity="0.05" fontSize="18" fontWeight="700" fontFamily="sans-serif" letterSpacing="6">SCUDERIA</text>
    {/* Shield outline */}
    <path d="M175,620 L200,610 L225,620 L225,660 Q200,680 175,660 Z" fill="none" stroke="#FF2020" strokeWidth="1" opacity="0.1" />
  </svg>
);

const LamborghiniSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Diamond angular pattern */}
    {Array.from({ length: 16 }, (_, row) =>
      Array.from({ length: 6 }, (_, col) => {
        const x = col * 65 + (row % 2 === 0 ? 0 : 32);
        const y = row * 50;
        return <polygon key={`${row}-${col}`} points={`${x+32},${y} ${x+64},${y+25} ${x+32},${y+50} ${x},${y+25}`} fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.12" />;
      })
    )}
    {/* Charging Bull silhouette */}
    <g transform="translate(120, 260) scale(1.3)" opacity="0.1" fill="#FFD700">
      <path d="M30,60 C20,55 15,40 20,30 C15,25 5,20 10,10 C15,5 25,8 30,15 C35,10 40,5 50,8 L55,20 C65,18 75,25 70,35 C80,40 75,55 65,60 L60,80 L50,80 L52,65 L40,70 L35,65 L37,80 L27,80 Z" />
    </g>
    {/* LAMBORGHINI text */}
    <text x="200" y="500" textAnchor="middle" fill="#FFD700" opacity="0.06" fontSize="22" fontWeight="900" fontFamily="sans-serif" letterSpacing="4">LAMBORGHINI</text>
    <text x="200" y="540" textAnchor="middle" fill="#FFD700" opacity="0.04" fontSize="12" fontWeight="700" fontFamily="sans-serif" letterSpacing="5">AUTOMOBILI</text>
    {/* L shield */}
    <path d="M180,600 L200,590 L220,600 L220,640 Q200,658 180,640 Z" fill="none" stroke="#FFD700" strokeWidth="1.2" opacity="0.12" />
    <text x="200" y="632" textAnchor="middle" fill="#FFD700" opacity="0.1" fontSize="24" fontWeight="900" fontFamily="sans-serif">L</text>
  </svg>
);

const BugattiSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Circuit board grid lines */}
    {Array.from({ length: 20 }, (_, i) => (
      <line key={`h${i}`} x1="0" y1={i * 42} x2="400" y2={i * 42} stroke="#0080FF" strokeWidth="0.3" opacity="0.08" />
    ))}
    {Array.from({ length: 10 }, (_, i) => (
      <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="800" stroke="#0080FF" strokeWidth="0.3" opacity="0.08" />
    ))}
    {/* Circuit nodes */}
    {[[88,168],[200,252],[312,168],[88,420],[200,336],[312,420],[200,504]].map(([x,y], i) => (
      <circle key={i} cx={x} cy={y} r="3" fill="#0080FF" opacity="0.15" />
    ))}
    {/* Horseshoe grille */}
    <path d="M140,320 Q200,260 260,320 L260,400 Q200,460 140,400 Z" fill="none" stroke="#0080FF" strokeWidth="1.5" opacity="0.12" />
    <path d="M160,330 Q200,285 240,330 L240,390 Q200,435 160,390 Z" fill="none" stroke="#0080FF" strokeWidth="0.8" opacity="0.08" />
    {/* EB monogram */}
    <text x="200" y="370" textAnchor="middle" fill="#0080FF" opacity="0.1" fontSize="52" fontWeight="900" fontFamily="serif">EB</text>
    <text x="200" y="520" textAnchor="middle" fill="#0080FF" opacity="0.06" fontSize="26" fontWeight="900" fontFamily="sans-serif" letterSpacing="6">BUGATTI</text>
  </svg>
);

const McLarenSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Speed swoosh curves */}
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={`M-50,${100 + i * 80} Q200,${60 + i * 80} 450,${120 + i * 80}`}
        fill="none" stroke="#FF6600" strokeWidth={1 - i * 0.05} opacity={0.12 - i * 0.01} />
    ))}
    {/* McLaren roundel */}
    <circle cx="200" cy="350" r="70" fill="none" stroke="#FF6600" strokeWidth="1.5" opacity="0.12" />
    <circle cx="200" cy="350" r="55" fill="none" stroke="#FF6600" strokeWidth="0.8" opacity="0.08" />
    {/* Speed fins */}
    <path d="M150,330 L250,330 L270,350 L250,370 L150,370 L130,350 Z" fill="none" stroke="#FF6600" strokeWidth="1" opacity="0.1" />
    {/* McLAREN text */}
    <text x="200" y="500" textAnchor="middle" fill="#FF6600" opacity="0.07" fontSize="30" fontWeight="900" fontFamily="sans-serif" letterSpacing="5">McLAREN</text>
    <text x="200" y="528" textAnchor="middle" fill="#FF6600" opacity="0.05" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="4">FORMULA ONE TEAM</text>
    {/* diagonal accent lines */}
    <line x1="0" y1="600" x2="400" y2="500" stroke="#FF6600" strokeWidth="0.5" opacity="0.08" />
    <line x1="0" y1="640" x2="400" y2="540" stroke="#FF6600" strokeWidth="0.5" opacity="0.06" />
  </svg>
);

const PorscheSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Brushed metal vertical lines */}
    {Array.from({ length: 40 }, (_, i) => (
      <line key={i} x1={i * 10} y1="0" x2={i * 10} y2="800" stroke="#C0C0C0" strokeWidth="0.3" opacity={0.04 + (i % 3) * 0.02} />
    ))}
    {/* Shield/Crest outline */}
    <path d="M160,260 L200,245 L240,260 L240,340 Q200,375 160,340 Z" fill="none" stroke="#C0C0C0" strokeWidth="1.5" opacity="0.15" />
    {/* Inner shield divisions */}
    <line x1="200" y1="245" x2="200" y2="375" stroke="#C0C0C0" strokeWidth="0.8" opacity="0.1" />
    <line x1="160" y1="307" x2="240" y2="307" stroke="#C0C0C0" strokeWidth="0.8" opacity="0.1" />
    {/* Stuttgart horse */}
    <text x="200" y="300" textAnchor="middle" fontSize="32" opacity="0.12">🐎</text>
    {/* PORSCHE text */}
    <text x="200" y="490" textAnchor="middle" fill="#C0C0C0" opacity="0.08" fontSize="30" fontWeight="900" fontFamily="sans-serif" letterSpacing="6">PORSCHE</text>
    {/* Horizontal accent lines */}
    <line x1="0" y1="530" x2="400" y2="530" stroke="#C0C0C0" strokeWidth="0.5" opacity="0.07" />
    <line x1="0" y1="535" x2="400" y2="535" stroke="#C0C0C0" strokeWidth="0.5" opacity="0.05" />
  </svg>
);

const GalaxySVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Stars */}
    {Array.from({ length: 60 }, (_, i) => {
      const x = (i * 137.5) % 400;
      const y = (i * 97.3) % 800;
      const r = 0.5 + (i % 3) * 0.5;
      return <circle key={i} cx={x} cy={y} r={r} fill="#A855F7" opacity={0.2 + (i % 5) * 0.08} />;
    })}
    {/* Nebula glow */}
    <radialGradient id="nebula1" cx="40%" cy="35%" r="40%">
      <stop offset="0%" stopColor="#A855F7" stopOpacity="0.12" />
      <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="nebula2" cx="70%" cy="65%" r="35%">
      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.1" />
      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
    </radialGradient>
    <rect width="400" height="800" fill="url(#nebula1)" />
    <rect width="400" height="800" fill="url(#nebula2)" />
    {/* Spiral galaxy path */}
    <path d="M200,350 Q250,280 300,320 Q320,380 270,420 Q210,450 170,400 Q140,340 200,300 Q260,260 310,310" fill="none" stroke="#A855F7" strokeWidth="1" opacity="0.1" />
    <circle cx="200" cy="360" r="6" fill="#A855F7" opacity="0.2" />
    <circle cx="200" cy="360" r="15" fill="none" stroke="#A855F7" strokeWidth="0.8" opacity="0.1" />
  </svg>
);

const SunsetSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Gradient sky */}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#FF8C42" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="400" height="800" fill="url(#sky)" />
    {/* Sun */}
    <circle cx="200" cy="350" r="55" fill="none" stroke="#FF6B9D" strokeWidth="1" opacity="0.12" />
    <circle cx="200" cy="350" r="35" fill="#FF8C42" opacity="0.06" />
    {/* Sun rays */}
    {Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30) * Math.PI / 180;
      const x1 = 200 + 62 * Math.cos(angle);
      const y1 = 350 + 62 * Math.sin(angle);
      const x2 = 200 + 85 * Math.cos(angle);
      const y2 = 350 + 85 * Math.sin(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6B9D" strokeWidth="1.2" opacity="0.1" />;
    })}
    {/* Horizon line */}
    <line x1="0" y1="480" x2="400" y2="480" stroke="#FF6B9D" strokeWidth="0.8" opacity="0.1" />
    {/* Mountain silhouette */}
    <path d="M0,800 L80,480 L160,560 L240,460 L320,530 L400,470 L400,800 Z" fill="#FF6B9D" opacity="0.05" />
    <path d="M0,800 L120,520 L200,600 L280,500 L400,560 L400,800 Z" fill="#C2185B" opacity="0.04" />
  </svg>
);

const DeepOceanSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Sonar rings */}
    {[40, 80, 120, 160, 200].map((r, i) => (
      <circle key={i} cx="200" cy="320" r={r} fill="none" stroke="#00E5FF" strokeWidth="0.7" opacity={0.14 - i * 0.02} />
    ))}
    {/* Wave patterns */}
    {Array.from({ length: 5 }, (_, i) => (
      <path key={i} d={`M0,${520 + i * 30} Q100,${505 + i * 30} 200,${520 + i * 30} Q300,${535 + i * 30} 400,${520 + i * 30}`}
        fill="none" stroke="#00E5FF" strokeWidth="0.7" opacity={0.1 - i * 0.01} />
    ))}
    {/* Bubbles */}
    {[[80,200,4],[300,150,3],[150,450,5],[320,400,3],[60,600,4],[340,620,3]].map(([x,y,r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#00E5FF" strokeWidth="0.6" opacity="0.12" />
    ))}
    {/* Anchor */}
    <circle cx="200" cy="200" r="12" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.1" />
    <line x1="200" y1="212" x2="200" y2="250" stroke="#00E5FF" strokeWidth="1" opacity="0.1" />
    <path d="M175,240 Q200,260 225,240" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.1" />
    <line x1="175" y1="240" x2="175" y2="248" stroke="#00E5FF" strokeWidth="1" opacity="0.1" />
    <line x1="225" y1="240" x2="225" y2="248" stroke="#00E5FF" strokeWidth="1" opacity="0.1" />
  </svg>
);

const EmeraldSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Crystal hexagon pattern */}
    {Array.from({ length: 10 }, (_, row) =>
      Array.from({ length: 6 }, (_, col) => {
        const x = col * 68 + (row % 2 === 0 ? 0 : 34);
        const y = row * 58;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 30) * Math.PI / 180;
          return `${x + 30 * Math.cos(a)},${y + 30 * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={`${row}-${col}`} points={pts} fill="none" stroke="#00E676" strokeWidth="0.4" opacity="0.1" />;
      })
    )}
    {/* Gem center — facets */}
    <g transform="translate(200, 340)" opacity="0.12">
      {Array.from({ length: 6 }, (_, i) => {
        const a1 = (i * 60) * Math.PI / 180;
        const a2 = ((i + 1) * 60) * Math.PI / 180;
        return <path key={i} d={`M0,0 L${70 * Math.cos(a1)},${70 * Math.sin(a1)} L${70 * Math.cos(a2)},${70 * Math.sin(a2)} Z`}
          fill="#00E676" opacity={0.5 - i * 0.05} />;
      })}
    </g>
    {/* Green glow */}
    <radialGradient id="glow" cx="50%" cy="43%" r="30%">
      <stop offset="0%" stopColor="#00E676" stopOpacity="0.1" />
      <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
    </radialGradient>
    <rect width="400" height="800" fill="url(#glow)" />
  </svg>
);

const NeonSVG = () => (
  <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Full screen grid */}
    {Array.from({ length: 20 }, (_, i) => (
      <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#00FF88" strokeWidth="0.3" opacity="0.07" />
    ))}
    {Array.from({ length: 10 }, (_, i) => (
      <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="800" stroke="#00FF88" strokeWidth="0.3" opacity="0.07" />
    ))}
    {/* Glitch diagonal lines */}
    {Array.from({ length: 5 }, (_, i) => (
      <line key={i} x1={i * 80} y1="0" x2={i * 80 + 100} y2="800" stroke="#FF00FF" strokeWidth="0.4" opacity="0.06" />
    ))}
    {/* Cyber crosshair target */}
    <circle cx="200" cy="340" r="80" fill="none" stroke="#00FF88" strokeWidth="1" opacity="0.1" />
    <circle cx="200" cy="340" r="50" fill="none" stroke="#00FF88" strokeWidth="0.7" opacity="0.08" />
    <circle cx="200" cy="340" r="5" fill="#00FF88" opacity="0.15" />
    <line x1="120" y1="340" x2="280" y2="340" stroke="#00FF88" strokeWidth="0.7" opacity="0.1" />
    <line x1="200" y1="260" x2="200" y2="420" stroke="#00FF88" strokeWidth="0.7" opacity="0.1" />
    {/* Binary code strip */}
    <text x="10" y="540" fill="#00FF88" opacity="0.06" fontSize="9" fontFamily="monospace">01001110 01000101 01001111 01001110 00100000 01000011 01011001 01000010 01000101 01010010</text>
    <text x="10" y="556" fill="#FF00FF" opacity="0.05" fontSize="9" fontFamily="monospace">10110001 01101110 10010011 01100001 11001010 10000111 01110010 10101001</text>
  </svg>
);

const BG_MAP: Record<string, React.FC> = {
  ferrari: FerrariSVG,
  lamborghini: LamborghiniSVG,
  bugatti: BugattiSVG,
  mclaren: McLarenSVG,
  porsche: PorscheSVG,
  galaxy: GalaxySVG,
  sunset: SunsetSVG,
  deepocean: DeepOceanSVG,
  emerald: EmeraldSVG,
  neon: NeonSVG,
};

const ThemeBackground: React.FC = () => {
  const { mode } = useTheme();

  if (!PREMIUM_THEMES.includes(mode as any)) return null;

  const BgComponent = BG_MAP[mode];
  if (!BgComponent) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, opacity: 0.85 }}
      aria-hidden="true"
    >
      <BgComponent />
    </div>
  );
};

export default ThemeBackground;
