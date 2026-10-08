import { useEffect } from 'react'
import { Link } from './app/router'
import { usePathname } from './app/usePathname'
import { tools } from './app/tools'
import { homeMetadata, privacyMetadata, notFoundMetadata, canonicalFor } from './app/metadata'
import './App.css'
import ToolGuide from './app/ToolGuide'

function Home() {
  return <>
    <section className="intro home-intro"><h1>ToolPudding</h1><p className="tagline">The proof is in the pudding.</p><p>Free little tools for everyday annoyances. No account required.</p></section>
    <div className="tool-directory">{tools.map(tool => <Link className="tool-card panel" href={tool.path} key={tool.path}><span className="tool-symbol" aria-hidden="true">{tool.symbol}</span><h2>{tool.title}</h2><p>{tool.summary}</p><span className="tool-open">Open tool <span aria-hidden="true">&#8599;</span></span></Link>)}</div>
    <p className="home-note">Made to work right in your browser.</p>
  </>
}

function Privacy() {
  return <section className="privacy-page"><h1>Privacy</h1><p>ToolPudding's tools process your inputs locally in your browser.</p><h2>Your images stay on your device.</h2><p>Image Resizer uses your browser to open, resize, and export images. It does not upload your files to a server.</p><h2>Saved in this browser</h2><p>Name Generator saves favorites and Spin the Wheel saves choices in localStorage on this device. These tools do not send those inputs to us. Clearing site data in your browser removes these saved lists. If storage is blocked, copy anything you want to keep before leaving.</p><h2>Website requests and external links</h2><p>Your browser requests the site files from our hosting provider, which may keep standard access logs such as IP addresses and request times. Domain search links open an external registrar and pass the suggested domain in the URL; that site's privacy policy applies.</p><h2>Analytics and advertising</h2><p>ToolPudding currently includes no analytics or advertising scripts and sets no cookies. We will update this page if that changes.</p><Link href="/">Back to all tools</Link></section>
}

export default function App({ initialPath = '/' }) {
  const pathname = usePathname(initialPath)
  const tool = tools.find(item => item.path === pathname)
  useEffect(() => {
    const metadata = tool ? { title: tool.pageTitle || `${tool.title} | ToolPudding`, description: tool.description } : pathname === '/' ? homeMetadata : pathname === '/privacy' ? privacyMetadata : notFoundMetadata
    document.title = metadata.title
    const canonicalUrl = canonicalFor(pathname)
    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl
    } else canonical?.remove()
    for (const [selector, value] of [['meta[name="description"]', metadata.description], ['meta[property="og:title"]', metadata.title], ['meta[property="og:description"]', metadata.description], ['meta[property="og:url"]', canonicalUrl || ''], ['meta[name="twitter:title"]', metadata.title], ['meta[name="twitter:description"]', metadata.description]]) document.querySelector(selector)?.setAttribute('content', value)
    window.scrollTo(0, 0)
  }, [tool, pathname])
  const Tool = tool?.component
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><Link className="site-name" href="/">ToolPudding<span className="name-dot" /></Link><nav className="tool-nav" aria-label="Main navigation"><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>All tools</Link>{tools.map(item => <Link href={item.path} key={item.path} aria-current={pathname === item.path ? 'page' : undefined}>{item.title}</Link>)}</nav></header>
    <main id="main" tabIndex="-1">{Tool ? <><Tool /><ToolGuide path={pathname} /></> : pathname === '/' ? <Home /> : pathname === '/privacy' ? <Privacy /> : <section className="intro"><h1>Well, this isn't pudding.</h1><p>We couldn't find that page.</p><Link className="primary" href="/">Back to all tools</Link></section>}</main>
    <footer><p>ToolPudding — The proof is in the pudding.</p><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/privacy" aria-current={pathname === '/privacy' ? 'page' : undefined}>Privacy</Link></nav></footer>
  </div>
}
