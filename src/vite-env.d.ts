/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBGPU_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
