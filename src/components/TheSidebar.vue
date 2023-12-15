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
  grid-area: sidebar;
  display: flex;
  gap: var(--spacing);
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
}
</style>
