<script setup lang="ts">

import type {ITimelineElement} from "~/types/client/ITimelineElement";

const {elements} = defineProps<{
  elements: ITimelineElement[],
}>()
const activeIndex = defineModel('activeIndex')


const items = computed(() => elements.sort((a, b) => a.order - b.order))

function action(index: number) {
  if (typeof items.value[index].action  === 'function'){
    items.value[index].action()
  }
}

</script>

<template>
  <div>
    <div class="flex gap-3">
      <div v-for="(item, index) in items" class="flex items-center gap-3">
        <div class="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-100 p-1" @click="action(index)">
          <Icon v-if="activeIndex === item.order" name="ic:baseline-check-circle" class="bg-primary"/>
          <Icon v-else name="ic:baseline-mode-standby"/>
          <span>{{ item.label }}</span>
        </div>
        <span v-if="index < items.length - 1" class="border-b-2 w-14"></span>
      </div>

    </div>
  </div>

</template>

<style scoped>

</style>