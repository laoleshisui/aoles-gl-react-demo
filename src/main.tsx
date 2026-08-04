import React from 'react';
import ReactDOM from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import {
  Engine,
  setupAolesI18n,
  EngineProvider,
  initEffects,
} from '@aoles-gl/react';
import '@aoles-gl/react/style.css';

import controllerJs from '@aoles-gl/core/wasm/GLController.mjs?url';
import controllerWasm from '@aoles-gl/core/wasm/GLController.wasm?url';

import App from './App';

// Initialize i18n
i18next
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('lang') || 'zh',
    fallbackLng: 'en',
    resources: { en: {}, zh: {} },
    interpolation: {
      escapeValue: false,
    },
  });

// Merge library locale resources
setupAolesI18n(i18next);

// Create Engine instance and configure WASM paths
const engine = new Engine(undefined, undefined, { width: 1920, height: 1080, fps: 30 });
engine.configure({ jsPath: controllerJs, wasmPath: controllerWasm });
engine.configAssetPath({
  basePath: import.meta.env.VITE_ASSERT_BASEPATH || '/',
});

// WASM preload list (fonts and shaders needed for text rendering)
const ASSET_PRELOAD_LIST = [
  '/fonts/NotoSansSC-Regular.ttf',
  '/glsl/text/position_text.glsl',
  '/glsl/video/position.glsl',
  '/glsl/video/effect/hflip.glsl',
];

engine.onWasmReady(async () => {
  const base = (import.meta.env.VITE_ASSERT_BASEPATH || '').replace(/\/$/, '');
  for (const assetPath of ASSET_PRELOAD_LIST) {
    try {
      const res = await fetch(base + assetPath);
      if (!res.ok) {
        console.warn(`[aoles-gl] Load failed: ${assetPath}`);
        continue;
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      const fs = (engine as any).controllerWasmLoader.module['GLController'].FS;
      const parts = assetPath.split('/').filter(Boolean);
      parts.pop();
      let dir = '';
      for (const part of parts) {
        dir += `/${part}`;
        try {
          fs.mkdir(dir);
        } catch {}
      }
      fs.writeFile(assetPath, buf);
    } catch (e) {
      console.warn(`[aoles-gl] Preload failed: ${assetPath}`, e);
    }
  }
});

// Initialize effects
initEffects(engine);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EngineProvider engine={engine}>
      <App />
    </EngineProvider>
  </React.StrictMode>,
);
