<script setup lang="ts">
defineProps<{
  id: string
  name: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="button-box">
    <button
      :id="id"
      class="button-box__button"
      :data-testid="id"
      :name="name"
      type="button"
      role="button"
      @click.prevent="$emit('click')"
    >
      <slot></slot>
    </button>
  </div>
</template>

<style>
.button-box {
  display: flex;

  justify-content: center;
  align-content: center;

  width: 100%;

  border: var(--border-size) solid var(--border-color);

  transition: background-color 150ms ease-out;

  &:hover {
    background-color: var(--green-dim);
    border: var(--border-size) solid var(--green-dim);
  }

  & > .button-box__button {
    width: 100%;

    appearance: none;
    border: none;

    background-color: transparent;

    &:focus {
      outline: none;
    }
  }
}
</style>
