/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_PWA_PROMPT_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
