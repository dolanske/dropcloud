<script setup lang="ts">
import { useFile } from '../../store/file'
const file = useFile()
</script>

<template>
  <div class="eq-icon">
    <span :style="{ animationPlayState: file.audioState.playing ? 'running' : 'paused' }" />
    <span :style="{ animationPlayState: file.audioState.playing ? 'running' : 'paused' }" />
    <span :style="{ animationPlayState: file.audioState.playing ? 'running' : 'paused' }" />
  </div>
</template>

<style lang="scss" scoped>
@import "../../style/setup/_variables.scss";

.eq-icon {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 13px;
  height: 13px;

  @keyframes bounce {
    10% {
      transform: scaleY(0.3); /* start by scaling to 30% */
    }

    30% {
      transform: scaleY(1); /* scale up to 100% */
    }

    60% {
      transform: scaleY(0.5); /* scale down to 50% */
    }

    80% {
      transform: scaleY(0.75); /* scale up to 75% */
    }

    100% {
      transform: scaleY(0.6); /* scale down to 60% */
    }
  }

  span {
    width: 3px;
    height: 100%;
    background-color: var(--color-primary);
    animation: bounce 2.6s ease infinite alternate;
    transform-origin: bottom;

      &:nth-of-type(2) {
      animation-delay: -2.4s; /* Start at the end of animation */
    }

    &:nth-of-type(3) {
      animation-delay: -3.9s; /* Start mid-way of return of animation */
    }
  }
}
</style>
