import { useState } from 'react';

interface AiApiKeyConfigProps {
  configured: boolean;
  canCancel: boolean;
  onSave: (apiKey: string) => void;
  onCancel: () => void;
  onClear: () => void;
}

export default function AiApiKeyConfig({
  configured,
  canCancel,
  onSave,
  onCancel,
  onClear,
}: AiApiKeyConfigProps) {
  const [draft, setDraft] = useState('');

  const save = () => {
    const apiKey = draft.trim();
    if (!apiKey) return;
    onSave(apiKey);
    setDraft('');
  };

  return (
    <div className="ai-api-key-config">
      <strong>配置 AI API-Key</strong>
      <span>请输入 dataserver 为当前账户签发的 API-Key。</span>
      <input
        type="password"
        value={draft}
        autoComplete="off"
        placeholder="粘贴 API-Key（不含 Api-Key 前缀）"
        onChange={event => setDraft(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') save();
        }}
      />
      <div className="ai-api-key-actions">
        <button type="button" className="primary" disabled={!draft.trim()} onClick={save}>
          保存并使用
        </button>
        {canCancel && <button type="button" onClick={onCancel}>取消</button>}
        {configured && <button type="button" className="danger" onClick={onClear}>清除密钥</button>}
      </div>
      <small>密钥仅保存在当前标签页的 sessionStorage，关闭标签页后自动清除。</small>
    </div>
  );
}
