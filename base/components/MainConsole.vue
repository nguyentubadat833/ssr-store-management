<script setup lang="ts">
import type {IMainConsoleData} from "~/types/client/IMainConsoleData";

const {consoleData} = defineProps<{
  consoleData: IMainConsoleData,
  isBtnModalDisabled: boolean
}>()

async function deleteAction() {
  consoleData.isLoading.value = true
  try {
    await consoleData.deleteData()
    await consoleData.refreshData()
    consoleData.clearState()
    consoleData.isOpenModal.value = false
  } finally {
    consoleData.isLoading.value = false
  }
}

function createAction() {
  consoleData.clearState()
  consoleData.isOpenModal.value = true
}

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
      <UModal v-model="consoleData.isOpenModal.value" :ui="{width: 'md:max-w-screen-md'}">
        <div @keyup.enter="consoleData.saveData()">
          <div class="p-4 space-y-6 ">
            <slot name="modalBody"/>
            <div class="flex justify-between items-center gap-4">
              <div class="flex justify-start ">
                <UIcon name="ic:sharp-close" size="20" class="cursor-pointer hover:bg-gray-500"
                       @click="consoleData.isOpenModal.value = false"/>
              </div>
              <div class="flex justify-end gap-4" :class="[{'pointer-events-none': isBtnModalDisabled ?? false}]">
                <UTooltip text="Clear">
                  <UButton icon="ic:sharp-cleaning-services" @click="consoleData.clearState()"/>
                </UTooltip>
                <UTooltip text="Delete">
                  <UButton icon="ic:outline-delete-outline" @click="deleteAction"/>
                </UTooltip>
                <UTooltip text="Save">
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