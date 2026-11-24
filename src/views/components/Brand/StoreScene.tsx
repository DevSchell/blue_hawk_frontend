/**
 * Vitrine da Loja em isométrico chapado, no mesmo traço da BoardScene da Wiki:
 * uma pilha de caixas de jogo com etiqueta de preço, moedas e um meeple que "cuida da banca".
 */

type Point = [number, number]

const NOITE = '#0B1147'
const PAINEL = '#161E66'
const SOMBRA = '#0F1650'
const ULTRAMAR = '#2438E8'
const CLARO = '#7E92FF'
const GELO = '#C6D0FF'
const GIZ = '#F3F4FC'
const ACAFRAO = '#FFB000'

const R: Point = [0.866, -0.5]
const L: Point = [-0.866, -0.5]
const add = (p: Point, q: Point): Point => [p[0] + q[0], p[1] + q[1]]
const scale = (p: Point, k: number): Point => [p[0] * k, p[1] * k]
const pts = (...ps: Point[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

/** Caixa isométrica: canto da frente F (na base), lados a (direita) e b (esquerda), altura h */
function Box({ F, a, b, h, top, right, left }: { F: Point; a: number; b: number; h: number; top: string; right: string; left: string }) {
  const up: Point = [0, -h]
  const fr = add(F, scale(R, a))
  const fl = add(F, scale(L, b))
  const t0 = add(F, up)
  return (
    <g>
      <polygon points={pts(t0, add(fr, up), add(add(fr, scale(L, b)), up), add(fl, up))} fill={top} />
      <polygon points={pts(F, fr, add(fr, up), t0)} fill={right} />
      <polygon points={pts(F, fl, add(fl, up), t0)} fill={left} />
    </g>
  )
}

/** Moeda vista de lado (elipse com borda) */
function Coin({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 4} rx={r} ry={r * 0.45} fill="#C98A00" />
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill={ACAFRAO} />
      <ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.25} fill="none" stroke="#C98A00" strokeWidth="2" />
    </g>
  )
}

export function StoreScene() {
  return (
    <svg viewBox="0 0 380 280" role="img" aria-label="Pilha de caixas de jogos usados com etiqueta de preço">
      {/* Tampo da banca */}
      <Box F={[190, 262]} a={150} b={150} h={14} top={PAINEL} right={SOMBRA} left={NOITE} />
      {/* Pilha: caixa grande embaixo, média e pequena em cima (levemente deslocadas) */}
      <Box F={[176, 224]} a={92} b={70} h={34} top={GIZ} right={GELO} left={CLARO} />
      <path d="M176 190l50-29" stroke={ULTRAMAR} strokeWidth="6" />
      <Box F={[188, 190]} a={70} b={56} h={30} top={ACAFRAO} right="#E09A00" left="#C98A00" />
      <path d="M150 174l-28-16" stroke={NOITE} strokeWidth="5" opacity="0.5" />
      <Box F={[178, 160]} a={52} b={44} h={24} top={CLARO} right={ULTRAMAR} left="#1D2BB8" />
      {/* Etiqueta de preço pendurada */}
      <path d="M232 132l16 20" stroke={GIZ} strokeWidth="2" />
      <g transform="rotate(-14 270 168)">
        <path d="M244 152h46l12 16-12 16h-46Z" fill={ACAFRAO} />
        <circle cx="290" cy="168" r="3.5" fill={NOITE} />
        <path d="M252 162h26M252 172h18" stroke={NOITE} strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* Moedas */}
      <Coin x={92} y={238} r={18} />
      <Coin x={92} y={228} r={18} />
      <Coin x={120} y={250} r={14} />
      {/* Meeple da banca */}
      <path
        transform="translate(286 196) scale(0.9)"
        fill={GIZ}
        d="M24 0c5 0 9 4 9 9 0 3-2 6-4 8 7 2 14 6 18 12 2 3-1 6-5 6-4 0-7-4-9-6v15l10 15c1 2-1 4-4 4-3 0-6-2-8-5l-7-10-7 10c-2 3-5 5-8 5-3 0-5-2-4-4l10-15V29c-2 2-5 6-9 6-4 0-7-3-5-6 4-6 11-10 18-12-2-2-4-5-4-8 0-5 4-9 9-9Z"
      />
      {/* Brilhos */}
      <path d="M120 96l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill={GIZ} opacity="0.9" />
      <path d="M322 110l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill={ACAFRAO} />
    </svg>
  )
}
