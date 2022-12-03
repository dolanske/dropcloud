<script setup lang='ts'>
import { computed } from 'vue'

const props = withDefaults(defineProps<{ width?: number; full?: boolean }>(), {
  width: 336,
})

const w = computed(() => props.full ? '100%' : `${props.width}px`)
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar-value" />
  </div>
</template>

<style scoped lang="scss">
@import "../../style/setup/variables";

.progress-bar {
  height: 6px;
  background-color: var(--color-bg);
  width: v-bind('w');
  overflow: hidden;
}

.progress-bar-value {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  animation: indeterminateAnimation 0.5s infinite linear;
  transform-origin: 0% 50%;
}

@keyframes indeterminateAnimation {
  0% {
    transform:  translateX(0) scaleX(0);
  }
  40% {
    transform:  translateX(0) scaleX(0.4);
  }
  100% {
    transform:  translateX(100%) scaleX(0.5);
  }
}
</style>
