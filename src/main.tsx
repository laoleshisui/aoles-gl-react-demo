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
import { resolveGlslUrl } from '@aoles-gl/effects';

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
  glslUrlResolver: resolveGlslUrl,
});

// WASM preload list; position shaders are attached directly by the React track bridge.
const ASSET_PRELOAD_LIST = [
  { url: '/fonts/NotoSansSC-Regular.ttf', wasmPath: '/fonts/NotoSansSC-Regular.ttf' },
  { url: resolveGlslUrl('/glsl/text/position_text.glsl'), wasmPath: '/glsl/text/position_text.glsl' },
  { url: resolveGlslUrl('/glsl/video/position.glsl'), wasmPath: '/glsl/video/position.glsl' },
].filter((asset): asset is { url: string; wasmPath: string } => Boolean(asset.url));

engine.onWasmReady(async () => {
  const base = (import.meta.env.VITE_ASSERT_BASEPATH || '').replace(/\/$/, '');
  for (const asset of ASSET_PRELOAD_LIST) {
    try {
      const fetchPath = asset.url.startsWith('/') && !asset.url.startsWith('/assets')
        ? base + asset.url
        : asset.url;
      const res = await fetch(fetchPath);
      if (!res.ok) {
        console.warn(`[aoles-gl] Load failed: ${asset.wasmPath}`);
        continue;
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      const fs = (engine as any).controllerWasmLoader.module['GLController'].FS;
      const parts = asset.wasmPath.split('/').filter(Boolean);
      parts.pop();
      let dir = '';
      for (const part of parts) {
        dir += `/${part}`;
        try {
          fs.mkdir(dir);
        } catch {}
      }
      fs.writeFile(asset.wasmPath, buf);
    } catch (e) {
      console.warn(`[aoles-gl] Preload failed: ${asset.wasmPath}`, e);
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
