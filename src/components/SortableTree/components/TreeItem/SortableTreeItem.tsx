import React from 'react';
import type {CSSProperties} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/core';
import {useSortable} from '@dnd-kit/sortable';
import type {AnimateLayoutChanges} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem} from './TreeItem';
import type {Props as TreeItemProps} from './TreeItem';
import {iOS} from '../../utilities';
import type {FlattenedItem} from '../../types';

interface Props<T = Record<string, any>> extends TreeItemProps<T> {
  id: UniqueIdentifier;
  item?: FlattenedItem<T>;
}

/**
 * 布局动画变化策略：禁用持久的布局变换动画，确保拖拽放置后所有节点立刻恢复无 transform 的纯净 DOM 真实布局，
 * 彻底杜绝拖拽后 DevTools 元素定位偏移、坐标错位或二次拖拽失效的问题。
 */
const animateLayoutChanges: AnimateLayoutChanges = () => false;

/**
 * ⭐️ SortableTreeItem 包装组件
 * 将 @dnd-kit/sortable 的 useSortable 状态（transform, transition, attributes, listeners）
 * 注入到底层 TreeItem UI 组件中。
 */
export function SortableTreeItem<T = Record<string, any>>({
  id,
  depth,
  item,
  ...props
}: Props<T>) {
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

  // ⭐️ 核心防漂移保障：仅在当前项处于被拖拽或排序过程中时才应用 transform / transition；
  // 拖拽放置后或静止状态下严格为 undefined，确保真实 DOM 布局与视图 100% 物理对齐，绝无任何残留位移。
  const style: CSSProperties = {
    transform: isDragging || isSorting ? CSS.Translate.toString(transform) : undefined,
    transition: isSorting ? transition : undefined,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      item={item}
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
