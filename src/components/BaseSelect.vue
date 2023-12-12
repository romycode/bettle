<script setup lang="ts">
defineProps<{
  id: string
  name: string
  options: Array<string>
  modelValue: string
}>()

const emits = defineEmits<{
  change: [value: string]
  'update:modelValue': [value: string]
}>()

function change(event: Event) {
  const target: HTMLInputElement = event.target as HTMLInputElement
  emits('update:modelValue', target.value)
  emits('change', target.value)
}
</script>

<template>
  <div class="select-box">
    <label class="select-box__label" :for="id"></label>
    <select
      class="select-box__select"
      :id="id"
      :data-testid="id"
      :name="name"
      :value="modelValue"
      @change="change"
    >
      <template v-for="(option, i) in options" :key="i">
        <option
          class="select-box__select__option"
          :value="option"
          :selected="modelValue === option"
        >
          {{ option }}
        </option>
      </template>
    </select>
    <label class="hide" for="select-label-01">request method</label>
  </div>
</template>

<style>
.select-box {
  display: flex;
  width: 100%;

  position: relative;

  padding: var(--spacing) 0;
  border: var(--border-size) solid var(--border-color);

  & > .select-box__select {
    width: 100%;
    height: 100%;

    border: none;
    padding: 0 0 0 var(--spacing);

    text-transform: uppercase;

    & > .select-box__select__option {
      padding: var(--spacing);
    }
  }

  &::before,
  &::after {
    --size: 0.3rem;
    --size-y: 0.4rem;
    position: absolute;
    content: '';
    right: 0.75rem;
    pointer-events: none;
  }

  &::before {
    border-left: var(--size) solid transparent;
    border-right: var(--size) solid transparent;
    border-bottom: var(--size) solid var(--foreground-color);
    top: calc(50% - var(--size-y));
  }

  &::after {
    border-left: var(--size) solid transparent;
    border-right: var(--size) solid transparent;
    border-top: var(--size) solid var(--foreground-color);
    bottom: calc(50% - var(--size-y));
  }
}
</style>
