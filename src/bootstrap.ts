async function enableCrossOriginIsolation() {
  if (window.crossOriginIsolated || !('serviceWorker' in navigator)) return;

  await navigator.serviceWorker.register(
    `${import.meta.env.BASE_URL}coi-serviceworker.js`,
    { scope: import.meta.env.BASE_URL },
  );

  if (navigator.serviceWorker.controller) return;

  await navigator.serviceWorker.ready;
  window.location.reload();
  await new Promise<void>(() => {});
}

async function bootstrap() {
  try {
    await enableCrossOriginIsolation();
  } catch (error) {
    console.error('[aoles-gl] Failed to enable cross-origin isolation', error);
  }

  await import('./main');
}

void bootstrap();
