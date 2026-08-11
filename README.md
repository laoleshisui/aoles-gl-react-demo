<div align="center">
  <img src="./public/logo.png" width="160" alt="Pixo" />
  <h1>Aoles GL React Demo</h1>
  <p><code>@aoles-gl/react</code> 的最小完整集成示例。</p>
</div>

## 在线体验

<https://laoleshisui.github.io/aoles-gl-react-demo/>

## 快速开始

要求：Node.js 22.13+、pnpm 11.18.0。

```bash
pnpm install
pnpm dev
```

访问 <http://localhost:4009>。

## AI 助手

Demo 右侧集成了 `@aoles-gl/react/ai`。本地启动 Hono 服务后，在
`.env.development.local` 中配置服务地址：

```env
VITE_API_AGENT=http://localhost:3000
```

AI 请求会发送到 `${VITE_API_AGENT}/api/chat`。独立 Demo 没有登录页，首次
打开 AI 助手时可手动粘贴由 PixoClip 签发的 API-Key；请求头格式为
`Authorization: Api-Key <key>`。API-Key 只保存在当前页面内存中，刷新或
关闭页面后自动清除，也不会写入 Web Storage 或 Vite 环境变量。

独立 Demo 仅支持 API-Key，不读取宿主页面的 JWT 登录状态。

本地导入的视频、音频和图片会作为受限资产列表提供给助手；删除轨道或
片段前会再次请求用户确认。AI 会话按当前 Engine 隔离并保存在
`localStorage`。

## 验证 npm 发布包

项目默认从 npm registry 安装 `@aoles-gl/*`：

```bash
pnpm registry:verify
```

`npm ls @aoles-gl/react @aoles-gl/core @aoles-gl/effects` 的结果中不应出现 `file:` 或本地 tgz 路径。

## 项目结构

```text
src/
├── main.tsx                 # i18n、WASM、GLSL 与 Engine 初始化
├── App.tsx                  # 编辑器布局
├── App.css                  # Demo 布局样式
└── components/ExportButton.tsx
```

WASM 由 `@aoles-gl/core` 提供，GLSL 由 `@aoles-gl/effects` 提供。开发服务器已配置 COOP/COEP 响应头；GitHub Pages 通过同源 Service Worker 启用跨源隔离，首次访问会自动刷新一次。
