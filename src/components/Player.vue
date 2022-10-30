<script setup lang='ts'>
import { computed, reactive, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useFile } from '../store/file'
import { getFormattedlength, now } from '../bin/utils'

import InputSlider from '../components/inputs/InputSlider.vue'

const file = useFile()

// Get relevant files
const metadata = computed(() => file.getFileData(file.audioState.path))
const audio = computed(() => file.audio)

// Update audio timestamps and progress bar
const timestamp = reactive({
  elapsed: 0,
  duration: 0,
})

// Reset timestamps when file changes
watch(() => file.audioState.path, () => {
  Object.assign(timestamp, { elapse: 0, duration: 0 })
})

audio.value.addEventListener('timeupdate', (e: any) => {
  if (!file.audioState.playing)
    return

  if (!timestamp.duration)
    timestamp.duration = e.target.duration

  // FIXME: sometimes song ends at eg 35 while the length is 34 (goofy ass)
  timestamp.elapsed = (now() - file.audioState.startedAt) / 1000
})

const percentage = computed(() => (timestamp.elapsed / timestamp.duration) * 100)

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
            <div v-if="volumeOpen" class="input-slider-wrap">
              <span>{{ volume }}%</span>

              <InputSlider v-model:value="volume" />
            </div>
          </div>

          <!-- <button> <Icon code="e04e" /> </button> -->
        </div>

        <div class="player-bar-wrap">
          <span>{{ getFormattedlength(timestamp.elapsed) }}</span>

          <div class="player-bar-background">
            <div class="player-bar-progress" :style="{ width: `${percentage}%` }" />
            <button class="player-bar-btn" :style="{ left: `${percentage}%` }" />
          </div>

          <span>{{ getFormattedlength(timestamp.duration) }}</span>
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
