<script setup lang="ts">
import WebIcon from '@/components/icons/WebIcon.vue'
import { computed, reactive, ref, toRefs } from 'vue'
import { fetch, Response, type FetchOptions, type HttpVerb } from '@tauri-apps/api/http'
import ThemeSelector from '@/components/ThemeSelector.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseEditor from '@/components/BaseEditor.vue'

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

  try {
    const res: Response<unknown> = await fetch(url?.value as string, opts)

    response.value = JSON.stringify(res.data, null, 2)
    responseHeaders.value = JSON.stringify(res.headers, null, 2)
  } catch (e) {
    // TODO: show in the UI the errors
    // console.error(e)
  } finally {
    const end = new Date().getTime()
    responseTime.value = end - start
  }
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

async function resetCurrentRequest() {
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
        <div class="delete red-dim" @click="resetCurrentRequest"><p>c</p></div>
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
  <main class="content">
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
      <BaseButton id="request-send" class="send" name="request-send" @click="send">send</BaseButton>
      <BaseButton id="request-save" class="save" name="request-save" @click="saveRequest"
        >save</BaseButton
      >
    </section>
    <section class="viewer">
      <section class="request-cofiguration">
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
          <BaseEditor
            class="request-body-editor"
            id="request-body-editor"
            @update="body = $event"
            :displayText="reqBody"
            v-show="activeTab === 'body'"
          ></BaseEditor>
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
              <BaseButton id="request-header-new" name="request-header-new" @click="addHeader"
                >add</BaseButton
              >
            </form>
          </div>
        </div>
      </section>
      <section class="response-viewer">
        <div class="stats">
          <div class="response-code"></div>
          <div class="response-time">{{ responseTime }} ms</div>
          <div class="response"></div>
        </div>
        <div class="body">
          <BaseEditor id="response-body-editor" :display-text="bodyText"></BaseEditor>
        </div>
      </section>
    </section>
  </main>
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

  & > .sidebar {
    display: grid;
    grid-area: sidebar;

    gap: var(--spacing);
    grid-auto-flow: row;
    grid-auto-rows: minmax(var(--grid-slim-row-min-h), var(--grid-slim-row-h)) auto;

    & > .collection {
      display: flex;

      gap: var(--spacing);
      flex-direction: column;

      width: 100%;
      height: 100%;

      overflow: hidden;
      overflow-y: auto;

      & > .collection-item {
        display: grid;

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

          padding: 0 var(--spacing);

          overflow-x: scroll;

          -ms-overflow-style: none;
          scrollbar-width: none;

          &::-webkit-scrollbar {
            display: none;
          }
        }

        & > .delete {
          grid-area: delete;

          padding: var(--spacing);

          justify-content: center;
          justify-items: center;
          justify-self: end;
          align-items: center;

          width: 50%;
          height: 50%;

          border: var(--border-size) solid var(--border-color);

          &:hover {
            background-color: var(--red-dim);
          }

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

  & > .content {
    display: grid;
    grid-area: content;

    gap: var(--spacing);
    grid-template-areas: 'url' 'viewer';
    grid-template-rows:
      minmax(var(--bt-cnt-url-min-h), var(--bt-cnt-url-h))
      minmax(var(--bt-cnt-vw-min-h), var(--bt-cnt-vw-h));
    grid-template-columns: minmax(var(--bt-cnt-min-h), 1fr);

    & > .request-url {
      display: grid;
      grid-area: url;

      gap: var(--spacing);
      grid-template-areas: 'method uri send save';
      grid-template-rows: minmax(var(--bt-cnt-url-min-h), 1fr);
      grid-template-columns:
        minmax(var(--bt-cnt-url-method-min-w), var(--bt-cnt-url-method-w))
        minmax(var(--bt-cnt-url-uri-min-w), var(--bt-cnt-url-uri-w))
        minmax(var(--bt-cnt-url-send-min-w), var(--bt-cnt-url-send-w))
        minmax(var(--bt-cnt-url-save-min-w), var(--bt-cnt-url-save-w));

      justify-items: center;

      & > .method {
        grid-area: method;
        width: 100%;
      }

      & > .url {
        grid-area: uri;
      }

      & > .send {
        grid-area: send;
      }

      & > .save {
        grid-area: save;
      }
    }

    & > .viewer {
      display: grid;
      grid-area: viewer;

      gap: var(--spacing);
      grid-template-areas: 'request-cofiguration response-viewer';
      grid-template-rows: minmax(var(--bt-cnt-vw-min-h), 1fr);
      grid-template-columns:
        minmax(var(--bt-cnt-vw-cfg-min-w), var(--bt-cnt-vw-cfg-w))
        minmax(var(--bt-cnt-vw-res-min-w), var(--bt-cnt-vw-res-w));

      & > .request-cofiguration {
        display: grid;
        grid-area: request-cofiguration;

        gap: var(--spacing);
        grid-template-areas: 'tabs' 'tab-content';
        grid-template-rows:
          minmax(var(--bt-cnt-vw-cfg-tabs-min-h), var(--bt-cnt-vw-cfg-tabs-h))
          minmax(var(--bt-cnt-vw-cfg-tab-cnt-min-h), var(--bt-cnt-vw-cfg-tab-cnt-h));
        grid-template-columns: minmax(var(--bt-cnt-vw-cfg-min-w), 1fr);

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

          width: 100%;

          & > .request-body-editor {
            height: 100%;
          }
        }
      }

      & > .response-viewer {
        display: grid;
        grid-area: response-viewer;

        gap: var(--spacing);
        grid-template-areas: 'stats' 'body';
        grid-template-rows:
          minmax(var(--bt-cnt-vw-res-stats-min-h), var(--bt-cnt-vw-res-stats-h))
          minmax(var(--bt-cnt-vw-res-body-cnt-min-h), var(--bt-cnt-vw-res-body-cnt-h));
        grid-template-columns: minmax(var(--bt-cnt-vw-cfg-min-w), 1fr);

        & > .stats {
          display: flex;
          grid-area: stats;

          justify-items: center;
          align-items: center;
        }

        & > .body {
          display: flex;
          grid-area: body;
        }
      }
    }
  }
}
</style>
