import { useEffect, useMemo, useRef } from 'react';
import { Alert, Modal } from 'antd';
import { SkillMarketplace, createAolesSkillManager, createAolesSkillPersistence, createSkillHttpRepository } from '@aoles-gl/react/ai';

interface Props { open: boolean; dataServerBaseUrl: string; apiKey: string; onClose: () => void }

export default function SkillMarketplaceDialog({ open, dataServerBaseUrl, apiKey, onClose }: Props) {
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  const repository = useMemo(() => createSkillHttpRepository({
    baseUrl: dataServerBaseUrl,
    getAccessToken: () => apiKeyRef.current,
    authorizationScheme: 'Api-Key',
  }), [dataServerBaseUrl]);
  const manager = useMemo(() => createAolesSkillManager({
    repository,
    persistence: createAolesSkillPersistence('aoles-gl-react-demo:skills'),
  }), [repository]);
  useEffect(() => { void manager.restore(); }, [manager]);

  return (
    <Modal className="skill-marketplace-dialog" title="Skill Marketplace" open={open} footer={null} width={1180} destroyOnHidden={false} onCancel={onClose}>
      {!dataServerBaseUrl ? (
        <Alert type="warning" showIcon message="Skill 服务尚未配置" description="请设置 VITE_API_DATA_SERVER 后重新启动开发服务器。" />
      ) : (
        <div className="skill-marketplace-dialog__content">
          {!apiKey && <Alert className="skill-marketplace-dialog__notice" type="info" showIcon message="当前为访客模式" description="可以浏览和安装公开 Skill；配置 API-Key 后可使用“我的提交”和发布功能。" />}
          <SkillMarketplace manager={manager} repository={repository} />
        </div>
      )}
    </Modal>
  );
}
