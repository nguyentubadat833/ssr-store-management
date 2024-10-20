<script setup lang="ts">
const {consoleRoutes} = useRouterConfig()
</script>

<template>
<div>
  <UCard>
    <div class="flex flex-col gap-2">
      <NuxtLink v-for="route in consoleRoutes" :to="route.link">
        <span class="cursor-pointer hover:underline">{{route.name}}</span>
      </NuxtLink>
    </div>
  </UCard>
  <slot/>
</div>
</template>

<style scoped>

</style>