/**
 * Regenerates every app icon from src-tauri/icons/icon-source.svg.
 *
 *   node scripts/build-icons.mjs
 *
 * Rasterises the SVG to a 1024x1024 PNG with the Edge/Chrome that Playwright
 * drives, then hands it to `tauri icon`, which writes the .ico, .icns, the
 * Windows Store logos and the PNG sizes. Playwright is a devDependency purely
 * for this and for the UI smoke tests.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = join(root, 'src-tauri/icons/icon-source.svg')
const pngPath = join(root, 'src-tauri/icons/icon.png')
const tmpHtml = join(root, 'src-tauri/icons/.render.html')

const svg = readFileSync(svgPath, 'utf8')
writeFileSync(
  tmpHtml,
  `<!doctype html><meta charset="utf-8">
   <style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>
   ${svg}`,
)

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({
  viewport: { width: 1024, height: 1024 },
  deviceScaleFactor: 1,
})
await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'load' })
await page.screenshot({ path: pngPath, omitBackground: true })
await browser.close()
unlinkSync(tmpHtml)
console.log(`rendered ${pngPath} (1024x1024)`)

// Relative path on purpose: with shell:true an absolute path containing a
// space (…/Hobby Tracker/…) gets split into two arguments.
execFileSync('npx', ['tauri', 'icon', 'src-tauri/icons/icon.png'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})
console.log('icon set regenerated')

// The Windows icon is embedded as a PE resource at compile time. Cargo doesn't
// treat icon.ico as an input, so without this the next build silently ships the
// previous icon — which is exactly what happened the first time round.
for (const profile of ['--release', '']) {
  try {
    execFileSync('cargo', ['clean', '-p', 'app', profile].filter(Boolean), {
      cwd: join(root, 'src-tauri'),
      stdio: 'ignore',
    })
  } catch {
    // Nothing built for that profile yet; nothing to invalidate.
  }
}
console.log('invalidated the app crate so the next build re-embeds the icon')
