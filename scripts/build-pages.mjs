import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { homeMetadata, privacyMetadata, notFoundMetadata, toolMetadata } from '../src/app/metadata.js'

// Actual route documents make direct visits work on directory-based static hosts,
// and expose route-specific metadata to crawlers that do not execute JavaScript.
const template = await readFile('dist/index.html', 'utf8')
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
function documentFor(metadata) {
  return template.replace(/<title>.*?<\/title>/, `<title>${escape(metadata.title)}</title>`)
    .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*("\s*\/?>)/g, (_, before, after) => before + escape(metadata.description) + after)
    .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*("\s*\/?>)/g, (_, before, after) => before + escape(metadata.title) + after)
}
await writeFile('dist/index.html', documentFor(homeMetadata))
for (const metadata of [...toolMetadata.map(tool => ({ ...tool, title: tool.pageTitle })), { ...privacyMetadata, path: '/privacy' }]) {
  const directory = `dist${metadata.path}`
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/index.html`, documentFor(metadata))
}
await writeFile('dist/404.html', documentFor(notFoundMetadata))
