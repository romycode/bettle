import { dialog } from '@tauri-apps/api'

export const createConfirmDialog = (message: string) => {
  return dialog.confirm(message)
}

export const createMessageDialog = (message: string) => {
  return dialog.message(message)
}