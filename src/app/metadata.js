export const productionOrigin = 'https://toolpudding.com'

export function canonicalFor(pathname) {
  return pathname === '/' || pathname === '/privacy' || toolMetadata.some(tool => tool.path === pathname)
    ? `${productionOrigin}${pathname}`
    : null
}

export const homeMetadata = {
  title: 'ToolPudding | Free little tools for everyday annoyances',
  description: 'Free little tools for everyday annoyances. Resize images, generate names, and spin the wheel in your browser. No account required.',
}
export const privacyMetadata = {
  title: 'Privacy | ToolPudding',
  description: 'How ToolPudding processes images and tool inputs locally, saves favorites in your browser, and handles external links.',
}
export const notFoundMetadata = {
  title: 'Page not found | ToolPudding',
  description: 'This page could not be found. Return to the ToolPudding directory to find a useful little tool.',
}
export const toolMetadata = [
  { path: '/image-resizer', title: 'Image Resizer', pageTitle: 'Image Resizer | ToolPudding', description: 'Resize JPG, PNG, and WebP images privately in your browser. Preview, adjust quality, and download. No uploads.' },
  { path: '/name-generator', title: 'Name Generator', pageTitle: 'Name Generator | ToolPudding', description: 'Find a name for your website, app, business, or project. Explore curated suggestions by vibe and style, and save your favorites locally.' },
  { path: '/spin-the-wheel', title: 'Spin the Wheel', pageTitle: 'Spin the Wheel - Random Choice Picker | ToolPudding', description: 'Spin the wheel to randomly pick a name, choice, winner, or anything else. Free random wheel picker with no account required.' },
]
