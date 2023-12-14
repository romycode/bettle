<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import type { Param } from '@/stores/types'
import BaseButton from '@/components/BaseButton.vue'
import BaseList from '@/components/BaseList.vue'
import BaseListItem from '@/components/BaseListItem.vue'

const props = defineProps<{
  params: Param[]
}>()

const emit = defineEmits<{
  update: [params: Param[]]
}>()

const paramsList = reactive<Param[]>([])

watch(props, (value) => {
  paramsList.splice(0)
  value.params.forEach((p) => paramsList.push(p))
})

const addParam = () => {
  paramsList.push({ name: '', val: '' })
  emit('update', paramsList)
}

const removeParam = (param: Param) => {
  for (let i = 0; i < paramsList.length; i++) {
    const element = paramsList[i]
    if (element.name === param.name && element.val === param.val) {
      paramsList.splice(i, 1)
    }
  }
  emit('update', paramsList)
}
</script>

<template>
  <div class="params">
    <div class="params__actions">
      <BaseButton class="params__actions__add" id="add-param" name="add-param" @click="addParam"
        >+</BaseButton
      >
    </div>
    <BaseList>
      <template v-for="(param, index) in paramsList" :key="index">
        <BaseListItem borderless>
          <BaseInput
            v-model.lazy="param.name"
            :id="'param-name-' + index.toString()"
            :name="'param-name-' + index.toString()"
            :label="'param-name-' + index.toString()"
          ></BaseInput>
          <BaseInput
            v-model.lazy="param.val"
            :id="'param-val-' + index.toString()"
            :name="'param-val-' + index.toString()"
            :label="'param-val-' + index.toString()"
          ></BaseInput>
          <div
            class="list__item__action red-dim"
            @click="() => removeParam({ name: param.name, val: param.val })"
          >
            x
          </div>
        </BaseListItem>
      </template>
    </BaseList>
  </div>
</template>

<style>
.params {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  width: 100%;
  height: 100%;
  & > .params__actions {
    display: flex;
  }
}
</style>
