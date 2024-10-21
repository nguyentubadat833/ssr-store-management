<template>
  <div class="p-3">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
    <ClientOnly>
      <UNotifications />
    </ClientOnly>
  </div>

</template>
<script setup lang="ts">
</script>