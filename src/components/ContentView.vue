<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import BaseSelect from './BaseSelect.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { fetch, type FetchOptions, type HttpVerb, type Response } from '@tauri-apps/api/http'
import BaseEditor from './BaseEditor.vue'
import type { RequestConfiguration } from '@/stores/types'
import HeadersList from './HeadersList.vue'

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

const emit = defineEmits<{
  saveRequest: []
}>()

const props = defineProps<{
  request: RequestConfiguration
}>()

// State
const { request } = toRefs(props)
const { method, url, body, headers } = toRefs(request.value)

const activeTab = ref('body')

let response = ref('')
let responseTime = ref(0)
let responseCode = ref(0)
let responseSize = ref('')
let responseHeaders = ref('')

const bodyText = computed(() => 'Body:\n' + response.value + '\n')
const headersText = computed(() => 'Headers:\n' + responseHeaders.value + '\n')

const reqBody = computed(() => body.value)

async function send() {
  console.info('sending request')

  const start = new Date().getTime()

  const opts: FetchOptions = {
    method: method?.value as HttpVerb,
    headers: headers.value.reduce(
      (acc, curr) => {
        acc[curr.name] = curr.val
        return acc
      },
      {} as Record<string, any>
    )
  }

  if (
    method?.value &&
    method?.value.toLowerCase() !== 'get' &&
    method?.value.toLowerCase() !== 'head'
  ) {
    opts.body = {
      type: 'Json',
      payload: body?.value
    }
  }

  try {
    const res: Response<unknown> = await fetch(url?.value as string, opts)

    console.info('request responded')

    response.value = JSON.stringify(res.data, null, 2)
    responseHeaders.value = JSON.stringify(res.headers, null, 2)
    responseCode.value = res.status
    responseSize.value = (new Blob([res.data as string]).size / 1024).toFixed(2)
  } catch (e) {
    // TODO: show in the UI the errors
    console.error(e)
  } finally {
    const end = new Date().getTime()
    responseTime.value = end - start
  }
}

async function saveRequest() {
  emit('saveRequest')
}
</script>

<template>
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
      <section class="request-configuration">
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
            <HeadersList
              :headers="headers"
              @update="(event) => headers.splice(0, headers.length, ...event)"
            ></HeadersList>
          </div>
        </div>
      </section>
      <section class="response-viewer">
        <div class="stats">
          <div class="response-code">{{ responseCode }}</div>
          <div class="response-time">{{ responseTime }} ms</div>
          <div class="response-size">{{ responseSize }} kb</div>
        </div>
        <div class="body">
          <BaseEditor id="response-body-editor" :display-text="bodyText"></BaseEditor>
        </div>
      </section>
    </section>
  </main>
</template>

<style>
.content {
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

    & > .request-configuration {
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
        flex-direction: column;
        align-items: center;

        width: 100%;

        & > .request-body-editor {
          height: 100%;
        }

        & > .request-headers {
          padding: var(--spacing) 0;
          width: 100%;
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

        gap: var(--spacing);
        justify-items: center;
        align-items: center;

        & > .response-code, .response-time, .response-size {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 var(--spacing);
          border: var(--border-size) solid var(--border-color);
        }
      }

      & > .body {
        display: flex;
        grid-area: body;
      }
    }
  }
}
</style>