<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'

import { boysAndGirls as darkTheme, smoothy as lightTheme } from 'thememirror'
import { useTheme } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const { theme } = storeToRefs(useTheme())

const props = withDefaults(
  defineProps<{
  id: string
  readonly?: boolean
  displayText?: string
  }>(),
  {
    readonly: false,
    displayText: ''
  }
)

const emits = defineEmits<{
  update: [value: string]
}>()

const content = ref('')

const updateContent = (value: string) => {
  content.value = value
  emits('update', value)
}

const { displayText } = toRefs(props)
content.value = displayText.value

onMounted(() => {
  let mytheme = EditorView.theme(
    {
      '&': {
        overflow: 'auto',
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
        overflow: 'auto',
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
  const { readOnly } = EditorState

  let startState = EditorState.create({
    doc: content.value,
    extensions: [
      mytheme,
      updater,
      json(),
      lineNumbers(),
      lineWrapping,
      readOnly.of(props.readonly),
      keymap.of(defaultKeymap),
      keymap.of([indentWithTab]),
      themeSwitcher.of(theme.value === 'light' ? lightTheme : darkTheme)
    ]
  })

  let view = new EditorView({
    state: startState,
    parent: document.querySelector(`#${props.id}`) as Element
  })

  watch(displayText, (value, oldValue) => {
    if (view.state.doc.toString() !== value && value !== oldValue) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        }
      })
    }
  })

  watch(theme, (value) => {
    view.dispatch({
      effects: themeSwitcher.reconfigure(value === 'light' ? lightTheme : darkTheme)
    })
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
  overflow-y: auto;
}
</style>
