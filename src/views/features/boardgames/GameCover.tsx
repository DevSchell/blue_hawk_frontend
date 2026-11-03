/**
 * A API ainda não tem imagem de capa, então cada jogo ganha uma capa
 * geométrica na paleta da marca, sempre a mesma para o mesmo id.
 */

const NOITE = '#0B1147'
const PAINEL = '#161E66'
const ULTRAMAR = '#2438E8'
const CLARO = '#7E92FF'
const GIZ = '#F3F4FC'
const ACAFRAO = '#FFB000'

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Ondas angulosas em três faixas */
function Waves({ offset }: { offset: number }) {
  const row = (y: number) => {
    let d = `M0 ${y + 26}`
    for (let x = 0; x <= 300; x += 38) {
      d += `L${x} ${y + ((x / 38 + offset) % 2 === 0 ? 26 : 0)}`
    }
    return `${d}L300 ${y + 26}V170H0Z`
  }
  return (
    <>
      <rect width="300" height="170" fill={ULTRAMAR} />
      <path fill={CLARO} d={row(48)} />
      <path fill={PAINEL} d={row(82)} />
      <path fill={NOITE} d={row(116)} />
    </>
  )
}

/** Feixe de luz cruzando a noite */
function Beam({ flip }: { flip: boolean }) {
  return (
    <g transform={flip ? 'translate(300 0) scale(-1 1)' : undefined}>
      <rect width="300" height="170" fill={NOITE} />
      <path fill={ACAFRAO} d="M104 56L300 8V96Z" />
      <path fill={GIZ} d="M86 62H110L120 170H76Z" />
      <path fill={ACAFRAO} d="M84 44H112V62H84Z" />
      <path fill={GIZ} d="M80 36H116L98 20Z" />
      <path fill={ULTRAMAR} d="M0 150L300 136V170H0Z" />
    </g>
  )
}

/** Cordilheira de picos */
function Peaks({ offset }: { offset: number }) {
  const s = offset * 24
  return (
    <>
      <rect width="300" height="170" fill={CLARO} />
      <circle cx={220 - s} cy="52" r="22" fill={ACAFRAO} />
      <path fill={ULTRAMAR} d={`M0 170L${70 + s} 70L${150 + s} 150L${210 + s} 60L300 140V170Z`} />
      <path fill={NOITE} d={`M0 170L${40 + s} 120L${110 + s} 170ZM${170 + s} 170L${250 + s} 104L300 150V170Z`} />
    </>
  )
}

/** O corvo sobre um vale açafrão */
function Valley() {
  return (
    <>
      <rect width="300" height="170" fill={ACAFRAO} />
      <path fill={ULTRAMAR} d="M0 66L80 170H0Z" />
      <path fill={ULTRAMAR} d="M300 40L190 170H300Z" />
      <path fill={NOITE} d="M0 118L70 170H0ZM300 104L232 170H300Z" />
      <svg className="m m-acaf" x="98" y="30" width="110" height="115" viewBox="0 0 400 420">
        <use href="#corvo" />
      </svg>
    </>
  )
}

/** Tabuleiro em diagonal */
function Board({ offset }: { offset: number }) {
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c + offset) % 2 === 0) {
        cells.push(<rect key={`${r}-${c}`} x={c * 44 - 20} y={r * 44 - 4} width="44" height="44" />)
      }
    }
  }
  return (
    <>
      <rect width="300" height="170" fill={PAINEL} />
      <g fill={ULTRAMAR} transform="skewX(-18)">
        {cells}
      </g>
      <path fill={ACAFRAO} d="M196 120L232 84L268 120L232 156Z" />
    </>
  )
}

export function GameCover({ id, name }: { id: string; name: string }) {
  const h = hash(id)
  const variant = h % 5
  const offset = (h >>> 3) % 2

  return (
    <svg viewBox="0 0 300 170" role="img" aria-label={`Capa ilustrativa de ${name}`}>
      {variant === 0 && <Waves offset={offset} />}
      {variant === 1 && <Beam flip={offset === 1} />}
      {variant === 2 && <Peaks offset={offset} />}
      {variant === 3 && <Valley />}
      {variant === 4 && <Board offset={offset} />}
    </svg>
  )
}
