<script setup lang='ts'>
import { computed, reactive } from 'vue'
import { useFile } from '../store/file'
import { getFormattedlength, now } from '../bin/utils'

const file = useFile()

// Get relevant files
const metadata = computed(() => file.getFileData(file.audioState.path))
const audio = computed(() => file.audio)

// Update audio timestamps and progress bar
const timestamp = reactive({
  elapsed: 0,
  duration: 0,
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

//
</script>

<template>
  <div class="player">
    <div class="container">
      <div v-if="audio" class="player-box">
        <div class="player-control">
          <button data-title-top="Previous">
            <Icon code="e045" />
          </button>
          <button data-title-top="Play" @click="file.toggle()">
            <Icon v-if="file.audioState.playing" code="e034" />
            <Icon v-else code="e1c4" />
          </button>
          <!-- <button> <Icon code="e034" /> </button> -->
          <button data-title-top="Next">
            <Icon code="e044" />
          </button>
          <button data-title-top="Shuffle">
            <Icon code="e043" />
          </button>
          <button data-title-top="Volume">
            <Icon code="e050" />
          </button>
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
