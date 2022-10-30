<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import { reactiveComputed } from '@vueuse/core'
import { useFile } from '../../store/file'

const route = useRoute()
const id = computed(() => route.params.id.toString())
const file = useFile()

watch(id, path => file.dwFile(path), {
  immediate: true,
})

const audio = file.getAudioNode(id.value)

function play() {
  // if (audio)
  //   audio.play()
}

function pause() {
  // if (audio)
  //   audio.pause()
}
</script>

<template>
  <div>
    <pre>
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
    </pre>
  </div>
</template>
