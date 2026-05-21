import React, { memo, useMemo } from "react";
import { useTheme } from "../theme/ThemeContext";
import { PREMIUM_THEMES } from "../theme/colors";

// Pure static SVG — no animations, no random, no timers = ZERO lag
const ThemeBackground: React.FC = memo(() => {
  const { mode } = useTheme();

  const isPremium = PREMIUM_THEMES.includes(mode as any);
  if (!isPremium) return null;

  const svgStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0,
    width: "100%", height: "100%",
    pointerEvents: "none", zIndex: 0,
  };

  // Ferrari
  if (mode === "ferrari") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#FF2020" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#0A0000" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {/* Prancing Horse */}
      <g transform="translate(195,230)" fill="#FF1A1A" opacity="0.14">
        <path d="M0,-72 C10,-72 22,-65 20,-52 C30,-55 40,-44 36,-32 C46,-30 50,-16 42,-8 C50,2 44,16 34,12 C36,26 24,34 14,26 C12,40 2,44 0,36 C-2,44 -12,40 -14,26 C-24,34 -36,26 -34,12 C-44,16 -50,2 -42,-8 C-50,-16 -46,-30 -36,-32 C-40,-44 -30,-55 -20,-52 C-22,-65 -10,-72 0,-72Z"/>
        <rect x="-14" y="36" width="10" height="52" rx="4"/>
        <rect x="4" y="36" width="10" height="52" rx="4"/>
        <path d="M16,0 Q42,-18 46,-44 Q52,-28 36,8Z" opacity="0.8"/>
        <path d="M-2,-72 Q-12,-95 -4,-108 Q6,-95 4,-72Z"/>
      </g>
      {/* Ferrari Shield */}
      <path d="M195,108 L248,126 L254,198 L195,226 L136,198 L142,126Z"
        fill="none" stroke="#FF2020" strokeWidth="1.5" opacity="0.13"/>
      <path d="M195,118 L238,133 L243,192 L195,216 L147,192 L152,133Z"
        fill="none" stroke="#FF2020" strokeWidth="0.6" opacity="0.07"/>
      {/* Speed lines */}
      <line x1="0" y1="440" x2="390" y2="420" stroke="#FF2020" strokeWidth="1" opacity="0.06"/>
      <line x1="0" y1="468" x2="390" y2="450" stroke="#FF2020" strokeWidth="0.7" opacity="0.04"/>
      <line x1="0" y1="496" x2="390" y2="480" stroke="#FF2020" strokeWidth="0.5" opacity="0.03"/>
      {/* Wordmark */}
      <text x="195" y="756" textAnchor="middle" fontSize="46" fontWeight="900"
        fontFamily="Georgia,serif" fill="#FF2020" opacity="0.06" letterSpacing="8">FERRARI</text>
      {/* Carbon fiber rows */}
      <g opacity="0.02" fill="#FF2020">
        {[0,1,2,3,4,5,6,7].map(r => [0,1,2,3,4,5,6,7,8].map(c => (
          <rect key={`${r}${c}`} x={c*46} y={580+r*30} width="22" height="14" rx="2"/>
        )))}
      </g>
    </svg>
  );

  // Lamborghini
  if (mode === "lamborghini") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#080600" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {/* Raging Bull */}
      <g transform="translate(195,215)" fill="#FFD700" opacity="0.15">
        {/* Body */}
        <ellipse cx="0" cy="8" rx="48" ry="28"/>
        {/* Head */}
        <ellipse cx="42" cy="-12" rx="24" ry="20"/>
        {/* Horns */}
        <path d="M32,-28 Q16,-62 26,-74 Q40,-58 38,-28Z"/>
        <path d="M52,-28 Q68,-62 58,-74 Q44,-58 44,-28Z"/>
        {/* Nose */}
        <ellipse cx="62" cy="-8" rx="8" ry="6"/>
        {/* Legs */}
        <rect x="-40" y="32" width="14" height="52" rx="6"/>
        <rect x="-16" y="34" width="14" height="50" rx="6"/>
        <rect x="10" y="34" width="14" height="50" rx="6"/>
        <rect x="30" y="28" width="14" height="50" rx="6"/>
        {/* Tail */}
        <path d="M-48,5 Q-76,-8 -70,-26 Q-58,-14 -48,10Z"/>
        {/* Eye */}
        <circle cx="50" cy="-15" r="4" fill="#1A0E00"/>
      </g>
      {/* Hexagon grid */}
      <g opacity="0.05" stroke="#FFD700" strokeWidth="0.6" fill="none">
        {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4].map(c => {
          const x = c*80 + (r%2)*40, y = 500 + r*46;
          return <polygon key={`${r}${c}`} points={`${x+24},${y} ${x+48},${y+14} ${x+48},${y+42} ${x+24},${y+56} ${x},${y+42} ${x},${y+14}`}/>;
        }))}
      </g>
      <text x="195" y="756" textAnchor="middle" fontSize="28" fontWeight="900"
        fontFamily="Arial,sans-serif" fill="#FFD700" opacity="0.06" letterSpacing="4">LAMBORGHINI</text>
    </svg>
  );

  // Bugatti
  if (mode === "bugatti") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#0080FF" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#00010A" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      <ellipse cx="195" cy="250" rx="145" ry="105" fill="none" stroke="#0080FF" strokeWidth="2.5" opacity="0.13"/>
      <ellipse cx="195" cy="250" rx="120" ry="82" fill="none" stroke="#0080FF" strokeWidth="1" opacity="0.08"/>
      <text x="195" y="275" textAnchor="middle" fontSize="88" fontWeight="900"
        fontFamily="Georgia,serif" fill="#0080FF" opacity="0.11" letterSpacing="6">EB</text>
      {/* Macaron stripe */}
      <rect x="50" y="348" width="145" height="16" rx="8" fill="#CC0000" opacity="0.08"/>
      <rect x="195" y="348" width="145" height="16" rx="8" fill="#0080FF" opacity="0.08"/>
      {/* Circuit dots */}
      <g opacity="0.05" stroke="#0080FF" strokeWidth="0.5" fill="none">
        {[0,1,2,3].map(i => <line key={i} x1={50+i*100} y1="0" x2={50+i*100} y2="844"/>)}
        {[0,1,2,3].map(i => <circle key={i} cx={50+i*100} cy={180+i*70} r="5"/>)}
      </g>
      <text x="195" y="756" textAnchor="middle" fontSize="42" fontWeight="900"
        fontFamily="Georgia,serif" fill="#0080FF" opacity="0.06" letterSpacing="10">BUGATTI</text>
    </svg>
  );

  // McLaren
  if (mode === "mclaren") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#FF6600" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#080300" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {/* Speedmark */}
      <path d="M30,290 Q195,110 360,290" fill="none" stroke="#FF6600" strokeWidth="22" strokeLinecap="round" opacity="0.09"/>
      <path d="M30,290 Q195,110 360,290" fill="none" stroke="#FF6600" strokeWidth="8" strokeLinecap="round" opacity="0.13"/>
      <path d="M30,290 Q195,110 360,290" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.04"/>
      {/* Vertical bar */}
      <rect x="183" y="90" width="24" height="210" rx="12" fill="#FF6600" opacity="0.09"/>
      {/* Speed diagonals */}
      <line x1="0" y1="420" x2="250" y2="844" stroke="#FF6600" strokeWidth="0.6" opacity="0.04"/>
      <line x1="70" y1="420" x2="320" y2="844" stroke="#FF6600" strokeWidth="0.6" opacity="0.04"/>
      <line x1="140" y1="420" x2="390" y2="844" stroke="#FF6600" strokeWidth="0.6" opacity="0.04"/>
      <text x="195" y="756" textAnchor="middle" fontSize="44" fontWeight="900"
        fontFamily="Arial,sans-serif" fill="#FF6600" opacity="0.06" letterSpacing="6">McLAREN</text>
    </svg>
  );

  // Porsche
  if (mode === "porsche") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#080808" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {/* Crest */}
      <path d="M195,105 L258,132 L266,228 L195,258 L124,228 L132,132Z"
        fill="none" stroke="#C0C0C0" strokeWidth="2" opacity="0.13"/>
      <line x1="195" y1="105" x2="195" y2="258" stroke="#C0C0C0" strokeWidth="1.5" opacity="0.1"/>
      <line x1="132" y1="182" x2="258" y2="182" stroke="#C0C0C0" strokeWidth="1.5" opacity="0.1"/>
      {/* Stuttgart Horse */}
      <g transform="translate(195,148) scale(0.42)" fill="#C0C0C0" opacity="0.13">
        <path d="M0,-55 C12,-55 24,-46 22,-34 C32,-36 42,-24 38,-12 C48,-8 50,6 40,12 C48,24 40,36 28,30 C30,44 18,52 6,44 C4,58 -4,58 -6,44 C-18,52 -30,44 -28,30 C-40,36 -48,24 -40,12 C-50,6 -48,-8 -38,-12 C-42,-24 -32,-36 -22,-34 C-24,-46 -12,-55 0,-55Z"/>
        <rect x="-9" y="30" width="8" height="38" rx="3"/>
        <rect x="1" y="30" width="8" height="38" rx="3"/>
        <path d="M18,-5 Q38,-15 40,-35 Q32,-20 18,0Z"/>
      </g>
      {/* Fine grid */}
      <g opacity="0.025" stroke="#C0C0C0" strokeWidth="0.4">
        {[0,1,2,3,4,5,6].map(i => <line key={i} x1={i*65} y1="380" x2={i*65} y2="844"/>)}
        {[0,1,2,3,4,5,6,7].map(i => <line key={i} x1="0" y1={400+i*66} x2="390" y2={400+i*66}/>)}
      </g>
      <text x="195" y="756" textAnchor="middle" fontSize="40" fontWeight="900"
        fontFamily="Arial,sans-serif" fill="#C0C0C0" opacity="0.06" letterSpacing="8">PORSCHE</text>
    </svg>
  );

  // Galaxy
  if (mode === "galaxy") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#04010F" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {/* Static stars */}
      {[[45,80,2],[120,42,1.5],[200,96,2],[312,56,1.5],[380,122,1],[62,182,1],
        [156,162,2],[282,146,1],[352,202,1.5],[88,282,1],[222,252,2],[332,302,1],
        [42,382,1.5],[172,342,1],[292,392,2],[102,482,1],[242,452,1.5],[362,502,1],
        [52,582,2],[192,562,1],[322,622,1.5],[82,702,1],[212,682,2],[352,732,1],
        [132,782,1.5],[262,802,1],[32,652,1],[388,648,1.5],[195,750,1],[22,420,1.5]
      ].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#A855F7" opacity={i%3===0?0.28:0.14}/>
      ))}
      {/* Galaxy spiral */}
      <path d="M195,295 Q252,238 292,178 Q322,128 278,98 Q238,76 196,108 Q154,140 152,192 Q150,244 195,295Z"
        fill="none" stroke="#A855F7" strokeWidth="1.5" opacity="0.1"/>
      <path d="M195,295 Q138,238 98,178 Q68,128 112,98 Q152,76 194,108 Q236,140 238,192"
        fill="none" stroke="#C084FC" strokeWidth="1" opacity="0.08"/>
      <circle cx="195" cy="295" r="18" fill="#A855F7" opacity="0.07"/>
      <circle cx="195" cy="295" r="7" fill="#A855F7" opacity="0.12"/>
    </svg>
  );

  // Sunset
  if (mode === "sunset") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.14"/>
          <stop offset="55%" stopColor="#FF8A50" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {[90,72,55,38,22].map((r,i) => (
        <circle key={i} cx="195" cy="340" r={r} fill="none"
          stroke="#FF6B9D" strokeWidth={2.2-i*0.35} opacity={0.12-i*0.018}/>
      ))}
      <circle cx="195" cy="340" r="10" fill="#FF6B9D" opacity="0.09"/>
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1="0" y1={402+i*18} x2="390" y2={402+i*18}
          stroke="#FF8A50" strokeWidth={1.5-i*0.22} opacity={0.09-i*0.012}/>
      ))}
      <path d="M0,468 L52,398 L104,444 L158,368 L212,434 L268,382 L322,428 L374,392 L390,408 L390,844 L0,844Z"
        fill="#FF6B9D" opacity="0.05"/>
    </svg>
  );

  // Deep Ocean
  if (mode === "deepocean") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#000A0F" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      {[0,1,2,3].map(i => (
        <path key={i} d={`M${110+i*45},0 L${70+i*35},580`}
          stroke="#00E5FF" strokeWidth="18" strokeLinecap="round" opacity="0.018"/>
      ))}
      {[0,1,2,3,4].map(i => (
        <path key={i} d={`M0,${275+i*58} Q98,${255+i*58} 195,${275+i*58} Q293,${295+i*58} 390,${275+i*58}`}
          fill="none" stroke="#00E5FF" strokeWidth={1.6-i*0.28} opacity={0.1-i*0.015}/>
      ))}
      {[[58,448,8],[138,378,5],[222,418,10],[302,388,6],[78,558,4],
        [182,538,7],[282,568,5],[352,478,9],[38,648,6],[242,678,4]].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#00E5FF" strokeWidth="0.8" opacity="0.07"/>
      ))}
    </svg>
  );

  // Emerald
  if (mode === "emerald") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="28%" r="58%">
          <stop offset="0%" stopColor="#00E676" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="#000A05" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      <polygon points="195,115 298,228 256,332 134,332 92,228"
        fill="none" stroke="#00E676" strokeWidth="2" opacity="0.11"/>
      <polygon points="195,115 298,228 374,176 312,86"
        fill="none" stroke="#00E676" strokeWidth="1.2" opacity="0.07"/>
      <polygon points="195,115 92,228 16,176 78,86"
        fill="none" stroke="#00E676" strokeWidth="1.2" opacity="0.07"/>
      <line x1="195" y1="115" x2="195" y2="332" stroke="#00E676" strokeWidth="1" opacity="0.07"/>
      <line x1="92" y1="228" x2="298" y2="228" stroke="#00E676" strokeWidth="1" opacity="0.07"/>
      {[[82,478],[198,518],[318,488],[118,618],[272,648],[48,718],[342,698]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x} y1={y-9} x2={x} y2={y+9} stroke="#00E676" strokeWidth="1.2" opacity="0.1"/>
          <line x1={x-9} y1={y} x2={x+9} y2={y} stroke="#00E676" strokeWidth="1.2" opacity="0.1"/>
        </g>
      ))}
    </svg>
  );

  // Neon
  if (mode === "neon") return (
    <svg style={svgStyle} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg" cx="50%" cy="33%" r="58%">
          <stop offset="0%" stopColor="#00FF88" stopOpacity="0.13"/>
          <stop offset="100%" stopColor="#000008" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="390" height="844" fill="url(#rg)"/>
      <g opacity="0.04" stroke="#00FF88" strokeWidth="0.4">
        {[0,1,2,3,4,5,6].map(i => <line key={i} x1={i*65} y1="0" x2={i*65} y2="844"/>)}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => <line key={i} x1="0" y1={i*84} x2="390" y2={i*84}/>)}
      </g>
      <circle cx="195" cy="295" r="92" fill="none" stroke="#00FF88" strokeWidth="2" opacity="0.12"/>
      <circle cx="195" cy="295" r="64" fill="none" stroke="#00FF88" strokeWidth="0.8" opacity="0.07"/>
      <line x1="195" y1="155" x2="195" y2="435" stroke="#00FF88" strokeWidth="2" opacity="0.1"/>
      <line x1="62" y1="295" x2="328" y2="295" stroke="#00FF88" strokeWidth="2" opacity="0.1"/>
      <path d="M22,22 L22,64 M22,22 L64,22" fill="none" stroke="#00FF88" strokeWidth="2.5" opacity="0.16"/>
      <path d="M368,22 L368,64 M368,22 L326,22" fill="none" stroke="#FF00FF" strokeWidth="2.5" opacity="0.16"/>
      <path d="M22,822 L22,780 M22,822 L64,822" fill="none" stroke="#FF00FF" strokeWidth="2.5" opacity="0.16"/>
      <path d="M368,822 L368,780 M368,822 L326,822" fill="none" stroke="#00FF88" strokeWidth="2.5" opacity="0.16"/>
    </svg>
  );

  return null;
});

ThemeBackground.displayName = "ThemeBackground";
export default ThemeBackground;
