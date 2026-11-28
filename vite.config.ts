import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import fs from "fs"

function getVercelHeaders(): Record<string, string> {
  try {
    const vercelJsonPath = path.resolve(import.meta.dirname, './vercel.json')
    const content = fs.readFileSync(vercelJsonPath, 'utf-8')
    const data = JSON.parse(content)
    const headersObj: Record<string, string> = {}
    if (Array.isArray(data.headers)) {
      for (const entry of data.headers) {
        if (Array.isArray(entry.headers)) {
          for (const header of entry.headers) {
            if (header.key && header.value) {
              headersObj[header.key] = header.value
            }
          }
        }
      }
    }
    return headersObj
  } catch {
    return {}
  }
}

// Podgląd jak Vercel: `/powiat/x` serwuje `dist/powiat/x/index.html` (statyczne strony miejsc, S07).
function directoryIndex(): Plugin {
  return {
    name: 'faktografia-directory-index',
    configurePreviewServer(server) {
      const outDir = path.resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, _res, next) => {
        const [pathname, query] = (req.url ?? '').split('?', 2)
        if (pathname && !pathname.endsWith('/') && !path.extname(pathname)) {
          let file = ''
          try {
            file = path.join(outDir, decodeURIComponent(pathname), 'index.html')
          } catch {
            return next()
          }
          if (file.startsWith(outDir + path.sep) && fs.existsSync(file)) {
            req.url = `${pathname}/index.html${query ? `?${query}` : ''}`
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), directoryIndex()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Mapy źródeł (Lighthouse: „Brakuje map źródeł”) – kod strony i tak jest publiczny w repozytorium.
    sourcemap: true,
  },
  preview: {
    headers: getVercelHeaders(),
  },
})
