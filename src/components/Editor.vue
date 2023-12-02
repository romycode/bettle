<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue'

import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'

import { dracula } from 'thememirror'

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

onMounted(() => {
  let theme = EditorView.theme(
    {
      '&': {
        maxHeight: '100%'
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

  const updater = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      updateContent(update.state.doc.toString())
    }
  })

  let startState = EditorState.create({
    doc: '',
    extensions: [
      theme,
      updater,
      dracula,
      json(),
      lineNumbers(),
      keymap.of(defaultKeymap),
      keymap.of([indentWithTab])
    ]
  })

  let view = new EditorView({
    state: startState,
    parent: document.querySelector(`#${props.id}`) as Element
  })

  const { displayText } = toRefs(props)

  watch(displayText, () => {
    if (view.state.doc.toString() !== displayText.value) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: displayText.value
        }
      })
    }
  })
})
</script>

<template>
  <div :id="id"></div>
</template>

<style>
#editor {
  width: 100%;
  height: 100%;
}
</style>
