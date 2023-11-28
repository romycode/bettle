<script setup lang="ts">
import GraphIcon from '@/components/GraphIcon.vue'
import WebIcon from './components/WebIcon.vue'
import { computed, reactive, ref, toRefs } from 'vue'
import { fetch, Response, type FetchOptions, type HttpVerb } from '@tauri-apps/api/http'

type RequestConf = {
  url: string
  method: string
  body: string
  query: Record<string, string>
  headers: Record<string, string>
}

const requests = reactive<Record<string, RequestConf>>({})

const selectedRequest: RequestConf = reactive({
  url: '',
  method: 'get',
  body: '',
  query: {},
  headers: {}
})

const selectedRequestId = computed(() => selectedRequest.method + '#' + selectedRequest.url)

const { url, method, body, query, headers } = toRefs(selectedRequest)

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

async function save() {
  requests[selectedRequestId.value] = JSON.parse(JSON.stringify(selectedRequest))
}

async function updateSelected(request: RequestConf) {
  body.value = request.body
  method.value = request.method
  url.value = request.url
  query.value = request.query
  headers.value = request.headers
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
</script>

<template>
  <aside class="sidebar">
    <ul class="collection">
      <li class="collection-item">
        <GraphIcon />
        <span>root/</span>
      </li>
      <template v-for="request in requests" :key="request.method + '#' + request.url">
        <li
          @click="() => updateSelected(request)"
          :class="[
            'collection-item',
            {
              'collection-item--active': request.method + '#' + request.url === selectedRequestId
            }
          ]"
        >
          <WebIcon />
          <span>{{ request.method + ' - ' + request.url }}</span>
        </li>
      </template>
    </ul>
  </aside>
  <main class="client">
    <section class="request-url">
      <div class="method">
        <label class="hide" for="method">request method</label>
        <select v-model="method" class="method-selector" name="method" id="method">
          <option value="get">get</option>
          <option value="post">post</option>
          <option value="put">put</option>
          <option value="patch">patch</option>
          <option value="delete">delete</option>
          <option value="options">options</option>
        </select>
      </div>
      <div class="url">
        <label class="hide" for="url">request url target</label>
        <input v-model="url" class="url__input" type="text" name="url" id="url" />
      </div>
      <div class="send">
        <button class="send-button" @click="send" type="submit">send</button>
      </div>
      <div class="save">
        <button class="save-button" @click="save" type="button">save</button>
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
          <textarea
            v-if="activeTab === 'body'"
            v-model="body"
            class="text"
            name="request-body"
            id="body"
          ></textarea>
        </div>
      </section>
      <section class="response-viewer">
        <div class="stats">
          <span class="response-code"></span>
          <span class="response-time">{{ responseTime }} ms</span>
          <span class="response-size"></span>
        </div>
        <div class="body">
          <textarea
            readonlygit
            v-model="bodyText"
            class="text"
            name="response-body"
            id="response-body"
          ></textarea>
        </div>
      </section>
    </section>
  </main>
</template>

<style>
#app {
  display: grid;

  gap: var(--spacing);
  grid-template-rows: 1fr;
  grid-template-columns: minmax(20px, 0.25fr) 1fr;
  grid-template-areas: 'sidebar client';

  width: 100%;
  height: 100%;

  overflow: hidden;

  padding: var(--spacing);

  & > .sidebar {
    display: flex;
    grid-area: sidebar;

    gap: var(--spacing);

    padding: var(--spacing);

    & > .collection {
      display: flex;

      gap: var(--spacing);
      flex-direction: column;

      width: 100%;
      height: 100%;

      & > .collection-item {
        display: grid;

        gap: var(--spacing);
        grid-template-columns: minmax(20px, 0.05fr) 1fr;

        padding: var(--spacing);
        border: var(--border-size) solid var(--border-color);

        &.collection-item--active {
          background-color: var(--background-selected-color);
        }

        & > * {
          display: flex;
          align-items: center;

          white-space: nowrap;
          overflow-x: scroll;
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
    grid-template-rows: 0.05fr 1fr;
    grid-template-columns: 1fr;
    grid-template-areas: 'request-url' 'viewer';

    & > .request-url {
      display: grid;
      grid-area: request-url;

      gap: var(--spacing);
      grid-template-columns: 0.1fr 1fr 0.1fr 0.1fr;
      grid-template-areas: 'method url send save';

      & > .method {
        grid-area: method;

        padding: var(--spacing) 0;

        height: 100%;

        & > .method-selector {
          appearance: none;
          height: 100%;
          border-radius: var(--border-radius);
          text-align: center;
        }
      }

      & > .url {
        grid-area: url;

        padding: var(--spacing) 0;

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
      grid-template-rows: 1fr;
      grid-template-columns: 1fr 1fr;
      grid-template-areas: 'request-config response-viewer';

      & > .request-config {
        display: grid;
        grid-area: request-config;

        gap: var(--spacing);
        grid-template-rows: 0.05fr 1fr;
        grid-template-areas: 'tabs' 'tab-content';

        padding: var(--spacing);

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

          & > .text {
            resize: none;
            overflow: hidden;

            width: 100%;
            height: 100%;

            padding: var(--spacing);

            &:hover,
            &:focus {
              outline: none;
            }
          }
        }
      }

      & > .response-viewer {
        display: grid;
        grid-area: response-viewer;

        gap: var(--spacing);
        grid-template-rows: 0.05fr 1fr;
        grid-template-areas: 'stats' 'body';

        padding: var(--spacing);

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

          & > .text {
            grid-area: body;

            appearance: none;

            padding: var(--spacing);

            resize: none;
            overflow: hidden;

            padding: var(--spacing);

            &:hover,
            &:focus {
              outline: none;
            }
          }
        }
      }
    }
  }
}
</style>
