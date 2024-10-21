<script setup lang="ts">

definePageMeta({
  layout: 'console',
  isAuth: true,
  isConsoleMenu: true,
  pageName: {
    en: 'Category management'
  },
})

const {data, keyData} = useCategory()
const {data: categoryData} = await useAsyncData(keyData.categoryDataKey, () => data())
console.log(categoryData.value)
</script>

<template>
  <div>
    category
  </div>
</template>

<style scoped>

</style>