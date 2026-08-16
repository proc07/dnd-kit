import React from 'react';
import type {CSSProperties} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/core';
import {useSortable} from '@dnd-kit/sortable';
import type {AnimateLayoutChanges} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem} from './TreeItem';
import type {Props as TreeItemProps} from './TreeItem';
import {iOS} from '../../utilities';

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
}

/**
 * 布局动画变化策略：在非排序和非拖拽状态下才触发常规布局动画，避免拖拽过程中的重绘抖动
 */
const animateLayoutChanges: AnimateLayoutChanges = ({isSorting, wasDragging}) =>
  isSorting || wasDragging ? false : true;

/**
 * ⭐️ SortableTreeItem 包装组件
 * 将 @dnd-kit/sortable 的 useSortable 状态（transform, transition, attributes, listeners）
 * 注入到底层无状态的 TreeItem UI 组件中。
 */
export function SortableTreeItem({id, depth, ...props}: Props) {
  const {
    attributes,           // 无障碍属性 (aria 标签等)
    isDragging,           // 当前项是否正处于被拖拽状态 (用于渲染半透明 ghost 占位)
    isSorting,            // 是否处于排序移动中
    listeners,            // 拖拽事件监听器 (onPointerDown 等)
    setDraggableNodeRef,  // 可拖拽 DOM 节点 ref
    setDroppableNodeRef,  // 可放置目标 DOM 容器 ref (包装在外层 li 上)
    transform,            // 拖拽移动产生的实时 2D 平移矩阵
    transition,           // 位移补间过渡动画
  } = useSortable({
    id,
    animateLayoutChanges,
  });

  // 将 transform 平移量转换为 CSS transform 字符串
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
