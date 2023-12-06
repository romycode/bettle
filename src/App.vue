<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRefs } from 'vue'
import Sidebar from './components/Sidebar.vue'
import WebIcon from './components/icons/WebIcon.vue'
import ContentView from './components/ContentView.vue'
import type { RequestConfiguration } from '@/stores/types'

let requests = reactive<Record<string, RequestConfiguration>>({})

onMounted(() => {
  const saved = localStorage.getItem('apps-requests')

  if (saved !== null) {
    const savedRequests: Record<string, RequestConfiguration> = JSON.parse(saved)

    for (const id in savedRequests) {
      requests[id] = savedRequests[id]
    }
  }
})

const currentRequestId = computed(() => currentRequestInformation.id)

const currentRequestInformation = reactive<RequestConfiguration>({
  id: crypto.randomUUID(),
  url: '',
  method: 'get',
  body: '',
  query: [],
  headers: []
})

const { id, method, url, body, query, headers } = toRefs(currentRequestInformation)
id.value = currentRequestId.value

async function saveRequest() {
  requests[id.value] = {
    id: id.value,
    method: method.value,
    url: url.value,
    body: body.value,
    query: query.value,
    headers: headers.value
  }

  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

async function removeRequest(removeId: string) {
  if (currentRequestId.value === removeId) {
    resetCurrentRequest()
  }

  delete requests[removeId]
  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

const isNewRequest = computed<boolean>(
  () => !Object.keys(requests).includes(currentRequestId.value)
)

async function updateSelectedRequest(request: RequestConfiguration) {
  id.value = request.id
  url.value = request.url
  query.value = request.query
  method.value = request.method
  headers.value = request.headers
  body.value = request.body
}

async function newRequest() {
  id.value = crypto.randomUUID()
  url.value = ''
  query.value = []
  method.value = 'get'
  headers.value = []
  body.value = ''
}

async function resetCurrentRequest() {
  url.value = ''
  query.value = []
  method.value = 'get'
  headers.value = []
  body.value = ''
}
</script>

<template>
  <Sidebar>
    <ul class="collection">
      <li
        @click="newRequest"
        :class="[
          'collection-item',
          {
            'collection-item--active': isNewRequest
          }
        ]"
      >
        <WebIcon class="icon" />
        <span class="name">new request</span>
        <div class="delete red-dim" @click="resetCurrentRequest"><p>c</p></div>
      </li>
      <template v-for="(request, id) in requests" :key="id">
        <li
          @click="() => updateSelectedRequest(request)"
          :class="[
            'collection-item',
            {
              'collection-item--active': request.id === currentRequestId
            }
          ]"
        >
          <WebIcon class="icon" />
          <span class="name">{{ request.method + ' - ' + request.url }}</span>
          <div class="delete red-dim" @click="() => removeRequest(request.id)"><p>x</p></div>
        </li>
      </template>
    </ul>
  </Sidebar>
  <ContentView
    :requests="requests"
    :request="currentRequestInformation"
    @save-request="saveRequest"
  ></ContentView>
</template>

<style>
#app {
  display: grid;

  gap: var(--spacing);
  grid-template-areas: 'sidebar content';
  grid-template-rows: minmax(var(--bt-min-h), var(--bt-h));
  grid-template-columns:
    minmax(var(--bt-sb-min-w), var(--bt-sb-w))
    minmax(var(--bt-cnt-min-w), var(--bt-cnt-w));

  width: 100%;
  height: 100%;
  min-width: calc(var(--bt-sb-min-w) + var(--bt-cnt-min-w));

  padding: var(--spacing);

  color: var(--foreground-color);
  background-color: var(--background-color);
}
</style>
