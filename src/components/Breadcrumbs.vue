<script setup lang='ts'>
import { capitalize } from 'lodash'
import { computed } from 'vue'
import { useFolder } from '../store/folder'

const folder = useFolder()

const links = computed(() => folder.active.path_lower.split('/').filter(item => item))

function open(part: string) {

}
</script>

<template>
  <div class="breadcrumbs">
    <button v-for="link in links" :key="link" @click="open(link)">
      {{ capitalize(link) }}
    </button>
  </div>
</template>
