/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API. Sem ela, o app usa /api (proxy do Vite em dev). */
  readonly VITE_API_URL?: string}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
