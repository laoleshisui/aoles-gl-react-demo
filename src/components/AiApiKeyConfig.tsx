import { useEffect, useState } from 'react';

interface AiApiKeyConfigProps {
  configured: boolean;
  authenticated: boolean;
  expanded: boolean;
  authLabel: string;
  onSave: (apiKey: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onClear: () => void;
}

export default function AiApiKeyConfig({
  configured,
  authenticated,
  expanded,
  authLabel,
  onSave,
  onEdit,
  onCancel,
  onClear,
}: AiApiKeyConfigProps) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!expanded) setDraft('');
  }, [expanded]);

  const save = () => {
    const apiKey = draft.trim();
    if (!apiKey) return;
    onSave(apiKey);
    setDraft('');
  };

  return (
    <section className={`ai-api-key-config ${expanded ? 'expanded' : ''}`.trim()}>
      <header className="ai-api-key-header">
        <span
          className={`ai-api-key-status ${authenticated ? 'connected' : ''}`.trim()}
          aria-hidden="true"
        />
        <div className="ai-api-key-summary">
          <strong>{authenticated ? 'PixoClip AI 已连接' : '连接 PixoClip AI'}</strong>
          <small>{authenticated ? authLabel : '使用由 PixoClip 签发的 API-Key'}</small>
        </div>
        {authenticated && !expanded && (
          <button type="button" className="ai-api-key-edit" onClick={onEdit}>更换</button>
        )}
      </header>

      {expanded && (
        <div className="ai-api-key-form">
          {authenticated && <p>输入新的 PixoClip API-Key，保存后立即切换。</p>}
          <input
            type="password"
            value={draft}
            autoComplete="off"
            placeholder="输入 PixoClip API-Key"
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') save();
            }}
          />
          <div className="ai-api-key-actions">
            <button type="button" className="primary" disabled={!draft.trim()} onClick={save}>
              {configured ? '更新密钥' : '连接'}
            </button>
            {authenticated && <button type="button" className="quiet" onClick={onCancel}>取消</button>}
            {configured && <button type="button" className="danger" onClick={onClear}>移除</button>}
          </div>
          <small>仅在当前页面内存中使用，刷新或关闭页面后自动清除。</small>
        </div>
      )}
    </section>
  );
}
