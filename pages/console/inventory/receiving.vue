<script setup lang="ts">

import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {IWarehouseDto} from "~/types/IWarehouse";
import type {IProductDto} from "~/types/IProduct";
import type {ITimelineElement} from "~/types/client/ITimelineElement";
import type {IPurchaseOrderDetail} from "~/types/IPurchaseOrder";
import type {IStockAddReceivingReq, IStockInfo} from "~/types/IStock";
import type {IReceivingReq, IReceivingRes} from "~/types/IReceiving";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  groupMenu: 'inventory',
  pageName: {
    en: 'Receiving management'
  }
})

interface IWarehouseInfo {
  code: string,
  name: string
}

interface IProductInfo {
  code: string,
  name: string
}

const toast = useToast()
const notification = useNotification
const {data: receivingFetchData, save, del, select, keyData, receivingStatus} = useReceiving()
const {select: selectPo} = usePurchaseOrder()
const {data: warehouseFetchData, keyData: warehouseKey} = useWarehouse()
const {data: productFetchData, keyData: productKey, getProductName} = useProduct()

const {data: productData} = await useLazyAsyncData(productKey.productKeyData, () => productFetchData(), {
  transform(value: IProductDto[]) {
    return value.map(e => {
      return {
        code: e.code,
        name: e.name
      } as IProductInfo
    })
  }
})
const {
  data: receivingData,
  refresh: receivingRefresh
} = useAsyncData(keyData.receivingKeyData, () => receivingFetchData())
const {data: warehouseData} = await useAsyncData(warehouseKey.warehouseKeyData, () => warehouseFetchData(), {
  transform: (value: IWarehouseDto[]) => {
    return value.map(e => {
      return {
        code: e.code,
        name: e.name
      } as IWarehouseInfo
    })
  }
})
const {data: poDataOrdered} = useLazyAsyncData('po-many-ordered', () => selectPo({
  selectType: "manyOrdered"
}))

console.log(poDataOrdered.value)

const initialState: IReceivingRes = {
  code: '',
  poCode: '',
  status: NaN,
  receivedDate: undefined,
  stocks: [] as IStockInfo[]
}

const receivingCurrent = reactive<IReceivingRes>({...initialState})

const receivingColumns = [{
  key: 'code',
  label: 'Code',
}, {
  key: 'poCode',
  label: 'Purchase Order'
}, {
  key: 'status',
  label: 'Status',
  sortable: true
}, {
  key: 'receivedDate',
  label: 'Received Date',
  sortable: true
}]

const searchPoColumns = [{
  key: 'code',
  label: 'Code'
}, {
  key: 'description',
  label: 'Description'
}, {
  key: 'supplierName',
  label: 'Supplier'
}]

const inStockDetailColumns = [{
  key: 'warehouseCode',
  label: 'Warehouse'
}, {
  key: 'productCode',
  label: 'Product Code'
}, {
  key: 'productName',
  label: 'Product Name',
}, {
  key: 'orderQuantity',
  label: 'Order Quantity'
}, {
  key: 'inQuantity',
  label: 'In Quantity'
}, {
  key: 'actions',
}]

class ConsoleData extends IMainConsoleData {
  clearState(): void {
    useAssign(receivingCurrent, initialState)
  }

  async deleteData(): Promise<void> {
    if (receivingCurrent.code) {
      const result = await del({
        receivingCode: receivingCurrent.code
      })
      if (result) {
        await this.refreshData()
        this.clearState()
        this.isOpenModal.value = false
      }
    }
  }

  async mapState(object: IReceivingRes): Promise<void> {
    console.log(object)
    this.isOpenModal.value = true
    if (isObject(object)) {
      const data = await this.selectByCode(object.code)
      if (data) {
        useAssign(receivingCurrent, data)
      }
    }
  }

  async refreshData(): Promise<void> {
    await receivingRefresh()
  }

  async selectByCode(code: string) {
    return await select({
      selectType: 'byCode',
      receivingCode: code
    })
  }

  async saveData(): Promise<void> {
    if (receivingCurrent.poCode) {
      const code = await save({
        params: {
          type: 'save'
        },
        body: {
          code: receivingCurrent.code,
          poCode: receivingCurrent.poCode,
          stocks: receivingCurrent.stocks?.map(e => {
            return {
              id: e.id,
              inQuantity: e.inQuantity,
              productCode: e.productCode,
              warehouseCode: e.warehouseCode,
              receivingCode: e.receivingCode
            } as IStockAddReceivingReq
          })
        } as IReceivingReq
      })
      if (code) {
        await this.refreshData()
        await this.mapState(await this.selectByCode(code))
      }
    }
  }
}

const consoleData = new ConsoleData()

async function refreshState() {
  if (receivingCurrent.code) {
    await consoleData.mapState(await consoleData.selectByCode(receivingCurrent.code))
  }
  await consoleData.refreshData()
}

function selectedPo(data: any) {
  const dataSelected = data[0]
  receivingCurrent.poCode = dataSelected.code ?? ''
  receivingCurrent.stocks = (dataSelected.details as IPurchaseOrderDetail[]).map(e => {
    return {
      receivingCode: receivingCurrent.code,
      productName: e.productName,
      productCode: e.productCode,
      orderQuantity: e.quantity,
      inQuantity: 0,
      warehouseCode: ''
    } as IStockInfo
  })
}

function acceptWarehouseAll(warehouseCode: string) {
  receivingCurrent.stocks?.forEach(e => {
    e.warehouseCode = warehouseCode
  })
}

async function changeStatus(input?: number) {
  switch (input) {
    case 0:
      await save({
        params: {
          type: 'cancel',
          receivingCode: receivingCurrent.code
        }
      })
      await refreshState()
      break
    case 2:
      await save({
        params: {
          type: 'imported',
          receivingCode: receivingCurrent.code
        }
      })
      await refreshState()
      break
  }
}

function addProducts(data: IProductInfo[]) {
  if (isArray(data) && data.length > 0) {
    data.forEach(selected => {
      if (!receivingCurrent.stocks?.some(e => e.productCode === selected.code)) {
        receivingCurrent.stocks?.push({
          receivingCode: receivingCurrent.code,
          productName: selected.name,
          productCode: selected.code,
          orderQuantity: 0,
          inQuantity: 0,
          warehouseCode: ''
        } as IStockInfo)
      }
    })
  }
}

function selectedWarehouseRow(data: any) {
  const toastObject = notification.getToastObject({
    type: 'info',
    title: `Selected ${data}`,
    timeout: 2000,
    actions: [{
      label: 'Apply to all records',
      click: () => acceptWarehouseAll(data)
    }]
  })
  toast.add(toastObject)
}

async function deleteDetail(data: IStockInfo, index: number) {
  const toastObject = notification.getToastObject({
    type: 'warn',
    description: 'Do you want delete ?',
    actions: [
      {
        label: 'Continue Delete',
        click: async () => {
          if (data.id) {
            await save({
              params: {
                type: 'deleteStock',
                receivingCode: receivingCurrent.code,
                stockId: data.id
              }
            })
            await refreshState()
          } else {
            receivingCurrent.stocks?.splice(index, 1)
          }
        }
      }
    ],
    timeout: 3000
  })
  toast.add(toastObject)
}

const timelineItems = computed<ITimelineElement[]>(() => {
  return receivingStatus().data.map(e => {
    return {
      label: e.name,
      order: e.status,
      action: () => changeStatus(e.status)
    }
  }) as ITimelineElement[]
})

const tableUIConfig = {
  th: {
    base: 'whitespace-nowrap'
  }
}

</script>

<template>
  <div>
    <MainConsole :console-data="consoleData">
      <UTable :columns="receivingColumns" :rows="receivingData || []" @select="consoleData.mapState($event)"
              class="max-h-96">
        <template #status-data="{row}">
          <span
              :class="[{'bg-green-300': row.status === 1}, {'bg-blue-300': row.status === 2}]">{{
              receivingStatus().map(row.status)
            }}</span>
        </template>
        <template #receivedDate-data="{row}">
          <NuxtTime v-if="row.receivedDate" :datetime="row.receivedDate" year="numeric" month="numeric"
                    day="numeric"/>
        </template>
      </UTable>
      <template #modalHeader>
        <div class="flex justify-center gap-2">
          <Timeline :class="[{'pointer-events-none': !receivingCurrent.code}]" :elements="timelineItems"
                    v-model:active-index="receivingCurrent.status"/>
        </div>
      </template>
      <template #modalBody>
        <div :class="[{'pointer-events-none': receivingCurrent.status === 2}]" class="space-y-3">
          <UForm :state="receivingCurrent" class="space-y-5">
            <UFormGroup label="Code" name="code">
              <UInput disabled v-model="receivingCurrent.code"/>
            </UFormGroup>
            <UFormGroup label="Purchase Order" name="poCode">
              <div class="flex justify-between gap-2">
                <UInput disabled v-model="receivingCurrent.poCode" class="w-full"/>
                <SearchData title="Select Purchase Order" :columns="searchPoColumns" :data="poDataOrdered"
                            key-data="code"
                            @selected="selectedPo"/>
              </div>
            </UFormGroup>
            <!--            <UFormGroup label="Status" name="status">-->
            <!--              <USelect disabled v-model="receivingCurrent.status" :options="receivingStatus().data"-->
            <!--                       option-attribute="name" value-attribute="status"/>-->
            <!--            </UFormGroup>-->
            <UFormGroup label="Received Date" name="receivedDate">
              <NuxtTime v-if="receivingCurrent.receivedDate" :datetime="receivingCurrent.receivedDate" year="numeric"
                        month="numeric"
                        day="numeric"/>
            </UFormGroup>
          </UForm>
          <UTable :ui="tableUIConfig" :columns="inStockDetailColumns" :rows="receivingCurrent.stocks" class="max-h-96"
                  :class="[{'pointer-events-none': receivingCurrent.status === 2}]"
          >
            <template #productName-data="{row}">
              {{ getProductName(productData, row?.productCode) }}
            </template>
            <template #warehouseCode-data="{row, index}">
              <USelect v-model="row.warehouseCode" :options="warehouseData" option-attribute="name"
                       value-attribute="code" @change="selectedWarehouseRow"/>
            </template>
            <template #inQuantity-data="{row}">
              <UFormGroup :error="(!row.warehouseCode && row.inQuantity > 0) && 'You must select warehouse'">
                <UInput v-model="row.inQuantity" type="number"/>
              </UFormGroup>
            </template>
            <template #actions-data="{row, index}">
              <Icon name="ic:outline-clear" size="20" class="cursor-pointer" @click="deleteDetail(row, index)"/>
            </template>
          </UTable>
          <div class="flex items-center justify-end">
            <SearchData title="Select Product" btn-label="Add product" :data="productData" key-data="code"
                        @selected="addProducts"
                        :select-multi="true"/>
          </div>
        </div>

      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>