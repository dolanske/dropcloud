<script setup lang='ts'>
import { computed } from 'vue'
import { useFile } from '../../store/file'
import { useTracklist } from '../../store/tracklist'

const tracklist = useTracklist()
const file = useFile()
const song = computed(() => file.audioState.file)

/**
 * Browse history & create tracklist
 */
</script>

<template>
  <div class="route-tracklist">
    <div class="container container-full">
      <h1>Tracklist</h1>

      <strong class="subtitle">Playing</strong>

      <div>
        file currently being played
        {{ song.name }}
      </div>

      <strong class="subtitle">Queued files</strong>
      <pre>
        {{ tracklist.queue }}
      </pre>
    </div>
  </div>
</template>
