<script setup lang="ts">
import { useTheme } from '@/stores/theme'
import { computed } from 'vue'
import BaseSelect from '@/components/BaseSelect.vue'

const theme = useTheme()

const value = computed({
  get: () => theme.theme,
  set: (value) => {
    theme.changeTheme(value)
  }
})
</script>

<template>
  <BaseSelect v-model="value">
    <option value="dark">dark</option>
    <option value="light">light</option>
  </BaseSelect>
</template>

<style></style>
