<script setup lang="ts"></script>

<template>
  <ul class="list">
    <slot></slot>
  </ul>
</template>

<style>
.list {
  display: flex;
  gap: var(--spacing);
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
