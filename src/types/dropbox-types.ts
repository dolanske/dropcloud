export interface DbxRequest {
  entries: Array<DbxFolder | DbxFile>
  cursor: string
  has_mode: boolean
}

export interface DbxFolder {
  '.tag': 'folder'
  name: string
  path_lower: string
  path_display: string
  id: string
}

export interface DbxFile {
  '.tag': 'file'
  name: string
  path_lower: string
  path_display: string
  id: string
  client_modified: string
  server_modified: string
  rev: string
  size: number
  is_downloadable: boolean
  content_hash: string
}

export type DbxStructure = Record<string, string | {}>
