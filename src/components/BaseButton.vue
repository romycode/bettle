<script setup lang="ts">
defineProps<{
  id: string
  name: string
}>()
</script>

<template>
  <div class="button-box">
    <button
      class="button-box__button"
      :id="id"
      :data-testid="id"
      :name="name"
      type="button"
      role="button"
      @click="$emit('click')"
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

    &:focus {
      outline: none;
    }
  }
}
</style>
