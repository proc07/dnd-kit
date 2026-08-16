import type {UniqueIdentifier} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';

import type {FlattenedItem, TreeItem, TreeItems} from './types';

/**
 * 判断当前环境是否为 iOS / iPadOS 设备（用于禁用特定手势冲突）
 */
export const iOS =
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.platform || navigator.userAgent);

/**
 * 计算水平拖拽距离对应的层级深度变化
 * 例如：拖拽向右移动 100px，缩进宽度为 50px，则拖拽深度为 +2 层
 *
 * @param offset 水平拖拽偏移量 (像素 px)
 * @param indentationWidth 每一级缩进的基准像素宽度 (默认 50px)
 */
function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

/**
 * ⭐️ 核心算法：实时计算拖拽投影（Projection）
 * 根据用户拖拽项的位置、悬停目标项以及水平横向拖动偏移，计算出当前项合法的层级深度（depth）和父节点（parentId）。
 *
 * @param items 当前已扁平化的所有树节点列表
 * @param activeId 当前正在被拖拽的节点 ID
 * @param overId 当前指针正悬停在哪个节点上方
 * @param dragOffset 当前指针在 X 轴上的水平拖动位移（正数向右，负数向左）
 * @param indentationWidth 每级缩进宽度
 * @param maxDepthLimit 最大层级深度限制 (例如：2层嵌套传 1，即只允许 0 和 1)
 * @param depthSpan 被拖拽项自身携带的子树最大深度（防止携带子节点的父项被嵌套过深）
 */
export function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number,
  maxDepthLimit?: number,
  depthSpan: number = 0
) {
  // 1. 获取拖拽项与悬停项在扁平列表中的索引
  const overItemIndex = items.findIndex(({id}) => id === overId);
  const activeItemIndex = items.findIndex(({id}) => id === activeId);
  const activeItem = items[activeItemIndex];

  // 2. 模拟如果将 activeItem 移动到 overItem 位置后的新数组
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);

  // 3. 获取目标位置的前一个节点和后一个节点
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];

  // 4. 根据水平拖动距离计算理论期望深度
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  // 5. 计算当前位置允许的最大深度 (不能超过前一个节点深度 + 1)
  let calculatedMaxDepth = getMaxDepth({previousItem});

  // ⭐️ 如果启用了最大深度限制（如限制 2 层嵌套：maxDepthLimit = 1）：
  // 则不仅自身深度不能超过限制，还要减去自身子树的深度跨度 (depthSpan)，保证整体树形不超过限制
  if (maxDepthLimit !== undefined) {
    const effectiveLimit = Math.max(0, maxDepthLimit - depthSpan);
    calculatedMaxDepth = Math.min(calculatedMaxDepth, effectiveLimit);
  }

  // 6. 计算当前位置允许的最小深度 (不能小于后一个节点的深度，否则后一个节点会变成孤儿)
  const minDepth = getMinDepth({nextItem});

  // 7. 将期望深度限制在 [minDepth, calculatedMaxDepth] 的合法区间内
  let depth = projectedDepth;
  if (projectedDepth >= calculatedMaxDepth) {
    depth = calculatedMaxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return {
    depth,                          // 最终计算出的合法深度
    maxDepth: calculatedMaxDepth,   // 允许的最大深度
    minDepth,                       // 允许的最小深度
    parentId: getParentId(),        // 计算归属的新父节点 ID
  };

  /**
   * 内部函数：根据最终计算出的 depth 和上方节点推导 parentId
   */
  function getParentId() {
    // 根节点（深度 0）或最顶部的项没有父节点
    if (depth === 0 || !previousItem) {
      return null;
    }

    // 与前一个节点同级，则拥有相同的 parentId
    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    // 比前一个节点更深，则前一个节点就是它的父节点
    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    // 比前一个节点更浅，则向上回溯寻找同深度的兄弟节点并获取其 parentId
    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

/**
 * 计算某个位置能允许的最大深度：
 * 只能比上方相邻节点 (previousItem) 最多深 1 层；若上方没有节点，则只能在根层 (0)
 */
function getMaxDepth({previousItem}: {previousItem?: FlattenedItem}) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

/**
 * 计算某个位置允许的最小深度：
 * 如果下方有相邻节点 (nextItem)，当前项的深度不能小于它，以维持树的连贯性
 */
function getMinDepth({nextItem}: {nextItem?: FlattenedItem}) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

/**
 * 递归将嵌套树形数据 (TreeItems) 拍平成线性一维列表 (FlattenedItem[])
 * 拍平后每个节点附带 parentId, depth(层级) 和 index(同级索引)
 */
function flatten(
  items: TreeItems,
  parentId: UniqueIdentifier | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      {...item, parentId, depth, index},
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

/**
 * 拍平树结构对外入口
 */
export function flattenTree(items: TreeItems): FlattenedItem[] {
  return flatten(items);
}

/**
 * ⭐️ 逆向重构：将拖拽排序后的一维扁平列表 (FlattenedItem[]) 还原为多叉树形结构 (TreeItems)
 */
export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root: TreeItem = {id: 'root', children: []};
  const nodes: Record<string, TreeItem> = {[root.id]: root};
  const items = flattenedItems.map((item) => ({...item, children: []}));

  for (const item of items) {
    const {id, children} = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = {id, children};
    if (parent) {
      parent.children.push(item);
    }
  }

  return root.children;
}

/**
 * 浅层查找某项
 */
export function findItem(items: TreeItem[], itemId: UniqueIdentifier) {
  return items.find(({id}) => id === itemId);
}

/**
 * 深度递归查找树中的某项
 */
export function findItemDeep(
  items: TreeItems,
  itemId: UniqueIdentifier
): TreeItem | undefined {
  for (const item of items) {
    const {id, children} = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

/**
 * 从树形结构中递归删除指定 ID 的节点及其所有子节点
 */
export function removeItem(items: TreeItems, id: UniqueIdentifier): TreeItems {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

/**
 * 递归设置树中某个节点的属性值 (如展开/折叠状态 collapsed)
 */
export function setProperty<T extends keyof TreeItem>(
  items: TreeItems,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T]
): TreeItems {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

/**
 * 统计子节点总数（递归）
 */
function countChildren(items: TreeItem[], count = 0): number {
  return items.reduce((acc, {children}) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

/**
 * 获取指定节点下所有后代节点的总个数
 */
export function getChildCount(items: TreeItems, id: UniqueIdentifier) {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

/**
 * ⭐️ 关键过滤函数：在渲染和拖拽投影时，隐藏已折叠节点的子节点或正在拖拽节点的子节点
 * 避免在拖拽父节点时，子节点依然在列表中占位导致位置错乱
 */
export function removeChildrenOf(
  items: FlattenedItem[],
  ids: UniqueIdentifier[]
) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}

/**
 * 递归计算某个树节点内部子树的最大深度跨度
 */
function getMaxChildDepth(items: TreeItem[], currentDepth = 0): number {
  if (!items.length) {
    return currentDepth;
  }
  return Math.max(
    ...items.map((item) =>
      item.children.length
        ? getMaxChildDepth(item.children, currentDepth + 1)
        : currentDepth + 1
    )
  );
}

/**
 * 获取指定节点自身携带的子树层级深度跨度
 * 例如：如果节点有直接子节点，跨度为 1；如果有孙子节点，跨度为 2；若无子节点，跨度为 0
 */
export function getItemDepthSpan(items: TreeItems, id: UniqueIdentifier): number {
  const item = findItemDeep(items, id);
  if (!item || !item.children.length) {
    return 0;
  }
  return getMaxChildDepth(item.children, 1);
}
