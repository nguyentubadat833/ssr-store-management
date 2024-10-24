<script setup lang="ts">
import type {IPurchaseOrderDetail, IPurchaseOrderDetailUpdate, IPurchaseOrderDto} from "~/types/IPurchaseOrder";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {ISupplierDto} from "~/types/ISupplier";
import type {IProductDto} from "~/types/IProduct";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  pageName: {
    en: 'Purchase Order management'
  }
})

const {data: supplierFetch, keyData: supplierKey, getSupplierName} = useSupplier()
const {data, create, update, select, del, keyData: poKey, purchaseOrderStatus} = usePurchaseOrder()
const {data: productFetch, keyData: productKey, getProductName} = useProduct()
const {data: productData} = useLazyAsyncData(productKey.productKeyData, () => productFetch(), {
  transform: (value: IProductDto[]) => {
    let result: { code: string | undefined, name: string }[] = []
    value.forEach(el => {
      result.push({
        code: el.code,
        name: el.name
      })
    })
    return result
  }
})
const {data: supplierData} = await useAsyncData(supplierKey.supplierKeyData, () => supplierFetch(), {
  transform: (value: ISupplierDto[]) => {
    let result: { code: string | undefined, name: string }[] = []
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

const initialState: IPurchaseOrderDto = {
  code: '',
  supplierCode: '',
  status: NaN,
  details: [] as IPurchaseOrderDetail[],
  orderDate: undefined,
  dateOfReceipt: undefined,
};

const poCurrent = reactive<IPurchaseOrderDto>({...initialState})
const poDetailToDelete = ref<string[]>([])

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

const poDetailColumns = [{
  key: 'productCode',
  label: 'Product',
}, {
  key: 'quantity',
  label: 'Quantity',
}, {
  key: 'unitPrice',
  label: 'Unit Price',
}, {
  key: 'totalAmount',
  label: 'Total Amount',
}, {
  key: 'actions',
}]

async function selectByCode(code?: string) {
  return await select({
    selectType: 'byCode',
    poCode: code ? code : poCurrent?.code
  })
}

class ConsoleData extends IMainConsoleData {
  clearState(): void {
    useAssign(poCurrent, initialState)
  }

  async deleteData(): Promise<void> {
    if (poCurrent.code) {
      await del({
        poCode: poCurrent.code
      })
    }
  }

  mapState(object: any): void {
    console.log(object)
    this.isOpenModal.value = true
    if (isObject(object)) {
      useAssign(poCurrent, object)
    }
  }

  async refreshData(): Promise<void> {
    await refreshPoData()
  }

  async saveData(): Promise<void> {
    if (!poCurrent.code) {
      const poCode = await create(poCurrent)
      if (poCode) {
        await refreshPoData()
        this.mapState(await selectByCode(poCode))
      }
    } else {
      await update({
        params: {
          updateType: 'update',
          poCode: poCurrent.code
        },
        data: {
          code: poCurrent.code,
          supplierCode: poCurrent.supplierCode,
          details: {
            toDelete: poDetailToDelete.value,
            toCreate: (poCurrent.details as IPurchaseOrderDetail[]).filter(e => !e.id),
            toUpdate: (poCurrent.details as IPurchaseOrderDetail[]).filter(e => e.id),
          } as IPurchaseOrderDetailUpdate
        } as IPurchaseOrderDto
      })
      await refreshPoData()
      this.mapState(await selectByCode())
    }
  }
}

const consoleData = new ConsoleData()

function selectedSupplier(data: any) {
  poCurrent.supplierCode = data[0]?.code
}

function selectedProduct(data: any) {
  const addProducts: { code: string, name: string }[] = data
  if (poCurrent.code) {
    addProducts.forEach(e => {
      (poCurrent.details as IPurchaseOrderDetail[]).push({
        poCode: poCurrent.code,
        productCode: e.code,
        quantity: 0,
        unitPrice: 0,
        totalAmount: 0
      } as IPurchaseOrderDetail)
    })
  }
  console.log(data)
}

function addDetailToDelete(index: number, row: IPurchaseOrderDetail) {
  if (isString(row.id) && isArray(poCurrent.details)) {
    poDetailToDelete.value.push(row.id)
    poCurrent.details?.splice(index, 1)
  }
}

async function cancelOrConfirmPo(type: 'cancel' | 'confirm') {
  if (poCurrent.code) {
    await update({
      params: {
        updateType: type,
        poCode: poCurrent.code
      }
    })
    await refreshPoData()
    consoleData.mapState(await selectByCode())
  }
}

</script>

<template>
  <div>
    <MainConsole :console-data="consoleData">
      <UTable :columns="columns" :rows="poData || []" @select="consoleData.mapState($event)" :sort="sort"
              class="max-h-96">
      </UTable>
      <template #modalBody>
        <div class="flex items-center justify-between">
          <div>
            <SearchData btn-label="Add Product" :is-non-icon="true" btn-color="white"
                        :is-disabled="poCurrent.status !== 0 && poCurrent.code" :data="productData"
                        :columns="[{key: 'name', label: 'Name'}, {key: 'code', label: 'Code'}]" :select-multi="true"
                        @selected="selectedProduct"/>
          </div>
          <div class="space-x-3">
            <UButton label="Cancel" color="red" :disabled="poCurrent.status === 0"
                     @click="cancelOrConfirmPo('cancel')"/>
            <UButton label="Confirm" :disabled="poCurrent.status === 1" @click="cancelOrConfirmPo('confirm')"/>
          </div>
        </div>
        <UForm :state="poCurrent" class="space-y-5">
          <UFormGroup label="Code" name="code">
            <UInput disabled v-model="poCurrent.code"/>
          </UFormGroup>
          <UFormGroup label="Supplier" name="supplierCode">
            <div class="flex justify-between gap-2">
              <UInput disabled v-model="poCurrent.supplierCode" class="w-full"/>
              <UInput disabled :model-value="getSupplierName(supplierData, poCurrent.supplierCode)" class="w-full"/>
              <SearchData :data="supplierData" :columns="[{key: 'name', label: 'Name'}, {key: 'code', label: 'Code'}]"
                          @selected="selectedSupplier"/>
            </div>
          </UFormGroup>
          <UFormGroup label="Status" name="status">
            <USelect disabled v-model="poCurrent.status" :options="purchaseOrderStatus().data" option-attribute="name"
                     value-attribute="status"/>
          </UFormGroup>
          <UFormGroup label="Order Date" name="orderDate">
            <UInput disabled v-model="poCurrent.orderDate" type="date"/>
          </UFormGroup>
          <UFormGroup label="Date Of Receipt" name="dateOfReceipt">
            <UInput disabled v-model="poCurrent.dateOfReceipt" type="date"/>
          </UFormGroup>
          <UTable :columns="poDetailColumns" :rows="poCurrent.details || []"
                  class="max-h-80">
            <template #productCode-data="{row, index}">
              <span>{{ getProductName(productData, row?.productCode) }}</span>
            </template>
            <template #actions-data="{index, row}">
              <div class="space-x-2">
                <Icon name="ic:outline-clear" size="20" class="cursor-pointer"
                      @click="addDetailToDelete(index, row)"/>
              </div>
            </template>
          </UTable>
        </UForm>

      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>