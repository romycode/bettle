<script setup lang="ts">
import ThemeSelector from '@/components/ThemeSelector.vue'
</script>

<template>
  <aside class="sidebar">
    <ThemeSelector></ThemeSelector>
    <slot></slot>
  </aside>
</template>

<style>
.sidebar {
  display: grid;
  grid-area: sidebar;
  gap: var(--spacing);
  grid-auto-flow: row;
  grid-auto-rows: minmax(var(--grid-slim-row-min-h), var(--grid-slim-row-h)) auto;
  grid-auto-columns: 1fr;
}
</style>
