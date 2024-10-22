<script setup>
const {icon, btnLabel, title, data, selectMulti} = defineProps(['icon', 'btnLabel', 'title', 'columns', 'data', 'selectMulti'])
const emit = defineEmits(['selected'])

const isOpen = ref(false)
const result = ref()
const singleResult = ref([])
const q = ref('')

if (selectMulti === true) {
  result.value = []
}

function removeAccents(str) {
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

function select(row) {
  if (selectMulti === true) {
    const index = result.value.findIndex((item) => item.id === row.id)
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
  if (selectMulti === true) {
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
      <UButton v-else :label="btnLabel || ''" :icon="icon ||'heroicons:ellipsis-horizontal-20-solid'" />
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