import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  App as AntdApp,
  Button,
  Dropdown,
  Input,
  Modal,
  Select,
  Tooltip,
  type MenuProps,
} from 'antd';
import {
  CheckOutlined,
  DownOutlined,
  LoadingOutlined,
  LockOutlined,
  MoonOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  usePageState,
  usePreviewState,
  usePageDarkMode,
  useDraftRecovery,
  useResourceState,
  PreviewContainer,
  TrackContainer,
  ResourceContainer,
  AttributeContainer,
  ResizablePanel,
  HealthCheckPanel,
} from '@aoles-gl/react';
import {
  AolesAiPanel,
  type AolesAiModelProfile,
  type AolesAiProfileInfo,
  type AolesAiProfilesResponse,
  type ReactAolesAiConfig,
} from '@aoles-gl/react/ai';
import {
  createArtifactHttpRepository,
  createArtifactResourceResolver,
  createResourceCloudSyncController,
  createDraftHttpAdapter,
  createProjectRepository,
  createShaderLibraryRepository,
  createWorkspaceRepository,
  type ArtifactRepository,
  type ShaderLibraryRepository,
  type WorkspaceProject,
} from '@aoles-gl/core';
import ExportButton from './components/ExportButton';
import AiApiKeyConfig from './components/AiApiKeyConfig';
import DraftManagerDialog from './components/DraftManagerDialog';
import WorkspaceContextPanel from './components/WorkspaceContextPanel';
import './App.css';

const AI_PROFILE_LABELS = {
  fast: '快速',
  balanced: '均衡',
  reasoning: '深度',
  media: '多媒体',
} satisfies Record<AolesAiModelProfile, string>;

const AI_PROFILE_DESCRIPTIONS = {
  fast: '低延迟，适合简单操作',
  balanced: '速度与质量均衡',
  reasoning: '适合复杂编辑任务',
  media: '侧重图片与视频理解',
} satisfies Record<AolesAiModelProfile, string>;

function isAiModelProfile(value: unknown): value is AolesAiModelProfile {
  return typeof value === 'string'
    && Object.prototype.hasOwnProperty.call(AI_PROFILE_LABELS, value);
}

function AppContent() {
  const { message } = AntdApp.useApp();
  const pageStore = usePageState();
  const previewStore = usePreviewState();
  const { resources, manager: resourceManager } = useResourceState();
  const [aiOpen, setAiOpen] = useState(true);
  const [healthCheckOpen, setHealthCheckOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceRole, setWorkspaceRole] = useState('');
  const legacyProjectId = 'aoles-gl-react-demo:project:default';
  const legacyAutosaveId = 'aoles-gl-react-demo:autosave';
  const [projectId, setProjectId] = useState(legacyProjectId);
  const [currentProject, setCurrentProject] = useState<WorkspaceProject>();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const projectRepositoryRef = useRef<ReturnType<typeof createProjectRepository>>();
  const [projectDialog, setProjectDialog] = useState<'create' | 'rename' | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [artifactRepository, setArtifactRepository] = useState<ArtifactRepository>();
  const [shaderLibraryRepository, setShaderLibraryRepository] = useState<ShaderLibraryRepository>();
  const [cloudArtifacts, setCloudArtifacts] = useState<import('@aoles-gl/core').ArtifactRecord[]>([]);
  const [cloudArtifactsLoading, setCloudArtifactsLoading] = useState(false);
  const [cloudArtifactsError, setCloudArtifactsError] = useState('');
  const [apiKeyEditorOpen, setApiKeyEditorOpen] = useState(true);
  const [aiProfile, setAiProfile] = useState<AolesAiModelProfile>('balanced');
  const [aiProfiles, setAiProfiles] = useState<AolesAiProfileInfo[]>([]);
  const [aiProfilesLoading, setAiProfilesLoading] = useState(false);
  const [aiProfilesError, setAiProfilesError] = useState('');
  const [aiClientSelectable, setAiClientSelectable] = useState(false);
  const [profilesReloadVersion, setProfilesReloadVersion] = useState(0);
  const apiKeyRef = useRef(apiKey);
  const aiProfileRef = useRef(aiProfile);
  const resourcesRef = useRef(resources);

  apiKeyRef.current = apiKey;
  aiProfileRef.current = aiProfile;
  resourcesRef.current = resources;

  const resourceResolver = useMemo(() => async (
    reference: import('@aoles-gl/core').ResourceAssetReference,
    context: { projectId: string },
  ) => {
    if (!artifactRepository || !workspaceId) return null;
    return createArtifactResourceResolver({ repository: artifactRepository, workspaceId })(reference, context);
  }, [artifactRepository, workspaceId]);
  const resourceCloudSync = useMemo(() => (
    artifactRepository && workspaceId && projectId
      ? createResourceCloudSyncController({
        manager: resourceManager,
        repository: artifactRepository,
        workspaceId,
        projectId,
      })
      : undefined
  ), [artifactRepository, projectId, resourceManager, workspaceId]);

  const agentBaseUrl = import.meta.env.VITE_API_AGENT?.trim().replace(/\/+$/, '') ?? '';
  const dataServerBaseUrl = import.meta.env.VITE_API_DATA_SERVER?.trim().replace(/\/+$/, '') ?? '';
  const aiEnabled = Boolean(agentBaseUrl);
  const aiAuthenticated = Boolean(apiKey);
  const aiEndpoint = agentBaseUrl.endsWith('/api/chat')
    ? agentBaseUrl
    : `${agentBaseUrl}/api/chat`;
  const aiProfilesEndpoint = `${aiEndpoint.slice(0, -'/api/chat'.length)}/api/ai/profiles`;
  const draftSync = useMemo(() => {
    if (!workspaceId || !dataServerBaseUrl) return undefined;
    const options = {
      baseUrl: dataServerBaseUrl,
      getAccessToken: () => apiKeyRef.current,
      authorizationScheme: 'Api-Key' as const,
    };
    return {
      remote: createDraftHttpAdapter(options),
      context: {
        scopeKey: workspaceId,
        projectId,
      },
    };
  }, [dataServerBaseUrl, projectId, workspaceId]);
  const draftRecovery = useDraftRecovery({
    draftSync,
    projectId,
    resourceResolver,
  });
  const { migrateProject } = draftRecovery;

  // Sync dark mode to <html> element
  usePageDarkMode(pageStore);

  useEffect(() => {
    if (!draftRecovery.report || draftRecovery.report.restored) return;
    const missing = draftRecovery.report.missingAssets.length
      ? ` 缺失资源：${draftRecovery.report.missingAssets.join('、')}`
      : '';
    void message.warning(`草稿恢复失败。${draftRecovery.report.error ?? ''}${missing}`.trim());
  }, [draftRecovery.report, message]);

  const isDark = pageStore((state: any) => state.isDark as boolean);
  const attrWidth = pageStore((state: any) => state.attrWidth as number);
  const trackHeight = pageStore((state: any) => state.trackHeight as number);
  const setIsDark = pageStore.getState().setIsDark;
  const setAttrWidth = pageStore.getState().setAttrWidth;
  const setTrackHeight = pageStore.getState().setTrackHeight;

  const wasmRuntimeInited = previewStore(
    (state: any) => state.wasmRuntimeInited as boolean
  );

  const aiProfileMenuEnabled = (
    aiClientSelectable
    && !aiProfilesLoading
    && !aiProfilesError
    && aiProfiles.length > 0
  );
  const aiProfileButtonLabel = aiProfilesLoading
    ? '读取档位'
    : aiProfilesError
      ? '档位不可用'
      : aiProfiles.length
        ? AI_PROFILE_LABELS[aiProfile]
        : '暂无档位';
  const aiProfileTooltip = aiProfilesLoading
    ? '正在读取服务端档位配置'
    : aiProfilesError
      ? '档位加载失败，请更换 API-Key 后重试'
      : !aiProfiles.length
        ? '服务端未提供可用档位'
        : !aiClientSelectable
          ? `服务端已锁定为${AI_PROFILE_LABELS[aiProfile]}档`
          : '选择 AI 模型档位';

  useEffect(() => {
    if (!apiKey) {
      setAiProfile('balanced');
      setAiProfiles([]);
      setAiProfilesLoading(false);
      setAiProfilesError('');
      setAiClientSelectable(false);
      return;
    }

    const abortController = new AbortController();
    setAiProfilesLoading(true);
    setAiProfilesError('');

    void fetch(aiProfilesEndpoint, {
      headers: { Authorization: `Api-Key ${apiKey}` },
      signal: abortController.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as Partial<AolesAiProfilesResponse>;
      const profiles = Array.isArray(payload.profiles)
        ? payload.profiles.filter(profile => isAiModelProfile(profile?.id))
        : [];
      if (!profiles.length) throw new Error('服务端没有返回可用的 AI 模型档位');

      const defaultProfile = isAiModelProfile(payload.defaultProfile)
        && profiles.some(profile => profile.id === payload.defaultProfile)
        ? payload.defaultProfile
        : profiles[0].id;
      const clientSelectable = payload.clientSelectable === true;

      setAiProfiles(profiles);
      setAiClientSelectable(clientSelectable);
      setAiProfile(current => (
        clientSelectable && profiles.some(profile => profile.id === current)
          ? current
          : defaultProfile
      ));
    }).catch((error: unknown) => {
      if (abortController.signal.aborted) return;
      setAiProfiles([]);
      setAiClientSelectable(false);
      setAiProfilesError(error instanceof Error ? error.message : String(error));
      void message.warning('AI 模型档位加载失败，请检查服务地址和 API-Key。');
    }).finally(() => {
      if (!abortController.signal.aborted) setAiProfilesLoading(false);
    });

    return () => abortController.abort();
  }, [apiKey, aiProfilesEndpoint, message, profilesReloadVersion]);

  useEffect(() => {
    let cancelled = false;
    setWorkspaceId('');
    setWorkspaceName('');
    setWorkspaceRole('');
    setCurrentProject(undefined);
    setProjects([]);
    projectRepositoryRef.current = undefined;
    setProjectId(legacyProjectId);
    setArtifactRepository(undefined);
    setShaderLibraryRepository(undefined);
    setCloudArtifacts([]);
    if (!apiKey || !dataServerBaseUrl) return () => { cancelled = true; };
    const options = {
      baseUrl: dataServerBaseUrl,
      getAccessToken: () => apiKeyRef.current,
      authorizationScheme: 'Api-Key' as const,
    };
    void createWorkspaceRepository(options).ensurePersonal().then(async workspace => {
      if (cancelled) return;
      const projectRepository = createProjectRepository(options);
      const defaultProject = await projectRepository.ensureDefault(workspace.id);
      const projectList = await projectRepository.list(workspace.id);
      const autosaveIdMap = {
        [legacyAutosaveId]: `aoles-gl-react-demo:autosave:${encodeURIComponent(defaultProject.id)}`,
      };
      const migratedCount = (
        await migrateProject('aoles-gl-react-demo', defaultProject.id, { draftIdMap: autosaveIdMap })
      ) + (
        await migrateProject(legacyProjectId, defaultProject.id, { draftIdMap: autosaveIdMap })
      );
      if (cancelled) return;
      setCurrentProject(defaultProject);
      setWorkspaceName(workspace.name);
      setWorkspaceRole(workspace.role);
      setProjects(projectList);
      projectRepositoryRef.current = projectRepository;
      setProjectId(defaultProject.id);
      setWorkspaceId(workspace.id);
      const nextArtifactRepository = createArtifactHttpRepository(options);
      setArtifactRepository(nextArtifactRepository);
      await draftRecovery.setProjectId(defaultProject.id);
      await resourceManager.ready;
      const nextCloudSync = createResourceCloudSyncController({
        manager: resourceManager,
        repository: nextArtifactRepository,
        workspaceId: workspace.id,
        projectId: defaultProject.id,
      });
      // Metadata-only reconciliation restores "已上传" after a refresh.
      await nextCloudSync.reconcile();
      setShaderLibraryRepository(createShaderLibraryRepository(options));
      if (migratedCount > 0) void message.info(`已将 ${migratedCount} 个本地草稿迁移到默认项目`);
    }).catch(error => {
      if (!cancelled) void message.warning(`数据服务连接失败：${error instanceof Error ? error.message : String(error)}`);
    });
    return () => { cancelled = true; };
  }, [apiKey, dataServerBaseUrl, legacyProjectId, message, migrateProject]);

  const loadCloudArtifacts = async () => {
    if (!workspaceId || !projectId || !artifactRepository) {
      setCloudArtifacts([]);
      return;
    }
    setCloudArtifactsLoading(true);
    setCloudArtifactsError('');
    try {
      setCloudArtifacts((await artifactRepository.list(workspaceId, { projectId })).artifacts);
    } catch (error) {
      setCloudArtifactsError(error instanceof Error ? error.message : String(error));
    } finally {
      setCloudArtifactsLoading(false);
    }
  };

  useEffect(() => { void loadCloudArtifacts(); }, [workspaceId, projectId, artifactRepository]);

  useEffect(() => {
    if (!resourceCloudSync) return;
    void resourceManager.ready
      .then(() => resourceCloudSync.reconcile())
      .catch(error => console.warn('[Aoles ResourceManager] cloud artifact reconciliation failed', error));
  }, [resourceCloudSync, resourceManager]);

  const draftStatus = useMemo(() => {
    const states = Object.values(draftRecovery.syncStates) as Array<{ status?: string }>;
    if (states.some(state => state.status === 'conflict')) return '有冲突';
    if (states.some(state => state.status === 'dirty' || state.status === 'syncing')) return '同步中';
    if (states.some(state => state.status === 'synced') || draftRecovery.drafts.length) return '已同步';
    return '仅本地';
  }, [draftRecovery.drafts, draftRecovery.syncStates]);

  const moveCloudArtifact = async (artifact: import('@aoles-gl/core').ArtifactRecord) => {
    if (!workspaceId || !artifactRepository || !projectId) return;
    try {
      const updated = await artifactRepository.updateScope(workspaceId, artifact.id, artifact.scope === 'workspace'
        ? { scope: 'project', projectId }
        : { scope: 'workspace' });
      setCloudArtifacts(items => items.map(item => item.id === updated.id ? updated : item));
      void message.success(updated.scope === 'workspace' ? '资源已转为 Workspace 共享' : '资源已归属当前项目');
    } catch (error) {
      const status = (error as { status?: number }).status;
      void message.error(status === 409 ? '资源仍被项目 Shader 引用，暂不能迁移' : `资源迁移失败：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const removeCloudArtifact = async (artifact: import('@aoles-gl/core').ArtifactRecord) => {
    if (!workspaceId || !artifactRepository) return;
    try {
      await artifactRepository.remove(workspaceId, artifact.id);
      setCloudArtifacts(items => items.filter(item => item.id !== artifact.id));
      void message.success('云端资源已删除');
    } catch (error) {
      void message.error(`删除资源失败：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const switchProject = async (nextProjectId: string) => {
    const next = projects.find(project => project.id === nextProjectId);
    if (!next || next.id === currentProject?.id || !workspaceId) return;
    const previous = currentProject;
    setProjectsLoading(true);
    try {
      await draftRecovery.saveNow();
      setCurrentProject(next);
      setProjectId(next.id);
    } catch (error) {
      setCurrentProject(previous);
      setProjectId(previous?.id ?? legacyProjectId);
      void message.error(`切换项目失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setProjectsLoading(false);
    }
  };

  const submitProject = async () => {
    const name = projectName.trim();
    const repository = projectRepositoryRef.current;
    if (!name || !repository || !workspaceId) return;
    setProjectsLoading(true);
    try {
      const next = projectDialog === 'create'
        ? await repository.create(workspaceId, { name })
        : await repository.update(workspaceId, currentProject!.id, { name });
      setProjects(items => projectDialog === 'create'
        ? [...items, next]
        : items.map(item => item.id === next.id ? next : item));
      setProjectDialog(null);
      if (projectDialog === 'create') {
        await draftRecovery.saveNow();
        setCurrentProject(next);
        setProjectId(next.id);
      } else {
        setCurrentProject(next);
      }
    } catch (error) {
      void message.error(`项目操作失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setProjectsLoading(false);
    }
  };

  const removeProject = async () => {
    const current = currentProject;
    const repository = projectRepositoryRef.current;
    if (!current || current.isDefault || !repository || !workspaceId) return;
    if (!window.confirm(`确定删除项目“${current.name}”吗？`)) return;
    try {
      await repository.remove(workspaceId, current.id);
      const remaining = projects.filter(project => project.id !== current.id);
      setProjects(remaining);
      const fallback = remaining.find(project => project.isDefault) ?? remaining[0];
      if (fallback) await switchProject(fallback.id);
    } catch (error) {
      const status = (error as { status?: number }).status;
      void message.error(status === 409
        ? '该项目仍有项目资源或项目 Shader，请先迁移资源到其他项目或 Workspace 共享后再删除'
        : `删除项目失败：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const aiConfig = useMemo<ReactAolesAiConfig & { storageKey: string }>(() => ({
    endpoint: aiEndpoint,
    storageKey: 'aoles-gl-react-demo:ai-sessions',
    getModelProfile: () => aiProfileRef.current,
    headers: (): HeadersInit => apiKeyRef.current
      ? { Authorization: `Api-Key ${apiKeyRef.current}` }
      : {},
    ...(workspaceId && artifactRepository && shaderLibraryRepository ? {
      shaderDesign: {
        register: true,
        artifactPersistence: {
          workspaceId,
          projectId,
          scope: 'project',
          repository: artifactRepository,
          shaderLibrary: shaderLibraryRepository,
        },
      },
    } : {}),
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
    onError: (error) => {
      console.error('[aoles-gl-ai]', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (/401|invalid (token|credentials|api key)/i.test(errorMessage)) {
        void message.error('AI 鉴权失败，请检查 PixoClip API-Key。');
      } else if (/tool round limit/i.test(errorMessage)) {
        void message.warning('AI 操作步骤过多，已自动停止。请缩小任务范围后重试。');
      } else {
        void message.error(`AI 请求失败：${errorMessage}`);
      }
    },
  }), [aiEndpoint, message, workspaceId, artifactRepository, shaderLibraryRepository]);

  const profileMenuItems = useMemo<MenuProps['items']>(() => aiProfiles.map(profile => ({
    key: profile.id,
    label: (
      <div className={`ai-profile-option ${profile.id === aiProfile ? 'active' : ''}`.trim()}>
        <span className="ai-profile-check">
          {profile.id === aiProfile && <CheckOutlined />}
        </span>
        <span className="ai-profile-option-copy">
          <strong>{AI_PROFILE_LABELS[profile.id]}</strong>
          <small>{AI_PROFILE_DESCRIPTIONS[profile.id]}</small>
        </span>
      </div>
    ),
  })), [aiProfile, aiProfiles]);

  const profileTrigger = (
    <button
      type="button"
      className={`ai-profile-trigger ${aiProfileMenuEnabled ? '' : 'disabled'}`.trim()}
      aria-label={aiProfileTooltip}
      aria-disabled={!aiProfileMenuEnabled}
    >
      {aiProfilesLoading ? <LoadingOutlined spin /> : <ThunderboltOutlined />}
      <span className="ai-profile-trigger-label">{aiProfileButtonLabel}</span>
      {aiProfileMenuEnabled ? <DownOutlined className="ai-profile-chevron" /> : (
        aiProfiles.length > 0 && !aiProfilesError ? <LockOutlined /> : null
      )}
    </button>
  );

  const profileSelector = aiProfileMenuEnabled ? (
    <Dropdown
      trigger={['click']}
      placement="topLeft"
      classNames={{ root: 'ai-profile-dropdown' }}
      getPopupContainer={trigger => trigger.closest('.aoles-ai-composer-box') ?? document.body}
      menu={{
        items: profileMenuItems,
        selectable: true,
        selectedKeys: [aiProfile],
        onClick: ({ key }) => {
          if (isAiModelProfile(key) && aiProfiles.some(profile => profile.id === key)) {
            setAiProfile(key);
          }
        },
      }}
    >
      {profileTrigger}
    </Dropdown>
  ) : (
    <Tooltip title={aiProfileTooltip} placement="top">
      {profileTrigger}
    </Tooltip>
  );

  return (
    <div className={`editor-root ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="header-bar">
        <div className="brand">
          <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="Pixo" />
          <span className="header-title font-semibold">Aoles GL React</span>
          {currentProject && <span className="project-label">{currentProject.name}</span>}
        </div>

        <div className="header-actions">
          <DraftManagerDialog recovery={draftRecovery} />
          {workspaceId && projects.length > 0 && (
            <Select
              size="small"
              value={projectId}
              loading={projectsLoading}
              className="project-select"
              options={projects.map(project => ({ label: project.name, value: project.id }))}
              onChange={value => { void switchProject(value); }}
            />
          )}
          {workspaceId && <Button size="small" onClick={() => { setProjectName(''); setProjectDialog('create'); }}>新建项目</Button>}
          {currentProject && !currentProject.isDefault && (
            <>
              <Button size="small" onClick={() => { setProjectName(currentProject.name); setProjectDialog('rename'); }}>重命名</Button>
              <Button size="small" danger onClick={() => { void removeProject(); }}>删除项目</Button>
            </>
          )}
          {wasmRuntimeInited && <ExportButton />}

          <Button
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => setHealthCheckOpen(true)}
          >
            资源健康
          </Button>

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

          <Button
            size="small"
            type={aiOpen ? 'primary' : 'default'}
            icon={<RobotOutlined />}
            aria-pressed={aiOpen}
            onClick={() => setAiOpen(value => !value)}
          >
            AI 助手
          </Button>

          <button
            onClick={() => setIsDark(!isDark)}
            className="theme-toggle w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            title="Toggle dark mode"
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </div>
      </div>
      <WorkspaceContextPanel
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        workspaceRole={workspaceRole}
        projectName={currentProject?.name ?? ''}
        draftStatus={draftStatus}
        artifacts={cloudArtifacts}
        loading={cloudArtifactsLoading}
        error={cloudArtifactsError}
        onRefresh={() => { void loadCloudArtifacts(); }}
        onMove={artifact => { void moveCloudArtifact(artifact); }}
        onRemove={artifact => { void removeCloudArtifact(artifact); }}
      />
      <Modal
        open={projectDialog !== null}
        title={projectDialog === 'create' ? '新建项目' : '重命名项目'}
        confirmLoading={projectsLoading}
        onCancel={() => setProjectDialog(null)}
        onOk={() => { void submitProject(); }}
      >
        <Input value={projectName} maxLength={80} placeholder="项目名称" onChange={event => setProjectName(event.target.value)} onPressEnter={() => { void submitProject(); }} />
      </Modal>

      <Modal
        title="资源健康检查"
        open={healthCheckOpen}
        footer={null}
        width={980}
        destroyOnHidden
        onCancel={() => setHealthCheckOpen(false)}
      >
        <HealthCheckPanel />
      </Modal>

      {/* Main layout */}
      <div className="main-content">
        {/* Left: Resources */}
        <ResourceContainer className="resources-section card-style" cloudSync={resourceCloudSync} />

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
                  authLabel="API-Key（当前标签页）"
                  onSave={(value) => {
                    setApiKey(value);
                    setApiKeyEditorOpen(false);
                    setProfilesReloadVersion(version => version + 1);
                  }}
                  onEdit={() => setApiKeyEditorOpen(true)}
                  onCancel={() => setApiKeyEditorOpen(false)}
                  onClear={() => {
                    setApiKey('');
                    setApiKeyEditorOpen(true);
                  }}
                />
                {aiAuthenticated && (
                  <AolesAiPanel config={aiConfig} composerTools={profileSelector} />
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
  return (
    <AntdApp>
      <AppContent />
    </AntdApp>
  );
}

export default App;
