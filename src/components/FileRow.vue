<script setup lang='ts'>
import { useDateFormat } from '@vueuse/shared'
import { computed } from 'vue'
import { formatFileSize } from '../bin/utils'
import { useFile } from '../store/file'
import { useFolder } from '../store/folder'
import { useLoading } from '../store/loading'
import type { DbxFile, DbxFolder } from '../types/dropbox-types'

import Spinner from './global/Spinner.vue'

const props = defineProps<{
  file: DbxFolder | DbxFile
}>()

// import { post } from '../bin/fetch'

const loading = useLoading()
const files = useFile()
const folder = useFolder()
const date = props.file['.tag'] === 'file' ? useDateFormat(props.file?.client_modified, 'DD/MM YYYY') : ''

//
const size = computed(() => {
  if (props.file['.tag'] === 'file')
    return formatFileSize(props.file.size, 2)

  return `${folder.getItemAmountInPath(props.file.path_lower)} `
})

async function updateAudioState() {
  await files.dwFile(props.file.id)
  files.updateAudioState(props.file.id)
}

function goToFile() {
  if (props.file['.tag'] === 'folder')
    folder.open(props.file.id)
}
</script>

<template>
  <tr>
    <td v-if="file['.tag'] === 'folder'" @click="goToFile()">
      <Icon code="e2c7" />
    </td>
    <td v-else class="is-file" @click="updateAudioState">
      <Spinner v-if="loading.get(file.id)" />
      <Icon v-else :code="file.id === files.audioState.path && files.audioState.playing ? 'e034' : 'e1c4'" />
      <!-- <Icon v-else code="e1c4" /> -->
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
    <!-- <pre>
      {{ file }}
     </pre>
    <hr>
    <pre>
      {{ metadata }}
     </pre> -->
  </tr>
</template>
