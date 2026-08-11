import { useMemo, useRef, useState } from 'react';
import {
  usePageState,
  usePreviewState,
  usePageDarkMode,
  PreviewContainer,
  TrackContainer,
  ResourceContainer,
  AttributeContainer,
  ResizablePanel,
  useResourceState,
} from '@aoles-gl/react';
import { AolesAiPanel, type ReactAolesAiConfig } from '@aoles-gl/react/ai';
import ExportButton from './components/ExportButton';
import AiApiKeyConfig from './components/AiApiKeyConfig';
import './App.css';

const agentBaseUrl = import.meta.env.VITE_API_AGENT?.trim().replace(/\/+$/, '') ?? '';
const aiEnabled = Boolean(agentBaseUrl);
const aiEndpoint = agentBaseUrl.endsWith('/api/chat')
  ? agentBaseUrl
  : `${agentBaseUrl}/api/chat`;

function AppContent() {
  const pageStore = usePageState();
  const previewStore = usePreviewState();
  const { resources } = useResourceState();
  const resourcesRef = useRef(resources);
  const [aiOpen, setAiOpen] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyEditorOpen, setApiKeyEditorOpen] = useState(true);
  const [aiError, setAiError] = useState('');
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  resourcesRef.current = resources;
  const aiAuthenticated = Boolean(apiKey);
  const aiAuthLabel = 'API-Key（当前页面）';

  const aiConfig = useMemo<ReactAolesAiConfig & { storageKey: string }>(() => ({
    endpoint: aiEndpoint,
    storageKey: 'aoles-gl-react-demo:ai-sessions',
    headers: () => {
      const headers = new Headers();
      if (apiKeyRef.current) {
        headers.set('Authorization', `Api-Key ${apiKeyRef.current}`);
      }
      return headers;
    },
    getAssets: () => resourcesRef.current
      .filter(resource => (
        resource.status === 'ready'
        && (resource.type === 'video' || resource.type === 'audio' || resource.type === 'image')
      ))
      .map(resource => ({
        id: resource.id,
        type: resource.type,
        prompt: resource.name,
        urls: [{
          id: resource.id,
          url: resource.url,
          origin_url: null,
          ...resource.metadata,
        }],
      })),
    authorizeToolCall: ({ name }) => {
      if (name === 'removeClip' || name === 'removeTrack') {
        return window.confirm('允许 AI 助手删除编辑器内容吗？');
      }
      return true;
    },
    onError: error => {
      console.error('[aoles-gl-ai]', error);
      const message = error instanceof Error ? error.message : String(error);
      if (/401|invalid (token|credentials|api key)/i.test(message)) {
        setAiError('AI 鉴权失败，请检查 PixoClip API-Key。');
      } else if (/tool round limit/i.test(message)) {
        setAiError('AI 操作步骤过多，已自动停止。请缩小任务范围后重试。');
      } else {
        setAiError(`AI 请求失败：${message}`);
      }
    },
  }), []);

  const saveAiApiKey = (value: string) => {
    setApiKey(value);
    setAiError('');
    setApiKeyEditorOpen(false);
  };

  const clearAiApiKey = () => {
    setApiKey('');
    setAiError('');
    setApiKeyEditorOpen(true);
  };

  // Sync dark mode to <html> element
  usePageDarkMode(pageStore);

  const isDark = pageStore((state: any) => state.isDark as boolean);
  const attrWidth = pageStore((state: any) => state.attrWidth as number);
  const trackHeight = pageStore((state: any) => state.trackHeight as number);
  const setIsDark = pageStore.getState().setIsDark;
  const setAttrWidth = pageStore.getState().setAttrWidth;
  const setTrackHeight = pageStore.getState().setTrackHeight;

  const wasmRuntimeInited = previewStore(
    (state: any) => state.wasmRuntimeInited as boolean
  );

  return (
    <div className={`editor-root ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="header-bar">
        <div className="brand">
          <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="Pixo" />
          <span className="header-title font-semibold">Aoles GL React</span>
        </div>

        <div className="flex items-center gap-3">
          {wasmRuntimeInited && <ExportButton />}

          <button
            type="button"
            className={`ai-toggle ${aiOpen ? 'active' : ''}`.trim()}
            aria-pressed={aiOpen}
            onClick={() => setAiOpen(open => !open)}
          >
            ✦ AI 助手
          </button>

          {!wasmRuntimeInited && (
            <span className="runtime-status runtime-status-loading text-sm flex items-center gap-1">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Loading WASM...
            </span>
          )}
          {wasmRuntimeInited && (
            <span className="runtime-status runtime-status-ready text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              WASM Ready
            </span>
          )}

          <button
            onClick={() => setIsDark(!isDark)}
            className="theme-toggle w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            title="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="main-content">
        {/* Left: Resources */}
        <ResourceContainer className="resources-section card-style" />

        {/* Right: Preview + Attr + Track */}
        <div className="right-section">
          {/* Top: Preview + Attributes */}
          <div className="preview-attr-row">
            <PreviewContainer className="preview-section card-style" />
            <ResizablePanel
              className="attr-resizable"
              direction="vertical"
              edge="left"
              size={attrWidth}
              minSize={300}
              maxSize={600}
              onSizeChange={setAttrWidth}
            >
              <AttributeContainer className="attr-section card-style" />
            </ResizablePanel>
          </div>

          {/* Bottom: Track timeline */}
          <ResizablePanel
            className="track-resizable"
            direction="horizontal"
            edge="top"
            size={trackHeight}
            minSize={200}
            maxSize={800}
            onSizeChange={setTrackHeight}
          >
            <TrackContainer className="track-section card-style" />
          </ResizablePanel>
        </div>

        {aiOpen && (
          <aside className="ai-section">
            {aiEnabled ? (
              <div className="ai-panel-shell">
                <AiApiKeyConfig
                  configured={Boolean(apiKey)}
                  authenticated={aiAuthenticated}
                  expanded={apiKeyEditorOpen || !aiAuthenticated}
                  authLabel={aiAuthLabel}
                  onSave={saveAiApiKey}
                  onEdit={() => setApiKeyEditorOpen(true)}
                  onCancel={() => setApiKeyEditorOpen(false)}
                  onClear={clearAiApiKey}
                />
                {aiAuthenticated && (
                  <>
                    {aiError && <div className="ai-auth-error">{aiError}</div>}
                    <AolesAiPanel config={aiConfig} />
                  </>
                )}
              </div>
            ) : (
              <div className="ai-unavailable">
                <strong>AI 助手尚未配置</strong>
                <span>请在 <code>.env.development.local</code> 中设置 <code>VITE_API_AGENT</code>。</span>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
