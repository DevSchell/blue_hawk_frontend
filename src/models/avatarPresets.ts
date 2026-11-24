/**
 * Presets de avatares com ilustrações SVG embutidas (Data URI).
 * Não dependem de rede externa e seguem a identidade Blue Hawk em versão minimalista:
 * fundo liso, um círculo sutil e um emblema chapado no centro, em 2 ou 3 cores da paleta,
 * sem contornos nem rostos.
 */

function makeSvgUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`
}

export type AvatarPreset = {
  id: string
  label: string
  dataUri: string
}

// Paleta da marca (mesmos valores dos tokens de global.css)
const NOITE = '#0b1147'
const PAINEL = '#161e66'
const ULTRAMAR = '#2438e8'
const CLARO = '#7e92ff'
const GELO = '#c6d0ff'
const GIZ = '#f3f4fc'
const ACAFRAO = '#ffb000'

/** Fundo liso, círculo sutil (claro no fundo escuro, escuro no fundo claro) e o emblema */
function emblem(bg: string, content: string, { lightBg = false } = {}) {
  const circle = lightBg ? `fill="${NOITE}" opacity="0.08"` : `fill="${GIZ}" opacity="0.07"`
  return makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="${bg}"/>
      <circle cx="50" cy="50" r="36" ${circle}/>
      ${content}
    </svg>
  `)
}

/** Estrela de 5 pontas centrada em (x,y) */
function star(x: number, y: number, r: number, fill: string) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.45
    const angle = (Math.PI / 5) * i - Math.PI / 2
    return `${(x + radius * Math.cos(angle)).toFixed(1)},${(y + radius * Math.sin(angle)).toFixed(1)}`
  })
  return `<polygon points="${points.join(' ')}" fill="${fill}"/>`
}

/** D20 visto de frente: hexágono e o triângulo da face de cima */
function d20(cx: number, cy: number, r: number, body: string, face: string) {
  const h = r * 0.866
  return `
    <path d="M${cx} ${cy - r} L${cx + h} ${cy - r / 2} V${cy + r / 2} L${cx} ${cy + r} L${cx - h} ${cy + r / 2} V${cy - r / 2} Z" fill="${body}"/>
    <path d="M${cx} ${cy - r * 0.55} L${cx + h * 0.55} ${cy + r * 0.38} H${cx - h * 0.55} Z" fill="${face}"/>
  `
}

/** Cabeça de corvo de perfil (bico para a direita), chapada */
function raven(body: string, beak: string, eye: string) {
  return `
    <path d="M28 76 Q22 50 36 35 Q48 24 63 28 L66 30 Q71 40 64 47 Q66 60 56 68 Q44 78 28 76 Z" fill="${body}"/>
    <path d="M63 28 L86 37 L64 45 Q69 37 63 28 Z" fill="${beak}"/>
    <circle cx="54" cy="38" r="3.6" fill="${eye}"/>
  `
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'clerigo',
    label: 'Clérigo',
    // Mitra com cruz dourada
    dataUri: emblem(
      ULTRAMAR,
      `
      <path d="M30 78 Q29 44 50 18 Q71 44 70 78 Z" fill="${GIZ}"/>
      <path d="M30 70 H70 V78 H30 Z" fill="${ACAFRAO}"/>
      <path d="M47 34 H53 V44 H61 V50 H53 V64 H47 V50 H39 V44 H47 Z" fill="${ACAFRAO}"/>
      `,
    ),
  },
  {
    id: 'mago',
    label: 'Mago',
    // Chapéu pontudo com estrela
    dataUri: emblem(
      NOITE,
      `
      ${star(22, 24, 3, GIZ)}
      ${star(80, 30, 2.2, GELO)}
      <path d="M30 70 L48 22 Q54 16 62 20 Q56 24 58 32 L70 70 Z" fill="${CLARO}"/>
      <path d="M16 72 Q50 62 84 72 Q50 82 16 72 Z" fill="${GELO}"/>
      <path d="M31 66 Q50 61 69 66 L70 70 Q50 65 30 70 Z" fill="${ACAFRAO}"/>
      ${star(50, 46, 6, ACAFRAO)}
      `,
    ),
  },
  {
    id: 'paladino',
    label: 'Paladino',
    // Elmo com visor em T e pluma
    dataUri: emblem(
      GELO,
      `
      <path d="M50 24 Q58 10 74 12 Q64 18 60 30 Z" fill="${ACAFRAO}"/>
      <path d="M30 80 V50 Q30 26 50 24 Q70 26 70 50 V80 Z" fill="${ULTRAMAR}"/>
      <path d="M37 48 H63 V54 H54 V74 H46 V54 H37 Z" fill="${NOITE}"/>
      `,
      { lightBg: true },
    ),
  },
  {
    id: 'guerreiro',
    label: 'Guerreiro',
    // Elmo de chifres
    dataUri: emblem(
      ACAFRAO,
      `
      <path d="M32 54 Q18 50 16 30 Q24 42 34 44 Z" fill="${GIZ}"/>
      <path d="M68 54 Q82 50 84 30 Q76 42 66 44 Z" fill="${GIZ}"/>
      <path d="M28 70 Q28 38 50 36 Q72 38 72 70 Z" fill="${NOITE}"/>
      <path d="M26 64 H74 V72 H26 Z" fill="${PAINEL}"/>
      <path d="M47 50 H53 V80 L50 84 L47 80 Z" fill="${PAINEL}"/>
      `,
      { lightBg: true },
    ),
  },
  {
    id: 'cacador',
    label: 'Caçador',
    // Arco e flecha
    dataUri: emblem(
      PAINEL,
      `
      <path d="M36 18 Q78 50 36 82" fill="none" stroke="${ACAFRAO}" stroke-width="6" stroke-linecap="round"/>
      <path d="M36 18 V82" stroke="${GELO}" stroke-width="1.8"/>
      <path d="M22 50 H78" stroke="${GIZ}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M86 50 L74 43 V57 Z" fill="${GIZ}"/>
      <path d="M22 50 L14 43 H22 L28 50 L22 57 H14 Z" fill="${CLARO}"/>
      `,
    ),
  },
  {
    id: 'druida',
    label: 'Druida',
    // Galhada sobre uma folha
    dataUri: emblem(
      CLARO,
      `
      <path d="M42 46 Q30 34 31 16 M36 33 Q26 30 22 20 M58 46 Q70 34 69 16 M64 33 Q74 30 78 20" fill="none" stroke="${GIZ}" stroke-width="5" stroke-linecap="round"/>
      <path d="M50 38 Q72 52 50 84 Q28 52 50 38 Z" fill="${PAINEL}"/>
      <path d="M50 46 V78" stroke="${ACAFRAO}" stroke-width="2.5" stroke-linecap="round"/>
      `,
      { lightBg: true },
    ),
  },
  {
    id: 'mestre',
    label: 'Mestre',
    // D20 sobre o escudo do mestre
    dataUri: emblem(
      NOITE,
      `
      ${d20(50, 38, 20, ACAFRAO, NOITE)}
      <path d="M18 66 L36 62 V84 L18 86 Z" fill="${CLARO}"/>
      <path d="M36 62 H64 V84 H36 Z" fill="${GELO}"/>
      <path d="M64 62 L82 66 V86 L64 84 Z" fill="${CLARO}"/>
      `,
    ),
  },
  {
    id: 'd20-mimico',
    label: 'D20 Mímico',
    // D20 com uma boca dentuça
    dataUri: emblem(
      ULTRAMAR,
      `
      <path d="M50 16 L80 33 V67 L50 84 L20 67 V33 Z" fill="${ACAFRAO}"/>
      <path d="M26 50 Q50 44 74 50 Q70 72 50 74 Q30 72 26 50 Z" fill="${NOITE}"/>
      <path d="M29 49.5 L33 57 L37 48 L41 57 L45 47 L49 56 L51 56 L55 47 L59 57 L63 48 L67 57 L71 49.5 Q50 44 29 49.5 Z" fill="${GIZ}"/>
      <path d="M43 64 Q50 60 57 64 Q56 72 50 73 Q44 72 43 64 Z" fill="${CLARO}"/>
      <circle cx="40" cy="34" r="4" fill="${NOITE}"/>
      <circle cx="60" cy="34" r="4" fill="${NOITE}"/>
      `,
    ),
  },
  {
    id: 'rei',
    label: 'Rei',
    // Coroa
    dataUri: emblem(
      PAINEL,
      `
      <path d="M24 70 L20 32 L36 46 L50 24 L64 46 L80 32 L76 70 Z" fill="${ACAFRAO}"/>
      <path d="M24 72 H76 V80 H24 Z" fill="${ACAFRAO}"/>
      <circle cx="50" cy="56" r="5" fill="${ULTRAMAR}"/>
      <circle cx="35" cy="60" r="3" fill="${GIZ}"/>
      <circle cx="65" cy="60" r="3" fill="${GIZ}"/>
      `,
    ),
  },
  {
    id: 'corvo-noturno',
    label: 'Corvo Noturno',
    dataUri: emblem(
      NOITE,
      `
      <circle cx="26" cy="24" r="8" fill="${GELO}"/>
      <circle cx="30" cy="21" r="7" fill="${NOITE}"/>
      ${raven(CLARO, GELO, NOITE)}
      `,
    ),
  },
  {
    id: 'corvo-dourado',
    label: 'Corvo Dourado',
    dataUri: emblem(
      ULTRAMAR,
      `
      ${star(26, 26, 5, GIZ)}
      ${raven(ACAFRAO, GIZ, NOITE)}
      `,
    ),
  },
  {
    id: 'escudo-do-rei',
    label: 'Escudo do Rei',
    // Brasão com a coroa
    dataUri: emblem(
      ACAFRAO,
      `
      <path d="M50 14 L80 24 V50 C80 70 50 86 50 86 C50 86 20 70 20 50 V24 Z" fill="${NOITE}"/>
      <path d="M50 14 L80 24 V50 C80 70 50 86 50 86 Z" fill="${PAINEL}"/>
      <path d="M36 54 L34 36 L42 43 L50 31 L58 43 L66 36 L64 54 Z" fill="${ACAFRAO}"/>
      <path d="M36 57 H64 V62 H36 Z" fill="${ACAFRAO}"/>
      `,
      { lightBg: true },
    ),
  },
]

/** Imagem (Data URI) de um avatar pelo id; null para um id que não existe mais */
export function presetDataUri(presetId: string): string | null {
  return AVATAR_PRESETS.find((preset) => preset.id === presetId)?.dataUri ?? null
}

/** Id do avatar a partir da imagem salva (para saber qual está marcado) */
export function presetIdOf(dataUri: string | null): string | null {
  return AVATAR_PRESETS.find((preset) => preset.dataUri === dataUri)?.id ?? null
}
