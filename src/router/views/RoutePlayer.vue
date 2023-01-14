<script setup lang='ts'>
import { onClickOutside } from '@vueuse/core'
import { chunk } from 'lodash'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '../../bin/local'
import { average, formatFileSize, formatSampleRate, getFormattedlength } from '../../bin/utils'
import { useFile } from '../../store/file'
import { useLoading } from '../../store/loading'
import type { AudioFileNode } from '../../types/audio-types'

const loading = useLoading()
const file = useFile()
const router = useRouter()

/* ---------------- // SECTION // ---------------- */
// Dynamically control bars
const availableFfts = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768]
const dropdownOpen = ref(false)
const dropdownBtn = ref<HTMLButtonElement | null>(null)
const viz = reactive({
  bars: 112,
  color: '#c5c0b2',
  fftsize: 4096,
})

onClickOutside(dropdownBtn, () => {
  dropdownOpen.value = false
})

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

window.addEventListener('resize', computeBars)

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

// TODO: document
const CANVAS_VIZ = ref<HTMLCanvasElement>()
const audioCtx = new AudioContext()
const analyzer = audioCtx.createAnalyser()

watch(() => viz.fftsize, (value) => {
  analyzer.fftSize = value
  dropdownOpen.value = false
}, { immediate: true })

// Default size
// analyzer.fftSize = 4096

// analyzer.minDecibels = -90
// analyzer.maxDecibels = -10
// analyzer.smoothingTimeConstant = 0.85

const bufferLength = analyzer.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

const src = audioCtx.createMediaElementSource(file.audio)

src.connect(analyzer)
analyzer.connect(audioCtx.destination)

onMounted(() => {
  if (CANVAS_VIZ.value && CANVAS_VIZ.value.parentElement) {
    const width = CANVAS_VIZ.value.parentElement.offsetWidth
    const height = CANVAS_VIZ.value.parentElement.offsetHeight

    CANVAS_VIZ.value.width = width
    CANVAS_VIZ.value.height = height

    const ctx = CANVAS_VIZ.value.getContext('2d')

    if (!ctx)
      return

    drawVisualizer(ctx)
  }
})

function drawVisualizer(ctx: CanvasRenderingContext2D) {
  if (!CANVAS_VIZ.value)
    return

  // Reset canvas to draw new lines again
  ctx.clearRect(0, 0, CANVAS_VIZ.value.width, CANVAS_VIZ.value.height)

  // Call itself on the next free draw frame
  requestAnimationFrame(() => drawVisualizer(ctx))

  // Get data from the audio source
  analyzer.getByteFrequencyData(dataArray)

  ctx.fillStyle = viz.color

  const _bars = CANVAS_VIZ.value.width / viz.bars
  const BAR_G = 4
  const BAR_W = _bars - (_bars / BAR_G)

  // We dont wanna chunk bass notes as those need to be precise
  // We do not chunk first ten items
  const SPLIT = Math.floor(viz.bars / 10)

  const bass = dataArray.slice(0, SPLIT)
  const rest = dataArray.slice(SPLIT + 1)
  const chunked = chunk(rest, SPLIT)

  // using Array.entries() will return back an array of [index, value] so we do not
  // have to define addition i and increment it on each loop
  for (const [index, chunk] of [...bass, ...chunked].entries()) {
    // const avg = Math.max(...chunk)
    const avg = typeof chunk === 'number' ? chunk : Math.max(...chunk)

    // Logarhytmically make the peaks louder to create better contrast
    const avgMultiplied = (avg > 128 ? 1.5 ^ avg : avg) * 1.25

    // TODO: increase darkness depending on the loudness

    ctx.fillRect(
      index * (BAR_W + BAR_G),
      CANVAS_VIZ.value.height - avgMultiplied,
      BAR_W,
      avgMultiplied,
    )
  }

  // for (let i = 0; i < bufferLength / 2; i++) {
  // barHeight = dataArray[i] * 2

  // ctx.fillStyle = `rgb(${barHeight + 100},50,50)`
  // ctx.fillRect(
  //   x,
  //   CANVAS_VIZ.value.height - barHeight,
  //   barWidth,
  //   barHeight,
  // )

  // x += barWidth + VIZ_GAP
  // x += i
  // }

  // ctx.lineTo(CANVAS_VIZ.value.width, CANVAS_VIZ.value.height / 2)
  // ctx.stroke()
}
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

      <!-- <div class="container"> -->
      <div class="canvas-viz-control">
        <div class="input-item text-input">
          <label>Bars</label>
          <input v-model="viz.bars" type="text" placeholder="156">
        </div>

        <div>
          <input id="color" v-model="viz.color" type="color" name="color" style="display:none;">
          <label for="color" class="button btn-gray">Color</label>
        </div>

        <div ref="dropdownBtn" class="input-item">
          <button class="button btn-gray" @click="dropdownOpen = !dropdownOpen">
            FFTSISZE
            <Icon code="e5cf" size="2" />
          </button>

          <div class="dropdown" :class="{ 'is-open': dropdownOpen }">
            <button v-for="size in availableFfts" :key="size" :class="{ 'is-active': size === viz.fftsize }" @click="viz.fftsize = size">
              {{ size }}
            </button>
          </div>
        </div>
      </div>
      <!-- </div> -->

      <div class="route-player-vizualization">
        <div class="canvas-viz-wrapper">
          <canvas ref="CANVAS_VIZ" />
        </div>
      </div>
    </template>
  </div>
</template>
