<script setup lang='ts'>
import { computed } from 'vue'
import { isObject } from 'lodash'
import { useFolder } from '../store/folder'
import { useFile } from '../store/file'
import { formatPathWithoutName } from '../bin/utils'
import Eq from './global/Eq.vue'
// FIXME: re-enable once importing types works in vue3
// import type { DbxStructure } from '../types/dropbox-types'

const props = defineProps<{ values: string | Record<string, string | {}>; label: string }>()

const folder = useFolder()
const file = useFile()

const data = computed(() => folder.getFolderData(props.label))
const active = computed(() => data.value?.id === folder.active.id)

const isPlayed = computed(() => {
  const path = file.audioState?.file?.path_lower

  if (!path)
    return

  // Split audio path by '/', remove the last item which is the name of the file and compare it the the folder's full path
  const folderMinusFile = formatPathWithoutName(path)

  // If they match, the active file is within this folder
  return folderMinusFile === data.value?.path_lower
})

function openFolder() {
  if (data.value)
    folder.open(data.value.id)
}
</script>

<template>
  <li v-if="data" :class="{ 'is-active': active, 'is-played': isPlayed }">
    <button @click="openFolder">
      <Icon v-if="active" code="e2c8" />
      <Icon v-else code="e2c7" />
      {{ data.name }}
      <Eq v-if="isPlayed" />
    </button>
  </li>
  <li v-if="isObject(values)" class="folder-li">
    <ul>
      <FolderItem v-for="(item, key) in values" :key="key" :label="key" :values="item" />
    </ul>
  </li>
</template>
