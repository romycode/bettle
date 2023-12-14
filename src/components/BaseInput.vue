<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    name: string
    label: string
    showLabel?: boolean
    modelValue?: string
  }>(),
  {
    showLabel: false
  }
)

defineEmits<{
  update: [value: string]
  change: [value: string]
  input: [value: string]
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="input-box">
    <label class="input-box__label" :class="{ 'input-box__label--hidden': !showLabel }" :for="id">{{
      label
    }}</label>
    <input
      class="input-box__text"
      :id="id"
      :data-testid="id"
      :name="name"
      type="text"
      :value="modelValue"
      @input="
        (event) => {
          const target: HTMLInputElement = event.target as HTMLInputElement
          $emit('update:modelValue', target.value)
          $emit('input', target.value)
        }
      "
      @change="
        (event) => {
          const target: HTMLInputElement = event.target as HTMLInputElement
          $emit('change', target.value)
        }
      "
    />
  </div>
</template>

<style>
.input-box {
  display: flex;
  justify-items: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 var(--spacing);
  & > .input-box__label {
    &.input-box__label--hidden {
      color: transparent;
      font-size: 0;
      position: absolute;
      opacity: 0;
      width: 0;
    }
  }
  & > .input-box__text {
    width: 100%;
    height: 100%;
    appearance: none;
    border: none;
    color: var(--foreground-color);
    background-color: var(--background-color);
    &:focus {
      outline: none;
    }
  }
  border: var(--border-size) solid var(--border-color);
}
</style>
