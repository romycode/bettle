<script setup lang="ts">
import { computed, onMounted, reactive, toRefs } from 'vue'
import Sidebar from './components/TheSidebar.vue'
import WebIcon from './components/icons/WebIcon.vue'
import ContentView from './components/ContentView.vue'
import type { RequestConfiguration } from '@/stores/types'
import BaseList from '@/components/BaseList.vue'
import BaseListItem from '@/components/BaseListItem.vue'

let requests = reactive<Record<string, RequestConfiguration>>({})

onMounted(() => {
  const saved: string | null = localStorage.getItem('apps-requests')
  if (saved === null) {
    return
  }
  const savedRequests: Record<string, RequestConfiguration> = JSON.parse(saved)
  for (const id in savedRequests) {
    requests[id] = { ...savedRequests[id] }
  }
})

const currentRequestId = computed(() => currentRequestInformation.id)
const currentRequestInformation = reactive<RequestConfiguration>({
  id: crypto.randomUUID(),
  url: '',
  method: 'get',
  body: '',
  query: [],
  params: [],
  headers: []
})

const { id, method, url, body, query, headers, params } = toRefs(currentRequestInformation)
id.value = currentRequestId.value

async function saveRequest() {
  requests[id.value] = {
    id: id.value,
    method: method.value,
    url: url.value,
    body: body.value,
    query: query.value,
    params: params.value,
    headers: headers.value,
  }

  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

async function removeRequest(removeId: string) {
  if (currentRequestId.value === removeId) {
    await resetCurrentRequest()
  }

  delete requests[removeId]
  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

const isNewRequest = computed<boolean>(() => !Object.keys(requests).includes(currentRequestId.value))

async function updateSelectedRequest(request: RequestConfiguration) {
  id.value = request.id
  url.value = request.url
  query.value = request.query
  params.value = request.params
  method.value = request.method
  headers.value = request.headers
  body.value = request.body
}

async function newRequest() {
  id.value = crypto.randomUUID()
  url.value = ''
  query.value = []
  method.value = 'get'
  params.value = []
  headers.value = []
  body.value = ''
}

async function resetCurrentRequest() {
  url.value = ''
  query.value = []
  params.value = []
  method.value = 'get'
  headers.value = []
  body.value = ''
}
</script>

<template>
  <Sidebar>
    <BaseList>
      <BaseListItem @click="newRequest" :active="isNewRequest">
        <WebIcon class="list__item__icon" />
        <span class="list__item__text">new request</span>
        <div class="list__item__action red-dim" @click="resetCurrentRequest"><p>c</p></div>
      </BaseListItem>
      <template v-for="request in requests" :key="request.id">
        <BaseListItem
          @click="() => updateSelectedRequest(request)"
          :active="request.id === currentRequestId"
        >
          <WebIcon class="list__item__icon" />
          <span class="list__item__text">{{ request.method + ' - ' + request.url }}</span>
          <div class="list__item__action red-dim" @click="() => removeRequest(request.id)">
            <p>x</p>
          </div>
        </BaseListItem>
      </template>
    </BaseList>
  </Sidebar>
  <ContentView
    :requests="requests"
    :request="currentRequestInformation"
    :is-new="isNewRequest"
    @save-request="saveRequest"
  ></ContentView>
</template>

<style>
#app {
  display: grid;
  gap: var(--spacing);
  grid-template-areas: 'sidebar main';
  grid-template-rows: 1fr;
  grid-template-columns:
    minmax(200px, 0.3fr)
    minmax(min-content, 1fr);
  width: 100%;
  height: 100%;
  padding: var(--spacing);
  color: var(--foreground-color);
  background-color: var(--background-color);
}
</style>
