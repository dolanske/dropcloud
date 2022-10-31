<script setup lang='ts'>
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useFile } from '../store/file'
import { getFormattedlength, now } from '../bin/utils'

import InputSlider from '../components/inputs/InputSlider.vue'

const file = useFile()

// Get relevant files
const metadata = computed(() => file.getFileData(file.audioState.path))
const audio = computed(() => file.audio)
const progress = computed(() => {
  return (file.audioState.elapsed / file.audio.duration) * 100
})

// watchEffect(() => {
//   console.log(progress.value)
// })

audio.value.addEventListener('timeupdate', (e: any) => {
  if (!file.audioState.playing)
    return

  file.audioState.elapsed = (now() - file.audioState.startedAt) / 1000
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
  const target = e.target as HTMLElement
  if (target) {
    const { left, width } = target.getBoundingClientRect()

    const posOnEl = ((left + window.scrollX) - e.clientX) * -1
    const percent = (posOnEl / width) * 100

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
    // const target = e.target as HTMLElement

    // console.log(target)

    if (playerbar.value) {
      const { left, width } = playerbar.value.getBoundingClientRect()

      const posOnEl = ((left + window.scrollX) - e.clientX) * -1
      tooltip.left = (posOnEl / width) * 100
      tooltip.time = getFormattedlength((file.audio.duration / 100) * tooltip.left)
    }
  }
}
</script>

<template>
  <div class="player">
    <div class="container container-player">
      <div v-if="audio" class="player-box">
        <div class="player-control">
          <!-- previous-file -->

          <button data-title-top="Previous">
            <Icon code="e045" />
          </button>

          <!-- play-pause button -->

          <button data-title-top="Play" @click="file.toggle()">
            <Icon v-if="file.audioState.playing" code="e034" />
            <Icon v-else code="e1c4" />
          </button>
          <!-- <button> <Icon code="e034" /> </button> -->

          <!-- next-file -->

          <button data-title-top="Next">
            <Icon code="e044" />
          </button>

          <!-- shuffle -->

          <button data-title-top="Shuffle">
            <Icon code="e043" />
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
          <span>{{ getFormattedlength(file.audioState.elapsed) }}</span>

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

            <button
              class="player-bar-btn"
              :style="{ left: `${progress}%` }"
            />
          </div>

          <span>{{ getFormattedlength(file.audio.duration) }}</span>
        </div>

        <div class="player-file">
          <p v-if="metadata">
            {{ metadata.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
