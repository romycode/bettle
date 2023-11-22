<script setup lang="ts"></script>

<template>
  <aside class="sidebar"></aside>
  <main class="client">
    <section class="request">
      <section></section>
      <section></section>
      <section></section>
    </section>
    <section class="response">
      <section></section>
      <section></section>
    </section>
  </main>
</template>

<style>
#app {
  display: grid;

  gap: var(--spacing);
  grid-template-rows: 1fr;
  grid-template-columns: 0.25fr 0.75fr;
  grid-template-areas: 'sidebar client';

  width: 100%;
  height: 100%;

  overflow: hidden;

  & > .sidebar {
    display: flex;
    grid-area: sidebar;

    gap: var(--spacing);

    flex-direction: row;
  }

  & > .client {
    grid-area: client;
  }
}
</style>
