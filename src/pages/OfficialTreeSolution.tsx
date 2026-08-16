import React, {useState} from 'react';
import {SortableTree, initialTreeItems} from '../components/SortableTree';
import type {TreeItems} from '../components/SortableTree';

export function OfficialTreeSolution() {
  const [collapsible, setCollapsible] = useState(true);
  const [removable, setRemovable] = useState(true);
  const [indicator, setIndicator] = useState(false);
  const [limitDepthToTwo, setLimitDepthToTwo] = useState(true);
  const [indentationWidth, setIndentationWidth] = useState(50);
  const [treeData, setTreeData] = useState<TreeItems>(() => JSON.parse(JSON.stringify(initialTreeItems)));
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setTreeData(JSON.parse(JSON.stringify(initialTreeItems)));
    setKey((prev) => prev + 1);
  };

  return (
    <div className="solution-container">
      {/* Banner */}
      <div className="solution-info-banner official-theme">
        <div className="banner-badge">官方推荐示例: @dnd-kit/Sortable/Tree (All Features)</div>
        <h3>dnd-kit 官方 Storybook 完整多级嵌套树形拖拽组件</h3>
        <p>
          <strong>特点：</strong>基于 <code>clauderic/dnd-kit</code> 官方仓库核心算法实现（全套 Projection 投影计算、层级嵌套、展开/折叠、删除节点、微动画与辅助键盘导航），并已新增<strong>「限制最多 2 层嵌套」</strong>配置。
        </p>
      </div>

      {/* Control Panel */}
      <div className="board-controls-card">
        <div className="control-group">
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
              <span>可排序树形列表 (拖动左侧手柄调整顺序与层级)</span>
            </div>
            <span className="badge-pill">
              {limitDepthToTwo ? '已开启 2 层深度限制' : '无极深度模式'}
            </span>
          </div>

          <div className="tree-card-body">
            <SortableTree
              key={key}
              collapsible={collapsible}
              removable={removable}
              indicator={indicator}
              maxDepth={limitDepthToTwo ? 1 : undefined}
              indentationWidth={indentationWidth}
              defaultItems={initialTreeItems}
              onItemsChange={(newItems) => setTreeData(newItems)}
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
