<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  code: String
  size?: String
}>()

const content = computed(() => `&#x${props.code};`)
const size = computed(() => `${props.size ?? 2}rem`)
</script>

<template>
  <span :style="{ fontSize: size }" class="material-icons" v-html="content" />
</template>
