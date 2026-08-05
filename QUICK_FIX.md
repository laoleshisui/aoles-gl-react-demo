# 快速解决方案

## 问题
pnpm 阻止了某些包的构建脚本运行。

## 解决方法

### 方法 1：批准所有构建（推荐）

```bash
cd /Users/yangxian/dev/aoles-gl-react-demo

# 批准所有构建脚本
pnpm config set auto-install-peers true
pnpm config set shamefully-hoist true

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install --shamefully-hoist

# 启动
pnpm run dev
```

### 方法 2：跳过构建检查

```bash
cd /Users/yangxian/dev/aoles-gl-react-demo

# 使用 --ignore-scripts 跳过构建
pnpm install --ignore-scripts

# 启动（应该可以工作）
pnpm run dev
```

### 方法 3：使用 npm 或 yarn 代替

```bash
cd /Users/yangxian/dev/aoles-gl-react-demo

# 删除 pnpm 文件
rm -rf node_modules pnpm-lock.yaml

# 使用 npm
npm install
npm run dev

# 或使用 yarn
yarn install
yarn dev
```

## 最简单的方法（推荐）

```bash
cd /Users/yangxian/dev/aoles-gl-react-demo
rm -rf node_modules pnpm-lock.yaml
pnpm install --ignore-scripts
pnpm run dev
```

这样应该可以直接启动了！🚀
