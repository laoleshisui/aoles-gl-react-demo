import { useMemo, useState } from 'react';
import { Button, Empty, List, Modal, Popconfirm, Space, Tag, Alert } from 'antd';
import type { ArtifactRecord } from '@aoles-gl/core';

interface Props {
  workspaceId: string;
  workspaceName: string;
  workspaceRole: string;
  projectName: string;
  draftStatus: string;
  artifacts: ArtifactRecord[];
  loading: boolean;
  error?: string;
  onRefresh: () => void;
  onMove: (artifact: ArtifactRecord) => void;
  onRemove: (artifact: ArtifactRecord) => void;
}

const formatSize = (value?: number) => {
  if (value == null) return '大小未知';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

export default function WorkspaceContextPanel(props: Props) {
  const [open, setOpen] = useState(false);
  const projectCount = useMemo(() => props.artifacts.filter(item => item.scope !== 'workspace').length, [props.artifacts]);
  const sharedCount = useMemo(() => props.artifacts.filter(item => item.scope === 'workspace').length, [props.artifacts]);
  return (
    <section className="workspace-context-panel" aria-label="工作区上下文">
      <div className="workspace-context-heading">
        <div>
          <span className="context-eyebrow">工作区</span>
          <strong>{props.workspaceName || '未连接数据服务'}</strong>
          {props.workspaceRole && <span className="context-role">{props.workspaceRole}</span>}
        </div>
        {props.workspaceId && <Button type="link" size="small" onClick={() => setOpen(true)}>云端资源</Button>}
      </div>
      <div className="workspace-context-tree">
        <span className="context-node context-node-workspace">Workspace</span><span className="context-branch">/</span>
        <span className="context-node context-node-project">项目：{props.projectName || '未选择'}</span><span className="context-branch">/</span>
        <span className="context-node context-node-draft">草稿：{props.draftStatus}</span>
      </div>
      <div className="workspace-context-meta">
        <span>项目资源 {projectCount}</span><span>共享资源 {sharedCount}</span>
        <span>本地资源由编辑器管理，云端资源由 Workspace 管理</span>
      </div>
      <Modal open={open} title="云端资源" width={760} footer={null} onCancel={() => setOpen(false)}>
        <Space className="cloud-resource-toolbar" justify="space-between" style={{ width: '100%' }}>
          <span>当前项目可见资源：{props.artifacts.length}</span><Button size="small" loading={props.loading} onClick={props.onRefresh}>刷新</Button>
        </Space>
        {props.error && <Alert type="warning" showIcon closable={false} message={props.error} style={{ marginTop: 12 }} />}
        {!props.loading && !props.artifacts.length ? <Empty description="当前项目暂无云端资源" /> : (
          <List loading={props.loading} className="cloud-resource-list" dataSource={props.artifacts} renderItem={artifact => (
            <List.Item actions={[
              <Tag color={artifact.scope === 'workspace' ? 'green' : 'blue'} key="scope">{artifact.scope === 'workspace' ? 'Workspace 共享' : '项目专属'}</Tag>,
              <Button size="small" key="move" onClick={() => props.onMove(artifact)}>{artifact.scope === 'workspace' ? '归属当前项目' : '转为共享'}</Button>,
              <Popconfirm key="remove" title="删除云端资源？该操作不可撤销。" okText="删除" cancelText="取消" onConfirm={() => props.onRemove(artifact)}><Button size="small" danger>删除</Button></Popconfirm>,
            ]}>
              <List.Item.Meta title={artifact.name} description={`${artifact.kind} · ${artifact.contentType} · ${formatSize(artifact.byteSize)}`} />
            </List.Item>
          )} />
        )}
      </Modal>
    </section>
  );
}
