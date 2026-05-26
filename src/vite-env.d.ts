/// <reference types="vite/client" />

// CSS module declarations
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Font source CSS declarations
declare module '@fontsource/ibm-plex-mono/400.css'
declare module '@fontsource/ibm-plex-mono/600.css'
declare module '@fontsource/ibm-plex-mono/700.css'
