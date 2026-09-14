/**
 * Captures des sites clients, affichées dans les cartes projets.
 *
 * Les boutiques Shopify interdisent l'affichage dans une iframe (`X-Frame-Options: DENY`) : on
 * prend donc une capture de chaque site, en bureau et en mobile, enregistrée en WebP dans
 * `public/previews/`. À relancer quand un site change : `npm run screenshots`.
 *
 * Utilise le Chrome installé sur la machine (`playwright-core`, aucun navigateur téléchargé).
 * Autre navigateur : `CHROME_PATH=/chemin/vers/chrome npm run screenshots`.
 *
 * Filtrer un site : `npm run screenshots -- santibe`.
 */
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/previews')

/**
 * `videoTime` : le hero est une vidéo, qui serait capturée à un instant quelconque (souvent un gros
 * plan flou). On la met en pause sur une image choisie, en secondes.
 */
const SITES = [
  { id: 'mudaparis', url: 'https://mudaparis.com', videoTime: 19.4 },
  { id: 'amadal', url: 'https://amadal.ma' },
  { id: 'santibe', url: 'https://santibe.fr' },
  { id: 'soliferme', url: 'https://soliferme.fr' },
  { id: 'soraali', url: 'https://soraali.com' },
]

/**
 * `viewport` : fenêtre du navigateur. `width` : largeur de l'image enregistrée — la capture bureau
 * est réduite, elle n'est jamais affichée à plus de ~600 px de large.
 */
const FORMATS = {
  desktop: { viewport: { width: 1440, height: 900 }, scale: 1, width: 1200, mobile: false },
  mobile: { viewport: { width: 390, height: 844 }, scale: 2, width: 390, mobile: true },
}

/**
 * Bandeaux cookies, pop-ups newsletter et widgets de chat : masqués plutôt que cliqués. Cliquer
 * « Accepter » enregistrerait un consentement et chargerait les traceurs ; on veut juste la page.
 */
const HIDE_OVERLAYS = `
  #shopify-pc__banner, #shopify-privacy-banner, .shopify-pc__banner__dialog,
  .cc-window, .cky-consent-container, #onetrust-consent-sdk, #axeptio_overlay, #tarteaucitronRoot,
  #cmplz-cookiebanner-container, .cmplz-cookiebanner, #didomi-host, #CybotCookiebotDialog,
  [id*="cookie" i][class*="banner" i], [class*="cookie-banner" i], [class*="cookie-consent" i],
  .klaviyo-form, [class*="needsclick" i][role="dialog"], [class*="newsletter-popup" i],
  [class*="popup" i][role="dialog"], [aria-modal="true"],
  #chat-button, #shopify-chat, inbox-online-store-chat, [id*="tidio" i], [class*="crisp" i],
  iframe[title*="chat" i] { display: none !important; }
  html, body { overflow: auto !important; }
`

/**
 * Widgets flottants (chat, WhatsApp, onglet « Avis ») : chaque fournisseur a ses propres
 * sélecteurs, on les repère plutôt à leur forme — un élément fixe, petit, collé à un bord.
 * Les en-têtes fixes, larges, ne sont pas concernés.
 */
function hideFloatingWidgets() {
  const width = window.innerWidth
  const height = window.innerHeight

  for (const element of document.querySelectorAll('body *')) {
    const style = getComputedStyle(element)
    if (style.position !== 'fixed' && style.position !== 'sticky') continue

    const rect = element.getBoundingClientRect()
    if (!rect.width || !rect.height) continue

    const small = rect.width < width * 0.6 && rect.height < height * 0.5
    const nearBottom = rect.bottom > height - 220
    const nearSide = rect.left < 12 || rect.right > width - 12
    if (small && (nearBottom || nearSide)) element.style.setProperty('display', 'none', 'important')
  }
}

const filter = process.argv[2]
const sites = filter ? SITES.filter((site) => site.id.includes(filter)) : SITES

async function launch() {
  const executablePath = process.env.CHROME_PATH
  return executablePath
    ? chromium.launch({ executablePath })
    : chromium.launch({ channel: 'chrome' })
}

/** JPEG → WebP redimensionné, dans le navigateur lui-même : pas de dépendance d'image côté Node. */
async function toWebp(converter, jpeg, width) {
  const dataUrl = await converter.evaluate(
    async ({ src, width }) => {
      const image = new Image()
      image.src = src
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = Math.round((image.height * width) / image.width)
      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/webp', 0.8)
    },
    { src: `data:image/jpeg;base64,${jpeg.toString('base64')}`, width },
  )
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

async function capture(browser, converter, site, name, format) {
  const context = await browser.newContext({
    viewport: format.viewport,
    deviceScaleFactor: format.scale,
    isMobile: format.mobile,
    hasTouch: format.mobile,
    locale: 'fr-FR',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  try {
    await page.goto(site.url, { waitUntil: 'load', timeout: 60_000 })
    await page.addStyleTag({ content: HIDE_OVERLAYS })

    // Défilement jusqu'en bas puis retour : déclenche les images en chargement différé et les
    // animations d'apparition, sinon le haut de page peut rester vide.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo(0, y)
        await new Promise((done) => setTimeout(done, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})

    if (site.videoTime !== undefined) {
      await page.evaluate(async (time) => {
        const videos = [...document.querySelectorAll('video')]
        await Promise.all(
          videos.map(
            (video) =>
              new Promise((done) => {
                video.pause()
                video.addEventListener('seeked', done, { once: true })
                // La version mobile peut servir une vidéo plus courte : on reste dans sa durée.
                video.currentTime = Math.min(time, (video.duration || time) - 0.1)
                setTimeout(done, 5000)
              }),
          ),
        )
      }, site.videoTime)
    }
    await page.keyboard.press('Escape')
    await page.addStyleTag({ content: HIDE_OVERLAYS })
    await page.waitForTimeout(1500)
    // En dernier : certains widgets de chat ne s'injectent qu'après quelques secondes.
    await page.evaluate(hideFloatingWidgets)

    const jpeg = await page.screenshot({ type: 'jpeg', quality: 92 })
    const webp = await toWebp(converter, jpeg, format.width)
    const file = resolve(outDir, `${site.id}-${name}.webp`)
    await writeFile(file, webp)
    console.log(`✓ ${site.id} ${name} — ${(webp.length / 1024).toFixed(0)} Ko`)
  } catch (error) {
    console.error(`✗ ${site.id} ${name} — ${error.message.split('\n')[0]}`)
    process.exitCode = 1
  } finally {
    await context.close()
  }
}

await mkdir(outDir, { recursive: true })
const browser = await launch()
const converter = await browser.newPage()

for (const site of sites) {
  for (const [name, format] of Object.entries(FORMATS)) {
    await capture(browser, converter, site, name, format)
  }
}

await browser.close()
