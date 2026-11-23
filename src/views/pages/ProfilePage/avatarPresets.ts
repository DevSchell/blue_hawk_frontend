/**
 * Presets de avatares com ilustrações SVG embutidas (Data URI).
 * Não dependem de rede externa e combinam com a identidade Blue Hawk.
 */

function makeSvgUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`
}

export type AvatarPreset = {
  id: string
  label: string
  dataUri: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'corvo-noite',
    label: 'Corvo Noturno',
    dataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#0b1147"/>
        <circle cx="50" cy="50" r="42" fill="#161e66" stroke="#2438e8" stroke-width="3"/>
        <path d="M50 20 L68 44 L58 48 L72 65 L48 58 L50 82 L34 56 L44 52 L30 38 Z" fill="#7e92ff"/>
        <circle cx="52" cy="35" r="4" fill="#ffb000"/>
        <path d="M68 44 L82 48 L68 54 Z" fill="#ffb000"/>
      </svg>
    `),
  },
  {
    id: 'corvo-ouro',
    label: 'Corvo Dourado',
    dataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#ffb000"/>
        <circle cx="50" cy="50" r="42" fill="#0b1147" stroke="#ffc53d" stroke-width="3"/>
        <path d="M50 20 L68 44 L58 48 L72 65 L48 58 L50 82 L34 56 L44 52 L30 38 Z" fill="#ffb000"/>
        <circle cx="52" cy="35" r="4" fill="#f3f4fc"/>
        <path d="M68 44 L82 48 L68 54 Z" fill="#f3f4fc"/>
      </svg>
    `),
  },
  {
    id: 'dado-d20',
    label: 'Dado D20 Místico',
    dataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#161e66"/>
        <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill="#2438e8" stroke="#7e92ff" stroke-width="2.5"/>
        <polygon points="50,15 50,85 18,32" fill="none" stroke="#7e92ff" stroke-width="2"/>
        <polygon points="50,15 50,85 82,32" fill="none" stroke="#7e92ff" stroke-width="2"/>
        <polygon points="50,42 82,68 18,68" fill="#0b1147" stroke="#ffb000" stroke-width="2"/>
        <text x="50" y="63" font-family="'Hanken Grotesk', sans-serif" font-weight="900" font-size="18" fill="#ffb000" text-anchor="middle">20</text>
      </svg>
    `),
  },
  {
    id: 'meeple-guerreiro',
    label: 'Meeple Aventureiro',
    dataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#0b1147"/>
        <circle cx="50" cy="50" r="44" fill="#161e66"/>
        <path d="M50 22 C55 22 59 26 59 31 C59 34 57 37 54 39 C61 41 68 46 72 52 C74 55 71 58 67 58 C63 58 60 54 58 52 L58 67 L68 82 C69 84 67 86 64 86 C61 86 58 84 56 81 L50 71 L44 81 C42 84 39 86 36 86 C33 86 31 84 32 82 L42 67 L42 52 C40 54 37 58 33 58 C29 58 26 55 28 52 C32 46 39 41 46 39 C43 37 41 34 41 31 C41 26 45 22 50 22 Z" fill="#ffb000"/>
      </svg>
    `),
  },
  {
    id: 'rei-estrategista',
    label: 'Rei Estrategista',
    dataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#161e66"/>
        <circle cx="50" cy="50" r="42" fill="#0b1147" stroke="#2438e8" stroke-width="2"/>
        <path d="M47 16 H53 V22 H59 V26 H53 V30 H47 V26 H41 V22 H47 Z" fill="#ffb000"/>
        <path d="M36 34 Q50 28 64 34 L68 48 Q50 44 32 48 Z" fill="#7e92ff"/>
        <path d="M35 52 L38 72 H62 L65 52 Q50 56 35 52 Z" fill="#7e92ff"/>
        <path d="M28 76 L32 84 H68 L72 76 Z" fill="#ffb000"/>
      </svg>
    `),
  },
  {
    id: 'guardiao-escudo',
    label: 'Guardião dos Jogos',
    dataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#0b1147"/>
        <path d="M50 16 L78 26 V52 C78 70 50 86 50 86 C50 86 22 70 22 52 V26 Z" fill="#2438e8" stroke="#ffb000" stroke-width="3"/>
        <path d="M50 20 V82 C50 82 74 68 74 52 V28 Z" fill="#161e66"/>
        <circle cx="50" cy="48" r="14" fill="#ffb000"/>
        <polygon points="50,38 53,44 60,45 55,50 56,57 50,53 44,57 45,50 40,45 47,44" fill="#0b1147"/>
      </svg>
    `),
  },
]
