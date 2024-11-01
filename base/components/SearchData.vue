<script setup lang="ts">
const {
  title,
  data,
  keyData,
  selectMulti,
  icon,
  isNonIcon,
  btnLabel,
  btnColor,
}
= defineProps<{
  title?: string,
  data: any[],
  columns?: any[]
  keyData: string,
  selectMulti?: boolean,
  icon?: string,
  isNonIcon?: boolean,
  btnLabel?: string,
  btnColor?: string
}>()
// = defineProps(['icon', 'isNonIcon', 'btnColor', 'btnLabel', 'title', 'columns', 'data', 'keyData', 'selectMulti'])
const emit = defineEmits(['selected'])

const isOpen = ref(false)
const result = ref()
const singleResult = ref<any[]>([])
const q = ref('')
const btnIcon = computed(() => {
  if (!isNonIcon) {
    return icon || 'heroicons:ellipsis-horizontal-20-solid'
  } else {
    return undefined
  }
})

if (selectMulti) {
  result.value = []
}

function removeAccents(str: any) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const filteredRows = computed(() => {
  if (Array.isArray(data)) {
    if (!q.value) {
      return data
    }

    return data.filter((item) => {
      return Object.values(item).some((value) => {
        return removeAccents(String(value).toLowerCase()).includes(removeAccents(q.value.toLowerCase()));
      })
    })
  } else {
    return []
  }
})

function select(row: any) {
  if (selectMulti) {
    const index = result.value.findIndex((item: { [x: string]: any; }) => item?.[`${keyData}`] === row?.[`${keyData}`])
    if (index === -1) {
      result.value.push(row)
    } else {
      result.value.splice(index, 1)
    }
  } else {
    singleResult.value.length = 0
    singleResult.value.push(row)
  }
}

function selected() {
  let response
  if (selectMulti) {
    response = result.value
  } else {
    response = singleResult.value
  }
  emit('selected', response)
  isOpen.value = false
}

function clearSelect() {
  if (selectMulti) {
    result.value = []
  } else {
    singleResult.value = []
  }
}

</script>

<template>
  <div>
    <div @click="isOpen = true">
      <slot v-if="$slots.btn" name="btn"/>
      <UButton v-else :label="btnLabel || ''" :color="btnColor || undefined"
               :icon="btnIcon"/>
    </div>
    <UModal v-model="isOpen" :overlay="false">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="space-y-5">
            <div class="flex items-center justify-between">
              <span class="text-xl font-bold">{{ title || 'Select' }}</span>
              <UIcon name="heroicons:x-mark-20-solid" size="20" class="cursor-pointer" @click="isOpen = false"/>
            </div>
            <UInput v-model="q" placeholder="Filter..."/>
          </div>
        </template>

        <UTable v-model="result" :columns="columns"
                :rows="filteredRows"
                @select="select"/>

        <div v-if="!selectMulti && singleResult.length > 0" class="space-y-5 mt-3">
          <span class="text-xl font-bold">Selected</span>
          <UTable :rows="singleResult" :columns="columns"/>
        </div>


        <template #footer>
          <div class="space-y-4">
            <UButton label="Select" @click="selected" block/>
            <UButton color="white" label="Clear" @click="clearSelect" block/>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>

</style>