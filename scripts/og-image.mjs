/**
 * Image de partage (Open Graph / Twitter) : `public/og-image.jpg`, 1200 × 630.
 *
 * Générée à partir de `scripts/og-image.html`. À relancer quand le texte change :
 * `npm run og-image`. Le texte doit rester aligné avec ce qui est affiché sur le site.
 *
 * Utilise le Chrome installé sur la machine (`playwright-core`, aucun navigateur téléchargé).
 * Autre navigateur : `CHROME_PATH=/chemin/vers/chrome npm run og-image`.
 */
import process from 'node:process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const template = pathToFileURL(resolve(root, 'scripts/og-image.html')).href
const output = resolve(root, 'public/og-image.jpg')

const executablePath = process.env.CHROME_PATH
const browser = executablePath
  ? await chromium.launch({ executablePath })
  : await chromium.launch({ channel: 'chrome' })

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(template)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: output, type: 'jpeg', quality: 90 })
  console.log(`Image enregistrée : ${output}`)
} finally {
  await browser.close()
}
