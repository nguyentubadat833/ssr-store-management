<script setup lang="ts">
const {consoleRoutes} = useRouterConfig()
const route = useRoute()

const routeGroup = Object.values(useGroupBy(consoleRoutes, "group"))
console.log(routeGroup)

</script>

<template>
  <div>
    <UCard>
      <div class="lg:grid grid-flow-col gap-5 space-y-5 lg:space-y-0">
        <div v-for="group in routeGroup" class="flex flex-col lg:gap-3">
          <NuxtLink v-for="rt in group" :to="rt.link">
          <span class="cursor-pointer hover:underline"
                :class="[{'underline': rt.link === route.fullPath}]">{{ rt.name }}</span>
          </NuxtLink>
        </div>
<!--        <NuxtLink v-for="rt in consoleRoutes" :to="rt.link">-->
<!--          <span class="cursor-pointer hover:underline"-->
<!--                :class="[{'underline': rt.link === route.fullPath}]">{{ rt.name }}</span>-->
<!--        </NuxtLink>-->
      </div>
    </UCard>
    <slot/>
  </div>
</template>

<style scoped>

</style>