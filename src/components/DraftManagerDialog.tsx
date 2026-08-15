import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Spin,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { DraftRecoveryState } from '@aoles-gl/react';

interface DraftManagerDialogProps {
  recovery: DraftRecoveryState;
}

export default function DraftManagerDialog({ recovery }: DraftManagerDialogProps) {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyDraftId, setBusyDraftId] = useState('');

  useEffect(() => {
    if (open) void recovery.refreshDrafts();
  }, [open, recovery.refreshDrafts]);

  const saveSnapshot = async () => {
    setSaving(true);
    try {
      const document = await recovery.saveSnapshot(title);
      if (!document) throw new Error('编辑器尚未完成初始化');
      setTitle('');
      void message.success('草稿已保存');
    } catch (error) {
      void message.error(`保存草稿失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const restoreDraft = async (draftId: string) => {
    setBusyDraftId(draftId);
    try {
      const report = await recovery.restoreDraft(draftId);
      if (!report?.restored) throw new Error(report?.error ?? '草稿恢复失败');
      void message.success('草稿已恢复');
      setOpen(false);
    } catch (error) {
      void message.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyDraftId('');
    }
  };

  const deleteDraft = async (draftId: string) => {
    setBusyDraftId(draftId);
    try {
      await recovery.deleteDraft(draftId);
      void message.success('草稿已删除');
    } catch (error) {
      void message.error(`删除草稿失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyDraftId('');
    }
  };

  return (
    <>
      <Button icon={<FileTextOutlined />} onClick={() => setOpen(true)}>
        草稿
      </Button>
      <Modal
        open={open}
        title="草稿管理"
        width={680}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <div className="draft-save-row">
          <Input
            value={title}
            maxLength={80}
            placeholder="草稿名称（可选）"
            onChange={event => setTitle(event.target.value)}
            onPressEnter={() => { void saveSnapshot(); }}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={recovery.status === 'restoring'}
            onClick={() => { void saveSnapshot(); }}
          >
            保存快照
          </Button>
          <Button
            aria-label="刷新草稿列表"
            icon={<ReloadOutlined />}
            onClick={() => { void recovery.refreshDrafts(); }}
          />
        </div>

        <Spin spinning={recovery.status === 'restoring'}>
          <div className="draft-list">
            {!recovery.drafts.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无草稿" />}
            {recovery.drafts.map(draft => {
              const isAutosave = draft.draftId === recovery.autosaveDraftId;
              const busy = busyDraftId === draft.draftId;
              return (
                <div className="draft-list-item" key={draft.draftId}>
                  <div className="draft-list-copy">
                    <div className="draft-list-title">
                      <strong>{draft.title || (isAutosave ? '自动保存' : '未命名草稿')}</strong>
                      {isAutosave && <Tag color="blue">自动</Tag>}
                    </div>
                    <span>{new Date(draft.updatedAt).toLocaleString()} · 版本 {draft.revision}</span>
                  </div>
                  <div className="draft-list-actions">
                    <Popconfirm
                      title="恢复这个草稿？"
                      description="当前编辑内容会先保存到自动草稿。"
                      okText="恢复"
                      cancelText="取消"
                      onConfirm={() => restoreDraft(draft.draftId)}
                    >
                      <Button icon={<FolderOpenOutlined />} loading={busy} disabled={Boolean(busyDraftId)}>
                        恢复
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title={isAutosave ? '删除自动草稿？' : '删除这个草稿？'}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => deleteDraft(draft.draftId)}
                    >
                      <Button
                        danger
                        aria-label="删除草稿"
                        icon={<DeleteOutlined />}
                        loading={busy}
                        disabled={Boolean(busyDraftId)}
                      />
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </div>
        </Spin>
      </Modal>
    </>
  );
}
