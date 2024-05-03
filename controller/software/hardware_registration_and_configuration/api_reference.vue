<script setup lang="ts">
import { onMounted } from "vue";
import { SwaggerUIBundle } from "swagger-ui-dist";
import "swagger-ui-dist/swagger-ui.css";

onMounted(() => {
  SwaggerUIBundle({
    dom_id: "#swaggerContainer",
    url: "https://raw.githubusercontent.com/BrentIO/FireFly-Controller/main/Hardware-Registration-and-Configuration/swagger.yaml"
  });
});
</script>

<template>
  <div class="swagger" id="swaggerContainer" />
</template>