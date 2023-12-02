<script setup lang="ts">
import Editor from '@/components/Editor.vue'
import WebIcon from '@/components/icons/WebIcon.vue'
import { computed, reactive, ref, toRefs } from 'vue'
import { fetch, Response, type FetchOptions, type HttpVerb } from '@tauri-apps/api/http'
import ThemeSelector from '@/components/ThemeSelector.vue'
import BaseSelect from './components/BaseSelect.vue'
import BaseInput from './components/BaseInput.vue'

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

const isNewRequest = ref(true)

async function saveRequest() {
  isNewRequest.value = false
  currentRequestInformation['id'] = currentRequestId.value
  requests[currentRequestId.value] = JSON.parse(JSON.stringify(currentRequestInformation))

  localStorage.setItem('apps-requests', JSON.stringify(requests))
}

async function removeRequest(id: string) {
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

  const res: Response<unknown> = await fetch(url?.value as string, opts)

  const end = new Date().getTime()

  responseTime.value = end - start
  response.value = JSON.stringify(res.data, null, 2)
  responseHeaders.value = JSON.stringify(res.headers, null, 2)
}

async function updateSelectedRequest(request: RequestConfiguration) {
  isNewRequest.value = false
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
  isNewRequest.value = true
  currentRequestId.value = crypto.randomUUID()

  url.value = ''
  query.value = []
  method.value = 'get'
  headers.value = []
  body.value = ''
}
</script>

<template>
  <aside class="sidebar">
    <ThemeSelector></ThemeSelector>
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
      </li>
      <template v-for="(request, id) in requests" :key="id">
        <li
          @click="() => updateSelectedRequest(request)"
          :class="[
            'collection-item',
            {
              'collection-item--active': id === currentRequestId
            }
          ]"
        >
          <WebIcon class="icon" />
          <span class="name">{{ request.method + ' - ' + request.url }}</span>
          <div class="delete red-dim" @click="() => removeRequest(request.id)"><p>x</p></div>
        </li>
      </template>
    </ul>
  </aside>
  <main class="client">
    <section class="request-url">
      <BaseSelect
        v-model="method"
        id="request-method"
        class="method"
        name="request-method"
        :options="methodOptions"
      ></BaseSelect>
      <BaseInput
        v-model="url"
        class="url"
        id="request-url"
        name="request-url"
        label="request url"
      ></BaseInput>
      <div class="send">
        <button class="send-button" @click="send" type="submit">send</button>
      </div>
      <div class="save">
        <button class="save-button" @click="saveRequest" type="button">save</button>
      </div>
    </section>
    <section class="viewer">
      <section class="request-config">
        <div class="tabs">
          <label for="request-body" :class="{ active: activeTab === 'body' }">
            <p>body</p>
            <input
              @click="() => (activeTab = 'body')"
              class="hide"
              type="checkbox"
              name="tab"
              id="request-body"
            />
          </label>

          <label for="request-headers" :class="{ active: activeTab === 'headers' }">
            <p>headers</p>
            <input
              @click="() => (activeTab = 'headers')"
              class="hide"
              type="checkbox"
              name="tab"
              id="request-headers"
            />
          </label>

          <label for="request-query" :class="{ active: activeTab === 'query' }">
            <p>query</p>
            <input
              @click="() => (activeTab = 'query')"
              class="hide"
              type="checkbox"
              name="tab"
              id="request-query"
            />
          </label>

          <label for="request-params" :class="{ active: activeTab === 'params' }">
            <p>params</p>
            <input
              @click="() => (activeTab = 'params')"
              class="hide"
              type="checkbox"
              name="tab"
              id="request-params"
            />
          </label>
        </div>
        <div class="tab-content">
          <Editor
            class="request-body-editor"
            id="request-body-editor"
            @update="body = $event"
            :displayText="reqBody"
            v-show="activeTab === 'body'"
          ></Editor>
          <div class="request-headers" v-show="activeTab === 'headers'">
            <form @submit.prevent>
              <template v-for="(header, i) in headers" :key="i + header.name">
                <BaseInput
                  v-model="header.name"
                  id="header-name"
                  name="header-name"
                  label="header-name"
                ></BaseInput>
                <BaseInput
                  v-model="header.name"
                  id="header-val"
                  name="header-val"
                  label="header-val"
                ></BaseInput>
              </template>
              <button @click="addHeader">add</button>
            </form>
          </div>
        </div>
      </section>
      <section class="response-viewer">
        <div class="stats">
          <span class="response-code"></span>
          <span class="response-time">{{ responseTime }} ms</span>
          <span class="response-size"></span>
        </div>
        <div class="body">
          <Editor
            class="response-body-viewer"
            id="response-body-viewer"
            :display-text="bodyText"
          ></Editor>
        </div>
      </section>
    </section>
  </main>
</template>

<style>
#app {
  display: grid;

  gap: var(--spacing);
  grid-template-rows: minmax(300px, 1fr);
  grid-template-columns: minmax(50px, 0.25fr) minmax(300px, 0.75fr);
  grid-template-areas: 'sidebar client';

  width: 100%;
  height: 100%;

  padding: var(--spacing);

  color: var(--foreground-color);
  background-color: var(--background-color);

  & > .sidebar {
    display: flex;
    grid-area: sidebar;

    gap: var(--spacing);
    flex-direction: column;

    padding: var(--spacing);

    & > .collection {
      display: flex;

      gap: var(--spacing);
      flex-direction: column;

      width: 100%;
      height: 100%;

      & > .collection-item {
        display: grid;

        grid-template-rows: 1fr;
        grid-template-columns: minmax(1px, 0.1fr) minmax(1px, 1fr) minmax(1px, 0.1fr);
        grid-template-areas: 'icon name delete';
        align-items: center;

        border: var(--border-size) solid var(--border-color);

        padding: 0 var(--spacing);

        &.collection-item--active {
          background-color: var(--background-selected-color);

          & > .delete {
            color: var(--foreground-color);
            background-color: var(--background-color);
          }
        }

        & > .icon {
          grid-area: icon;
          fill: inherit !important;
        }

        & > .name {
          grid-area: name;

          padding: calc(var(--spacing) * 1.5);

          overflow-x: scroll;

          -ms-overflow-style: none;
          scrollbar-width: none;

          &::-webkit-scrollbar {
            display: none;
          }
        }

        & > .delete {
          grid-area: delete;

          justify-content: center;
          justify-self: end;

          width: 50%;
          height: 50%;

          background-color: var(--background-color);
          border: var(--border-size) solid var(--border-color);

          & > p {
            text-align: center;
          }
        }

        & > * {
          display: flex;
          align-items: center;

          white-space: nowrap;
          scroll-padding: 0;
          scroll-margin: 0;
        }
      }
    }
  }

  & > .client {
    display: grid;
    grid-area: client;

    gap: var(--spacing);
    grid-template-rows: minmax(40px, 0.05fr) minmax(200px, auto);
    grid-template-columns: minmax(300px, 1fr);
    grid-template-areas: 'request-url' 'viewer';

    & > .request-url {
      display: grid;
      grid-area: request-url;

      gap: var(--spacing);
      grid-template-rows: 1fr;
      grid-template-columns: 0.15fr 1fr 0.1fr 0.1fr;
      grid-template-areas: 'method url send save';

      & > .method {
        grid-area: method;

        height: 100%;

        & > .method-selector {
          max-height: 2.5rem;
          border-radius: var(--border-radius);
          text-align: center;
        }
      }

      & > .url {
        grid-area: url;

        & > .url__input {
          appearance: none;

          width: 100%;
          height: 100%;

          padding: var(--spacing);

          border: var(--border-size) solid var(--border-color);
        }
      }

      & > .send {
        grid-area: send;

        padding: var(--spacing) 0;

        height: 100%;

        & > .send-button {
          width: 100%;
          height: 100%;

          border: var(--border-size) solid var(--border-color);
        }
      }

      & > .save {
        grid-area: save;

        padding: var(--spacing) 0;

        height: 100%;

        & > .save-button {
          width: 100%;
          height: 100%;

          border: var(--border-size) solid var(--border-color);
        }
      }
    }

    & > .viewer {
      display: grid;
      grid-area: viewer;

      gap: var(--spacing);
      grid-template-rows: minmax(1px, 1fr);
      grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
      grid-template-areas: 'request-config response-viewer';

      & > .request-config {
        display: grid;
        grid-area: request-config;

        gap: var(--spacing);
        grid-template-rows: minmax(1px, 0.05fr) minmax(1px, 1fr);
        grid-template-areas: 'tabs' 'tab-content';

        overflow: hidden;

        & > .tabs {
          display: flex;
          grid-area: tabs;

          gap: var(--spacing);

          justify-content: stretch;

          & > label {
            display: flex;

            justify-content: center;
            align-items: center;

            width: 100%;

            border: var(--border-size) solid var(--border-color);

            &.active {
              background-color: var(--background-selected-color);
            }

            & > p {
              text-align: center;
            }
          }
        }

        & > .tab-content {
          display: flex;
          grid-area: tab-content;

          gap: var(--spacing);
          align-items: center;

          & > .request-body-editor {
            width: 100%;
            height: 100%;
          }
        }
      }

      & > .response-viewer {
        display: grid;
        grid-area: response-viewer;

        gap: var(--spacing);
        grid-template-rows: minmax(1px, 0.05fr) minmax(1px, 1fr);
        grid-template-areas: 'stats' 'body';

        & > .stats {
          display: flex;
          grid-area: stats;

          gap: var(--spacing);
          align-items: center;
        }

        & > .body {
          display: grid;
          grid-area: body;

          grid-template-rows: 1fr;
          grid-template-columns: 1fr;
          grid-template-areas: 'body';

          & > .response-body-viewer {
            overflow-x: scroll;
          }
        }
      }
    }
  }
}
</style>
