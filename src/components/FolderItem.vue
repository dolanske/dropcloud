<script setup lang='ts'>
import { computed, watch, watchEffect } from 'vue'
import { isObject } from 'lodash'
import { useFolder } from '../store/folder'
// FIXME: re-enable once importing types works in vue3
// import type { DbxStructure } from '../types/dropbox-types'

const props = defineProps<{ values: string | Record<string, string | {}>; label: string }>()

const folder = useFolder()
const data = computed(() => folder.getFolderData(props.label))
const active = computed(() => data.value?.id === folder.active.id)

function openFolder() {
  if (data.value)
    folder.open(data.value.id)
}
</script>

<template>
  <li v-if="data" :class="{ 'is-active': active }">
    <button @click="openFolder">
      <Icon v-if="active" code="e2c8" />
      <Icon v-else code="e2c7" />
      {{ data.name }}
    </button>
  </li>
  <li v-if="isObject(values)" class="folder-li">
    <ul>
      <FolderItem v-for="(item, key) in values" :key="key" :label="key" :values="item" />
    </ul>
  </li>
</template>
