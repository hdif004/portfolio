/**
 * Pré-rendu statique.
 *
 * Le portfolio est une SPA d'une seule page : sans cette étape, `dist/index.html` ne contient
 * qu'une div vide et tous les robots qui n'exécutent pas JavaScript (Bing, DuckDuckGo, LinkedIn,
 * WhatsApp, GPTBot, ClaudeBot, PerplexityBot…) reçoivent une page blanche.
 *
 * On rend l'application en français — la langue du `canonical` — puis on injecte le HTML dans
 * `dist/index.html`. Le JavaScript client hydrate ensuite ce markup.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const htmlPath = resolve(root, 'dist/index.html')

const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href)
const appHtml = await render('fr')

const html = await readFile(htmlPath, 'utf8')

if (!html.includes('<div id="app"></div>')) {
  throw new Error('Point d’injection introuvable dans dist/index.html')
}

await writeFile(htmlPath, html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`))

console.log(`Pré-rendu injecté : ${(appHtml.length / 1024).toFixed(1)} Ko de HTML statique.`)
