<script setup lang="ts">
import { onMounted } from "vue";
import { SwaggerUIBundle } from "swagger-ui-dist";
import "swagger-ui-dist/swagger-ui.css";
import { useSwaggerDark } from "../../../.vitepress/theme/useSwaggerDark";

useSwaggerDark();

onMounted(() => {
  SwaggerUIBundle({
    dom_id: "#swaggerContainer",
    url: "/openapi/controller-hardware-registration-and-configuration-openapi.yaml"
  });
});
</script>

<template>
  <div class="swagger" id="swaggerContainer" />
</template>
