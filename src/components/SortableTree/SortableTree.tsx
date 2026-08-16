import React, {useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  defaultDropAnimation,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  DropAnimation,
  Modifier,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  getItemDepthSpan,
  removeItem,
  removeChildrenOf,
  setProperty,
} from './utilities';
import type {FlattenedItem, RenderItemParams, TreeItems} from './types';
import {SortableTreeItem} from './components';
import {initialTreeItems} from './constants';

/**
 * 测量策略：在每次拖拽生命周期中始终重新测量 droppable 容器尺寸
 */
const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

/**
 * 拖拽松开（Drop）时的微动画配置：平滑淡出并移动到最终目标位置
 */
const dropAnimationConfig: DropAnimation = {
  keyframes({transform}) {
    return [
      {opacity: 1, transform: CSS.Transform.toString(transform.initial)},
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({active}) {
    active.node.animate([{opacity: 0}, {opacity: 1}], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

/**
 * SortableTree 组件属性定义 (支持泛型自定义业务数据类型)
 */
export interface SortableTreeProps<T = Record<string, any>> {
  collapsible?: boolean;                         // 是否支持展开/折叠
  defaultItems?: TreeItems<T>;                   // 初始树形数据
  indentationWidth?: number;                     // 每一级缩进的像素宽度 (默认 50px)
  indicator?: boolean;                           // 是否启用放置指示线模式 (Drop Indicator)
  removable?: boolean;                           // 是否显示并启用删除按钮 (仅在默认 UI 下生效)
  maxDepth?: number;                             // 最大允许的嵌套深度 (例如：1 表示最多 2 层嵌套)
  renderItem?: (params: RenderItemParams<T>) => ReactNode; // ⭐️ 自定义节点 UI 渲染插槽
  onItemsChange?: (items: TreeItems<T>) => void; // 树形结构发生变动时的回调
}

/**
 * ⭐️ 核心通用树形排序容器组件
 */
export function SortableTree<T = Record<string, any>>({
  collapsible = true,
  defaultItems = initialTreeItems as unknown as TreeItems<T>,
  indicator = false,
  indentationWidth = 50,
  removable = true,
  maxDepth,
  renderItem,
  onItemsChange,
}: SortableTreeProps<T>) {
  // 1. 状态定义：树形数据、当前拖拽项 ID、当前悬停目标项 ID、水平拖拽偏移量
  const [items, setItems] = useState<TreeItems<T>>(() => defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  // 外部 defaultItems 变动时同步更新
  useEffect(() => {
    setItems(defaultItems);
  }, [defaultItems]);

  // 2. ⭐️ 扁平化数据源：将嵌套多维树拍平成一维列表，同时剔除已折叠的子节点与正在拖拽项的子节点
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, {children, collapsed, id}) =>
        collapsed && children && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId != null ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);

  // 3. 计算当前正在拖拽项自身携带的子树深度跨度（用于限制多层嵌套）
  const depthSpan = useMemo(
    () => (activeId ? getItemDepthSpan(items, activeId) : 0),
    [activeId, items]
  );

  // 4. ⭐️ 实时投影计算：根据当前水平位移 offsetLeft 计算期望落点深度与新的 parentId
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
          maxDepth,
          depthSpan
        )
      : null;

  // 5. 注册指针（鼠标/触控）传感器与键盘传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 6. 提取当前排序列表中的所有 ID
  const sortedIds = useMemo(
    () => flattenedItems.map(({id}) => id),
    [flattenedItems]
  );

  // 7. 获取当前被拖拽项的完整对象
  const activeItem = activeId
    ? flattenedItems.find(({id}) => id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4, width: '100%'}}>
          {flattenedItems.map((item) => {
            const {id, children, collapsed, depth} = item;
            return (
              <SortableTreeItem<T>
                key={id}
                id={id}
                item={item}
                // 若当前项正处于拖拽中且有投影，则显示投影计算出的实时深度；否则显示实际深度
                depth={id === activeId && projected ? projected.depth : depth}
                indentationWidth={indentationWidth}
                indicator={indicator}
                renderItem={renderItem}
                collapsed={Boolean(collapsed && children && children.length)}
                onCollapse={
                  collapsible && children && children.length
                    ? () => handleCollapse(id)
                    : undefined
                }
                onRemove={removable ? () => handleRemove(id) : undefined}
              />
            );
          })}
        </div>

        {/* ⭐️ DragOverlay: 鼠标指针跟随的拖拽悬浮副本 */}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <SortableTreeItem<T>
                id={activeId}
                item={activeItem}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                renderItem={renderItem}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );

  /**
   * 拖拽开始：记录 activeId 与初始位置，设置全局抓取光标
   */
  function handleDragStart({active: {id: activeId}}: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);
    document.body.style.setProperty('cursor', 'grabbing');
  }

  /**
   * 拖拽移动中：实时记录水平横向拖动偏移量 delta.x
   */
  function handleDragMove({delta}: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  /**
   * 拖拽悬停：更新当前指针下方的目标项 ID
   */
  function handleDragOver({over}: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  /**
   * ⭐️ 拖拽结束：应用投影计算出的新深度与父子关系，并调用 buildTree 重建树形结构
   */
  function handleDragEnd({active, over}: DragEndEvent) {
    resetState();

    if (projected && over) {
      const {depth, parentId} = projected;
      const clonedItems: FlattenedItem<T>[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({id}) => id === over.id);
      const activeIndex = clonedItems.findIndex(({id}) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      // 1. 更新被拖拽项的深度和归属 parentId
      clonedItems[activeIndex] = {...activeTreeItem, depth, parentId};

      // 2. 调整顺序位置
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      // 3. 将一维扁平列表重新构建为多叉树结构
      const newItems = buildTree(sortedItems);

      // 4. 更新 state 并通知外部
      setItems(newItems);
      onItemsChange?.(newItems);
    }
  }

  /**
   * 拖拽取消（如按下 ESC）：重置状态
   */
  function handleDragCancel() {
    resetState();
  }

  /**
   * 清理拖拽状态
   */
  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    document.body.style.setProperty('cursor', '');
  }

  /**
   * 删除某个节点
   */
  function handleRemove(id: UniqueIdentifier) {
    const updated = removeItem(items, id);
    setItems(updated);
    onItemsChange?.(updated);
  }

  /**
   * 展开 / 收起某个父节点
   */
  function handleCollapse(id: UniqueIdentifier) {
    const updated = setProperty(items, id, 'collapsed', (value) => !value);
    setItems(updated);
    onItemsChange?.(updated);
  }
}

/**
 * 放置指示线模式下的微调偏移修饰器
 */
const adjustTranslate: Modifier = ({transform}) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
