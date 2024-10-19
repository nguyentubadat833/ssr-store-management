<script setup>

const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

</script>

<template>
  <div>
    <ClientOnly>
      <UButton
          :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
          variant="ghost"
          color="gray"
          aria-label="Theme"
          @click="isDark = !isDark"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>

</style>