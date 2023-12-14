<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import type { Header } from '@/stores/types'
import BaseButton from '@/components/BaseButton.vue'
import BaseList from '@/components/BaseList.vue'
import BaseListItem from '@/components/BaseListItem.vue'

const props = defineProps<{
  headers: Header[]
}>()

const emit = defineEmits<{
  update: [headers: Header[]]
}>()

const headersList = reactive<Header[]>([])

watch(props, (value) => {
  headersList.splice(0)
  value.headers.forEach((h) => headersList.push(h))
})

const addHeader = () => {
  headersList.push({ name: '', val: '' })

  emit('update', headersList)
}

const removeHeader = (header: Header) => {
  for (let i = 0; i < headersList.length; i++) {
    const element = headersList[i]
    if (element.name === header.name && element.val === header.val) {
      headersList.splice(i, 1)
    }
  }
  emit('update', headersList)
}
</script>

<template>
  <div class="headers">
    <div class="headers__actions">
      <BaseButton class="headers__actions__add" id="add-header" name="add-header" @click="addHeader"
        >+</BaseButton
      >
    </div>
    <BaseList>
      <template v-for="(header, index) in headersList" :key="index">
        <BaseListItem borderless>
          <BaseInput
            v-model.lazy="header.name"
            :id="'header-name-' + index.toString()"
            class="name"
            :name="'header-name-' + index.toString()"
            :label="'header-name-' + index.toString()"
          ></BaseInput>
          <BaseInput
            v-model.lazy="header.val"
            :id="'header-val-' + index.toString()"
            class="value"
            :name="'header-val-' + index.toString()"
            :label="'header-val-' + index.toString()"
          ></BaseInput>
          <div
            class="list__item__action red-dim"
            @click="() => removeHeader({ name: header.name, val: header.val })"
          >
            x
          </div>
        </BaseListItem>
      </template>
    </BaseList>
  </div>
</template>

<style>
.headers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  width: 100%;
  height: 100%;
  & > .headers__actions {
    display: flex;
  }
}
</style>
