import { defineStore } from 'pinia'
import type { DbxFile, DbxFolder, DbxStructure } from '../types/dropbox-types'

interface State {
  folders: DbxFolder[]
  folderStructure: DbxStructure
  root: string
  active: DbxFolder

  everything: Array<DbxFolder | DbxFile>
}

export const useFolder = defineStore('folder', {
  state: () => ({
    everything: [],
    folders: [],
    folderStructure: {},
    root: '',
    active: {} as DbxFolder,
  } as State),
  actions: {
    updateStructure(folders: any[], structure: DbxStructure) {
      this.folders = folders
      this.folderStructure = structure
    },
    async open(path: string) {
      const doesExist = this.folders.find(item => item.path_lower === path || item.name === path || item.id === path)

      if (!doesExist || this.active === doesExist)
        return

      this.active = doesExist

      // If we provide a file, it means we want to scroll to it upon opening the new folder
      // if (fileId) {
      //   const target = document.querySelector(`#${fileId}`)
      //   if (target)
      //     target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      // }
    },
  },
  getters: {
    getFolderData: state => (name: string) => {
      return state.folders.find((folder) => {
        const endOfPath = folder.path_lower.split('/').at(-1)

        return endOfPath === name
      })
    },
    getItemAmountInPath: state => (path: string) => {
      return state.everything.filter(folder => folder.path_lower.startsWith(path) && folder['.tag'] === 'file').length
    },
  },
})
