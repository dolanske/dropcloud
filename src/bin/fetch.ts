import { isObject, merge } from 'lodash'

export const rootUrl = 'https://_prefix_.dropboxapi.com/2'
export const token = ''

const prefixes = ['api', 'content']

export function get(prefix: string, path: string | object, body: object | string, options?: object) {
  let mergedPath = ''

  if (!prefixes.includes(prefix)) {
    options = isObject(body) ? body : {}
    body = path
    mergedPath = prefix
    prefix = 'api'
  }

  if (typeof path === 'string')
    mergedPath = path

  return _handleFetch(
    mergedPath,
    merge(
      {
        method: 'GET',
      },
      options,
    ),
    prefix,
  )
}

export function post(prefix: string, path: string | object, body?: object | string, options?: object) {
  let mergedPath = ''

  if (!prefixes.includes(prefix)) {
    options = isObject(body) ? body : {}
    body = path
    mergedPath = prefix
    prefix = 'api'
  }

  if (typeof path === 'string')
    mergedPath = path

  return _handleFetch(
    mergedPath,
    merge(
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      options,
    ),
    prefix,
  )
}

export function download(path: string, options?: object) {
  const token = JSON.parse(localStorage.getItem('dbx-context') ?? '')

  const mergedRootUrl = rootUrl.replace('_prefix_', 'content')

  merge(options, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  })

  return fetch(mergedRootUrl + path, options)
}

// export function put(url: string, body: object | string, options?: object) {
//   return _handleFetch(
//     url,
//     merge(
//       {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       },
//       options,
//     ),
//   )
// }

/**
 * Special function to handle file uploads
 */

// export function upload(url: string, body: object | string, options?: object) {
//   return _handleFetch(url, {
//     method: 'POST',
//     body,
//     ...options,
//   })
// }

// export function del(url: string, options?: object) {
//   return _handleFetch(
//     url,
//     merge(
//       {
//         method: 'DELETE',
//       },
//       options,
//     ),
//   )
// }

// Private handler functions
async function _handleFetch(path: string, options: object, prefix: string) {
  const token = JSON.parse(localStorage.getItem('dbx-context') ?? '')

  const mergedRootUrl = rootUrl.replace('_prefix_', prefix)

  merge(options, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  })

  return fetch(mergedRootUrl + path, options).then(_handleResponse)
}

async function _handleResponse(response: Response) {
  if (response.status !== 200) {
    return response.text().then((text: string) => {
      let message = null

      try {
        const parsed = JSON.parse(text)
        message = parsed.message
      }
      catch (e) {
        message = text
      }

      return Promise.reject(new Error(message || `An unexpected error occured: ${response.statusText}`))
    })
  }

  return response.text().then((text: string) => {
    const data = text && JSON.parse(text)

    if (!response.ok)
      return Promise.reject(data)

    return data
  })
}
