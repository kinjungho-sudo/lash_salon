// MUTE Landing — SVG 오너먼트 & 일러스트 컴포넌트

export function FlourishRule({ width = 80, color = 'currentColor' }: { width?: number; color?: string }) {
  return (
    <svg viewBox="0 0 120 12" width={width} height={12}>
      <line x1="0" y1="6" x2="48" y2="6" stroke={color} strokeWidth="0.6" />
      <circle cx="60" cy="6" r="1.5" fill={color} />
      <line x1="72" y1="6" x2="120" y2="6" stroke={color} strokeWidth="0.6" />
    </svg>
  )
}

export function EyeEditorial({ color = '#2A3A2C', bg = '#E9E2D2' }: { color?: string; bg?: string }) {
  const lashes = Array.from({ length: 56 }).map((_, i) => {
    const t = i / 55
    const x = 440 * t
    const y = (1 - t) * (1 - t) * 80 + 2 * (1 - t) * t * (-20) + t * t * 80
    const dx = 2 * (1 - t) * (220 - 0) + 2 * t * (440 - 220)
    const dy = 2 * (1 - t) * (-20 - 80) + 2 * t * (80 - (-20))
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dy / len
    const ny = -dx / len
    const lashLen = 36 + 70 * Math.sin(Math.PI * t)
    return { x, y, x2: x + nx * lashLen, y2: y + ny * lashLen + lashLen * 0.5 }
  })

  return (
    <svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="600" height="750" fill={bg} />
      <circle cx="300" cy="380" r="240" fill="none" stroke={color} strokeWidth="0.4" opacity="0.15" />
      <circle cx="300" cy="380" r="180" fill="none" stroke={color} strokeWidth="0.4" opacity="0.18" />
      <circle cx="300" cy="380" r="120" fill="none" stroke={color} strokeWidth="0.4" opacity="0.22" />
      <g transform="translate(80 360)">
        <path d="M0 80 Q 220 -20 440 80" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        {lashes.map((l, i) => (
          <line key={i} x1={l.x} y1={l.y} x2={l.x2} y2={l.y2} stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity={0.82} />
        ))}
      </g>
      <text x="40" y="60" fontFamily="Inter, sans-serif" fontSize="10" letterSpacing="3" fill={color} opacity="0.55">PLATE I</text>
      <text x="560" y="60" fontFamily="Inter, sans-serif" fontSize="10" letterSpacing="3" fill={color} opacity="0.55" textAnchor="end">2026</text>
      <text x="300" y="700" fontFamily="Italiana, serif" fontSize="22" letterSpacing="6" fill={color} opacity="0.7" textAnchor="middle">CILIUM · STUDY No. 04</text>
    </svg>
  )
}

export function LashStudyA({ color = '#2A3A2C', bg = '#F2ECDD' }: { color?: string; bg?: string }) {
  const lashes = Array.from({ length: 40 }).map((_, i) => {
    const t = i / 39
    const x = 320 * t
    const y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * (-10) + t * t * 40
    const lashLen = 24 + 36 * Math.sin(Math.PI * t)
    return { x, y, lashLen }
  })
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="500" fill={bg} />
      <g transform="translate(40 240)">
        <path d="M0 40 Q 160 -10 320 40" fill="none" stroke={color} strokeWidth="1.6" />
        {lashes.map((l, i) => (
          <line key={i} x1={l.x} y1={l.y} x2={l.x} y2={l.y + l.lashLen} stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity={0.8} />
        ))}
      </g>
      <text x="200" y="460" fontFamily="Italiana, serif" fontSize="14" letterSpacing="5" fill={color} opacity="0.55" textAnchor="middle">NATURAL CURL</text>
    </svg>
  )
}

export function LashStudyB({ color = '#2A3A2C', bg = '#F2ECDD' }: { color?: string; bg?: string }) {
  const arcs = [60, 110, 160, 210, 260]
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="500" fill={bg} />
      {arcs.map((r, i) => (
        <path key={i} d={`M ${200 - r} 280 A ${r} ${r} 0 0 1 ${200 + r} 280`} fill="none" stroke={color} strokeWidth="1" opacity={0.55 - i * 0.08} />
      ))}
      <circle cx="200" cy="280" r="6" fill={color} />
      <text x="200" y="460" fontFamily="Italiana, serif" fontSize="14" letterSpacing="5" fill={color} opacity="0.55" textAnchor="middle">VOLUME LIFT</text>
    </svg>
  )
}

export function LashStudyC({ color = '#2A3A2C', bg = '#F2ECDD' }: { color?: string; bg?: string }) {
  const veins = Array.from({ length: 12 }).map((_, i) => {
    const y = -130 + i * 24
    const w = Math.max(8, 45 - Math.abs(y) / 4)
    return { y, w }
  })
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="500" fill={bg} />
      <g transform="translate(200 250) rotate(-15)">
        <ellipse cx="0" cy="0" rx="50" ry="160" fill="none" stroke={color} strokeWidth="1.2" />
        <line x1="0" y1="-150" x2="0" y2="150" stroke={color} strokeWidth="0.6" />
        {veins.map((v, i) => (
          <line key={i} x1={-v.w} y1={v.y + 8} x2={0} y2={v.y} stroke={color} strokeWidth="0.5" opacity="0.7" />
        ))}
      </g>
      <text x="200" y="460" fontFamily="Italiana, serif" fontSize="14" letterSpacing="5" fill={color} opacity="0.55" textAnchor="middle">BOTANICAL CARE</text>
    </svg>
  )
}

export function MapArt() {
  const color = '#2A3A2C'
  const blocks = [
    [80, 150, 60, 40], [60, 330, 80, 50], [330, 310, 60, 60],
    [460, 310, 90, 40], [330, 150, 90, 40], [480, 150, 60, 40],
  ]
  return (
    <svg viewBox="0 0 600 480" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="600" height="480" fill="#F2ECDD" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={'h' + i} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="#C9BFA6" strokeWidth="0.3" opacity="0.5" />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={'v' + i} x1={i * 40} y1="0" x2={i * 40} y2="480" stroke="#C9BFA6" strokeWidth="0.3" opacity="0.5" />
      ))}
      <path d="M 0 280 Q 200 230 360 270 T 600 250" fill="none" stroke="#C9BFA6" strokeWidth="14" opacity="0.7" />
      <path d="M 0 280 Q 200 230 360 270 T 600 250" fill="none" stroke="#EFE7D2" strokeWidth="10" />
      <path d="M 220 0 L 240 200 L 280 480" fill="none" stroke="#C9BFA6" strokeWidth="10" opacity="0.6" />
      <path d="M 220 0 L 240 200 L 280 480" fill="none" stroke="#EFE7D2" strokeWidth="6" />
      <path d="M 420 0 L 410 480" fill="none" stroke="#C9BFA6" strokeWidth="6" opacity="0.5" />
      <path d="M 0 100 Q 150 60 320 80 T 600 60 L 600 0 L 0 0 Z" fill="#E2DCC2" opacity="0.5" />
      {blocks.map((b, i) => (
        <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="#E9E2D2" stroke="#C9BFA6" strokeWidth="0.6" />
      ))}
      <g transform="translate(300 240)">
        <circle r="38" fill={color} opacity="0.08" />
        <circle r="20" fill={color} opacity="0.14" />
        <circle r="9" fill={color} />
        <circle r="3" fill="#E9E2D2" />
      </g>
      <text x="316" y="232" fontFamily="Italiana, serif" fontSize="14" letterSpacing="3" fill={color}>MUTE</text>
      <g transform="translate(540 60)">
        <circle r="22" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill={color} opacity="0.7" />
        <text x="0" y="-26" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2" fill={color} textAnchor="middle" opacity="0.7">N</text>
      </g>
      <text x="100" y="120" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2" fill="#6B7363" opacity="0.7">SEONGSU PARK</text>
      <text x="450" y="200" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2" fill="#6B7363" opacity="0.7">YEONMUJANG</text>
      <text x="80" y="430" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2" fill="#6B7363" opacity="0.7">TTUKSEOM</text>
    </svg>
  )
}
