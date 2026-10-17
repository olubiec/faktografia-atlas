import { defineConfig } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  preview: {
    headers: getVercelHeaders(),
  },
})
