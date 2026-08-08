import React, { useState } from 'react';
import {
  TRANSITIONS,
  TEXT_EFFECTS,
  VIDEO_EFFECTS,
  getAllEffects,
  searchEffects,
  getTransitionPath,
  getTextEffectPath,
  getVideoEffectPath,
} from '@aoles-gl/effects';

/**
 * Effects 包使用示例
 * 展示如何使用 @aoles-gl/effects 包来管理和查询视频效果
 */
export const EffectsExample: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'transition' | 'text' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 获取所有效果或按类别筛选
  const effects = selectedCategory === 'all'
    ? getAllEffects()
    : searchEffects({ category: selectedCategory });

  // 根据搜索关键词过滤
  const filteredEffects = searchQuery
    ? effects.filter(effect =>
        effect.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        effect.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : effects;

  const getEffectPath = (effect: typeof effects[0]) => {
    switch (effect.category) {
      case 'transition':
        return getTransitionPath(effect.id);
      case 'text':
        return getTextEffectPath(effect.id);
      case 'video':
        return getVideoEffectPath(effect.id);
      default:
        return '';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Aoles GL Effects Gallery</h1>

      {/* 统计信息 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard label="Total" count={getAllEffects().length} color="#3b82f6" />
        <StatCard label="Transitions" count={Object.keys(TRANSITIONS).length} color="#8b5cf6" />
        <StatCard label="Text Effects" count={Object.keys(TEXT_EFFECTS).length} color="#ec4899" />
        <StatCard label="Video Effects" count={Object.keys(VIDEO_EFFECTS).length} color="#10b981" />
      </div>

      {/* 搜索和过滤 */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="搜索效果名称或描述..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
          }}
        >
          <option value="all">全部</option>
          <option value="transition">转场效果</option>
          <option value="text">文字效果</option>
          <option value="video">视频效果</option>
        </select>
      </div>

      {/* 效果列表 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {filteredEffects.map((effect) => (
          <div
            key={effect.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fff',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                {effect.metadata.name}
              </h3>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: getCategoryColor(effect.category),
                color: '#fff',
              }}>
                {getCategoryLabel(effect.category)}
              </span>
            </div>

            {effect.metadata.description && (
              <p style={{
                margin: '8px 0',
                fontSize: '13px',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                {effect.metadata.description}
              </p>
            )}

            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #f3f4f6',
              fontSize: '12px',
              color: '#9ca3af',
              fontFamily: 'monospace'
            }}>
              <div>ID: {effect.id}</div>
              <div style={{ marginTop: '4px', wordBreak: 'break-all' }}>
                Path: {getEffectPath(effect)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEffects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          未找到匹配的效果
        </div>
      )}
    </div>
  );
};

// 辅助组件
const StatCard: React.FC<{ label: string; count: number; color: string }> = ({
  label,
  count,
  color
}) => (
  <div style={{
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: color,
    color: '#fff',
  }}>
    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{count}</div>
    <div style={{ fontSize: '14px', opacity: 0.9 }}>{label}</div>
  </div>
);

// 辅助函数
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'transition': return '#8b5cf6';
    case 'text': return '#ec4899';
    case 'video': return '#10b981';
    default: return '#6b7280';
  }
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'transition': return '转场';
    case 'text': return '文字';
    case 'video': return '视频';
    default: return category;
  }
};
