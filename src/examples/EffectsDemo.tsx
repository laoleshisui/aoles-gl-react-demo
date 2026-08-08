/**
 * @aoles-gl/effects 在 React 项目中的使用示例
 *
 * 文件位置: src/examples/EffectsDemo.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  TRANSITIONS,
  TEXT_EFFECTS,
  VIDEO_EFFECTS,
  getAllEffects,
  searchEffects,
  getTransitionPath,
  type EffectEntry,
} from '@aoles-gl/effects';

// 方式 1: 直接导入 GLSL URL (推荐)
import bookFlipUrl from '@aoles-gl/effects/glsl/transitions/book_flip.glsl?url';
import cubeUrl from '@aoles-gl/effects/glsl/transitions/cube.glsl?url';

export function EffectsDemo() {
  const [selectedEffect, setSelectedEffect] = useState<EffectEntry | null>(null);
  const [allEffects, setAllEffects] = useState<EffectEntry[]>([]);
  const [filteredEffects, setFilteredEffects] = useState<EffectEntry[]>([]);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    // 加载所有效果
    const effects = getAllEffects();
    setAllEffects(effects);
    setFilteredEffects(effects);

    console.log('Total effects loaded:', effects.length);
    console.log('Transitions:', Object.keys(TRANSITIONS).length);
    console.log('Text effects:', Object.keys(TEXT_EFFECTS).length);
    console.log('Video effects:', Object.keys(VIDEO_EFFECTS).length);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (cat === 'all') {
      setFilteredEffects(allEffects);
    } else {
      const filtered = searchEffects({ category: cat });
      setFilteredEffects(filtered);
    }
  };

  const handleEffectSelect = (effect: EffectEntry) => {
    setSelectedEffect(effect);
    console.log('Selected effect:', effect);

    // 在实际应用中，你可以这样使用:
    // engine.addTransition({
    //   glsl_path: effect.path,
    //   startTime: 0,
    //   duration: 1000,
    // });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>@aoles-gl/effects 示例</h1>

      {/* 分类过滤 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => handleCategoryChange('all')}>
          全部 ({allEffects.length})
        </button>
        <button onClick={() => handleCategoryChange('transition')}>
          转场效果 ({searchEffects({ category: 'transition' }).length})
        </button>
        <button onClick={() => handleCategoryChange('text')}>
          文字效果 ({searchEffects({ category: 'text' }).length})
        </button>
        <button onClick={() => handleCategoryChange('video')}>
          视频效果 ({searchEffects({ category: 'video' }).length})
        </button>
        <button onClick={() => handleCategoryChange('effect')}>
          特效 ({searchEffects({ category: 'effect' }).length})
        </button>
      </div>

      {/* 效果列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {filteredEffects.map((effect) => (
          <div
            key={effect.id}
            onClick={() => handleEffectSelect(effect)}
            style={{
              border: selectedEffect?.id === effect.id ? '2px solid blue' : '1px solid #ccc',
              padding: '10px',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              {effect.metadata.name}
            </h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
              {effect.id}
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
              {effect.metadata.category}
            </p>
            {effect.metadata.tags && (
              <div style={{ fontSize: '11px', color: '#999' }}>
                {effect.metadata.tags.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 选中效果详情 */}
      {selectedEffect && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h2>选中效果详情</h2>
          <p><strong>ID:</strong> {selectedEffect.id}</p>
          <p><strong>名称:</strong> {selectedEffect.metadata.name}</p>
          <p><strong>分类:</strong> {selectedEffect.metadata.category}</p>
          <p><strong>路径:</strong> {selectedEffect.path}</p>
          {selectedEffect.metadata.description && (
            <p><strong>描述:</strong> {selectedEffect.metadata.description}</p>
          )}
          {selectedEffect.metadata.tags && (
            <p><strong>标签:</strong> {selectedEffect.metadata.tags.join(', ')}</p>
          )}

          <h3 style={{ marginTop: '15px' }}>使用方式:</h3>
          <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
{`// 方式 1: 使用路径
const path = '${selectedEffect.path}';

// 方式 2: 使用导入 (需要在文件顶部)
import effectUrl from '@aoles-gl/effects/glsl/${
  selectedEffect.metadata.category === 'transition' ? 'transitions' :
  selectedEffect.metadata.category === 'text' ? 'text' :
  selectedEffect.metadata.category === 'video' ? 'video' : 'effects'
}/${selectedEffect.id}.glsl?url';

// 应用到引擎
transition.glsl_path = effectUrl;`}
          </pre>
        </div>
      )}

      {/* 使用示例代码 */}
      <div style={{ marginTop: '30px' }}>
        <h2>代码示例</h2>
        <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto' }}>
{`// 1. 导入效果常量和辅助函数
import { TRANSITIONS, getTransitionPath } from '@aoles-gl/effects';

// 2. 使用常量获取路径
const path = getTransitionPath(TRANSITIONS.BOOK_FLIP);
console.log(path); // '/glsl/transitions/book_flip.glsl'

// 3. 或者直接导入 GLSL URL
import bookFlipUrl from '@aoles-gl/effects/glsl/transitions/book_flip.glsl?url';

// 4. 搜索 3D 效果
const effects3D = searchEffects({ tags: ['3d'] });
console.log('Found', effects3D.length, '3D effects');

// 5. 应用到引擎
engine.addTransition({
  glsl_path: bookFlipUrl, // 或使用 path
  startTime: 0,
  duration: 1000,
});`}
        </pre>
      </div>
    </div>
  );
}

export default EffectsDemo;
