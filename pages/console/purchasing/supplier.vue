<script setup lang="ts">
import type {ISupplierDto, ISupplierInfo} from "~/types/ISupplier";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  groupMenu: 'purchasing',
  pageName: {
    en: 'Supplier management'
  }
})

const {data, del, save, keyData} = useSupplier()
const {data: supplierData, refresh: refreshData} = await useAsyncData(keyData.supplierKeyData, () => data())
const supplierCurrent = reactive<ISupplierDto>({
  code: '',
  info: {
    name: ''
  } as ISupplierInfo
})

const columns = [{
  key: 'code',
  label: 'Code'
}, {
  key: 'info.name',
  label: 'Name',
  sortable: true
}]

const sort = ref({
  column: 'name',
  direction: 'desc'
})

class ConsoleData extends IMainConsoleData {

  clearState(): void {
    supplierCurrent.code = ''
    supplierCurrent.info = {} as ISupplierInfo
  }

  async deleteData(object?: any): Promise<void> {
    if (isString(supplierCurrent.code)){
      await del({
        supplierCode: supplierCurrent.code
      })
    }
  }

  async mapState(object: ISupplierDto): Promise<void> {
    this.isOpenModal.value = true
    if (isObject(object)) {
      supplierCurrent.code = object.code
      supplierCurrent.info = object.info
    }
  }

  async saveData(): Promise<void> {
    let code = await save(supplierCurrent)
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
    <UTable :columns="columns" :rows="supplierData || []" @select="consoleData.mapState($event)" :sort="sort"
            class="max-h-96">
    </UTable>
    <template #modalBody>
      <UForm :state="supplierCurrent" class="space-y-5">
        <UFormGroup label="Name" name="name">
          <UInput v-model="supplierCurrent.info.name"/>
        </UFormGroup>
        <UFormGroup label="Code" name="code">
          <UInput disabled v-model="supplierCurrent.code"/>
        </UFormGroup>
      </UForm>
    </template>
  </MainConsole>
</div>
</template>

<style scoped>

</style>