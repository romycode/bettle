<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'

import { smoothy as lightTheme, boysAndGirls as darkTheme } from 'thememirror'
import { useTheme } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const { theme } = storeToRefs(useTheme())

const props = defineProps<{
  id: string
  displayText?: string
}>()

const emits = defineEmits<{
  update: [value: string]
}>()

const content = ref('')

const updateContent = (value: string) => {
  content.value = value
  emits('update', value)
}

const { displayText } = toRefs(props)

onMounted(() => {
  let mytheme = EditorView.theme(
    {
      '&': {
        maxHeight: '100%',
        fontFamily: 'Geis Mono !important',
        fontSize: '19px !important'
      },
      '&.cm-gutter, &.cm-content': {
        minHeight: '100px'
      },
      '&.cm-gutterElement': {
        padingLeft: '0'
      },
      '&.cm-scroller': {
        overflow: 'scroll',
        maxHeight: '100%'
      },
      '&.cm-editor': {
        height: '100%'
      }
    },
    {
      dark: true
    }
  )

  const themeSwitcher = new Compartment()

  const updater = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      updateContent(update.state.doc.toString())
    }
  })

  const { lineWrapping } = EditorView

  let startState = EditorState.create({
    doc: '',
    extensions: [
      mytheme,
      updater,
      json(),
      lineNumbers(),
      lineWrapping,
      keymap.of(defaultKeymap),
      keymap.of([indentWithTab]),
      themeSwitcher.of(darkTheme)
    ]
  })

  let view = new EditorView({
    state: startState,
    parent: document.querySelector(`#${props.id}`) as Element
  })

  watch(displayText, (value, oldValue) => {
    if (value !== oldValue) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: displayText.value
        }
      })
    }
  })

  watch(theme, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      view.dispatch({
        effects: themeSwitcher.reconfigure(newValue === 'light' ? lightTheme : darkTheme)
      })
    }
  })
})
</script>

<template>
  <div :id="id" class="editor"></div>
</template>

<style>
.editor {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
