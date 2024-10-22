<script setup lang="ts">

import {IMainConsoleData} from "~/types/client/IMainConsoleData";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  pageName: {
    en: 'Category management'
  },
})

const {data, del, save, keyData} = useCategory()
const {data: categoryData, refresh: refreshData} = await useAsyncData(keyData.categoryDataKey, () => data())
console.log(categoryData.value)
const categoryCurrent = reactive({
  name: '',
  code: '',
  alias: '',
})

const columns = [{
  key: 'code',
  label: 'Code'
}, {
  key: 'name',
  label: 'Name',
  sortable: true
}, {
  key: 'alias',
  label: 'Alias'
}]

const sort = ref({
  column: 'name',
  direction: 'desc'
})


class ConsoleData extends IMainConsoleData {
  createData() {
    this.clearState()
    this.isOpenModal.value = true
  }

  clearState(): void {
    categoryCurrent.name = ''
    categoryCurrent.alias = ''
    categoryCurrent.code = ''
  }

  async deleteData(object?: any): Promise<void> {
    await del({
      categoryCode: categoryCurrent.code
    })
  }

  async mapState(object: any): Promise<void> {
    this.isOpenModal.value = true
    let data: any
    if (isObject(object)) {
      data = object
      categoryCurrent.code = data?.code
      categoryCurrent.name = data?.name
      categoryCurrent.alias = data?.alias
    }
  }

  async saveData(): Promise<void> {
    let code = await save({
      code: categoryCurrent.code,
      name: categoryCurrent.name
    })
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
      <UTable :columns="columns" :rows="categoryData || []" @select="consoleData.mapState($event)" :sort="sort"
              class="max-h-96">
      </UTable>
      <template #modalBody>
        <UForm :state="categoryCurrent" class="space-y-5">
          <UFormGroup label="Name" name="name">
            <UInput v-model="categoryCurrent.name"/>
          </UFormGroup>
          <UFormGroup label="Alias" name="alias">
            <UInput disabled v-model="categoryCurrent.alias"/>
          </UFormGroup>
          <UFormGroup label="Code" name="code">
            <UInput disabled v-model="categoryCurrent.code"/>
          </UFormGroup>
        </UForm>
      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>