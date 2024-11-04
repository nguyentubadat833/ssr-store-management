<script setup lang="ts">
import type {IPurchaseOrderDetail, IPurchaseOrderRes} from "~/types/IPurchaseOrder";
import {IMainConsoleData} from "~/types/client/IMainConsoleData";
import type {ISupplierDto} from "~/types/ISupplier";
import type {IProductDto} from "~/types/IProduct";
import type {ITimelineElement} from "~/types/client/ITimelineElement";

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  groupMenu: 'purchasing',
  pageName: {
    en: 'Purchase Order management'
  }
})

const toast = useToast()
const notification = useNotification
const {data: supplierFetch, keyData: supplierKey, getSupplierName} = useSupplier()
const {data, save, select, del, keyData: poKey, purchaseOrderStatus} = usePurchaseOrder()
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
    let result: { code: string | undefined, info: any }[] = []
    value.forEach(el => {
      result.push({
        code: el.code,
        info: el.info
      })
    })
    return result
  }
})
const {data: poData, refresh: refreshPoData} = await useAsyncData(poKey.poKeyData, () => data())

const initialState: IPurchaseOrderRes = {
  code: '',
  supplierCode: '',
  description: '',
  status: NaN,
  details: [] as IPurchaseOrderDetail[],
  orderDate: undefined,
  dateOfReceipt: undefined,
};

const poCurrent = reactive<IPurchaseOrderRes>({...initialState})
const isPoPending = computed(() => poCurrent.status === 0)

const columns = [{
  key: 'code',
  label: 'Code'
}, {
  key: 'supplierCode',
  label: 'Supplier',
}, {
  key: 'status',
  label: 'Status',
  sortable: true
}, {
  key: 'orderDate',
  label: 'Order Date',
  sortable: true
}, {
  key: 'dateOfReceipt',
  label: 'Date Of Receipt',
  sortable: true
}, {
  key: 'description',
  label: 'Description',
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
    poCurrent.details = []
  }

  async deleteData(): Promise<void> {
    if (poCurrent.code) {
      const code = await del({
        poCode: poCurrent.code
      })
      if (code) {
        this.isOpenModal.value = false
        await this.refreshData()
      }
    }
  }

  mapState(object: any): void {
    this.isOpenModal.value = true
    if (isObject(object)) {
      useAssign(poCurrent, object)
    }
  }

  async refreshData(): Promise<void> {
    await refreshPoData()
  }

  async saveData(): Promise<void> {
    const response = await save({
      params: {
        type: "save",
        poCode: poCurrent.code
      },
      data: {
        supplierCode: poCurrent.supplierCode,
        description: poCurrent.description,
        details: poCurrent.details?.filter(e => {
          return !('status' in e) || e.status === 1;
        })
      }
    })
    this.mapState(response)
    await this.refreshData()
  }
}

const consoleData = new ConsoleData()

function selectedSupplier(data: any) {
  poCurrent.supplierCode = data[0]?.code
}

function selectedProduct(data: any) {
  const addProducts: { code: string, name: string }[] = data
  addProducts.forEach(e => {
    const isElExist = poCurrent.details?.some(el => el.productCode === e.code)
    if (!isElExist) {
      (poCurrent.details as IPurchaseOrderDetail[]).push({
        poCode: poCurrent.code,
        productCode: e.code,
        quantity: 0,
        unitPrice: 0,
        totalAmount: 0
      } as IPurchaseOrderDetail)
    }
  })
}

async function changeStatus(input?: number) {
  switch (input) {
    case 0:
      if (poCurrent.code) {
        await save({
          params: {
            type: 'cancel',
            poCode: poCurrent.code
          }
        })
      }
      break
    case 1:
      if (!poCurrent.code) {
        await consoleData.saveData()
      }
      await save({
        params: {
          type: 'confirm',
          poCode: poCurrent.code
        }
      })
      break
  }
  await refreshPoData()
  consoleData.mapState(await selectByCode())
}

function noUseDetail(index: number) {
  if (isArray(poCurrent.details)) {
    poCurrent.details[index].status = 0
  }
}

function useDetail(index: number) {
  if (isArray(poCurrent.details)) {
    poCurrent.details[index].status = 1
  }
}

const timelineItems: ITimelineElement[] = purchaseOrderStatus().data.map(e => {
  return {
    label: e.name,
    order: e.status,
    action: () => changeStatus(e.status)
  } as ITimelineElement
})

function handleChangeQuantityOrUnitPrice(event: any, poDetailRow: IPurchaseOrderDetail) {
  if (poDetailRow.unitPrice && poDetailRow.quantity) {
    poDetailRow.totalAmount = poDetailRow.unitPrice * poDetailRow.quantity
  }
}

function handleChangTotalAmount(event: any, poDetailRow: IPurchaseOrderDetail) {
  if (!poDetailRow.totalAmount) {
    poDetailRow.unitPrice = 0
  } else {
    poDetailRow.unitPrice = poDetailRow.totalAmount / poDetailRow.quantity
  }
}

</script>

<template>
  <div>
    <MainConsole :console-data="consoleData" :is-btn-modal-disabled="poCurrent.status">
      <UTable :columns="columns" :rows="poData || []" @select="consoleData.mapState($event)" :sort="sort"
              class="max-h-96">
        <template #supplierCode-data="{row}">
          {{ `${row.supplierCode} | ${getSupplierName(supplierData, row.supplierCode)}` }}
        </template>
        <template #status-data="{row}">
          <span :class="[{'bg-green-300': row.status === 1}, {'bg-blue-300': row.status === 2}]">{{
              purchaseOrderStatus().map(row.status)
            }}</span>
        </template>
        <template #orderDate-data="{row}">
          <NuxtTime v-if="row.orderDate" :datetime="row.orderDate" year="numeric" month="numeric" day="numeric"/>
        </template>
        <template #dateOfReceipt-data="{row}">
          <NuxtTime v-if="row.dateOfReceipt" :datetime="row.dateOfReceipt" year="numeric" month="numeric"
                    day="numeric"/>
        </template>
      </UTable>
      <template #modalHeader>
        <div class="flex items-center justify-center">
          <Timeline :elements="timelineItems" v-model:active-index="poCurrent.status"/>
        </div>
      </template>
      <template #modalBody>
        <UForm :state="poCurrent" class="space-y-5" :class="[{'pointer-events-none': !isPoPending && poCurrent.code}]">
          <UFormGroup label="Code" name="code">
            <UInput disabled v-model="poCurrent.code"/>
          </UFormGroup>
          <UFormGroup label="Supplier" name="supplierCode">
            <div class="flex justify-between gap-2">
              <UInput disabled v-model="poCurrent.supplierCode" class="w-full"/>
              <UInput disabled :model-value="getSupplierName(supplierData, poCurrent.supplierCode)" class="w-full"/>
              <SearchData title="Select Supplier" :data="supplierData" key-data="code"
                          :columns="[{key: 'info.name', label: 'Name'}, {key: 'code', label: 'Code'}]"
                          @selected="selectedSupplier"/>
            </div>
          </UFormGroup>
          <!--          <UFormGroup label="Status" name="status">-->
          <!--            <USelect disabled v-model="poCurrent.status" :options="purchaseOrderStatus().data" option-attribute="name"-->
          <!--                     value-attribute="status"/>-->
          <!--          </UFormGroup>-->
          <UFormGroup v-if="poCurrent.orderDate" label="Order Date" name="orderDate">
            <NuxtTime :datetime="poCurrent.orderDate" year="numeric" month="numeric"
                      day="numeric"/>
          </UFormGroup>
          <UFormGroup v-if="poCurrent.dateOfReceipt" label="Date Of Receipt" name="dateOfReceipt">
            <NuxtTime :datetime="poCurrent.dateOfReceipt" year="numeric" month="numeric"
                      day="numeric"/>
          </UFormGroup>
          <UFormGroup label="Description" name="description">
            <UTextarea
                autoresize
                v-model="poCurrent.description"
            />
          </UFormGroup>
          <UTable :columns="poDetailColumns" :rows="poCurrent.details || []"
                  class="max-h-80">
            <template #quantity-data="{row}">
              <UFormGroup :error="!row.quantity && 'You must enter quantity'">
                <UInput v-model="row.quantity" type="number" @change="handleChangeQuantityOrUnitPrice($event, row)"/>
              </UFormGroup>
            </template>
            <template #unitPrice-data="{row}">
              <UInput v-model="row.unitPrice" type="number" @change="handleChangeQuantityOrUnitPrice($event, row)"/>
            </template>
            <template #totalAmount-data="{row}">
              <UFormGroup :error="(row.quantity > 0 && !row.totalAmount) && 'You must enter totalAmount'">
                <UInput v-model="row.totalAmount" type="number" @change="handleChangTotalAmount($event, row)"/>
              </UFormGroup>
            </template>
            <template #productCode-data="{row, index}">
              <span :class="[{'line-through': Number.isFinite(row.status) && row.status === 0}]">{{
                  getProductName(productData, row?.productCode)
                }}</span>
            </template>
            <template #actions-data="{index, row}">
              <div class="space-x-2">
                <Icon v-if="!('status' in row) || row.status === 1" name="ic:outline-clear" size="20"
                      class="cursor-pointer" @click="noUseDetail(index)"/>
                <Icon v-else name="ic:baseline-undo" size="20" class="cursor-pointer" @click="useDetail(index)"/>
              </div>
            </template>
          </UTable>
          <div class="flex justify-end">
            <SearchData title="Select Product" btn-label="Add Product" :is-non-icon="true" btn-color="white"
                        :data="productData"
                        key-data="code"
                        :columns="[{key: 'name', label: 'Name'}, {key: 'code', label: 'Code'}]" :select-multi="true"
                        @selected="selectedProduct"
                        :class="[{'pointer-events-none': (!isPoPending && poCurrent.code) || !poCurrent.supplierCode}]"/>
          </div>
        </UForm>
      </template>
    </MainConsole>
  </div>
</template>

<style scoped>

</style>