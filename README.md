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
