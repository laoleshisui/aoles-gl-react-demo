import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';

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
    const value = draft.trim();
    if (!value) return;
    onSave(value);
    setDraft('');
  };

  return (
    <section className={`ai-api-key-config ${expanded ? 'expanded' : ''}`.trim()}>
      <header className="ai-api-key-header">
        <span className={`ai-api-key-status ${authenticated ? 'connected' : ''}`.trim()} aria-hidden="true" />
        <div className="ai-api-key-summary">
          <strong>{authenticated ? 'PixoClip AI 已连接' : '连接 PixoClip AI'}</strong>
          <small>{authenticated ? authLabel : '使用由 PixoClip 签发的 API-Key'}</small>
        </div>
        {authenticated && !expanded && (
          <Button type="text" size="small" onClick={onEdit}>更换</Button>
        )}
      </header>

      {expanded && (
        <div className="ai-api-key-form">
          {authenticated && <p>输入新的 PixoClip API-Key，保存后立即切换。</p>}
          <Input.Password
            value={draft}
            autoComplete="off"
            placeholder="输入 PixoClip API-Key"
            onChange={event => setDraft(event.target.value)}
            onPressEnter={save}
          />
          <div className="ai-api-key-actions">
            <Button type="primary" size="small" disabled={!draft.trim()} onClick={save}>
              {configured ? '更新密钥' : '连接'}
            </Button>
            {authenticated && <Button type="text" size="small" onClick={onCancel}>取消</Button>}
            {configured && <Button type="text" danger size="small" onClick={onClear}>移除</Button>}
          </div>
          <small>仅在当前页面内存中使用，刷新或关闭页面后自动清除。</small>
        </div>
      )}
    </section>
  );
}
