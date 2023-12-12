<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import type { Header } from '@/stores/types'
import BaseButton from '@/components/BaseButton.vue'

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
    <div class="headers__title">
      <BaseButton class="headers__title__add" id="add-header" name="add-header" @click="addHeader">+</BaseButton>
    </div>
    <ul class="headers__list">
      <template v-for="(header, index) in headersList" :key="index">
        <li class="headers__list__item">
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
            class="delete red-dim"
            @click="() => removeHeader({ name: header.name, val: header.val })"
          >
            <p>x</p>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<style>
.headers {
  display: flex;

  gap: var(--spacing) 0;
  flex-direction: column;

  width: 100%;
  height: 100%;

  & > .headers__title {
    display: flex;

    justify-content: flex-end;

    & > .headers__title__add {
      width: 100%;
    }
  }

  & > .headers__list {
    display: grid;

    gap: var(--spacing);
    grid-auto-flow: row;
    grid-auto-rows: minmax(min-content, var(--grid-row-h));

    width: 100%;
    height: 100%;

    & > .headers__list__item {
      display: grid;

      gap: 0 var(--spacing);
      grid-template-columns: 1fr 1fr 0.1fr;
      grid-template-areas: 'name value delete';
      align-items: center;
      justify-content: center;

      & > .name {
        grid-area: name;
      }

      & > .value {
        grid-area: value;
      }

      & > .delete {
        grid-area: delete;

        justify-content: center;
        justify-items: center;
        align-items: center;

        width: 100%;
        height: 100%;

        padding: var(--spacing);
        border: var(--border-size) solid var(--border-color);

        &:hover {
          background-color: var(--red-dim);
        }

        & > p {
          text-align: center;
        }
      }
    }
  }
}
</style>
