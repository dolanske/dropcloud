<script setup lang='ts'>

</script>

<template>
  <aside id="navigation">
    <ul>
      <li>
        <router-link :to="{ name: 'RouteFolder' }">
          <Icon code="e03d" size="2.4" />
          <strong>Library</strong>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RoutePlayer' }">
          <Icon code="e03e" size="2.4" />
          <strong>Player</strong>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RouteTracklist' }">
          <Icon code="e8de" size="2.4" />
          <strong>Tracklist</strong>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RouteSearch' }">
          <Icon code="f02f" size="2.4" />
          <strong>Search</strong>
        </router-link>
      </li>
    </ul>
  </aside>
</template>
