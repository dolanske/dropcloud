import { isNil } from 'lodash'
import { defineStore } from 'pinia'
import { download, post } from '../bin/fetch'
import { now } from '../bin/utils'
import type { DbxFile } from '../types/dropbox-types'
import { useLoading } from './loading'

// TODO: Add interface for folder & file

// create default state for volume
if (isNil(localStorage.getItem('volume')))
  localStorage.setItem('volume', '30')

interface State {
  audioState: {
    playing: boolean
    path: string
    startedAt: number
    pausedAt: number
    volume: number
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
      volume: Number(localStorage.getItem('volume')),
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
        if (path === this.audioState.path) {
          this.toggle()
          return
        }

        /* Init */
        this.audio.src = registeredPath
        this.audioState.path = path
        this.play()
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

    setVolume(volume: number) {
      this.audioState.volume = volume
      this.audio.volume = volume / 100
      localStorage.setItem('volume', volume.toString())
    },

    play() {
      this.setVolume(this.audioState.volume)
      this.audioState.playing = true
      this.audioState.startedAt = now()
      this.audioState.pausedAt = 0
      this.audio.play()
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
