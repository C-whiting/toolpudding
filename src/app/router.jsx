export function Link({ href, children, onClick, ...props }) {
  return <a href={href} {...props} onClick={(event) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target || props.download) return
    event.preventDefault()
    if (window.location.pathname !== href) {
      window.history.pushState(null, '', href)
      window.dispatchEvent(new PopStateEvent('popstate'))
      requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }))
    }
  }}>{children}</a>
}
