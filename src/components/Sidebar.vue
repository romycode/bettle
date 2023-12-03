<script setup lang="ts">
import ThemeSelector from '@/components/ThemeSelector.vue'
</script>

<template>
  <aside class="sidebar">
    <ThemeSelector></ThemeSelector>
    <slot></slot>
  </aside>
</template>

<style>
.sidebar {
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
</style>
