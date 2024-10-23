<script setup lang="ts">
import type {IPurchaseOrderDto} from "~/types/IPurchaseOrder";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {ISupplierDto} from "~/types/ISupplier";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  pageName: {
    en: 'Purchase Order management'
  }
})

const {data: supplierFetch, keyData: supplierKey, getSupplierName} = useSupplier()
const {data, create, del, keyData: poKey, purchaseOrderStatus} = usePurchaseOrder()
const {data: supplierData} = await useAsyncData(supplierKey.supplierKeyData, () => supplierFetch(), {
  transform: (value: ISupplierDto[]) => {
    let result : {code: string | undefined, name: string}[] = []
    value.forEach(el => {
      result.push({
        code: el.code,
        name: el.info?.name
      })
    })
    return result
  }
})
const {data: poData, refresh: refreshPoData} = await useAsyncData(poKey.poKeyData, () => data())
console.log(poData.value)

const initialState: IPurchaseOrderDto = {
  code: '',
  supplierCode: '',
  status: NaN,
  details: [],
  orderDate: undefined,
  dateOfReceipt: undefined,
};

const poCurrent = reactive<IPurchaseOrderDto>({...initialState})

const columns = [{
  key: 'code',
  label: 'Code'
}, {
  key: 'supplierCode',
  label: 'Supplier',
}, {
  key: 'status',
  label: 'Status',
  sort: true
}, {
  key: 'orderDate',
  label: 'Order Date',
  sort: true
}, {
  key: 'dateOfReceipt',
  label: 'Date Of Receipt',
  sort: true
}]

const sort = ref({
  column: 'name',
  direction: 'desc'
})

class ConsoleData extends IMainConsoleData{
  clearState(): void {
    useAssign(poCurrent, initialState)
  }

  async deleteData(): Promise<void> {
    if (isString(poCurrent.code)) {
      await del({
        poCode: poCurrent.code
      })
    }
  }

  mapState(object: any): void {
    this.isOpenModal.value = true
    if (isObject(object)){
      useAssign(poCurrent, object)
    }
  }

  async refreshData(): Promise<void> {
    await refreshPoData()
  }

  async saveData(): Promise<void> {
    if (!poCurrent.code) {
      const poCode = await create(poCurrent)
      if (isString(poCode)){
        await refreshPoData()
        this.isOpenModal.value = false
      }
    }
  }
}

const consoleData = new ConsoleData()

function selectedSupplier(data: any) {
  poCurrent.supplierCode = data[0]?.code
}

</script>

<template>
<div>
  <MainConsole :console-data="consoleData">
    <UTable :columns="columns" :rows="poData || []" @select="consoleData.mapState($event)" :sort="sort"
            class="max-h-96">
    </UTable>
    <template #modalBody>
      <UForm :state="poCurrent" class="space-y-5">
        <UFormGroup label="Code" name="code">
          <UInput disabled v-model="poCurrent.code"/>
        </UFormGroup>
        <UFormGroup label="Supplier" name="supplierCode">
          <div class="flex justify-between gap-2">
            <UInput disabled v-model="poCurrent.supplierCode" class="w-full"/>
            <UInput disabled :model-value="getSupplierName(supplierData, poCurrent.supplierCode)" class="w-full"/>
            <SearchData :data="supplierData" :columns="[{key: 'name', label: 'Name'}, {key: 'code', label: 'Code'}]" @selected="selectedSupplier"/>
          </div>
        </UFormGroup>
        <UFormGroup label="Status" name="status">
          <USelect  v-model="poCurrent.status" :options="purchaseOrderStatus().data" option-attribute="name" value-attribute="status"/>
        </UFormGroup>
        <UFormGroup label="Order Date" name="orderDate">
          <UInput v-model="poCurrent.orderDate" type="date"/>
        </UFormGroup>
        <UFormGroup label="Date Of Receipt" name="dateOfReceipt">
          <UInput v-model="poCurrent.dateOfReceipt" type="date"/>
        </UFormGroup>
      </UForm>
    </template>
  </MainConsole>
</div>
</template>

<style scoped>

</style>