<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useData } from "vitepress";

const { isDark } = useData();

const STYLE_ID = 'vp-asyncapi-dark';

const darkCSS = `
  .bg-white, .bg-gray-100 { background-color: #1b1b1f !important; }
  .bg-gray-200 { background-color: #202127 !important; }
  .bg-gray-400 { background-color: #3c3c43 !important; }
  .bg-gray-600 { background-color: #3c3c43 !important; }
  .bg-gray-800 { background-color: #0e0e11 !important; }
  .bg-blue-50, .bg-blue-100 { background-color: #1e2535 !important; }
  .bg-blue-400, .bg-blue-500, .bg-blue-600, .bg-blue-700 { background-color: #2a3a5c !important; }
  .text-gray-900, .text-gray-800 { color: rgba(255,255,245,.86) !important; }
  .text-gray-700, .text-gray-600 { color: rgba(235,235,245,.60) !important; }
  .text-gray-500, .text-gray-200 { color: rgba(235,235,245,.45) !important; }
  .text-white { color: #ffffff !important; }
  .prose, .prose h1, .prose h2, .prose h3, .prose h4 { color: rgba(255,255,245,.86) !important; }
  .border-gray-400 { border-color: rgba(82,82,89,1) !important; }
`;

function applyTheme(dark: boolean) {
  const el = document.querySelector('asyncapi-component');
  if (!el?.shadowRoot) return;
  let styleEl = el.shadowRoot.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    el.shadowRoot.appendChild(styleEl);
  }
  styleEl.textContent = dark ? darkCSS : '';
}

onMounted(async () => {
  if (!customElements.get('asyncapi-component')) {
    const script = document.createElement('script');
    script.src = '/asyncapi/web-component.js';
    document.head.appendChild(script);
  }
  await customElements.whenDefined('asyncapi-component');
  // Give React one tick to render into the shadow root
  await new Promise(resolve => setTimeout(resolve, 50));
  applyTheme(isDark.value);
});

watch(isDark, (dark) => applyTheme(dark));
</script>

<template>
  <div class="asyncapi-wrapper">
    <asyncapi-component
      schemaUrl="/asyncapi/controller.yaml"
      cssImportPath="/asyncapi/default.min.css"
    />
  </div>
</template>

<style scoped>
.asyncapi-wrapper {
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  padding: 8px;
}
</style>
