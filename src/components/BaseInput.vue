<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    name: string
    label: string
    showLabel?: boolean
    modelValue: string
  }>(),
  {
    showLabel: false
  }
)

defineEmits<{
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
      @input="$emit('update:modelValue', $event.target?.value)"
    />
  </div>
</template>

<style>
.input-box {
  display: flex;

  justify-items: center;
  align-items: center;

  width: 100%;

  padding: 0 var(--spacing);

  & > .input-box__label {
    &.input-box__label--hidden {
      color: transparent;
      font: 0;
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

    &:focus {
      outline: none;
    }
  }

  border: var(--border-size) solid var(--border-color);
}
</style>
