<script setup lang="ts">

import type {IWarehouseDto} from "~/types/IWarehouse";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  groupMenu: 'warehouse',
  pageName: {
    en: 'Warehouse management'
  }
})

const {data, del, save, keyData} = useWarehouse()
const {data: warehouseData, refresh: refreshData} = await useAsyncData(keyData.warehouseKeyData, () => data())
const warehouseCurrent = reactive<IWarehouseDto>({
  code: '',
  name: '',
  location: '',
  maxCapacity: 0
})

const columns = [{
  key: 'code',
  label: 'Code'
}, {
  key: 'name',
  label: 'Name',
  sortable: true
}, {
  key: 'location',
  label: 'Location'
}, {
  key: 'maxCapacity',
  label: 'Max Capacity'
}]

const sort = ref({
  column: 'name',
  direction: 'desc'
})

class ConsoleData extends IMainConsoleData {

  clearState(): void {
    warehouseCurrent.code = ''
    warehouseCurrent.name = ''
    warehouseCurrent.location = ''
    warehouseCurrent.maxCapacity = 0
  }

  async deleteData(object?: any): Promise<void> {
    if (isString(warehouseCurrent.code)) {
      await del({
        warehouseCode: warehouseCurrent.code
      })
    }
  }

  async mapState(object: IWarehouseDto): Promise<void> {
    this.isOpenModal.value = true
    if (isObject(object)) {
      warehouseCurrent.code = object.code
      warehouseCurrent.name = object.name
      warehouseCurrent.location = object.location
      warehouseCurrent.maxCapacity = object.maxCapacity
    }
  }

  async saveData(): Promise<void> {
    let code = await save(warehouseCurrent)
    if (code) {
      await refreshData()
      this.isOpenModal.value = false
    }
  }

  async refreshData(): Promise<void> {
    await refreshData()
  }
}

const consoleData = new ConsoleData()

</script>

<template>
  <div>
    <MainConsole :console-data="consoleData">
      <UTable :columns="columns" :rows="warehouseData || []" @select="consoleData.mapState($event)" :sort="sort"
              class="max-h-96">
      </UTable>
      <template #modalBody>
        <UForm :state="warehouseCurrent" class="space-y-5">
          <UFormGroup label="Name" name="name">
            <UInput v-model="warehouseCurrent.name"/>
          </UFormGroup>
          <UFormGroup label="Code" name="code">
            <UInput disabled v-model="warehouseCurrent.code"/>
          </UFormGroup>
          <UFormGroup label="Location" name="location">
            <UInput v-model="warehouseCurrent.location"/>
          </UFormGroup>
          <UFormGroup label="Max Capacity" name="maxCapacity">
            <UInput v-model="warehouseCurrent.maxCapacity" type="number"/>
          </UFormGroup>
        </UForm>
      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>