<script setup lang='ts'>
import { computed, watch } from 'vue'
import { useFile } from '../../store/file'
import type { AudioFileNode } from '../../types/audio-types'

const files = useFile()

watch(() => files.getAudioNode, (node) => {
  if (node)
    formatAudioVolumeData(node)
})

async function formatAudioVolumeData({ url, raw }: AudioFileNode) {
  const audioCtx = new AudioContext()
  const analyser = audioCtx.createAnalyser()

  // const src = audioCtx.createMediaStreamDestination(raw)
}
</script>

<template>
  <div class="route-player">
    <div class="route-player-header" />
  </div>
</template>
