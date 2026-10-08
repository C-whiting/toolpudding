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
  { path: '/image-resizer', title: 'Image Resizer', pageTitle: 'Free Image Resizer – Resize JPG, PNG & WebP | ToolPudding', description: 'Resize images online by pixels. Change JPG, PNG, or WebP dimensions, lock the aspect ratio, and adjust JPG/WebP quality. Images stay on your device.' },
  { path: '/name-generator', title: 'Name Generator', pageTitle: 'Free Name Generator – Website, Business, App & Project Ideas | ToolPudding', description: 'Generate website, business, app, and project name ideas. Choose a vibe and style, add keywords, and save favorites in your browser. No account needed.' },
  { path: '/spin-the-wheel', title: 'Spin the Wheel', pageTitle: 'Spin the Wheel – Free Random Wheel & Choice Picker | ToolPudding', description: 'Spin a random wheel to pick names, giveaway winners, classroom activities, or dinner. Add your choices and remove winners for drawings without replacement.' },
]
