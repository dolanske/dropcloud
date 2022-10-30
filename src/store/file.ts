import { defineStore } from 'pinia'
import { download, post } from '../bin/fetch'
import { now } from '../bin/utils'
import type { DbxFile } from '../types/dropbox-types'
import { useLoading } from './loading'

// TODO: Add interface for folder & file

interface State {
  audioState: {
    playing: boolean
    path: string
    startedAt: number
    pausedAt: number
  }
  audio: HTMLAudioElement
  registry: Map<string, string>
  files: DbxFile[]
}

export const useFile = defineStore('file', {
  state: () => ({
    audioState: {
      playing: false,
      path: '',
      startedAt: 0,
      pausedAt: 0,

    },
    audio: document.createElement('audio'),
    registry: new Map(),
    files: [],

  } as State),
  actions: {
    async fetchFilesFromPath(path: string) {
      if (!path)
        return

      await post('/files/list_folder', { path })
        .then((response) => {
          this.files = response.entries
        })
    },

    async dwFile(path: string) {
      const loading = useLoading()

      // Do not download cached files
      if (this.registry.has(path))
        return Promise.resolve()

      loading.set(path)

      // Download file from drobpx
      const file = download('/files/download', {
        headers: { 'Dropbox-API-Arg': JSON.stringify({ path }) },
      })

      return file
        .then(res => res.blob())
        .then((data) => {
          const audioUrl = URL.createObjectURL(data)
          this.registry.set(path, audioUrl)
        })
        .finally(() => {
          loading.del(path)
        })
    },

    // Audio actions
    updateAudioState(path: string) {
      const registeredPath = this.registry.get(path)

      if (registeredPath) {
        this.audio.src = registeredPath
        this.audioState.path = path
        this.toggle()
      }
    },

    toggle() {
      if (this.audioState.playing)
        this.pause()

      else if (this.audioState.pausedAt > 0)
        this.unpause()

      else
        this.play()
    },

    play() {
      this.audio.play()
      this.audioState.playing = true
      this.audioState.startedAt = now()
    },

    unpause() {
      this.audio.play()
      this.audioState.playing = true
      this.audio.currentTime = this.audioState.pausedAt / 1000
      this.audioState.startedAt = now() - this.audioState.pausedAt
    },

    pause() {
      this.audio.pause()
      this.audioState.playing = false
      this.audioState.pausedAt = now() - this.audioState.startedAt
    },
  },
  getters: {
    getFileData: state => (path: string) => state.files.find((file: any) => file?.id === path),
    getAudioNode: state => (path: string) => state.registry.get(path),
  },
})
