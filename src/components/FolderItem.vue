<script setup lang='ts'>
import { computed, watch, watchEffect } from 'vue'
import { isObject } from 'lodash'
import { useFolder } from '../store/folder'
const props = defineProps<{ values: string | Record<string, any>; label: string }>()

const folder = useFolder()
const data = computed(() => folder.getFolderData(props.label))
const active = computed(() => data.value.id === folder.active.id)
</script>

<template>
  <li :class="{ 'is-active': active }">
    <button @click="folder.open(data.id)">
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
