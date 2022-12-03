import { isNil } from 'lodash'
import { defineStore } from 'pinia'
import { download, post } from '../bin/fetch'
import { now } from '../bin/utils'
import type { DbxFile } from '../types/dropbox-types'
import type { AudioFileNode } from '../types/audio-types'
import { useTracklist } from './tracklist'
import { useLoading } from './loading'

let setProgressDuringPause = false

// create default state for volume, run once when app is initialized
if (isNil(localStorage.getItem('volume')))
  localStorage.setItem('volume', '30')

interface State {
  audioState: {
    playing: boolean
    path: string
    file: DbxFile
    startedAt: number
    pausedAt: number
    volume: number
    elapsed: number
  }
  vizualizations: Map<string, number[]>
  sampleRates: Map<string, number>
  audio: HTMLAudioElement
  registry: Map<string, AudioFileNode>
  files: DbxFile[]
}

export const supportedMedia = ['.wav', '.mp3', '.flac']

export const useFile = defineStore('file', {
  state: () => ({
    audioState: {
      playing: false,
      path: '',
      file: {} as DbxFile,
      startedAt: 0,
      pausedAt: 0,
      volume: Number(localStorage.getItem('volume')),
      elapsed: 0,
    },
    audio: document.createElement('audio'),
    sampleRates: new Map(),
    registry: new Map(),
    vizualizations: new Map(),
    files: [],
  } as State),
  actions: {
    async fetchFilesFromPath(path: string) {
      if (!path)
        return

      const loading = useLoading()
      loading.set('folder')

      await post('/files/list_folder', { path })
        .then((response) => {
          this.files = response.entries.filter((file: DbxFile) =>
            !file.name.startsWith('._'),
            // || !supportedMedia.some(media => item.name.endsWith(media)),
          ).map((file: DbxFile) => {
            const [name, extension] = file.name.split(/(?:\.([^.]+))?$/)
            Object.assign(file, { name, extension })
            return file
          })

          loading.del('folder')
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

      return file.then(res => res.blob())
        .then(async (raw) => {
          const url = URL.createObjectURL(raw)
          const buffer = await raw.arrayBuffer()
          this.registry.set(path, { url, raw, buffer })

          loading.del(path)
        })
    },

    // Audio actions
    updateAudioState(path: string) {
      const { url } = this.registry.get(path) ?? {}

      if (url) {
        if (path === this.audioState.path) {
          this.toggle()
          return
        }

        const file = this.files.find(file => file.id === path)

        /* Init */
        this.audio.src = url
        this.audioState.path = path
        if (file)
          this.audioState.file = file
        this.audioState.elapsed = 0
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

      const tracklist = useTracklist()
      tracklist.pushHistory(this.audioState.path)
    },

    unpause() {
      this.audio.play()
      this.audioState.playing = true

      if (setProgressDuringPause) {
        /**
         * This is needed becaue on unpause it calculates the progress based on when pause occured.
         * If progress was updated during pause, the timings are messed up. We can easily fix it but just
         * skipping the new assignment. As we know it had happened during the pause
         */
        setProgressDuringPause = false
        return
      }

      this.audio.currentTime = this.audioState.pausedAt / 1000
      this.audioState.startedAt = now() - this.audioState.pausedAt
    },

    pause() {
      this.audio.pause()
      this.audioState.playing = false
      this.audioState.pausedAt = now() - this.audioState.startedAt
    },

    reset() {
      this.audioState.playing = false
      this.audioState.startedAt = 0
      this.audioState.pausedAt = 0
      this.audioState.elapsed = 0
      this.audio.currentTime = 0
    },

    /**
     *  Change song's playback position to the amount of %.
     */

    setProgress(percent: number) {
      const updated = (this.audio.duration / 100) * percent
      this.audioState.startedAt = now() - (updated * 1000)
      this.audioState.elapsed = updated
      this.audio.currentTime = updated

      if (!this.audioState.playing)
        setProgressDuringPause = true
    },

    /**
     * Change the current song's position by the provided amount of seconds.
     * The input can be negative.
     */
    // changeTime(by: number) {
    //   const newElapsed = this.audioState.elapsed + by
    // },

    saveVizualization(path: string, value: number[]) {
      this.vizualizations.set(path, value)
    },
    saveSampleRate(path: string, number: number) {
      this.sampleRates.set(path, number)
    },
  },
  getters: {
    getFileData: state => (path: string) => state.files.find((file: any) => file?.id === path),
    getAudioNode: state => state.registry.get(state.audioState.path),
    getVizualization: state => (path: string) => state.vizualizations.get(path),
    getSampleRate: state => (path: string) => state.sampleRates.get(path),
  },
})
