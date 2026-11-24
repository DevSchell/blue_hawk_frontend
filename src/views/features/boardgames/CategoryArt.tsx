import type { ReactElement } from 'react'

/**
 * Ilustrações das categorias (quadros de "Explore por categoria" na Wiki e na Loja), em SVG chapado
 * na paleta da marca. Uma por categoria; nomes desconhecidos usam a arte genérica (dados).
 */

const NOITE = '#0B1147'
const PAINEL = '#161E66'
const ULTRAMAR = '#2438E8'
const CLARO = '#7E92FF'
const GELO = '#C6D0FF'
const GIZ = '#F3F4FC'
const ACAFRAO = '#FFB000'

/** Meeple (peça de tabuleiro) com a base em (x, y) e altura h */
function Meeple({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) {
  const s = h / 64
  return (
    <path
      transform={`translate(${x - 24 * s} ${y - 64 * s}) scale(${s})`}
      fill={fill}
      d="M24 0c5 0 9 4 9 9 0 3-2 6-4 8 7 2 14 6 18 12 2 3-1 6-5 6-4 0-7-4-9-6v15l10 15c1 2-1 4-4 4-3 0-6-2-8-5l-7-10-7 10c-2 3-5 5-8 5-3 0-5-2-4-4l10-15V29c-2 2-5 6-9 6-4 0-7-3-5-6 4-6 11-10 18-12-2-2-4-5-4-8 0-5 4-9 9-9Z"
    />
  )
}

function Estrategia() {
  const hexes = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * 42 + (row % 2) * 21 - 10
      const y = row * 36 + 40
      hexes.push(`M${x} ${y}l21-12 21 12v24l-21 12-21-12Z`)
    }
  }
  return (
    <>
      <rect width="320" height="180" fill={ULTRAMAR} />
      <path d={hexes.join(' ')} fill="none" stroke={CLARO} strokeWidth="1.5" opacity="0.45" />
      <path d="M190 72h12v20h-12z" fill={ACAFRAO} opacity="0.5" />
      {/* Torre */}
      <path d="M196 150V96h-6V78h10v8h8v-8h10v8h8v-8h10v18h-6v54Z" fill={NOITE} />
      <path d="M228 60v-30l20 8-20 8" fill={ACAFRAO} />
      <path d="M228 78V30" stroke={GIZ} strokeWidth="3" />
      {/* Cavalo */}
      <path
        d="M98 150c-2-14 2-24 10-32-6-2-12-6-14-12l20-24c6-8 16-12 26-10 10 2 16 12 16 24 0 16-8 24-10 34l4 20Z"
        fill={GIZ}
      />
      <circle cx="128" cy="96" r="3.5" fill={NOITE} />
      <path d="M90 150h80v10H90z M188 150h64v10h-64z" fill={ACAFRAO} />
    </>
  )
}

function Cooperativo() {
  return (
    <>
      <rect width="320" height="180" fill={PAINEL} />
      <circle cx="160" cy="92" r="70" fill={ULTRAMAR} opacity="0.5" />
      <path d="M160 34l9 18 20 3-14 14 3 20-18-9-18 9 3-20-14-14 20-3Z" fill={ACAFRAO} />
      <path d="M104 132q56 26 112 0" fill="none" stroke={CLARO} strokeWidth="5" strokeLinecap="round" />
      <Meeple x={104} y={158} h={64} fill={GIZ} />
      <Meeple x={160} y={164} h={64} fill={ACAFRAO} />
      <Meeple x={216} y={158} h={64} fill={CLARO} />
    </>
  )
}

function Familia() {
  return (
    <>
      <rect width="320" height="180" fill={CLARO} />
      <path d="M0 140h320v40H0z" fill={ULTRAMAR} />
      {/* Tabuleiro na mesa */}
      <path d="M118 140l42-16 42 16-42 16Z" fill={GIZ} />
      <path d="M140 140l20-8 20 8-20 8Z" fill={ACAFRAO} />
      <Meeple x={86} y={150} h={78} fill={NOITE} />
      <Meeple x={234} y={150} h={78} fill={PAINEL} />
      <Meeple x={124} y={168} h={44} fill={ACAFRAO} />
      <Meeple x={198} y={168} h={44} fill={GIZ} />
      <path d="M150 52c0-8 10-10 10-2 0-8 10-6 10 2 0 8-10 12-10 16 0-4-10-8-10-16Z" fill={ACAFRAO} />
    </>
  )
}

function Party() {
  return (
    <>
      <rect width="320" height="180" fill={ACAFRAO} />
      {[
        [30, 30, CLARO],
        [282, 40, ULTRAMAR],
        [60, 150, NOITE],
        [250, 150, GIZ],
        [150, 20, NOITE],
        [300, 110, CLARO],
      ].map(([x, y, c], i) => (
        <rect key={i} x={Number(x)} y={Number(y)} width="10" height="5" fill={String(c)} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      {/* Balões de fala */}
      <path d="M50 56h110a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H96l-20 18 4-18H50a12 12 0 0 1-12-12V68a12 12 0 0 1 12-12Z" fill={NOITE} />
      <path d="M64 78h80M64 94h52" stroke={GIZ} strokeWidth="6" strokeLinecap="round" />
      <path d="M188 86h84a12 12 0 0 1 12 12v26a12 12 0 0 1-12 12h-12l4 16-20-16h-56a12 12 0 0 1-12-12V98a12 12 0 0 1 12-12Z" fill={GIZ} />
      <text x="230" y="124" textAnchor="middle" fontFamily="Grenze, serif" fontWeight="800" fontSize="34" fill={ULTRAMAR}>
        !?
      </text>
      {/* Dado */}
      <g transform="rotate(-14 150 140)">
        <rect x="130" y="120" width="40" height="40" rx="6" fill={GIZ} />
        <circle cx="141" cy="131" r="4" fill={NOITE} />
        <circle cx="150" cy="140" r="4" fill={NOITE} />
        <circle cx="159" cy="149" r="4" fill={NOITE} />
      </g>
    </>
  )
}

function Cartas() {
  const card = (angle: number, fill: string, suit: string) => (
    <g transform={`rotate(${angle} 160 200)`}>
      <rect x="126" y="40" width="68" height="100" rx="6" fill={fill} stroke={NOITE} strokeWidth="2" />
      <path d={suit} fill={ACAFRAO} transform="translate(160 90)" />
    </g>
  )
  const spade = 'M0-18c-10 10-18 16-18 24 0 6 5 10 11 8l-3 10h20l-3-10c6 2 11-2 11-8 0-8-8-14-18-24Z'
  const heart = 'M0 14C-14 4-18-2-18-8c0-6 5-10 10-10 4 0 7 3 8 6 1-3 4-6 8-6 5 0 10 4 10 10 0 6-4 12-18 22Z'
  const diamond = 'M0-20 14 0 0 20-14 0Z'
  return (
    <>
      <rect width="320" height="180" fill={NOITE} />
      <circle cx="160" cy="110" r="78" fill={PAINEL} />
      {card(-28, GELO, diamond)}
      {card(0, GIZ, spade)}
      {card(28, CLARO, heart)}
    </>
  )
}

function Abstrato() {
  const tiles: [number, number, string, 'q' | 'c' | 't'][] = [
    [40, 30, ACAFRAO, 'q'],
    [100, 30, GIZ, 'c'],
    [160, 30, CLARO, 't'],
    [220, 30, ACAFRAO, 'c'],
    [40, 90, ULTRAMAR, 'c'],
    [100, 90, ACAFRAO, 't'],
    [160, 90, GIZ, 'q'],
    [220, 90, CLARO, 'q'],
  ]
  return (
    <>
      <rect width="320" height="180" fill={PAINEL} />
      <path d="M30 20h260v140H30z" fill="none" stroke={ULTRAMAR} strokeWidth="2" />
      {tiles.map(([x, y, c, shape], i) =>
        shape === 'q' ? (
          <rect key={i} x={x + 6} y={y + 6} width="48" height="48" fill={c} />
        ) : shape === 'c' ? (
          <circle key={i} cx={x + 30} cy={y + 30} r="24" fill={c} />
        ) : (
          <path key={i} d={`M${x + 30} ${y + 6}l26 48H${x + 4}Z`} fill={c} />
        ),
      )}
      <circle cx="280" cy="150" r="14" fill={ACAFRAO} opacity="0.6" />
    </>
  )
}

/** Arte genérica: dois dados */
function Generica() {
  return (
    <>
      <rect width="320" height="180" fill={ULTRAMAR} />
      <g transform="rotate(-12 130 96)">
        <rect x="100" y="66" width="60" height="60" rx="8" fill={GIZ} />
        <circle cx="116" cy="82" r="5" fill={NOITE} />
        <circle cx="144" cy="110" r="5" fill={NOITE} />
      </g>
      <g transform="rotate(16 200 100)">
        <rect x="170" y="70" width="60" height="60" rx="8" fill={ACAFRAO} />
        <circle cx="186" cy="86" r="5" fill={NOITE} />
        <circle cx="200" cy="100" r="5" fill={NOITE} />
        <circle cx="214" cy="114" r="5" fill={NOITE} />
      </g>
    </>
  )
}

const ART: Record<string, () => ReactElement> = {
  estrategia: Estrategia,
  cooperativo: Cooperativo,
  familia: Familia,
  party: Party,
  cartas: Cartas,
  abstrato: Abstrato,
}

/** "Estratégia" → "estrategia" */
const keyOf = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export function CategoryArt({ name }: { name: string }) {
  const Art = ART[keyOf(name)] ?? Generica
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Art />
    </svg>
  )
}
