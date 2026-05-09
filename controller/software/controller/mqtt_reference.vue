<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  import("@asyncapi/web-component/lib/asyncapi-web-component.js");
});
</script>

<template>
  <div class="asyncapi">
    <asyncapi-component
      schemaUrl="/asyncapi/controller.yaml"
      cssImportType="style"
    />
  </div>
</template>
