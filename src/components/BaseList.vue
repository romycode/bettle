<script setup lang="ts"></script>

<template>
  <ul class="list">
    <slot></slot>
  </ul>
</template>

<style>
.list {
  display: grid;
  gap: var(--spacing);
  grid-auto-flow: row;
  grid-auto-rows: minmax(40px, 0.05fr);
  grid-auto-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
