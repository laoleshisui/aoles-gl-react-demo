# @aoles-gl/effects 使用指南

## 安装

Effects 包已通过本地文件安装：

```bash
pnpm install
```

## 基本用法

### 1. 导入效果常量

```typescript
import {
  TRANSITIONS,
  TEXT_EFFECTS,
  VIDEO_EFFECTS,
} from '@aoles-gl/effects';

// 使用效果 ID
console.log(TRANSITIONS.BOOK_FLIP); // 'book_flip'
console.log(TEXT_EFFECTS.TEXT_ALPHA); // 'text_alpha'
console.log(VIDEO_EFFECTS.BLUR_GLASS); // 'blur_glass'
```

### 2. 查询效果

```typescript
import {
  getAllEffects,
  searchEffects,
  getEffectById,
} from '@aoles-gl/effects';

// 获取所有效果
const allEffects = getAllEffects();
console.log(`Total: ${allEffects.length} effects`);

// 按类别搜索
const transitions = searchEffects({ category: 'transition' });
const textEffects = searchEffects({ category: 'text' });

// 按 ID 查找
const effect = getEffectById('book_flip');
console.log(effect?.metadata.name); // '翻书效果'
```

### 3. 获取 GLSL 文件路径

```typescript
import {
  getTransitionPath,
  getTextEffectPath,
  getVideoEffectPath,
  TRANSITIONS,
} from '@aoles-gl/effects';

// 获取转场效果的 GLSL 路径
const path = getTransitionPath(TRANSITIONS.BOOK_FLIP);
// 返回: '/glsl/transitions/book_flip.glsl'

// 文字效果
const textPath = getTextEffectPath('text_alpha');
// 返回: '/glsl/text/text_alpha.glsl'

// 视频效果
const videoPath = getVideoEffectPath('blur_glass');
// 返回: '/glsl/video/blur_glass.glsl'
```

### 4. 访问 GLSL 文件

GLSL 文件打包在 effects 包中，可以通过静态文件服务访问：

```typescript
// 在 Vite 项目中
import bookFlipGlsl from '@aoles-gl/effects/glsl/transitions/book_flip.glsl?raw';

// 或者通过 fetch
const response = await fetch('/node_modules/@aoles-gl/effects/glsl/transitions/book_flip.glsl');
const glslCode = await response.text();
```

## 效果注册表

### 转场效果 (28 个)

```typescript
import { TRANSITION_REGISTRY } from '@aoles-gl/effects';

TRANSITION_REGISTRY.forEach(effect => {
  console.log(`${effect.id}: ${effect.metadata.name}`);
});
```

包含：book_flip, cube, doorway, linear_blur, morph, swap 等

### 文字效果 (7 个)

```typescript
import { TEXT_EFFECT_REGISTRY } from '@aoles-gl/effects';
```

包含：text_alpha, barrage, position_text, slide_long_line 等

### 视频效果 (9 个)

```typescript
import { VIDEO_EFFECT_REGISTRY } from '@aoles-gl/effects';
```

包含：blur_glass, color_change, gblur, mountain, snow 等

## 完整示例

查看 `src/examples/EffectsExample.tsx` 了解完整的 React 组件示例，展示：

- 效果统计卡片
- 类别过滤
- 搜索功能
- 效果列表展示

运行示例：

```bash
# 在你的 App.tsx 中导入
import { EffectsExample } from './examples/EffectsExample';

function App() {
  return <EffectsExample />;
}
```

## TypeScript 类型

所有导出都包含完整的 TypeScript 类型定义：

```typescript
import type {
  EffectCategory,
  EffectMetadata,
  EffectDefinition,
  SearchOptions,
} from '@aoles-gl/effects';

const effect: EffectDefinition = {
  id: 'custom_effect',
  category: 'transition',
  metadata: {
    name: '自定义效果',
    description: '效果描述',
  },
};
```

## 与 @aoles-gl/core 集成

```typescript
import { Engine } from '@aoles-gl/core';
import { getTransitionPath, TRANSITIONS } from '@aoles-gl/effects';

const engine = new Engine(/* ... */);

// 使用效果路径
const transitionPath = getTransitionPath(TRANSITIONS.BOOK_FLIP);
// 然后在引擎中加载该路径的 GLSL 文件
```

## 故障排查

### 找不到 GLSL 文件

确保 Vite 配置允许导入 `.glsl` 文件：

```typescript
// vite.config.ts
export default {
  assetsInclude: ['**/*.glsl'],
};
```

### TypeScript 类型错误

确保已安装类型定义：

```bash
pnpm install --force
```

## 更多信息

- Effects 包源码：`/Users/yangxian/dev/aoles-gl-web-package/packages/effects`
- GLSL 文件目录：`node_modules/@aoles-gl/effects/glsl/`
