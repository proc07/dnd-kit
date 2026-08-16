import React, {useState} from 'react';
import {SortableTree, initialTreeItems} from '../components/SortableTree';
import type {CustomTreeItemData} from '../components/SortableTree/constants';
import type {TreeItems} from '../components/SortableTree';

export function OfficialTreeSolution() {
  const [collapsible, setCollapsible] = useState(true);
  const [removable, setRemovable] = useState(true);
  const [indicator, setIndicator] = useState(false);
  const [limitDepthToTwo, setLimitDepthToTwo] = useState(true);
  const [useCustomRender, setUseCustomRender] = useState(true);
  const [indentationWidth, setIndentationWidth] = useState(50);
  const [treeData, setTreeData] = useState<TreeItems<CustomTreeItemData>>(() =>
    JSON.parse(JSON.stringify(initialTreeItems))
  );
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setTreeData(JSON.parse(JSON.stringify(initialTreeItems)));
    setKey((prev) => prev + 1);
  };

  return (
    <div className="solution-container">
      {/* Banner */}
      <div className="solution-info-banner official-theme">
        <div className="banner-badge">通用树形组件: SortableTree (All Features + renderItem)</div>
        <h3>可插拔、支持完全自定义 UI 样式的通用树形拖拽组件</h3>
        <p>
          <strong>特点：</strong>基于 <code>dnd-kit</code> 投影算法封装为通用组件 <code>&lt;SortableTree /&gt;</code>，支持通过 <code>renderItem</code> 插槽完全由外部传入自定义卡片样式、图标、业务状态徽标，同时支持 2 层嵌套限制与无障碍交互。
        </p>
      </div>

      {/* Control Panel */}
      <div className="board-controls-card">
        <div className="control-group">
          <label className="control-checkbox highlight-control">
            <input
              type="checkbox"
              checked={useCustomRender}
              onChange={(e) => setUseCustomRender(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="control-label" style={{fontWeight: 600, color: useCustomRender ? 'var(--color-accent)' : 'inherit'}}>
              🎨 启用外部传入自定义 UI (renderItem 插槽)
            </span>
          </label>

          <label className="control-checkbox highlight-control">
            <input
              type="checkbox"
              checked={limitDepthToTwo}
              onChange={(e) => setLimitDepthToTwo(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="control-label" style={{fontWeight: 600, color: limitDepthToTwo ? 'var(--color-accent)' : 'inherit'}}>
              🔒 限制最多 2 层嵌套 (不可拖入第 3 层)
            </span>
          </label>

          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={collapsible}
              onChange={(e) => setCollapsible(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="control-label">启用展开/折叠 (Collapsible)</span>
          </label>

          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={removable}
              onChange={(e) => setRemovable(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="control-label">启用删除项 (Removable)</span>
          </label>

          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={indicator}
              onChange={(e) => setIndicator(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="control-label">放置指示线 (Drop Indicator)</span>
          </label>
        </div>

        <div className="control-group-row">
          <div className="indent-control">
            <span className="control-label">层级缩进间距:</span>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={indentationWidth}
              onChange={(e) => setIndentationWidth(Number(e.target.value))}
              className="range-slider"
            />
            <span className="range-value">{indentationWidth}px</span>
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            重置树形数据
          </button>
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="official-tree-wrapper-layout">
        <div className="official-tree-main-card">
          <div className="tree-card-header">
            <div className="header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>{useCustomRender ? '🚀 自定义业务卡片渲染模式' : '📦 官方默认极简渲染模式'}</span>
            </div>
            <span className="badge-pill">
              {limitDepthToTwo ? '已开启 2 层深度限制' : '无极深度模式'}
            </span>
          </div>

          <div className="tree-card-body">
            <SortableTree<CustomTreeItemData>
              key={key}
              collapsible={collapsible}
              removable={removable}
              indicator={indicator}
              maxDepth={limitDepthToTwo ? 1 : undefined}
              indentationWidth={indentationWidth}
              defaultItems={initialTreeItems}
              onItemsChange={(newItems) => setTreeData(newItems)}
              /* ⭐️ 核心演示：外部传入完全自定义的节点卡片 UI */
              renderItem={
                useCustomRender
                  ? ({item, depth, handleProps, onCollapse, onRemove, collapsed, childCount, isClone}) => (
                      <div className={`custom-tree-node-card depth-level-${depth}`}>
                        {/* 自定义拖拽抓手 */}
                        <button type="button" className="custom-tree-handle" {...handleProps} title="按住拖拽移动与嵌套">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="6" r="2" />
                            <circle cx="15" cy="6" r="2" />
                            <circle cx="9" cy="12" r="2" />
                            <circle cx="15" cy="12" r="2" />
                            <circle cx="9" cy="18" r="2" />
                            <circle cx="15" cy="18" r="2" />
                          </svg>
                        </button>

                        {/* 自定义展开/折叠箭头 */}
                        {onCollapse ? (
                          <button
                            type="button"
                            className={`custom-tree-collapse-btn ${collapsed ? 'is-collapsed' : ''}`}
                            onClick={onCollapse}
                            title={collapsed ? '展开子项' : '折叠子项'}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        ) : (
                          <span className="custom-tree-collapse-placeholder" />
                        )}

                        {/* 自定义图标 */}
                        <span className="custom-tree-icon">{item.icon ?? (depth === 0 ? '📁' : '📄')}</span>

                        {/* 自定义内容信息区 */}
                        <div className="custom-tree-content">
                          <span className="custom-tree-title">{item.title ?? String(item.id)}</span>
                          <span className="custom-tree-depth-tag">
                            {depth === 0 ? '根层 (Level 1)' : '子项 (Level 2)'}
                          </span>
                        </div>

                        {/* 自定义业务标签 */}
                        {item.tag && (
                          <span className={`custom-status-tag tag-${item.tagColor ?? 'blue'}`}>
                            {item.tag}
                          </span>
                        )}

                        {/* 悬浮拖拽时的子项数量气泡 */}
                        {isClone && childCount && childCount > 1 ? (
                          <span className="custom-clone-count-badge">{childCount} 项</span>
                        ) : null}

                        {/* 自定义删除按钮 */}
                        {!isClone && onRemove && (
                          <button
                            type="button"
                            className="custom-tree-remove-btn"
                            onClick={onRemove}
                            title="删除该项"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )
                  : undefined
              }
            />
          </div>
        </div>

        {/* Real-time Data Preview */}
        <div className="official-tree-side-card">
          <div className="tree-card-header">
            <div className="header-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>实时树形 JSON 数据结构</span>
            </div>
          </div>
          <pre className="json-preview-body">
            {JSON.stringify(treeData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
