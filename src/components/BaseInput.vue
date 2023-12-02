<script setup lang="ts"></script>

<template>
  <input class="base_input" />
</template>

<style>
.base_input {
  appearance: none;

  width: 100%;
  height: 100%;

  border: var(--border-size) solid var(--border-color);

  &:focus {
    outline: none;
  }
}
</style>
