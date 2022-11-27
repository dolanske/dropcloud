const { now } = Date
export { now }

// Returns any URL search parameters it finds in an object
export function getUrlQuery(...fields: string[]): Record<string, string | number> {
  const data = new URLSearchParams(window.location.search)

  if (fields.length === 0) {
    const objectifiedValues: { [key: string]: string | number } = {}
    data.forEach((item, index) => (objectifiedValues[index] = item))
    return objectifiedValues
  }

  return fields.reduce((obj, field /* index */) => {
    const value = data.get(field)

    let parsed: unknown

    if (value) {
      try {
        parsed = JSON.parse(value)
      }
      catch (e) {
        parsed = value
      }
    }
    else {
      parsed = null
    }

    Reflect.set(obj, field, parsed)

    return obj as { [key: typeof field]: typeof parsed }
  }, {})
}

// Returns an object of all url hash parameters
export function getUrlHashQuery<T>() {
  const hash = window.location.hash.substring(1)

  if (!hash)
    return null

  return hash.split('&').reduce((res: { [key: string]: string }, item) => {
    const parts = item.split('=')

    res[parts[0]] = parts[1]
    return res
  }, {}) as T
}

// Return a human readable file size
export function formatFileSize(bytes: string | number, decimals?: number) {
  if (typeof bytes === 'string')
    bytes = Number(bytes)

  if (isNaN(bytes))
    return 0

  if (bytes / 1000000 > 1)
    return decimals ? `${(bytes / 1000000).toFixed(decimals)}MB` : `${bytes / 1000000}MB`
  return decimals ? `${(bytes / 1000).toFixed(decimals)}KB` : `${bytes / 1000}KB`
}

// Returns a formatted length of time in seconds
// Example: 01:32
export function getFormattedlength(s = 1) {
  if (isNaN(s))
    return '0:00'

  return new Date(s * 1000).toISOString().substring(14, 19)
}

// Returns a path from a file without its name
export function formatPathWithoutName(path: string) {
  return path.split('/').slice(0, -1).join('/')
}
