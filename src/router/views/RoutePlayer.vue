<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { useFile } from '../../store/file'
import type { AudioFileNode } from '../../types/audio-types'

const ctx = new AudioContext()
const file = useFile()

const analyzed = ref<number[]>([])

watch(() => file.getAudioNode, async (node) => {
  if (node)
    // TODO
    // Once sound is analized, save it to the registry so that next time we dont have to call this function again
    analyzed.value = await formatAudioVolumeData(node)
}, { immediate: true })
// NOTE
// Use this for the live audio vizualizer
// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
// https://github.com/mdn/webaudio-examples/blob/f58a57b47ad4f4ec57bbfe169b3cf79490408b98/voice-change-o-matic/scripts/app.js#L194

// NOTE:
// https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
// An absolute chad of an article. Exactly waht I was looking for. I love this.
async function formatAudioVolumeData({ raw }: AudioFileNode) {
  const buffer = await raw.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(buffer)

  // #1 Filter data into the amount of chunks we want (1chunk = 1 visualization bar)

  // We only need to work with one channel of data
  const rawAudio = audioBuffer.getChannelData(0)
  // Number of samples we want to have in our final data set
  const SAMPLES = 100
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
  const multiplier = Math.max(...filtered) ** -1
  return filtered.map(n => n * multiplier)
}
</script>

<template>
  <div class="route-player">
    <div class="route-player-header">
      <pre>
        {{ analyzed }}
      </pre>
    </div>
  </div>
</template>
