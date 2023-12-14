import { defineStore } from 'pinia'

const iconColors: Record<string, string> = {
  dark: '#fbf1c7',
  light: '#a89984'
} as const

export const useTheme = defineStore('theme', {
  state: () => ({ theme: 'dark' }),
  actions: {
    changeTheme(theme: string) {
      this.theme = theme
      document.querySelector('#app')?.setAttribute('theme', theme)
    }
  },
  getters: {
    iconColor(state) {
      return iconColors[state.theme]
    }
  }
})
