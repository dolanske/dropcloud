import { defineStore } from 'pinia'

interface State {
  folders: any[]
  folderStructure: Record<string, string | {}>
  root: string
  active: Record<string, any>
}

export const useFolder = defineStore('folder', {
  state: () => ({
    folders: [],
    folderStructure: {},
    root: '',
    active: {},
  } as State),
  actions: {
    updateStructure(folders: any[], structure: Record<string, string | {}>) {
      this.folders = folders
      this.folderStructure = structure
    },
    open(path: string) {
      const doesExist = this.folders.find(item => item.path_lower === path || item.name === path || item.id === path)

      if (doesExist)
        this.active = doesExist
    },
  },
  getters: {
    getFolderData: state => (name: string) => {
      return state.folders.find((folder) => {
        const endOfPath = folder.path_lower.split('/').at(-1)

        return endOfPath === name
      })
    },
  },
})
