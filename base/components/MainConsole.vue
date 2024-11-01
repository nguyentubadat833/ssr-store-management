<script setup lang="ts">
import type {IMainConsoleData} from "~/types/client/IMainConsoleData";

const {consoleData} = defineProps<{
  consoleData: IMainConsoleData,
}>()

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
      <UModal v-model="consoleData.isOpenModal.value" :ui="{width: 'md:max-w-screen-md'}" prevent-close>
        <div @keyup.enter="consoleData.saveData()">
          <div class="p-4 space-y-6 ">
            <slot name="modalHeader"/>
            <UDivider v-if="$slots.modalHeader"/>
            <slot name="modalBody"/>
            <UDivider/>
            <div class="flex justify-between items-center gap-4">
              <div class="flex justify-start ">
                <UIcon name="ic:sharp-close" size="20" class="cursor-pointer hover:bg-gray-500"
                       @click="closeModal"/>
              </div>
              <div class="flex justify-end gap-4">
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