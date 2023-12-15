<script setup lang="ts">
import { ref } from 'vue'
import BaseRadio from '@/components/BaseRadio.vue'
const props = defineProps<{
  tabs: { name: string; val: string }[]
  default: string
}>()
const activeTab = ref(props.default)
</script>

<template>
  <div class="tabs-box">
    <div class="tabs-box__tabs">
      <template v-for="(tab, index) in tabs" :key="index">
        <BaseRadio
          :id="`${tab.val}-${index}`"
          :name="`${tab.val}-${index}`"
          :label="tab.name"
          :value="tab.val"
          v-model="activeTab"
        ></BaseRadio>
      </template>
    </div>
    <div class="tabs-box__content">
      <slot name="content" :active="activeTab"></slot>
    </div>
  </div>
</template>

<style>
.tabs-box {
  display: grid;
  gap: var(--spacing);
  grid-template-areas: 'tabs' 'content';
  grid-template-rows: minmax(40px, 0.05fr) minmax(max-content, 1fr);
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
  & > .tabs-box__tabs {
    grid-area: tabs;
    display: flex;
    gap: var(--spacing);
  }
  & > .tabs-box__content {
    grid-area: content;
    width: 100%;
    height: 100%;
  }
}
</style>
