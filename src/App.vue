<script setup lang="ts">
import './style/index.scss'
import { onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isEmpty } from 'lodash'
import { useState } from './store/state'
import type { AuthObject } from './store/state'
import { getUrlHashQuery } from './bin/utils'
import Player from './components/Player.vue'

const router = useRouter()
const state = useState()

onBeforeMount(() => {
  state.init()
})

onMounted(() => {
  const query = getUrlHashQuery<AuthObject>()
  if (query && !isEmpty(query)) {
    state.setAuth(query)
    router.replace({ query: {} })
  }
})
</script>

<template>
  <div>
    <router-view />
    <Player />
  </div>
</template>
