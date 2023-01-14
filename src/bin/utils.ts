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

// Rounds a number to a set precision. Displays decimals only if needed
export function round(value: number, precision = 0) {
  const multiplier = 10 ** precision
  return Math.round(value * multiplier) / multiplier
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
    return decimals ? `${round(bytes / 1000000, 2)} MB` : `${bytes / 1000000}MB`
  return decimals ? `${round(bytes / 1000, 2)} KB` : `${bytes / 1000}KB`
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

// Takes in an amount of HZ and adds a k Hz to it
export function formatSampleRate(number: number) {
  return `${number / 1000} kHz`
}

// Creates an average from the provided array of numbers
export const average = (arr: number[]) => arr.reduce((p, c) => p + c, 0) / arr.length
