import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('UI components compliance scan', () => {
  const uiDir = path.resolve(process.cwd(), 'src/components/ui')

  it('should only scan existing UI components and verify strict style compliance', () => {
    expect(fs.existsSync(uiDir)).toBe(true)
    const files = fs.readdirSync(uiDir).filter((f) => f.endsWith('.tsx'))
    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      const filePath = path.join(uiDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')

      // 1. No lucide-react imports
      expect(content, `${file} should not import lucide-react`).not.toContain('lucide-react')

      // 2. No shadow- classes
      expect(content, `${file} should not contain shadow- classes`).not.toContain('shadow-')

      // 3. No backdrop-blur or backdrop-filter
      expect(content, `${file} should not contain backdrop-blur`).not.toContain('backdrop-blur')
      expect(content, `${file} should not contain backdrop-filter`).not.toContain('backdrop-filter')

      // 4. No rounded classes except rounded-none
      const forbiddenRoundedRegex = /\b(?:\w+:)*rounded(?!-none\b)(?:-[a-zA-Z0-9-[\]]+)?\b/g
      const matches = content.match(forbiddenRoundedRegex)
      expect(matches, `${file} contains forbidden rounded classes: ${matches?.join(', ')}`).toBeNull()
    }
  })
})
