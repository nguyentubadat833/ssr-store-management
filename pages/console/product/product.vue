<script setup lang="ts">
import type {IProductDto} from "~/types/IProduct";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";

interface ICategory {
  code: string,
  name: string
}

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  groupMenu: 'product',
  pageName: {
    en: 'Product management'
  }
})

const {data, del, save, keyData} = useProduct()
const {data: categoryDataFetch, keyData: categoryKey, getCategoryName} = useCategory()
const {data: productData, refresh: refreshData} = await useAsyncData(keyData.productKeyData, () => data())
const {data: categoryData} = await useAsyncData(categoryKey.categoryDataKey, () => categoryDataFetch(), {
  transform: (input: ICategory[]) => {
    return input
  }
})

const productCurrent = reactive<IProductDto>({
  name: '',
  code: '',
  alias: '',
  categoryCode: '',
  description: ''
})

const columns = [{
  key: 'categoryCode',
  label: 'Category'
}, {
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
  clearState(): void {
    productCurrent.name = ''
    productCurrent.code = ''
    productCurrent.alias = ''
    productCurrent.description = ''
    productCurrent.categoryCode = ''
  }

  async deleteData(object?: any): Promise<void> {
    if (isString(productCurrent.code)) {
      await del({
        productCode: productCurrent.code
      })
    }
  }

  mapState(object: IProductDto): void {
    this.isOpenModal.value = true
    productCurrent.name = object.name
    productCurrent.code = object.code
    productCurrent.alias = object.alias
    productCurrent.description = object.description
    productCurrent.categoryCode = object.categoryCode
  }

  async refreshData(): Promise<void> {
    await refreshData()
  }

  async saveData(): Promise<void> {
    if (productCurrent.categoryCode){
      let code: string = await save(productCurrent)
      if (isString(code)) {
        await refreshData()
        this.isOpenModal.value = false
      }
    }
  }
}

const consoleData = new ConsoleData()

function selectedCategory(data: any) {
  productCurrent.categoryCode = data[0]?.code
}

</script>

<template>
  <div>
    <MainConsole :console-data="consoleData">
      <UTable :columns="columns" :rows="productData || []" @select="consoleData.mapState($event)" :sort="sort"
              class="max-h-96">
        <template #categoryCode-data="{row}">
          <span>{{getCategoryName(categoryData, row?.categoryCode)}}</span>
        </template>
      </UTable>
      <template #modalBody>
        <UForm :state="productCurrent" class="space-y-5">
          <UFormGroup label="Category" name="categoryCode" :error="!productCurrent.categoryCode && 'You must select category'">
            <div class="flex justify-between gap-2">
              <UInput disabled v-model="productCurrent.categoryCode" class="w-full"/>
              <UInput disabled :model-value="getCategoryName(categoryData, productCurrent.categoryCode)" class="w-full"/>
              <SearchData :data="categoryData" :columns="[{key: 'name', label: 'Name'}, {key: 'code', label: 'Code'}]" @selected="selectedCategory"/>
            </div>
          </UFormGroup>
          <UFormGroup label="Name" name="name">
            <UInput v-model="productCurrent.name"/>
          </UFormGroup>
          <UFormGroup label="Code" name="code">
            <UInput disabled v-model="productCurrent.code"/>
          </UFormGroup>
          <UFormGroup label="Alias" name="alias">
            <UInput disabled v-model="productCurrent.alias"/>
          </UFormGroup>
        </UForm>
      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>