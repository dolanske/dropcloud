<script setup lang='ts'>
import { capitalize } from 'lodash'
import { computed } from 'vue'
import { useFile } from '../store/file'
import { useFolder } from '../store/folder'

const folder = useFolder()
const file = useFile()

const links = computed(() => folder.active?.path_lower?.split('/')?.filter(item => item) ?? [])

function open(part: string) {

}
</script>

<template>
  <div v-if="folder.active" class="breadcrumbs">
    <button v-for="link in links" :key="link" @click="open(link)">
      {{ capitalize(link) }}
    </button>

    <!-- <div class="flex-1" />

    <p>{{ file.files.length }} Files</p> -->
  </div>
</template>
