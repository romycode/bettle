<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import type { Query } from '@/stores/types'
import BaseButton from '@/components/BaseButton.vue'
import BaseList from '@/components/BaseList.vue'
import BaseListItem from '@/components/BaseListItem.vue'

const props = defineProps<{
  queries: Query[]
}>()

const emit = defineEmits<{
  update: [queries: Query[]]
}>()

const queriesList = reactive<Query[]>([])

watch(props, (value) => {
  queriesList.splice(0)
  value.queries.forEach((p) => queriesList.push(p))
})

const addQuery = () => {
  queriesList.push({ name: '', val: '' })
  emit('update', queriesList)
}

const removeQuery = (query: Query) => {
  for (let i = 0; i < queriesList.length; i++) {
    const element = queriesList[i]
    if (element.name === query.name && element.val === query.val) {
      queriesList.splice(i, 1)
    }
  }
  emit('update', queriesList)
}
</script>

<template>
  <div class="queries">
    <div class="queries__actions">
      <BaseButton class="queries__actions__add" id="add-query" name="add-query" @click="addQuery"
        >+</BaseButton
      >
    </div>
    <BaseList>
      <template v-for="(query, index) in queriesList" :key="index">
        <BaseListItem borderless>
          <BaseInput
            v-model.lazy="query.name"
            :id="'query-name-' + index.toString()"
            :name="'query-name-' + index.toString()"
            :label="'query-name-' + index.toString()"
          ></BaseInput>
          <BaseInput
            v-model.lazy="query.val"
            :id="'query-val-' + index.toString()"
            :name="'query-val-' + index.toString()"
            :label="'query-val-' + index.toString()"
          ></BaseInput>
          <div
            class="list__item__action red-dim"
            @click="() => removeQuery({ name: query.name, val: query.val })"
          >
            x
          </div>
        </BaseListItem>
      </template>
    </BaseList>
  </div>
</template>

<style>
.queries {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  width: 100%;
  height: 100%;
  & > .queries__actions {
    display: flex;
  }
}
</style>
