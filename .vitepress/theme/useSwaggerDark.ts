import { onMounted, watch } from "vue";
import { useData } from "vitepress";

const STYLE_ID = 'vp-swagger-dark';

const darkCSS = `
  .swagger-ui,
  .swagger-ui .wrapper,
  .swagger-ui .opblock-body pre.microlight { background: #1b1b1f; color: rgba(255,255,245,.86); }

  .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info li { color: rgba(255,255,245,.86); }
  .swagger-ui .info a { color: #5b9cf6; }

  .swagger-ui .scheme-container { background: #202127; box-shadow: none; }
  .swagger-ui .schemes label { color: rgba(255,255,245,.86); }
  .swagger-ui select { background: #2c2c34; color: rgba(255,255,245,.86); border-color: rgba(82,82,89,1); }

  .swagger-ui .opblock-tag { color: rgba(255,255,245,.86); border-bottom-color: rgba(82,82,89,1); }
  .swagger-ui .opblock-tag:hover { background: rgba(60,60,67,.3); }

  .swagger-ui .opblock .opblock-summary-description,
  .swagger-ui .opblock .opblock-summary-path,
  .swagger-ui .opblock .opblock-summary-path__deprecated { color: rgba(255,255,245,.86); }
  .swagger-ui .opblock .opblock-section-header { background: rgba(60,60,67,.6); }
  .swagger-ui .opblock .opblock-section-header label,
  .swagger-ui .opblock .opblock-section-header h4 { color: rgba(255,255,245,.86); }

  .swagger-ui .parameters-col_description p,
  .swagger-ui .parameter__name,
  .swagger-ui .parameter__type,
  .swagger-ui .parameter__deprecated,
  .swagger-ui table thead tr td,
  .swagger-ui table thead tr th { color: rgba(255,255,245,.86); }
  .swagger-ui .parameters-col_description input[type=text],
  .swagger-ui .body-param textarea { background: #202127; color: rgba(255,255,245,.86); border-color: rgba(82,82,89,1); }

  .swagger-ui .response-col_status,
  .swagger-ui .response-col_links,
  .swagger-ui .responses-inner h4,
  .swagger-ui .responses-inner h5 { color: rgba(255,255,245,.86); }
  .swagger-ui .response-control-media-type__title { color: rgba(235,235,245,.60); }

  .swagger-ui section.models { border-color: rgba(82,82,89,1); }
  .swagger-ui section.models h4 { color: rgba(255,255,245,.86); border-bottom-color: rgba(82,82,89,1); }
  .swagger-ui section.models .model-box { background: #202127; }
  .swagger-ui .model-title, .swagger-ui .model { color: rgba(255,255,245,.86); }
  .swagger-ui .prop-type { color: #5b9cf6; }

  .swagger-ui .topbar { background: #0e0e11; }

  .swagger-ui a.nostyle, .swagger-ui a.nostyle:visited { color: rgba(255,255,245,.86); }

  .swagger-ui .highlight-code > .microlight { background: #0e0e11 !important; color: rgba(255,255,245,.86) !important; }

  .swagger-ui .markdown p, .swagger-ui .markdown li { color: rgba(255,255,245,.86); }
`;

export function useSwaggerDark() {
  const { isDark } = useData();

  function applyTheme(dark: boolean) {
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = dark ? darkCSS : '';
  }

  onMounted(() => applyTheme(isDark.value));
  watch(isDark, applyTheme);
}
