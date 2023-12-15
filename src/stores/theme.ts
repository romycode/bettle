import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const iconColors: Record<string, string> = {
  dark: '#fbf1c7',
  light: '#a89984'
} as const

export const useTheme = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('current-theme') ?? 'dark')
  document.querySelector('#app')?.setAttribute('theme', theme.value)

  const iconColor = computed(() => iconColors[theme.value])

  async function changeTheme(value: string) {
    theme.value = value
    localStorage.setItem('current-theme', theme.value)
    document.querySelector('#app')?.setAttribute('theme', theme.value)
  }

  return {theme, iconColor, changeTheme}
})
