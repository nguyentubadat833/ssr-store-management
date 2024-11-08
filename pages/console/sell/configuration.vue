<script setup lang="ts">

import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {IProductSellRes} from "~/types/ISell";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  groupMenu: 'sell',
  pageName: {
    en: 'Configuration'
  }
})

const {save: savePrice} = usePrice()
const {data: productSell} = await useAsyncData('productSell', () => useAPI({
  endpoint: '/api/sell/productSell',
  isShowSuccessMessage: false
}))

const isConfigPrice = ref(false)
const productSellCurrentInit = {
  categoryName: '',
  categoryCode: '',
  productName: '',
  productCode: '',
  status: undefined,
  basePrice: 0,
  discountPrice: 0,
  startDateApplyPrice: undefined,
  endDateApplyPrice: undefined
}

const productSellCurrent = reactive({...productSellCurrentInit})

const tblProductSellCol = [
  {
    key: 'categoryName',
    label: 'Category'
  }, {
    key: 'productName',
    label: 'Product'
  }, {
    key: 'status',
    label: 'Status'
  }, {
    key: 'basePrice',
    label: 'Base Price'
  }, {
    key: 'Discount Price',
    label: 'Discount Price'
  }, {
    key: 'startDateApplyPrice',
    label: 'Start Applying'
  }, {
    key: 'endDateApplyPrice',
    label: 'End Applying'
  }
]

const statusOptions = [{
  value: 1,
  label: 'active'
}, {
  value: 0,
  label: 'inactive'
}]

function getStatus(value: number) {
  return statusOptions.find(e => e.value === value)
}

class ConsoleData extends IMainConsoleData {
  clearState(): void {
    useAssign(productSellCurrent, productSellCurrentInit)
    isConfigPrice.value = false
  }

  deleteData(): Promise<void> {
    return Promise.resolve(undefined);
  }

  mapState(object: any): void {
    useAssign(productSellCurrent, object)
  }

  refreshData(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async saveData(): Promise<void> {
    if (isConfigPrice) {
      await savePrice({
        params: {
          type: "save",
        },
        body: {
          productCode: productSellCurrent.productCode,
          priceObject: {
            basePrice: productSellCurrent.basePrice,
            discountPrice: productSellCurrent.discountPrice,
            startDate: productSellCurrent.startDateApplyPrice as unknown as Date,
            endDate: productSellCurrent.endDateApplyPrice as unknown as Date
          }
        }
      })
    }
  }
}

const consoleData = new ConsoleData()

function selectProductSell(data: IProductSellRes) {
  consoleData.isOpenModal.value = true
  consoleData.mapState(data)
}
</script>

<template>
  <div>
    <MainConsole :console-data="consoleData">
      <UTable :rows="productSell" :columns="tblProductSellCol" @select="selectProductSell">
        <template #status-data="{row}">
          <span :class="[{'bg-green-300': row.status === 1}]">{{ getStatus(row.status).label }}</span>
        </template>
      </UTable>
      <template #modalHeader>
        <div class="flex items-center justify-end">
          <UButton label="Config price" icon="ic:round-edit" @click="isConfigPrice = true" color="white"/>
        </div>
      </template>
      <template #modalBody>
        <UForm class="space-y-5" :state="productSellCurrent">
          <UFormGroup label="Category">
            <div class="flex justify-between gap-2">
              <UInput disabled :model-value="productSellCurrent.categoryName" class="w-full"/>
              <UInput disabled :model-value="productSellCurrent.categoryCode" class="w-full"/>
            </div>
          </UFormGroup>
          <UFormGroup label="product">
            <div class="flex justify-between gap-2">
              <UInput disabled :model-value="productSellCurrent.productName" class="w-full"/>
              <UInput disabled :model-value="productSellCurrent.productCode" class="w-full"/>
            </div>
          </UFormGroup>
          <UFormGroup label="Base Price">
            <UInput :disabled="!isConfigPrice" v-model="productSellCurrent.basePrice" type="number"/>
          </UFormGroup>
          <UFormGroup label="Discount Price">
            <UInput :disabled="!isConfigPrice" v-model="productSellCurrent.discountPrice" type="number"/>
          </UFormGroup>
          <UFormGroup label="Time to apply price">
            <div class="flex justify-between gap-2">
              <UInput :disabled="!isConfigPrice" v-model="productSellCurrent.startDateApplyPrice" type="date"
                      class="w-full" placeholder="Start date"/>
              <UInput :disabled="!isConfigPrice" v-model="productSellCurrent.endDateApplyPrice" type="date"
                      class="w-full" placeholder="End date"/>
            </div>
          </UFormGroup>
          <UFormGroup label="Status">
            <USelect v-model="productSellCurrent.status" :options="statusOptions" option-attribute="label"
                     value-attribute="value"/>
          </UFormGroup>
        </UForm>
      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>