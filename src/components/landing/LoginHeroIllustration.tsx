export default function LoginHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="hpGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0071E3" />
            <stop offset="100%" stopColor="#2997FF" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A1F28" />
            <stop offset="100%" stopColor="#14181F" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background grid */}
        <g opacity="0.06">
          {[...Array(12)].map((_, i) => (
            <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="400" stroke="white" strokeWidth="0.5" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 45} x2="500" y2={i * 45} stroke="white" strokeWidth="0.5" />
          ))}
        </g>

        {/* Central hub circle */}
        <circle cx="250" cy="200" r="60" stroke="url(#hpGrad)" strokeWidth="2" fill="#0071E310">
          <animate attributeName="r" values="60;64;60" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Inner hub */}
        <circle cx="250" cy="200" r="28" fill="url(#hpGrad)">
          <animate attributeName="r" values="28;32;28" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="250" y="208" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="sans-serif">S</text>

        {/* Orbiting nodes */}
        {[
          { angle: 0, label: "CRM", icon: "📊" },
          { angle: 60, label: "Finance", icon: "💰" },
          { angle: 120, label: "Projects", icon: "📁" },
          { angle: 180, label: "Analytics", icon: "📈" },
          { angle: 240, label: "People", icon: "👥" },
          { angle: 300, label: "AI", icon: "🤖" },
        ].map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const cx = 250 + Math.cos(rad) * 140;
          const cy = 200 + Math.sin(rad) * 140;
          return (
            <g key={i}>
              {/* Connection line */}
              <line
                x1="250"
                y1="200"
                x2={cx}
                y2={cy}
                stroke="#0071E3"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;16;0"
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </line>

              {/* Outer ring */}
              <circle cx={cx} cy={cy} r="32" fill="#1A1F28" stroke="#0071E3" strokeWidth="1.5">
                <animate
                  attributeName="r"
                  values="32;34;32"
                  dur={`${2.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Icon circle */}
              <circle cx={cx} cy={cy} r="18" fill="url(#hpGrad)" opacity="0.9">
                <animate
                  attributeName="opacity"
                  values="0.9;0.6;0.9"
                  dur={`${2 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Label */}
              <text
                x={cx}
                y={cy + 48}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="500"
                fontFamily="sans-serif"
                opacity="0.7"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Floating cards around */}
        {[
          { x: 80, y: 60, w: 90, h: 55, delay: "0s" },
          { x: 340, y: 50, w: 100, h: 50, delay: "1s" },
          { x: 360, y: 280, w: 95, h: 60, delay: "2s" },
          { x: 60, y: 290, w: 85, h: 50, delay: "1.5s" },
        ].map((card, i) => (
          <g key={i}>
            <rect
              x={card.x}
              y={card.y}
              width={card.w}
              height={card.h}
              rx="8"
              fill="url(#cardGrad)"
              stroke="#2C2C3E"
              strokeWidth="1"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; 0,-6; 0,0`}
                dur={`${4 + i}s`}
                repeatCount="indefinite"
                additive="sum"
              />
            </rect>
            <rect x={card.x + 12} y={card.y + 14} width={card.w - 24} height="6" rx="3" fill="#0071E3" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.3;0.6" dur={`${3 + i}s`} repeatCount="indefinite" />
            </rect>
            <rect x={card.x + 12} y={card.y + 28} width={(card.w - 24) * 0.7} height="4" rx="2" fill="#8A929D" opacity="0.3" />
            <rect x={card.x + 12} y={card.y + 38} width={(card.w - 24) * 0.5} height="4" rx="2" fill="#8A929D" opacity="0.2" />
          </g>
        ))}

        {/* Particle dots */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 90 + Math.random() * 60;
          const px = 250 + Math.cos(angle) * r;
          const py = 200 + Math.sin(angle) * r;
          return (
            <circle key={i} cx={px} cy={py} r="2" fill="#2997FF" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="2;3;2" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* Curved decorative arcs */}
        <path
          d="M 120 200 A 130 130 0 0 1 380 200"
          stroke="#0071E3"
          strokeWidth="1"
          fill="none"
          opacity="0.15"
          strokeDasharray="8 8"
        >
          <animate attributeName="stroke-dashoffset" values="0;32;0" dur="6s" repeatCount="indefinite" />
        </path>

        <path
          d="M 150 200 A 100 100 0 0 0 350 200"
          stroke="#2997FF"
          strokeWidth="1"
          fill="none"
          opacity="0.12"
          strokeDasharray="6 6"
        >
          <animate attributeName="stroke-dashoffset" values="0;24;0" dur="5s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}
