<script setup lang="ts">
import type {IMainConsoleData} from "~/types/client/IMainConsoleData";

const {consoleData} = defineProps<{
  consoleData: IMainConsoleData
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="py-2 border-b flex justify-end gap-4">
      <UTooltip text="Print">
        <UButton icon="ic:outline-local-printshop" color="white"/>
      </UTooltip>
      <UTooltip text="Create">
        <UButton icon="ic:baseline-plus" color="white" @click="consoleData.createData()"/>
      </UTooltip>
    </div>
    <slot/>
    <ClientOnly>
      <UModal v-model="consoleData.isOpenModal.value" :ui="{width: 'md:max-w-screen-md'}">
        <div>
          <div class="p-4 space-y-6 ">
            <slot name="modalBody"/>
            <div class="flex justify-between items-center gap-4">
              <div class="flex justify-start ">
                <UIcon name="ic:sharp-close" size="20" class="cursor-pointer hover:bg-gray-500"
                       @click="consoleData.isOpenModal.value = false"/>
              </div>
              <div class="flex justify-end gap-4">
                <UTooltip text="Clear">
                  <UButton icon="ic:sharp-cleaning-services" @click="consoleData.clearState()"/>
                </UTooltip>
                <UTooltip text="Delete">
                  <UButton icon="ic:outline-delete-outline" @click="consoleData.deleteData()"/>
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