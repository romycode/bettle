<script setup lang="ts">
defineEmits<{
  click: []
}>()

withDefaults(
  defineProps<{
    active?: boolean
    borderless?: boolean
  }>(),
  {
    active: false,
    borderless: false
  }
)
</script>

<template>
  <li
    :class="['list__item', { 'list__item--active': active, 'borderless': borderless }]"
    @click="$emit('click')"
  >
    <slot></slot>
  </li>
</template>

<style>
.list > .list__item {
  display: flex;
  gap: var(--spacing);
  align-items: center;
  padding: 0 var(--spacing);
  border: var(--border-size) solid var(--border-color);

  &.borderless {
    border: 0;
    & {
      padding: 0;
    }
    & > .list__item__action {
      height: 100%;
    }
  }

  &.list__item--active {
    color: var(--foreground-selected-color);
    background-color: var(--background-selected-color);
  }

  & > .list__item__icon {
    display: flex;
    width: 10%;
    height: 100%;
  }
  & > .list__item__text {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: var(--spacing);
    overflow: hidden;
    overflow-x: auto;
    white-space: nowrap;
  }
  & > .list__item__action {
    display: flex;
    place-items: center;
    place-content: center;
    width: max(50px, 10%);
    height: 75%;
    padding: var(--spacing);
    border: var(--border-size) solid var(--border-color);
    > p {
      margin: 0;
      margin-block-start: 0;
      margin-block-end: 0;
    }
  }
}
</style>
