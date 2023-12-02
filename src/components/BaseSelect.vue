<script setup lang="ts">
defineProps<{
  modelValue: string
}>()
</script>

<template>
  <div class="select-wrapper">
    <select
      class="select"
      name="select-label-01"
      id="select-label-01"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target?.value)"
    >
      <slot></slot>
    </select>
    <label class="hide" for="select-label-01">request method</label>
  </div>
</template>

<style>
.select-wrapper {
  position: relative;
  min-height: 2.5rem;

  & > .select {
    width: 100%;
    height: 100%;

    padding: 0 var(--spacing);

    text-transform: uppercase;

    & > option {
      padding: var(--spacing);
    }
  }

  &::before,
  &::after {
    --size: 0.3rem;
    --y-size: 0.4rem;
    position: absolute;
    content: '';
    right: 0.75rem;
    pointer-events: none;
  }

  &::before {
    border-left: var(--size) solid transparent;
    border-right: var(--size) solid transparent;
    border-bottom: var(--size) solid var(--foreground-color);
    top: calc(50% - var(--y-size));
  }

  &::after {
    border-left: var(--size) solid transparent;
    border-right: var(--size) solid transparent;
    border-top: var(--size) solid var(--foreground-color);
    bottom: calc(50% - var(--y-size));
  }
}
</style>
