<script setup lang="ts">
const {consoleRoutes} = useRouterConfig()
const route = useRoute()
</script>

<template>
  <div>
    <UCard>
      <div class="flex flex-col gap-2">
        <NuxtLink v-for="rou in consoleRoutes" :to="rou.link">
          <span class="cursor-pointer hover:underline"
                :class="[{'underline': rou.link === route.fullPath}]">{{ rou.name }}</span>
        </NuxtLink>
      </div>
    </UCard>
    <slot/>
  </div>
</template>

<style scoped>

</style>