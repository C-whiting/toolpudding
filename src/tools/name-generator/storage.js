import { isSafeName } from './generator'

export const STORAGE_KEY = 'boring-tools.saved-names.v1'
export function readSavedNames() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(data)) return []
    const unique = new Set()
    return data.filter(item => {
      if (!item || typeof item.name !== 'string' || !/^[A-Za-z][A-Za-z ]{1,49}$/.test(item.name) || !isSafeName(item.name)) return false
      const key = item.name.toLowerCase().replace(/\s/g, '')
      if (unique.has(key)) return false
      unique.add(key)
      return true
    }).slice(0, 200).map(item => ({ name: item.name }))
  } catch { return [] }
}
