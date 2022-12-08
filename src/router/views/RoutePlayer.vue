<script setup lang='ts'>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '../../bin/local'
import { formatFileSize, formatSampleRate, getFormattedlength } from '../../bin/utils'
import { useFile } from '../../store/file'
import { useLoading } from '../../store/loading'
import type { AudioFileNode } from '../../types/audio-types'

const loading = useLoading()
const file = useFile()
const router = useRouter()

/* ---------------- // SECTION // ---------------- */
// Analyze volumes of an entire song and return an array of values between 0 and 1

// https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
// An absolute chad of an article. Exactly waht I was looking for. I love this.
const SAMPLES = 300
const CANVAS_BAR = ref<HTMLCanvasElement>()
const CANVAS_BAR_PARENT = ref<HTMLElement>()
const HEIGHT = 96
const BAR_SPACE = 2
const analyzed = reactive<{ value: number[] }>({ value: [] })

async function formatAudioVolumeData({ raw }: AudioFileNode) {
  // Add loading anyway, because its deletion is further down the line
  loading.set('audio-bar')

  const existing = file.getVizualization(file.audioState.path)
  if (existing)
    return existing

  const ctx = new AudioContext()
  const buffer = await raw.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(buffer)

  file.saveSampleRate(file.audioState.path, audioBuffer.sampleRate)

  // We only need to work with one channel of data
  // NOTE I think the first is either left or right channel. To have accurate average
  // I would assume we need to average both channel 0 and channel 1 volume data
  const rawAudio = audioBuffer.getChannelData(0)
  // Number of samples we want to have in our final data set
  // Number of samples in each subdivision
  const block = Math.floor(rawAudio.length / SAMPLES)
  const filtered = []

  for (let i = 0; i < SAMPLES; i++) {
    // the location of the first sample in the block
    const start = block * i
    let sum = 0

    for (let j = 0; j < block; j++) {
      // find the sum of all the samples in the block
      sum += Math.abs(rawAudio[start + j])
    }

    // divide the sum by the block size to get the average
    filtered.push(sum / block)
  }

  /**
   * This function finds the largest data point in the array with Math.max(),
   * takes its inverse with Math.pow(n, -1), and multiplies each value in the array by that number.
   * This guarantees that the largest data point will be set to 1,
   * and the rest of the data will scale proportionally.
   */
  // TODO: this should not be linear but logarithmic
  const multiplier = Math.max(...filtered) ** -1
  const multiplied = filtered.map(n => n * multiplier)

  // Save data
  file.saveVizualization(file.audioState.path, multiplied)

  return multiplied
}

watch(() => file.getAudioNode, async (node) => {
  if (node) {
    // TODO
    // Once sound is analized, save it to the registry so that next time we dont have to call this function again
    analyzed.value = await formatAudioVolumeData(node)
    computeBars()
  }
}, { immediate: true })

function computeBars() {
  if (CANVAS_BAR.value) {
    // Assign canvas width to the width of its parent
    if (!CANVAS_BAR.value.parentElement)
      return

    const width = CANVAS_BAR.value.parentElement.getBoundingClientRect().width

    CANVAS_BAR.value.width = width
    CANVAS_BAR_PARENT.value = CANVAS_BAR.value.parentElement

    // Afterwards, get canvas context
    const ctx = CANVAS_BAR.value.getContext('2d')

    if (!ctx)
      return

    // Calculate width of a single bar based on canvas width and the amount of samples
    const BAR_WIDTH = width / SAMPLES

    analyzed.value.forEach((bar, index) => {
      const sizeInPercent = Math.round(Math.max(100 / HEIGHT * (bar * 100), 1))
      const size = 100 / HEIGHT * sizeInPercent
      const fromTop = HEIGHT - size

      ctx.fillStyle = '#c5c0b2'

      ctx.fillRect(
        (index * BAR_WIDTH) + BAR_SPACE,
        fromTop,
        BAR_WIDTH - BAR_SPACE,
        size,
      )
    })

    // Loading ended
    loading.del('audio-bar')
  }
}

window.addEventListener('resize', () => computeBars())

/* ---------------- // SECTION // ---------------- */
// Controls in Canvas BAR for song progression
const showHover = ref(false)
const barHoverWidth = ref(0)
const progress = computed(() => (file.audioState.elapsed / file.audio.duration) * 100)

function handleMouseMove(e: MouseEvent) {
  if (showHover.value && CANVAS_BAR_PARENT.value) {
    const { left, width } = CANVAS_BAR_PARENT.value.getBoundingClientRect()

    const posOnEl = ((left + window.scrollX) - e.clientX) * -1
    const percent = Math.min((100 * posOnEl) / width, 100)

    barHoverWidth.value = percent
  }
}

function setSongProgress() {
  if (barHoverWidth.value)
    file.setProgress(barHoverWidth.value)
}

/* ---------------- // SECTION // ---------------- */
// Information about the currently played song
const song = computed(() => file.audioState.file)
const sampleRate = computed(() => file.getSampleRate(file.audioState.path) ?? 0)
const duration = computed(() => file.audio.duration)
const elapsed = computed(() => file.audioState.elapsed)

/* ---------------- // SECTION // ---------------- */
//
async function goToFolder() {
  await router.push({ name: 'RouteLibrary' })
}

/* ---------------- // SECTION // ---------------- */
// Live audio visualiser

// NOTE
// Use this for the live audio vizualizer
// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
// https://github.com/mdn/webaudio-examples/blob/f58a57b47ad4f4ec57bbfe169b3cf79490408b98/voice-change-o-matic/scripts/app.js#L194

// const analyzer =

// onMounted(() => {
//   const ctx = new AudioContext()
//   const analyzer = ctx.createAnalyser()
// })
</script>

<template>
  <div class="route-player" :class="{ 'no-song': !file.audioState.path }">
    <div v-if="!file.audioState.path" class="route-player-no-song">
      <h3>No file found</h3>
      <p>There is currently no file ready to be played. Please visit the library / search page and select a file to play.</p>

      <router-link class="button btn-black" :to="{ name: 'RouteLibrary' }">
        Find a song
      </router-link>
    </div>
    <template v-else>
      <div class="route-player-header">
        <div class="container">
          <!-- <a :href="song.path_lower" @click.prevent="goToFolder()">{{ song.path_display }}</a> -->
          <p>{{ song.path_display }}</p>
          <h1>{{ song.name }}</h1>

          <div class="metadata">
            <!-- <span>{{ getFormattedlength(file.audio.duration) }}</span> -->
            <span>{{ song.extension }}</span>
            <span>{{ formatSampleRate(sampleRate) }}</span>
            <span>{{ formatFileSize(song.size, 2) }}</span>

            <span>{{ formatDate(song.client_modified) }}</span>

            <div class="horizontal-divider" />

            <button class="play-button" :data-title-top="file.audioState.playing ? 'Pause' : 'Play'" :class="{ active: file.audioState.playing }" @click="file.toggle()">
              <Icon v-if="file.audioState.playing" code="e034" size="2.4" />
              <Icon v-else code="e1c4" size="2.4" />
            </button>
          </div>

          <button class="button btn-black btn-icon share-button" data-title-left="Share">
            <Icon code="e80d" />
          </button>
        </div>
      </div>

      <div class="route-player-bars">
        <span class="time-marker elapsed">{{ getFormattedlength(Math.min(elapsed, duration)) }}</span>
        <span class="time-marker duration">{{ getFormattedlength(duration) }}</span>

        <div class="container">
          <div class="canvas-wrapper" @mouseenter="(showHover = true)" @mouseleave="(showHover = false)" @mousemove="handleMouseMove" @click="setSongProgress">
            <Bar v-if="loading.get('audio-bar')" />
            <template v-else>
              <div v-if="showHover" class="canvas-bar-hover" :style="{ width: `${barHoverWidth}%` }" />
              <div class="canvas-bar-progress" :style="{ width: `${progress}%` }" />
            </template>

            <canvas ref="CANVAS_BAR" :height="HEIGHT" width="100%" />
          </div>
        </div>
      </div>

      <div class="route-player-vizualization" />
    </template>
  </div>
</template>
