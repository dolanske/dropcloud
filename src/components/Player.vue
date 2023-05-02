<script setup lang='ts'>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useFile } from '../store/file'
import { useTracklist } from '../store/tracklist'
import { getFormattedlength, now } from '../bin/utils'

import InputSlider from '../components/inputs/InputSlider.vue'
import { useLoading } from '../store/loading'
import Bar from './global/Bar.vue'

const tracklist = useTracklist()
const file = useFile()
const loading = useLoading()
// const folder = useFolder()
// const router = useRouter()

// Get relevant files
const metadata = computed(() => file.audioState.file)
const audio = computed(() => file.audio)
const progress = computed(() => {
  return (file.audioState.elapsed / file.audio.duration) * 100
})

// async function openAudioFolder() {
//   if (metadata.value) {
//     await router.push({ name: 'RouteLibrary' })
//     folder.open(formatPathWithoutName(metadata.value.path_lower))
//   }
// }

/* ---------------- // SECTION // ---------------- */
// Repeat
const repeat = ref(false)

/* ---------------- // SECTION // ---------------- */
// Audio events
audio.value.addEventListener('timeupdate', () => {
  if (!file.audioState.playing)
    return

  file.audioState.elapsed = (now() - file.audioState.startedAt) / 1000
})

audio.value.addEventListener('ended', async () => {
  // If we have set repeat ON, just toggle play when it ends
  if (repeat.value) {
    await nextTick()
    file.play()
    return
  }

  // Check for an item in queue
  if (tracklist.queue.length > 0) {
    console.log('test')

    fetchNextFile()
    return
  }

  file.reset()
})

/* ---------------- // SECTION // ---------------- */
// Volume
const volumeInput = ref()
const volumeOpen = ref(false)
const volume = computed({
  get: () => file.audioState.volume,
  set: (value: number) => file.setVolume(value),
})

onClickOutside(volumeInput, () => {
  volumeOpen.value = false
})

/* ---------------- // SECTION // ---------------- */
// Progress
const playerbar = ref()
// const holding = ref(false)

function setProgress(e: MouseEvent) {
  const target = playerbar.value
  if (target) {
    const { left, width } = target.getBoundingClientRect()

    const posOnEl = ((left + window.scrollX) - e.clientX) * -1
    const percent = Math.min((100 * posOnEl) / width, 100)
    file.setProgress(percent)
  }
}

// const tooltipPos = ref(0)
const tooltip = reactive({
  left: 0,
  show: false,
  time: '0:00',
})

function handleEnter() {
  tooltip.show = true
}

function handleLeave() {
  tooltip.show = false
}

function handleMove(e: MouseEvent) {
  if (tooltip.show && file.audioState.path) {
    if (playerbar.value) {
      const { left, width } = playerbar.value.getBoundingClientRect()

      const posOnEl = ((left + window.scrollX) - e.clientX) * -1
      tooltip.left = Math.min((100 * posOnEl) / width, 100)
      tooltip.time = getFormattedlength((file.audio.duration / 100) * tooltip.left)
    }
  }
}

/* ---------------- // SECTION // ---------------- */
// Previous song

async function previous() {
  const track = tracklist.getPrevInHistory()

  if (!track)
    return

  await file.dwFile(track)
  file.updateAudioState(track)
}

/* ---------------- // SECTION // ---------------- */
// Keep track of queue

watch(() => tracklist.shuffleOn, (on) => {
  tracklist.queue = []

  if (on)
    tracklist.shuffleQueue()
})

function next() {
  fetchNextFile()
}

async function fetchNextFile() {
  const next = tracklist.getNextTrack()
  await file.dwFile(next)
  file.updateAudioState(next)
}
</script>

<template>
  <div class="player">
    <div class="container container-player">
      <div v-if="audio" class="player-box">
        <div v-if="loading.get('file-download')" class="player-loading">
          <Bar />
        </div>

        <div class="player-control">
          <!-- previous-file -->

          <button data-title-top="Previous" @click="previous()">
            <Icon code="e045" />
          </button>

          <!-- play-pause button -->

          <button :data-title-top="file.audioState.playing ? 'Pause' : 'Play'" @click="file.toggle()">
            <Icon v-if="file.audioState.playing" code="e034" />
            <Icon v-else code="e1c4" />
          </button>
          <!-- <button> <Icon code="e034" /> </button> -->

          <!-- next-file -->

          <button data-title-top="Next" @click="next()">
            <Icon code="e044" />
          </button>

          <!-- shuffle -->

          <button class="blue" data-title-top="Shuffle" :class="{ 'is-active': tracklist.shuffleOn }" @click="tracklist.shuffleOn = !tracklist.shuffleOn">
            <Icon code="e043" />
          </button>

          <!-- repeat -->

          <button class="blue" data-title-top="Repeat" :class="{ 'is-active': repeat }" @click="repeat = !repeat">
            <Icon code="e041" />
          </button>

          <!-- volume-changing -->

          <div ref="volumeInput" class="input-volume">
            <button data-title-top="Volume" @click="volumeOpen = !volumeOpen">
              <Icon :code="volume > 0 ? 'e050' : 'e04e'" />
            </button>
            <div v-if="volumeOpen" class="input-slider-wrap has-arrow">
              <span>{{ volume }}%</span>

              <InputSlider v-model:value="volume" />
            </div>
          </div>

          <!-- <button> <Icon code="e04e" /> </button> -->
        </div>

        <div class="player-bar-wrap">
          <span>{{ getFormattedlength(Math.min(file.audioState.elapsed, file.audio.duration)) }}</span>

          <div
            ref="playerbar"
            class="player-bar-background"
            @click="setProgress($event)"
            @mouseenter="handleEnter"
            @mouseleave="handleLeave"
            @mousemove="handleMove($event)"
          >
            <div
              v-if="tooltip.show && file.audioState.path"
              class="player-bar-tooltip has-arrow"
              :style="{ left: `${tooltip.left}%` }"
            >
              {{ tooltip.time }}
            </div>

            <div class="player-bar-progress" :style="{ width: `${progress}%` }" />
          </div>

          <span>{{ getFormattedlength(file.audio.duration) }}</span>
        </div>

        <div class="player-file">
          <p v-if="metadata">
            <!-- <button @click="openAudioFolder"> -->
            {{ metadata.name }}
            <!-- </button> -->
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
