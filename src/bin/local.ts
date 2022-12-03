import { omit } from 'lodash'

export function formatDate(date: Date | number | string, toOmit?: Array<any>) {
  if (typeof date === 'number')
    date *= 1000

  const d = new Date(date)
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  return d.toLocaleDateString('en-GB', toOmit ? omit(options, toOmit) : options)
}

