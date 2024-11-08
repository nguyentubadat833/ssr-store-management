<script setup lang="ts">
import {IMainConsoleData} from "~/types/client/IMainConsoleData";

const {consoleData, useToolbar} = defineProps({
  consoleData: {
    type: Object as PropType<IMainConsoleData>,
    required: true
  },
  useToolbar: {
    type: Boolean,
    default: true,
    required: false
  }
})

async function deleteAction() {
  await consoleData.deleteData()
}

function createAction() {
  consoleData.clearState()
  consoleData.isOpenModal.value = true
}

function closeModal() {
  consoleData.clearState()
  consoleData.isOpenModal.value = false
}

onMounted(() => {
  // window.addEventListener('keydown', (event) => {
  //   if (event.ctrlKey && event.key === "s") {
  //     event.preventDefault()
  //     consoleData.saveData()
  //   }
  // })
})
</script>

<template>
  <div class="space-y-6">
    <div class="py-2 border-b flex justify-end gap-4">
      <UTooltip text="Refresh">
        <UButton icon="ic:outline-sync" color="white" @click="consoleData.refreshData()"/>
      </UTooltip>
      <UTooltip text="Print">
        <UButton icon="ic:outline-local-printshop" color="white"/>
      </UTooltip>
      <UTooltip text="Create">
        <UButton icon="ic:baseline-plus" color="white" @click="createAction"/>
      </UTooltip>
    </div>
    <slot/>
    <ClientOnly>
      <UModal id="console-modal" v-model="consoleData.isOpenModal.value" :ui="{width: 'md:max-w-screen-md'}"
              prevent-close>
        <div>
          <div class="p-4 space-y-6 ">
            <slot name="modalHeader"/>
            <UDivider v-if="$slots.modalHeader"/>
            <slot name="modalBody"/>
            <UDivider/>
            <div class="flex justify-between items-center gap-4">
              <div class="flex items-center gap-1 justify-start w-16 h-10 cursor-pointer hover:bg-gray-100" @click="closeModal">
                <UIcon name="ic:sharp-close" size="20"/>
                <span class="text-gray-400">(Esc)</span>
              </div>
              <div class="flex justify-end gap-4" v-if="useToolbar">
                <UTooltip text="Clear">
                  <UButton icon="ic:sharp-cleaning-services" @click="consoleData.clearState()"/>
                </UTooltip>
                <UTooltip text="Delete">
                  <UButton icon="ic:outline-delete-outline" @click="deleteAction"/>
                </UTooltip>
                <UTooltip text="Save (Ctrl + S)">
                  <UButton icon="ic:outline-save" @click="consoleData.saveData()"/>
                </UTooltip>
              </div>
            </div>
          </div>
        </div>
      </UModal>
    </ClientOnly>
  </div>
</template>

<style scoped>

</style>