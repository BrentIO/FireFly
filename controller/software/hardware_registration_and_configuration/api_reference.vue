<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'

const ApiReference = shallowRef()

onMounted(async () => {
  ApiReference.value = (await import('@scalar/api-reference')).ApiReference
})
</script>

<template>
  <component
    v-if="ApiReference"
    :is="ApiReference"
    :configuration="{
      url: 'https://raw.githubusercontent.com/BrentIO/FireFly-Controller/main/Hardware-Registration-and-Configuration/swagger.yaml'
    }"
  />
</template>
