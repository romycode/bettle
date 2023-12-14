<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  id: string
  label: string
  value: string
  modelValue?: string
}>()
const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()

const val = ref('')
val.value = props.value

const checked = computed(() => val.value === props.modelValue)

function change(event: Event): void {
  const target = event.target as HTMLInputElement
  val.value = target.value
  emits('update:modelValue', target.value)
}
</script>

<template>
  <div :class="['radio-box', {'radio-box--checked': checked}]">
    <label class="radio-box__label" :for="id">
      {{ label }}
    </label>
    <input
      class="radio-box__input"
      type="radio"
      :id="id"
      :name="id"
      :checked="checked"
      :value="val"
      @change="change"
    />
  </div>
</template>

<style>
.radio-box {
  display: flex;
  justify-items: stretch;
  align-items: stretch;
  padding: 0 var(--spacing);

  &.radio-box--checked {
    color: var(--foreground-selected-color);
    background-color: var(--background-selected-color);
  }

  & > .radio-box__label {
    display: flex;
    align-items: center;
  }

  & > .radio-box__input {
    display: none;
  }

  border: var(--border-size) solid var(--border-color);
}
</style>
