import './Brand.css'

/**
 * Corvo do Blue Hawk. As cores vêm das variáveis --rv, --hi, --eye e --pu,
 * definidas pelas classes .m-* em Brand.css.
 *
 * RavenSymbols deve ser renderizado uma vez na página (o AppLayout faz isso):
 * os outros corvos apontam para o símbolo #corvo.
 */
export function RavenSymbols() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="corvo" viewBox="0 0 400 420">
        <path
          fill="var(--rv)"
          d="M236 84C284 80 344 100 378 150C384 160 384 170 380 180C366 166 344 158 320 156L256 150L258 156L328 165C338 167 344 172 344 180C320 198 290 206 264 200L284 240L254 224L268 278L236 258L248 316L214 292L222 352L186 324L186 388L150 344L138 410L112 352L84 388L78 324L40 344C56 270 56 190 92 140C124 96 180 88 236 84Z"
        />
        <path fill="var(--hi)" d="M262 100C298 100 332 114 356 142C328 124 298 115 262 114Z" />
        <path fill="var(--eye)" d="M186 108L244 128C240 146 212 150 198 136C190 128 186 118 186 108Z" />
        <circle fill="var(--pu)" cx="219" cy="128" r="8" />
        <path fill="var(--hi)" d="M190 164C204 182 222 190 244 190C232 200 214 204 200 200C192 190 188 176 190 164Z" />
        <path fill="var(--hi)" d="M154 146C160 196 178 242 214 280C170 256 142 206 138 152Z" />
        <path fill="var(--hi)" d="M116 160C118 220 136 276 176 320C130 290 102 226 100 170Z" />
        <path fill="var(--hi)" d="M80 196C78 244 90 296 120 340C88 310 66 256 66 214Z" />
      </symbol>
    </svg>
  )
}

type RavenProps = {
  /** Variante de cor da marca, conforme o fundo onde ela aparece */
  variant: 'ultra' | 'noite' | 'acaf'
  className?: string
  /** Sem rótulo, o corvo é decorativo e fica escondido de leitores de tela */
  label?: string
}

export function Raven({ variant, className, label }: RavenProps) {
  return (
    <svg
      className={`m m-${variant}${className ? ` ${className}` : ''}`}
      viewBox="0 0 400 420"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <use href="#corvo" />
    </svg>
  )
}
