/**
 * Cena de mesa de jogo em isométrico chapado, na paleta da marca:
 * tabuleiro, pilha de caixas, dois meeples e um dado.
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

// Eixos isométricos a partir do canto da frente: direita-para-trás e esquerda-para-trás
const R: Point = [0.866, -0.5]
const L: Point = [-0.866, -0.5]

const add = (p: Point, q: Point): Point => [p[0] + q[0], p[1] + q[1]]
const scale = (p: Point, k: number): Point => [p[0] * k, p[1] * k]
const pts = (...ps: Point[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

/** Caixa isométrica: canto da frente F (na base), lados a (direita) e b (esquerda), altura h */
function isoBox(F: Point, a: number, b: number, h: number) {
  const up: Point = [0, -h]
  const fr = add(F, scale(R, a))
  const fl = add(F, scale(L, b))
  const top0 = add(F, up)
  return {
    top: pts(top0, add(fr, up), add(add(fr, scale(L, b)), up), add(fl, up)),
    right: pts(F, fr, add(fr, up), top0),
    left: pts(F, fl, add(fl, up), top0),
    /** Ponto na tampa: u ao longo de a, v ao longo de b (0 a 1) */
    onTop: (u: number, v: number): Point => add(add(top0, scale(R, a * u)), scale(L, b * v)),
    onRight: (u: number, v: number): Point => add(add(F, scale(R, a * u)), [0, -h * v]),
    onLeft: (u: number, v: number): Point => add(add(F, scale(L, b * u)), [0, -h * v]),
  }
}

function Box({ box, top, left, right }: { box: ReturnType<typeof isoBox>; top: string; left: string; right: string }) {
  return (
    <>
      <polygon points={box.left} fill={left} />
      <polygon points={box.right} fill={right} />
      <polygon points={box.top} fill={top} />
    </>
  )
}

const MEEPLE =
  'M-14 -70C-34 -68 -46 -60 -46 -50C-46 -40 -34 -36 -22 -36L-36 -4C-38 0 -36 0 -32 0L-8 0L0 -16L8 0L32 0C36 0 38 0 36 -4L22 -36C34 -36 46 -40 46 -50C46 -60 34 -68 14 -70Z'

function Meeple({ at, size, color }: { at: Point; size: number; color: string }) {
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) scale(${size})`} fill={color}>
      <circle cx="0" cy="-88" r="20" />
      <path d={MEEPLE} />
    </g>
  )
}

export function BoardScene({ className }: { className?: string }) {
  const board = isoBox([240, 410], 250, 250, 8)
  const boardGrid = [0.25, 0.5, 0.75]

  const backMeeple = board.onTop(0.82, 0.18)
  const lowerBox = isoBox(board.onTop(0.34, 0.5), 112, 92, 52)
  const upperBox = isoBox(lowerBox.onTop(0.1, 0.12), 90, 70, 30)
  const frontMeeple = board.onTop(0.1, 0.38)
  const die = isoBox(board.onTop(0.44, 0.07), 40, 40, 40)

  const badge = [
    upperBox.onTop(0.5, 0.3),
    upperBox.onTop(0.68, 0.5),
    upperBox.onTop(0.5, 0.7),
    upperBox.onTop(0.32, 0.5),
  ] as Point[]

  return (
    <svg className={className} viewBox="0 130 480 290" aria-hidden="true">
      {/* Tabuleiro com grade e uma casa destacada */}
      <Box box={board} top={NOITE} left={PAINEL} right={SOMBRA} />
      <polygon
        points={pts(board.onTop(0.5, 0.25), board.onTop(0.75, 0.25), board.onTop(0.75, 0.5), board.onTop(0.5, 0.5))}
        fill={PAINEL}
      />
      <g stroke={PAINEL} strokeWidth="2.5">
        {boardGrid.map((t) => (
          <g key={t}>
            <line x1={board.onTop(t, 0)[0]} y1={board.onTop(t, 0)[1]} x2={board.onTop(t, 1)[0]} y2={board.onTop(t, 1)[1]} />
            <line x1={board.onTop(0, t)[0]} y1={board.onTop(0, t)[1]} x2={board.onTop(1, t)[0]} y2={board.onTop(1, t)[1]} />
          </g>
        ))}
      </g>

      <Meeple at={backMeeple} size={0.62} color={GELO} />

      {/* Pilha de caixas de jogo */}
      <Box box={lowerBox} top={GIZ} left={GELO} right={CLARO} />
      <polygon
        points={pts(lowerBox.onLeft(0, 0.62), lowerBox.onLeft(1, 0.62), lowerBox.onLeft(1, 0.78), lowerBox.onLeft(0, 0.78))}
        fill={ULTRAMAR}
      />
      <Box box={upperBox} top={PAINEL} left={NOITE} right={SOMBRA} />
      <polygon points={pts(...badge)} fill={ACAFRAO} />

      <Meeple at={frontMeeple} size={1} color={ACAFRAO} />

      {/* Dado: 1 na face de cima, 2 na direita, 3 na esquerda */}
      <Box box={die} top={GIZ} left={GELO} right={CLARO} />
      <g fill={NOITE}>
        <ellipse cx={die.onTop(0.5, 0.5)[0]} cy={die.onTop(0.5, 0.5)[1]} rx="5.5" ry="3.2" />
        {[0.28, 0.72].map((t) => (
          <circle key={`r${t}`} cx={die.onRight(t, 1 - t)[0]} cy={die.onRight(t, 1 - t)[1]} r="3.6" />
        ))}
        {[0.25, 0.5, 0.75].map((t) => (
          <circle key={`l${t}`} cx={die.onLeft(t, t)[0]} cy={die.onLeft(t, t)[1]} r="3.6" />
        ))}
      </g>
    </svg>
  )
}
