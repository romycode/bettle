<script setup lang="ts">
import { useTheme } from '@/stores/theme'
import { computed } from 'vue'
import BaseSelect from '@/components/BaseSelect.vue'

// Static data
const themeOptions = ['dark', 'light']

// Stores
const theme = useTheme()

// Dynamic data
const value = computed({
  get: () => theme.theme,
  set: (value) => {
    theme.changeTheme(value)
  }
})
</script>

<template>
  <BaseSelect v-model="value" id="theme-selector" name="theme-selector" :options="themeOptions" />
</template>

<style></style>
