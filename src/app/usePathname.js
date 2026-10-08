import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

export function usePathname(initialPath = '/') {
  return useSyncExternalStore(subscribe, () => window.location.pathname.replace(/\/+$/, '') || '/', () => initialPath)
}
