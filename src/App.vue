<script setup lang="ts">
import { computed, reactive, ref, toRefs } from 'vue'
import { fetch, Response, type FetchOptions, type HttpVerb } from '@tauri-apps/api/http'
import Sidebar from './components/Sidebar.vue'
import WebIcon from './components/icons/WebIcon.vue'
import Content from './components/Content.vue'

// component internal types
type Header = { name: string; val: string }
type Query = { name: string; val: string }

type RequestConfiguration = {
  id: string
  url: string
  method: string
  body: string
  query: Array<Query>
  headers: Array<Header>
}

// static data
const methodOptions = [
  'get',
  'put',
  'post',
  'patch',
  'delete',
  'options',
  'head',
  'connect',
  'trace'
]

const requests = reactive<Record<string, RequestConfiguration>>(
  JSON.parse(localStorage.getItem('apps-requests') ?? '{}')
)

const currentRequestId = ref<string>(crypto.randomUUID())

const currentRequestInformation = reactive<RequestConfiguration>({
  id: '',
  url: '',
  method: 'get',
  body: '',
  query: [],
  headers: []
})

const { method, url, body, query, headers } = toRefs(currentRequestInformation)

const reqBody = computed(() => body.value)

const isNewRequest = computed<boolean>(
  () => !Object.keys(requests).includes(currentRequestId.value)
)

async function saveRequest() {
  currentRequestInformation['id'] = currentRequestId.value
  requests[currentRequestId.value] = JSON.parse(JSON.stringify(currentRequestInformation))

  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

async function removeRequest(id: string) {
  if (currentRequestId.value === id) {
    resetCurrentRequest()
  }

  delete requests[id]
  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

let response = ref('')
let responseTime = ref(0)
let responseHeaders = ref('')

const bodyText = computed(
  () => 'Headers:\n' + responseHeaders.value + '\n\nBody:\n' + response.value
)

async function send() {
  const start = new Date().getTime()

  const opts: FetchOptions = { method: method?.value as HttpVerb }

  if (
    method?.value &&
    method?.value.toLowerCase() !== 'get' &&
    method?.value.toLowerCase() !== 'get'
  ) {
    opts.body = {
      type: 'Json',
      payload: body?.value
    }
  }

  try {
    const res: Response<unknown> = await fetch(url?.value as string, opts)

    response.value = JSON.stringify(res.data, null, 2)
    responseHeaders.value = JSON.stringify(res.headers, null, 2)
  } catch (e) {
    // TODO: show in the UI the errors
  } finally {
    const end = new Date().getTime()
    responseTime.value = end - start
  }
}

async function updateSelectedRequest(request: RequestConfiguration) {
  if (!isNewRequest.value) {
    saveRequest()
  }

  currentRequestId.value = request.id

  url.value = request.url
  query.value = request.query
  method.value = request.method
  headers.value = request.headers
  body.value = request.body
}

const requestBodyHeaders = ref(false)
const requestBodyTab = ref(false)
const requestQueryTab = ref(false)
const requestParamsTab = ref(false)

const activeTab = computed({
  get: () => {
    if (requestBodyHeaders.value) {
      return 'headers'
    }
    if (requestQueryTab.value) {
      return 'query'
    }
    if (requestParamsTab.value) {
      return 'params'
    }

    return 'body'
  },
  set: (value: string) => {
    if (value === 'headers') {
      requestBodyHeaders.value = true
      requestBodyTab.value = false
      requestQueryTab.value = false
      requestParamsTab.value = false
      return
    }

    if (value === 'query') {
      requestBodyHeaders.value = false
      requestBodyTab.value = false
      requestQueryTab.value = true
      requestParamsTab.value = false
      return
    }

    if (value === 'params') {
      requestBodyHeaders.value = false
      requestBodyTab.value = false
      requestQueryTab.value = false
      requestParamsTab.value = true
      return
    }

    requestBodyHeaders.value = false
    requestBodyTab.value = true
    requestQueryTab.value = false
    requestParamsTab.value = false
  }
})

async function addHeader() {
  headers.value.push({ name: '', val: '' })
}

async function newRequest() {
  currentRequestId.value = crypto.randomUUID()

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
  <Content :requests="requests" :request="currentRequestInformation"></Content>
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
