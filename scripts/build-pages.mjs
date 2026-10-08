import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { homeMetadata, privacyMetadata, notFoundMetadata, toolMetadata, canonicalFor } from '../src/app/metadata.js'

// Actual route documents make direct visits work on directory-based static hosts,
// and expose route-specific metadata to crawlers that do not execute JavaScript.
const template = await readFile('dist/index.html', 'utf8')
// Render the same components below their existing navigation and tool intro.
// The client still mounts normally, including device-local saved choices/names.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
let App
try {
  App = (await server.ssrLoadModule('/src/App.jsx')).default
} finally {
  await server.close()
}
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
function documentFor(metadata) {
  const canonical = canonicalFor(metadata.path)
  return template.replace(/<title>.*?<\/title>/, `<title>${escape(metadata.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, canonical ? `<link rel="canonical" href="${escape(canonical)}" />` : '')
    .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*("\s*\/?>)/g, (_, before, after) => before + escape(metadata.description) + after)
    .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*("\s*\/?>)/g, (_, before, after) => before + escape(metadata.title) + after)
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, (_, before, after) => before + escape(canonical || '') + after)
    .replace('<div id="root"></div>', `<div id="root">${renderToStaticMarkup(createElement(App, { initialPath: metadata.path || '/404' }))}</div>`)
}
await writeFile('dist/index.html', documentFor({ ...homeMetadata, path: '/' }))
for (const metadata of [...toolMetadata.map(tool => ({ ...tool, title: tool.pageTitle })), { ...privacyMetadata, path: '/privacy' }]) {
  const directory = `dist${metadata.path}`
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/index.html`, documentFor(metadata))
}
await writeFile('dist/404.html', documentFor(notFoundMetadata))
