<script setup lang='ts'>
import { useDateFormat } from '@vueuse/shared'
import { computed, onMounted, ref } from 'vue'
import { track } from '@vue/reactivity'
import { onClickOutside } from '@vueuse/core'
import { formatFileSize } from '../bin/utils'
import { useFile } from '../store/file'
import { useFolder } from '../store/folder'
import { useLoading } from '../store/loading'
import type { DbxFile, DbxFolder } from '../types/dropbox-types'

import { useTracklist } from '../store/tracklist'
import Spinner from './global/Spinner.vue'
import Eq from './global/Eq.vue'

const props = defineProps<{
  file: DbxFolder | DbxFile
}>()

const loading = useLoading()
const files = useFile()
const folder = useFolder()
const tracklist = useTracklist()
const date = props.file['.tag'] === 'file' ? useDateFormat(props.file?.client_modified, 'DD/MM YYYY') : ''

// Functions
const size = computed(() => {
  if (props.file['.tag'] === 'file')
    return formatFileSize(props.file.size, 2)

  return `${folder.getItemAmountInPath(props.file.path_lower)} files`
})

async function updateAudioState() {
  await files.dwFile(props.file.id)
  files.updateAudioState(props.file.id)
  tracklist.$patch({ current: 0 })
}

function goToFile() {
  if (props.file['.tag'] === 'folder')
    folder.open(props.file.id)
}

const isPlaying = computed(() => props.file.id === files.audioState.path)
const hover = ref(false)

// Dropdown Menu
const open = ref(false)
const tr = ref()

onMounted(() => {
  onClickOutside(tr, () => open.value = false)
})
</script>

<template>
  <tr
    :id="file.id"
    ref="tr"
    :class="{ 'is-active': isPlaying, 'is-hovered': hover || open }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <td v-if="file['.tag'] === 'folder'" @click="goToFile()">
      <Icon code="e2c7" />
    </td>
    <td v-else class="is-file" @click="updateAudioState">
      <div class="icon">
        <Spinner v-if="loading.get(file.id)" />
        <template v-else-if="hover">
          <Icon :code="isPlaying ? 'e034' : 'e1c4'" />
        </template>
        <Eq v-else-if="isPlaying" />
      </div>
    </td>
    <td @click="goToFile()">
      {{ file.name }}
    </td>
    <td @click="goToFile()">
      {{ size }}
    </td>
    <td @click="goToFile()">
      {{ date }}
    </td>
    <td>
      <button v-if="file['.tag'] === 'file'" class="dropdown-button-open" @click="open = !open">
        <Icon v-show="hover" code="e5d4" />
      </button>

      <div class="dropdown" :class="{ 'is-open': open }">
        <button @click="updateAudioState">
          Play
        </button>
        <button>Open in Player</button>
        <button>Add to Queue</button>
        <button>Share Link</button>
      </div>
    </td>
  </tr>
</template>
