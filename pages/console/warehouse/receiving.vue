<script setup lang="ts">

import type {IReceivingDto, IReceivingUpdateReq} from "~/types/IReceiving";
import type {IStockDto} from "~/types/IStock";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {IPurchaseOrderDetailUseReceiving, IPurchaseOrderDto} from "~/types/IPurchaseOrder";
import type {IWarehouseDto} from "~/types/IWarehouse";
import type {IProductDto} from "~/types/IProduct";
import type {ITimelineElement} from "~/types/client/ITimelineElement";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
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
const {data: receivingFetchData, create, update, del, select, keyData, receivingStatus} = useReceiving()
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

const initialState: IReceivingDto = {
  code: '',
  poCode: '',
  status: NaN,
  receivedDate: undefined,
  stocks: [] as IStockDto[]
}

const receivingCurrent = reactive<IReceivingDto>({...initialState})

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
}]

class ConsoleData extends IMainConsoleData {
  clearState(): void {
    useAssign(receivingCurrent, initialState)
  }

  async deleteData(): Promise<void> {
    if (receivingCurrent.code) {
      await del({
        receivingCode: receivingCurrent.code
      })
      await this.refreshData()
    }
  }

  mapState(object: any): void {
    this.isOpenModal.value = true
    if (isObject(object)) {
      useAssign(receivingCurrent, object)
    }
  }

  async refreshData(): Promise<void> {
    await receivingRefresh()
  }

  async selectByCode() {
    if (receivingCurrent.code) {
      return await select({
        selectType: 'byCode',
        receivingCode: receivingCurrent.code
      })
    }
  }

  async saveData(): Promise<void> {
    if (receivingCurrent.poCode) {
      if (receivingCurrent.code) {

      } else {
        const code = await create(receivingCurrent)
        if (code) {
          await receivingRefresh()
          this.mapState(await this.selectByCode())
        }
      }
    }
  }
}

const consoleData = new ConsoleData()

function selectedPo(data: IPurchaseOrderDto[]) {
  const dataSelected = data[0]
  receivingCurrent.poCode = dataSelected.code ?? ''
  receivingCurrent.stocks = (dataSelected.details as IPurchaseOrderDetailUseReceiving[]).map(e => {
    return {
      receivingCode: receivingCurrent.code,
      productName: e.productName,
      productCode: e.productCode,
      orderQuantity: e.quantity,
      inQuantity: 0,
      warehouseCode: ''
    } as IStockDto
  })
}

function acceptWarehouseAll(warehouseCode: string) {
  receivingCurrent.stocks.forEach(e => {
    e.warehouseCode = warehouseCode
  })
}

async function changeStatus(input?: number) {
  switch (input) {
    case 0:
      await update(<IReceivingUpdateReq>{
        params: {
          updateType: 'cancel',
          receivingCode: receivingCurrent.code
        }
      })
      break
    case 1:
      await update(<IReceivingUpdateReq>{
        params: {
          updateType: 'progress',
          receivingCode: receivingCurrent.code
        }
      })
      break
    case 2:
      await update(<IReceivingUpdateReq>{
        params: {
          updateType: 'imported',
          receivingCode: receivingCurrent.code
        }
      })
      break
  }
  consoleData.mapState(await consoleData.selectByCode())
  await consoleData.refreshData()
}

function addProducts(data: IProductInfo[]) {
  const selected = data[0]
  if (selected) {
    receivingCurrent.stocks.push({
      receivingCode: receivingCurrent.code,
      productName: selected.name,
      productCode: selected.code,
      orderQuantity: 0,
      inQuantity: 0,
      warehouseCode: ''
    } as IStockDto)
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

const timelineItems = computed<ITimelineElement[]>(() => {
  return receivingStatus().data.map(e => {
    return {
      label: e.name,
      order: e.status,
      action: () => changeStatus(e.status)
    }
  }) as ITimelineElement[]
})

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
          <Timeline v-if="receivingCurrent.code" :elements="timelineItems" v-model:active-index="receivingCurrent.status"/>
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
                            @selected="selectedPo"/>
              </div>
            </UFormGroup>
            <UFormGroup label="Status" name="status">
              <USelect disabled v-model="receivingCurrent.status" :options="receivingStatus().data"
                       option-attribute="name" value-attribute="status"/>
            </UFormGroup>
            <UFormGroup label="Received Date" name="receivedDate">
              <NuxtTime v-if="receivingCurrent.receivedDate" :datetime="receivingCurrent.receivedDate" year="numeric"
                        month="numeric"
                        day="numeric"/>
            </UFormGroup>
          </UForm>
          <UTable :columns="inStockDetailColumns" :rows="receivingCurrent.stocks" class="max-h-96"
          >
            <template #warehouseCode-data="{row, index}">
              <USelect v-model="row.warehouseCode" :options="warehouseData" option-attribute="name"
                       value-attribute="code" @change="selectedWarehouseRow"/>
            </template>
            <template #inQuantity-data="{row}">
              <UInput v-model="row.inQuantity" type="number"/>
            </template>
          </UTable>
          <div class="flex items-center justify-end">
            <SearchData title="Select Product" btn-label="Add product" :data="productData" @selected="addProducts"
                        :select-multi="true"/>
          </div>
        </div>

      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>