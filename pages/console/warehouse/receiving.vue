<script setup lang="ts">

import type {IReceivingDto, IReceivingUpdateReq} from "~/types/IReceiving";
import type {IStockDto} from "~/types/IStock";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {IPurchaseOrderDetailUseReceiving, IPurchaseOrderDto} from "~/types/IPurchaseOrder";
import type {IWarehouseDto} from "~/types/IWarehouse";

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

const {data: receivingFetchData, create, update, select, keyData, receivingStatus} = useReceiving()
const {select: selectPo} = usePurchaseOrder()
const {data: warehouseFetchData, keyData: warehouseKey} = useWarehouse()
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
console.log(receivingData.value)
console.log(poDataOrdered.value)

const initialState: IReceivingDto = {
  code: '',
  poCode: '',
  status: NaN,
  receivedDate: undefined,
  stocks: [] as IStockDto[]
}

const receivingCurrent = reactive<IReceivingDto>({...initialState})
const warehouseCurrent = ref()

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

  deleteData(): Promise<void> {
    return Promise.resolve(undefined);
  }

  mapState(object: any): void {
    console.log(object)
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

const consoleData = new ConsoleData()

function selectedPo(data: IPurchaseOrderDto[]) {
  console.log(data)
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

function acceptWarehouseAll() {
  if (receivingCurrent.stocks.length > 0 && warehouseCurrent.value){
    receivingCurrent.stocks.forEach(e => {
      e.warehouseCode = warehouseCurrent.value
    })
  }
}

async function startImport() {
  await update(<IReceivingUpdateReq>{
    params: {
      updateType: 'progress',
      receivingCode: receivingCurrent.code
    }
  })
  consoleData.mapState(await consoleData.selectByCode())
  await consoleData.refreshData()
}

async function cancelImport() {
  await update(<IReceivingUpdateReq>{
    params: {
      updateType: 'cancel',
      receivingCode: receivingCurrent.code
    }
  })
  consoleData.mapState(await consoleData.selectByCode())
  await consoleData.refreshData()
}


async function completeImport() {
  await update(<IReceivingUpdateReq>{
    params: {
      updateType: 'imported',
      receivingCode: receivingCurrent.code
    }
  })
  consoleData.mapState(await consoleData.selectByCode())
  await consoleData.refreshData()
}

</script>

<template>
  <div>
    <MainConsole :console-data="consoleData">
      <UTable :columns="receivingColumns" :rows="receivingData || []" @select="consoleData.mapState($event)"
              class="max-h-96">
        <template #status-data="{row}">
          <span :class="[{'bg-green-300': row.status === 1}, {'bg-blue-300': row.status === 2}]">{{receivingStatus().map(row.status)}}</span>
        </template>
      </UTable>
      <template #modalBody>
        <div class="flex justify-between gap-2">
          <div class="flex justify-start gap-2">
            <UButton :disabled="!receivingCurrent.code || !receivingCurrent.status" label="Cancel Cancel" color="red" @click="cancelImport"/>
            <UButton :disabled="!receivingCurrent.code || receivingCurrent.status > 0" label="Start import" @click="startImport"/>
          </div>
          <div class="flex justify-end gap-2">
            <UButton :disabled="!receivingCurrent.code || !receivingCurrent.status || receivingCurrent.status === 2" label="Complete" color="blue" @click="completeImport"/>
          </div>
        </div>
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
        <UTable :columns="inStockDetailColumns" :rows="receivingCurrent.stocks" class="max-h-96" :class="[{'pointer-events-none': receivingCurrent.status !== 1}]">
          <template #warehouseCode-data="{row}">
            <USelect v-model="row.warehouseCode" :options="warehouseData" option-attribute="name"
                     value-attribute="code"/>
          </template>
          <template #inQuantity-data="{row}">
            <UInput v-model="row.inQuantity" type="number"/>
          </template>
        </UTable>
        <UFormGroup v-if="receivingCurrent.stocks.length > 0" label="Select Warehouse">
          <div class="flex justify-between gap-2">
            <USelect v-model="warehouseCurrent" :options="warehouseData" option-attribute="name"
                     value-attribute="code" class="w-full"/>
            <UButton label="Accept all" @click="acceptWarehouseAll"/>
          </div>
        </UFormGroup>
      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>