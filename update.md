# Plan de refonte — Audit SEO / AI SEO / CRO / Accessibilité

> **Point d'avancement — 8 septembre 2026** (domaine acheté : `devay.dev`, hébergement Vercel)
>
> **Fait :**
> - **2.1 / 3.1 Pré-rendu statique** — `npm run build` rend l'app en HTML (script `scripts/prerender.mjs`,
>   entrées `src/entry-client.js` / `src/entry-server.js`). ~1 000 mots servis aux robots au lieu d'une div vide.
> - **2.2** `base: '/'`, `vercel.json` (redirections `/portfolio/*`, cache, en-têtes de sécurité). Reste à faire : les DNS.
> - **2.3 / 2.4 / 2.5 / 2.6 / 2.9 / 3.4** — `robots.txt` (bots IA autorisés explicitement), `sitemap.xml`, `llms.txt`,
>   `canonical`, JSON-LD `Person` + `ProfessionalService` + `WebSite` avec `sameAs`, Open Graph absolu
>   (`public/og-image.jpg`, carte 1200×630 générée), `<noscript>`, `meta keywords` supprimée.
> - **2.8** `<html lang>` suit la langue affichée.
> - **`<h1>`** — « Développeur Shopify freelance » ; la salutation passe en ligne secondaire. Ancre `#hero` ajoutée, `alt` de la photo réécrit.
> - **4. CRO** — CTA principal « Discutons de votre projet », pourcentages de compétences remplacés par
>   trois groupes d'usage, formulaire (type de projet, budget, RGPD, honeypot, `aria-live`, `<label for>`,
>   état d'envoi, promesse de réponse sous 24 h), CTA du bandeau vers `#contact`, bouton flottant mobile
>   = contact, marque « DevAy » remplacée par « Hudayfa Koujdal ».
> - **5.** « Le déclic » et la phrase creuse sur l'accessibilité réécrites en contenu factuel et chiffré.
> - **6.** Palette recalculée (tous les contrastes ≥ 4,5:1, plus aucune opacité sur du texte),
>   GSAP retiré au profit de CSS + IntersectionObserver (contenu visible sans JS, `prefers-reduced-motion`),
>   menu mobile en `<button>` avec `aria-expanded`, lien d'évitement, `title` sur les iframes, `rel="noopener noreferrer"`,
>   YouTube en `nocookie` + `loading="lazy"`, hero en WebP (872 Ko → 80 Ko) avec `width`/`height`/`fetchpriority`,
>   bundle JS 332 Ko → 191 Ko (gzip 125 → 67 Ko).
> - **7.** Les 7 bugs listés sont corrigés. Bonus : `@` non échappé dans les messages vue-i18n (l'adresse e-mail
>   dans un message cassait le rendu de toute la section contact).
>
> **Reste à faire :** DNS `devay.dev` → Vercel · témoignages et logos clients · captures des boutiques ·
> section Services avec fourchettes de prix · mentions légales · FAQ + `FAQPage` · pages dédiées ·
> version EN sur `/en/` avec `hreflang` (le pré-rendu ne couvre que le français) · projets scolaires à réduire.


> Audit du portfolio `hdif004.github.io/portfolio/` — 29 août 2026
> Stack : Vue 3 + Vite + Tailwind 4 + vue-i18n, SPA mono-page, déployée sur GitHub Pages (branche `gh-pages`, `base: '/portfolio/'`).

---

## Sommaire

1. [Contexte technique](#1-contexte-technique)
2. [SEO technique](#2-seo-technique)
3. [AI SEO (GEO / AEO)](#3-ai-seo-geo--aeo)
4. [CRO](#4-cro)
5. [Qualité éditoriale / « AI slop »](#5-qualité-éditoriale--ai-slop)
6. [Accessibilité & performance](#6-accessibilité--performance)
7. [Bugs concrets](#7-bugs-concrets)
8. [Regard client / regard recruteur](#8-regard-client--regard-recruteur)
9. [Plan d'action priorisé](#9-plan-daction-priorisé)

---

## 1. Contexte technique

Trois faits structurent tout le reste de l'audit :

- **Rendu 100 % côté client.** `dist/index.html` ne contient que `<div id="app"></div>`.
- **Hébergement en sous-dossier** : `hdif004.github.io/portfolio/` (`vite.config.js:11` → `base: '/portfolio/'`).
- **Une seule page**, pas de router, contenu piloté par i18n (FR/EN sur la même URL).

---

## 2. SEO technique

### 🔴 Critique

- [ ] **2.1 — Le HTML servi est vide.** Bing, DuckDuckGo, LinkedIn, Slack, WhatsApp et **tous les crawlers d'IA** n'exécutent pas le JS. Un portfolio qui vend du SEO et sert une page blanche aux robots, c'est le pire signal possible.
      → Pré-rendu statique via `vite-ssg` ou `vite-plugin-prerender` (~30 min pour une SPA d'une page).
- [ ] **2.2 — Domaine.** Sous-domaine mutualisé + sous-répertoire = autorité quasi nulle, zéro crédibilité commerciale, pas d'e-mail pro cohérent.
      → Domaine perso (~10 €/an) + `CNAME` dans `public/` + `base: '/'`.
- [ ] **2.3 — Aucun fichier de crawl.** Pas de `robots.txt`, pas de `sitemap.xml` dans `public/`.
- [ ] **2.4 — Pas de `<link rel="canonical">`.** Avec un futur domaine custom, deux URLs indexables pour le même contenu.
- [ ] **2.5 — Aucune donnée structurée.** Zéro JSON-LD. Levier le plus rentable pour un freelance : `Person` + `ProfessionalService` + `WebSite`, avec `knowsAbout`, `sameAs` (GitHub, LinkedIn), `areaServed`, `email`.

### 🟠 Important

- [ ] **2.6 — Balises sociales cassées.** `index.html:17` : `og:image` reste **relative** après build (`/portfolio/assets/hero-*.png`). Les réseaux exigent une URL **absolue** → aperçu sans image. Manquent aussi `og:url`, `og:site_name`, `twitter:image:alt`.
- [ ] **2.7 — Bilingue sans i18n SEO.** Les deux langues vivent sur la même URL, changée en JS → la version anglaise ne sera **jamais** indexée. Il faut `/fr/` et `/en/` + `hreflang` + `x-default`, ou assumer le FR seul.
- [ ] **2.8 — `<html lang="fr">` ne change jamais** au switch de langue (`App.vue`, `toggleLang`). Faux signal pour les crawlers et les lecteurs d'écran.
- [ ] **2.9 — Supprimer `meta keywords`** (`index.html:11`) : ignorée depuis 2009, lue comme un marqueur de site amateur.
- [ ] **2.10 — Une seule page = un seul mot-clé.** Tu ne peux ranker que sur « Hudayfa Koujdal ». Les requêtes commerciales (« développeur Shopify freelance », « migration WooCommerce Shopify », « intégrateur thème Shopify Horizon ») demandent des pages dédiées.

### 🟡 On-page

- [ ] `<h1>` unique ✅ mais le mot-clé est noyé dans une salutation (« Salut, moi c'est Hudayfa et je suis… »).
- [ ] `HeroSection.vue` n'a ni `id` ni `<h2>` → la section « Accueil » n'existe pas comme ancre (`App.vue:90` : `href="#"` fonctionne par accident).
- [ ] Aucun lien interne contextuel.
- [ ] `alt` de la photo = `"Hudayfa photo"` (`fr.json`, `hero.imageAlt`) → « Hudayfa Koujdal, développeur Shopify freelance ».

---

## 3. AI SEO (GEO / AEO)

**État actuel : invisible pour ChatGPT, Perplexity, Claude et les AI Overviews.**

- [ ] **3.1 — Blocage total : pas de HTML statique.** GPTBot, ClaudeBot, PerplexityBot, Google-Extended lisent du HTML brut sans JS et reçoivent une page vide. **Tant que le pré-rendu (2.1) n'est pas fait, tout le reste de cette section est inutile.**
- [ ] **3.2 — Contenu non structuré pour être cité.** Les LLM extraient des blocs question → réponse factuelle, courts et autonomes. Manquent :
  - une **FAQ** + schema `FAQPage` : « Combien coûte une migration WooCommerce vers Shopify ? », « Combien de temps prend une refonte de thème Shopify ? », « Que devient mon SEO après une migration ? »
  - une **phrase de définition canonique** en haut de page : *« Hudayfa Koujdal est un développeur Shopify freelance basé à [ville], spécialisé en migrations WooCommerce → Shopify et en personnalisation de thèmes Horizon. »* C'est le format que les modèles recopient.
  - des **chiffres réutilisables**. Il n'y en a qu'un (Amadal : « < 1 s, 286 Ko, CLS 0 ») et il est excellent → en produire un par projet.
- [ ] **3.3 — Zéro entité vérifiable ailleurs.** Les LLM recoupent site + LinkedIn + GitHub + annuaires + mentions tierces. Pas de `sameAs` en JSON-LD, README GitHub non aligné avec le site, aucune mention externe. Sans corroboration, pas de citation.
- [ ] **3.4 — Ajouter `llms.txt`** et expliciter les bots IA dans `robots.txt`.

---

## 4. CRO

### 🔴 Le CTA principal est le mauvais

`HeroSection.vue:45-60` : le bouton **plein / primaire** = « Mon GitHub » (lien sortant), le secondaire = « Mon CV ». **Aucun bouton « Me contacter » dans le hero** → le trafic le plus chaud quitte le site.

- [ ] Primaire : « Discutons de votre projet » (ancre `#contact`)
- [ ] Secondaire : « Voir mes réalisations »
- [ ] GitHub / CV → liens texte discrets

### 🔴 Les barres de compétences en pourcentage

`SkillsSection.vue` : React 55 %, Python 55 %, Figma 55 %, Symfony 60 %, Docker 60 %.

Auto-sabotage : chiffres invérifiables, purement déclaratifs, lus uniquement comme des aveux de faiblesse. C'est aussi le cliché n°1 du portfolio junior.

- [ ] **Supprimer les pourcentages.** Garder des groupes (« Au quotidien » / « Maîtrisé » / « Notions ») ou une simple liste de tags.

### 🟠 Autres points

- [ ] **Zéro preuve sociale.** Aucun témoignage, aucun logo, aucun avis, un seul chiffre de résultat — alors qu'il y a **6 clients réels nommés** (Mudaparis, Amadal, Sàntibé, Soliferme, Soraali, LXIR). Actif majeur totalement inexploité.
- [ ] **Pas de capture d'écran des projets.** Deux `<iframe>` YouTube pour des **projets scolaires**, et **aucun visuel** pour les 5 missions freelance payées : hiérarchie inversée.
- [ ] **Pas d'offre lisible.** Aucune section « Services » : quoi, pour qui, en combien de temps, à partir de quel budget, avec quel process. Même un « Migration Shopify — à partir de X € — 2 à 3 semaines » filtre les mauvais leads et rassure les bons.
- [ ] **Formulaire (`ContactSection.vue`)** :
  - [ ] pas de champ « budget » / « type de projet » → leads non qualifiés
  - [ ] pas d'état de chargement lisible, pas d'`aria-live` sur les messages de statut
  - [ ] **aucune mention RGPD** (obligatoire, et rassurante)
  - [ ] **aucune protection anti-spam** (ni honeypot ni reCAPTCHA Formspree) sur un endpoint public
  - [ ] pas de promesse de délai (« Je réponds sous 24 h »)
  - [ ] `<label>` non liés à un `id` → clic sans effet
- [ ] **Marque « DevAy »** (`fr.json:2`) : n'apparaît nulle part ailleurs, n'est expliquée nulle part, concurrence « Hudayfa Koujdal » — le seul nom capitalisable. → supprimer.
- [ ] **`SoftBannerSection.vue`** : CTA vers `#footer` alors que `#contact` existe juste après.
- [ ] **Bouton flottant mobile** = sélecteur de langue : la position la plus précieuse de l'écran mobile occupée par la fonction la moins convertissante. → « Me contacter » / WhatsApp.
- [ ] **Pas de mentions légales** (obligation légale pour une activité indépendante en France + signal de sérieux).

---

## 5. Qualité éditoriale / « AI slop »

**Le cœur du site n'est pas de l'IA slop.** Les missions freelance sont précises, datées, nominatives, avec des livrables concrets — nettement au-dessus de la moyenne.

Ce qui relève quand même du remplissage :

- [ ] **`about.steps[2]`** — « J'accorde une grande importance à l'accessibilité, à la rapidité de chargement et à des interfaces simples, utiles et orientées utilisateur. » Phrase que tout le monde écrit, invérifiable, et **contredite par le site lui-même** (§6). → supprimer ou prouver.
- [ ] **`about.steps[0]` « Le déclic »** — « Curieux de nature, j'ai découvert le monde du code… » : paragraphe générique de reconversion, zéro information.
- [ ] **Projets scolaires (Flag, Gourmet_Atlas)** — franchement du remplissage : *« Flag est un jeu passionnant… plus votre série de victoires s'allonge »*, ton commercial ampoulé à la deuxième personne pour un exercice de L2. Ils déteignent sur les vraies missions juste au-dessus. → couper, ou réduire à deux lignes dans un onglet « Perso » discret.
- [ ] **Redondance mécanique** : « Mission freelance (date) pour X » cinq fois de suite ; meta description identique 3 fois dans `index.html`.

**Verdict : ~15 % de slop**, concentré sur le « à propos » et les projets étudiants.

---

## 6. Accessibilité & performance

> Point critique **vu le positionnement** : le site vend de la performance et de l'accessibilité. Un prospect technique ouvrira Lighthouse dessus.

### 🔴 Contrastes non conformes WCAG AA (ratios calculés)

| Usage | Couleurs | Ratio | Requis | Verdict |
|---|---|---|---|---|
| `text-primary` sur petit texte (tags technos, « Voir le site → », liens contact) | `#588157` / `#dad7cd` | **3,10:1** | 4,5:1 | ❌ |
| `text-text/80` (description du hero) | ≈ `#5a735c` | **3,61:1** | 4,5:1 | ❌ |
| `text-text/70` (descriptions projets, sous-titre contact) | ≈ `#6a806a` | **2,99:1** | 4,5:1 | ❌ |
| `text-text/50` (pourcentages compétences) | ≈ `#8a9886` | **2,11:1** | 4,5:1 | ❌❌ |
| Texte courant `text-text` | `#3a5a40` / `#dad7cd` | 5,37:1 | 4,5:1 | ✅ |

Les opacités Tailwind (`/70`, `/80`) sont le piège classique : elles cassent systématiquement le contraste.

- [ ] Corriger tous les contrastes en supprimant les opacités sur le texte (définir de vraies couleurs secondaires dans `main.css`).

### 🔴 Le contenu dépend du JS pour être visible

`App.vue:52` : `gsap.from(section, { opacity: 0 })` sur **toutes** les sections. Si GSAP échoue ou si ScrollTrigger ne se déclenche pas → **page blanche**. Aucun respect de `prefers-reduced-motion`.

- [ ] Contenu visible par défaut, animation en progressive enhancement
- [ ] Respecter `prefers-reduced-motion`

### 🟠 Autres points d'accessibilité

- [ ] `App.vue:116` : `<Menu @click>` est un **SVG cliquable**, pas un `<button>` → menu mobile inutilisable au clavier, pas d'`aria-expanded`, pas d'`aria-label`, pas de focus visible.
- [ ] `<iframe>` YouTube sans attribut `title`.
- [ ] Barres de compétences sans `role="progressbar"` / `aria-valuenow`.
- [ ] Pas de lien d'évitement (skip to content).
- [ ] `target="_blank"` sans `rel="noopener"` dans `ProjectsSection.vue:150`.

### 🟠 Performance

- [ ] **Hero : PNG de 872 Ko**, sans `width`/`height`, sans `loading`/`fetchpriority`, sans WebP/AVIF, sans `srcset`. C'est le LCP **et** la source de CLS. En WebP dimensionné : ~60 Ko (**-93 %**).
- [ ] **Bundle JS : 332 Ko** non gzippé pour une page vitrine (GSAP + ScrollTrigger + Headless UI + Vue + i18n). GSAP seul pour des fondus qu'une animation CSS + `IntersectionObserver` ferait en 1 Ko.
- [ ] **2 iframes YouTube** chargés dès l'onglet « Tous » : ~600 Ko de tiers + cookies. → façade (image cliquable) + `youtube-nocookie.com` (actuellement : cookies tiers sans consentement).

---

## 7. Bugs concrets

| # | Fichier | Problème |
|---|---|---|
| 1 | `src/i18n.js:6` | **Priorité des opérateurs cassée.** L'expression `getItem('lang') || navigator.language.startsWith('fr') ? 'fr' : 'en'` s'évalue en `(a || b) ? 'fr' : 'en'` → dès qu'une langue est enregistrée, elle vaut **toujours `'fr'`**. Un utilisateur qui choisit l'anglais retombe en français au rechargement. Correctif : `localStorage.getItem('lang') ?? (navigator.language.startsWith('fr') ? 'fr' : 'en')` |
| 2 | `HeroSection.vue:55` | `href="/portfolio/CV.pdf"` en dur → casse au changement de `base` ou de domaine. Utiliser `import.meta.env.BASE_URL`. |
| 3 | `HeroSection.vue:66` | `src="/src/assets/images/hero.png"` : résolu par chance par Vite, fragile → passer par un `import`. |
| 4 | `SoftBannerSection.vue` | CTA vers `#footer` au lieu de `#contact`. |
| 5 | `App.vue:90` / `:127` | `href="#"` pour « Accueil » → ajouter l'ancre `#hero` sur le hero. |
| 6 | `FooterSection.vue` | Seul `footer.role` est traduit ; « All rights reserved » reste en anglais en version FR. |
| 7 | `index.html` | Aucun `<noscript>`. |

---

## 8. Regard client / regard recruteur

### 👤 Client (marque e-commerce cherchant un dev Shopify) — **6/10**

L'URL GitHub fait douter dès la première seconde : pro ou étudiant ? Le hero est clair et le positionnement se comprend en 3 secondes — **très bien joué**. Mais les deux boutons envoient sur GitHub et sur un CV : « candidat », pas « prestataire ».

La section « Mon profil » parle du parcours, pas du problème du client. Les compétences en pourcentage sont inexploitables (« pourquoi me dit-il ce qu'il ne sait pas faire ? »).

**Les projets, en revanche, sont excellents** : migration WooCommerce → Shopify pour Mudaparis, refonte du panier Horizon pour Sàntibé, « < 1 s, 286 Ko, CLS 0 » pour Amadal. Concret, vérifiable, exactement le problème du client — déjà résolu 5 fois. Mais aucune image des boutiques, aucun avis client, et juste après : un jeu de drapeaux d'un projet d'école qui casse net l'élan.

Aucun prix, aucun délai, aucun process, aucun mot sur le SEO post-migration (angoisse n°1 du marchand), aucun témoignage.

> **Il serait contacté sur recommandation. Pas à froid via Google.**

**Les 5 corrections qui changent la décision d'achat :** domaine perso · CTA « Discutons de votre projet » · 2 témoignages + logos clients · captures des boutiques · fourchette de prix / section services.

### 👔 Recruteur (dev web / e-commerce) — **6,5/10**

**Ce qui accroche :** un profil junior 2025 avec **6 clients réels payants en 9 mois**, marques nommées et vérifiables, livrables précis. Très au-dessus du portfolio junior standard (todo-list, clone Netflix). Migrer une boutique WooCommerce → Shopify de bout en bout, avis clients compris, prouve une capacité à travailler dans le réel. Le positionnement Shopify/Liquid est **une niche recherchée** — bon réflexe stratégique là où la plupart se noient dans « React fullstack ».

**Ce qui refroidit :**

1. **Les barres de pourcentage** → « portfolio de tuto YouTube ». Afficher React à 55 % sur un profil front, c'est se disqualifier soi-même sans qu'on ait rien demandé.
2. **Le site ne démontre pas ce qu'il affirme.** Il revendique accessibilité et vitesse ; Lighthouse montre un PNG de 872 Ko, des contrastes sous 3:1, un menu mobile inaccessible au clavier, 332 Ko de JS, une page blanche sans JS. **Le point le plus coûteux** : ce n'est pas un manque de compétence, c'est un manque de relecture critique de son propre travail.
3. **Un dev qui vend du SEO dont le site sert une page vide aux crawlers.** L'ironie reste en tête.
4. Les projets scolaires **soustraient** de la valeur : ils disent « je n'ai pas assez de vrai travail à montrer », ce qui est faux.
5. **Zéro code lisible mis en avant** : pas de README soigné, pas d'extrait de section Liquid propre, pas d'article sur un choix technique. Le lien GitHub existe mais ne guide vers rien.

> **Entretien téléphonique accordé.** Le fond est là ; le portfolio le fait passer pour moins bon qu'il n'est : il communique en junior alors qu'il travaille en prestataire.

---

## 9. Plan d'action priorisé

### Semaine 1 — Débloquer (impact énorme, effort faible)

- [ ] 1. Pré-rendu statique (`vite-ssg`) → débloque SEO **et** AI SEO d'un coup
- [ ] 2. Domaine perso + `CNAME` + `canonical` + `base: '/'`
- [ ] 3. `robots.txt` + `sitemap.xml`
- [ ] 4. `og:image` / `og:url` en absolu, + `og:site_name`
- [ ] 5. JSON-LD `Person` + `ProfessionalService` + `sameAs`
- [ ] 6. Corriger le bug i18n (`i18n.js:6`) et le CTA du banner → `#contact`

### Semaine 2 — Convertir

- [ ] 7. CTA hero = « Discutons de votre projet »
- [ ] 8. **Supprimer les pourcentages** de compétences
- [ ] 9. Demander 2–3 témoignages (Mudaparis / Amadal / Sàntibé) + bande de logos clients
- [ ] 10. Captures d'écran des 5 boutiques ; projets scolaires réduits ou retirés
- [ ] 11. Section « Services » : 3 offres, délais, fourchette de prix
- [ ] 12. Formulaire : champ budget, mention RGPD, honeypot, `aria-live`, labels liés aux `id`

### Semaine 3 — Crédibiliser techniquement

- [ ] 13. Hero en WebP dimensionné + `width`/`height` + `fetchpriority="high"`
- [ ] 14. Remplacer GSAP par CSS + `IntersectionObserver` ; `prefers-reduced-motion` ; contenu visible sans JS
- [ ] 15. Corriger tous les contrastes (supprimer les opacités sur le texte)
- [ ] 16. Menu mobile en `<button>` avec `aria-expanded` ; façade pour les YouTube en `nocookie`
- [ ] 17. Mentions légales

### Ensuite — AI SEO & acquisition

- [ ] 18. FAQ + schema `FAQPage` (5–7 questions commerciales)
- [ ] 19. Pages dédiées : `/migration-woocommerce-shopify`, `/developpeur-shopify-freelance`
- [ ] 20. Article de fond chiffré sur la migration Mudaparis → c'est ce qui se fait citer par les LLM
- [ ] 21. Version EN sur `/en/` avec `hreflang`, ou abandon assumé de l'anglais
