<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import BaseSelect from './BaseSelect.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { fetch, type FetchOptions, type HttpVerb, type Response } from '@tauri-apps/api/http'
import BaseEditor from './BaseEditor.vue'
import type { RequestConfiguration } from '@/stores/types'
import HeadersList from './HeadersList.vue'
import BaseTabs from '@/components/BaseTabs.vue'
import ParamsList from '@/components/ParamsList.vue'
import QueriesList from '@/components/QueriesList.vue'

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
  isNew: boolean
}>()

// State
const { request, isNew } = toRefs(props)
const { method, url, body, headers, query, params } = toRefs(request.value)

let response = ref('')
let responseTime = ref(0)
let responseCode = ref(0)
let responseSize = ref('')
let responseHeaders = ref('')

const bodyText = computed(() => (!isNew.value ? response.value : ''))
const headersText = computed(() => responseHeaders.value)

const reqBody = computed(() => body.value)

function buildURL(value: string): string {
  let url = ''
  const parts = value.split('/')
  for (let i = 0; i < parts.length; i++) {
    const partsKey = parts[i]
    if (partsKey.startsWith(':')) {
      const param = params.value.find(p => p.name === partsKey.slice(1))
      if (param) {
        url += param.val
      }
    } else {
      url += partsKey
    }

    if (i < parts.length -1) {
      url += '/'
    }
  }
  return url
}

async function send() {
  const start = new Date().getTime()

  const opts: FetchOptions = {
    method: method?.value as HttpVerb,
    headers: headers.value.reduce(
      (acc, curr) => {
        acc[curr.name] = curr.val
        return acc
      },
      {} as Record<string, any>
    ),
    query: query.value.reduce(
      (acc, curr) => {
        acc[curr.name] = curr.val
        return acc
      },
      {} as Record<string, any>
    ),
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
    const sendUrl = buildURL(url.value)
    const res: Response<unknown> = await fetch(sendUrl, opts)

    response.value = JSON.stringify(res.data, null, 2)
    for (let key in res.headers) {
      responseHeaders.value += key.toLocaleUpperCase() + ': ' + res.headers[key] + '\n'
    }
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
      <BaseButton id="request-save" class="save" name="request-save" @click="saveRequest">
        save
      </BaseButton>
    </section>
    <section class="viewer">
      <section class="request-configuration">
        <BaseTabs
          :tabs="[
            { name: 'body', val: 'req-body' },
            { name: 'headers', val: 'req-headers' },
            { name: 'query', val: 'req-query' },
            { name: 'param', val: 'req-param' }
          ]"
          default="req-body"
        >
          <template #content="{ active }">
            <BaseEditor
              v-show="active === 'req-body'"
              id="request-body-editor"
              :displayText="reqBody"
              class="request-body-editor"
              @update="body = $event"
            ></BaseEditor>
            <HeadersList
              :headers="headers"
              @update="(event) => headers.splice(0, headers.length, ...event)"
              v-show="active === 'req-headers'"
            ></HeadersList>
            <QueriesList
              :queries="query"
              @update="(event) => query.splice(0, query.length, ...event)"
              v-show="active === 'req-query'"
            ></QueriesList>
            <ParamsList
              :params="params"
              @update="(event) => params.splice(0, params.length, ...event)"
              v-show="active === 'req-param'"
            ></ParamsList>
          </template>
        </BaseTabs>
      </section>
      <section class="response-viewer">
        <BaseTabs
          :tabs="[
            { name: 'body', val: 'res-body' },
            { name: 'headers', val: 'res-headers' }
          ]"
          default="res-body"
        >
          <template #content="{ active }">
            <BaseEditor
              v-show="active === 'res-body'"
              id="response-body"
              :displayText="bodyText"
            ></BaseEditor>
            <BaseEditor
              v-show="active === 'res-headers'"
              id="response-headers"
              :displayText="headersText"
            ></BaseEditor>
          </template>
        </BaseTabs>
      </section>
    </section>
  </main>
</template>

<style>
.content {
  display: grid;
  grid-area: main;
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
      minmax(60px, 0.1fr)
      minmax(min-content, 1fr)
      minmax(min-content, 0.1fr)
      minmax(min-content, 0.1fr);

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
    grid-template-areas: 'request-configuration response-viewer';
    grid-template-rows: minmax(min-content, 1fr);
    grid-template-columns:
      1fr
      1fr;

    & > .request-configuration {
      grid-area: request-configuration;
      display: grid;
    }

    & > .response-viewer {
      grid-area: response-viewer;
      display: grid;
    }
  }
}
</style>
