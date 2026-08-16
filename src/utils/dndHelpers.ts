import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { RootItem, TaskItem, GroupItem } from '../types';
import { isGroupItem } from '../types';

/**
 * Container info for a task
 */
export interface ContainerInfo {
  containerId: string; // 'root' or group id
  index: number;
}

/**
 * Find which container a task belongs to.
 * Returns { containerId: 'root', index } if it's a root-level task,
 * or { containerId: groupId, index } if it's inside a group.
 * Returns null if not found.
 */
export function findContainerOfTask(
  taskId: UniqueIdentifier,
  items: RootItem[]
): ContainerInfo | null {
  // Check root-level items
  const rootIndex = items.findIndex((item) => item.id === taskId);
  if (rootIndex !== -1) {
    return { containerId: 'root', index: rootIndex };
  }

  // Check inside groups
  for (const item of items) {
    if (isGroupItem(item)) {
      const childIndex = item.children.findIndex((child) => child.id === taskId);
      if (childIndex !== -1) {
        return { containerId: String(item.id), index: childIndex };
      }
    }
  }

  return null;
}

/**
 * Find a group by its ID
 */
export function findGroupById(
  groupId: UniqueIdentifier,
  items: RootItem[]
): GroupItem | null {
  const item = items.find((i) => i.id === groupId && isGroupItem(i));
  return item ? (item as GroupItem) : null;
}

/**
 * Find a task by its ID (searches root level and all groups)
 */
export function findTaskById(
  taskId: UniqueIdentifier,
  items: RootItem[]
): TaskItem | null {
  // Check root level
  const rootItem = items.find((i) => i.id === taskId && i.type === 'task');
  if (rootItem) return rootItem as TaskItem;

  // Check inside groups
  for (const item of items) {
    if (isGroupItem(item)) {
      const child = item.children.find((c) => c.id === taskId);
      if (child) return child;
    }
  }

  return null;
}

/**
 * Remove a task from its current container and return [updatedItems, removedTask]
 */
export function removeTaskFromSource(
  taskId: UniqueIdentifier,
  items: RootItem[]
): [RootItem[], TaskItem | null] {
  const container = findContainerOfTask(taskId, items);
  if (!container) return [items, null];

  if (container.containerId === 'root') {
    const task = items[container.index];
    if (task.type !== 'task') return [items, null];
    const newItems = items.filter((_, i) => i !== container.index);
    return [newItems, task];
  } else {
    // Inside a group
    let removedTask: TaskItem | null = null;
    const newItems = items.map((item) => {
      if (isGroupItem(item) && String(item.id) === container.containerId) {
        removedTask = item.children[container.index];
        return {
          ...item,
          children: item.children.filter((_, i) => i !== container.index),
        };
      }
      return item;
    });
    return [newItems, removedTask];
  }
}

/**
 * Insert a task into a target container at the specified index
 */
export function insertTaskToTarget(
  task: TaskItem,
  targetContainerId: string,
  targetIndex: number,
  items: RootItem[]
): RootItem[] {
  if (targetContainerId === 'root') {
    const newItems = [...items];
    newItems.splice(targetIndex, 0, task);
    return newItems;
  } else {
    return items.map((item) => {
      if (isGroupItem(item) && String(item.id) === targetContainerId) {
        const newChildren = [...item.children];
        newChildren.splice(targetIndex, 0, task);
        return { ...item, children: newChildren };
      }
      return item;
    });
  }
}

/**
 * Move a root-level item from one index to another
 */
export function moveRootItem(
  items: RootItem[],
  fromIndex: number,
  toIndex: number
): RootItem[] {
  return arrayMove(items, fromIndex, toIndex);
}

/**
 * Move a task within the same group
 */
export function moveTaskWithinGroup(
  items: RootItem[],
  groupId: string,
  fromIndex: number,
  toIndex: number
): RootItem[] {
  return items.map((item) => {
    if (isGroupItem(item) && String(item.id) === groupId) {
      return {
        ...item,
        children: arrayMove(item.children, fromIndex, toIndex),
      };
    }
    return item;
  });
}

/**
 * Get all sortable IDs for the root-level SortableContext
 */
export function getRootItemIds(items: RootItem[]): UniqueIdentifier[] {
  return items.map((item) => item.id);
}

/**
 * Determine which container an overId belongs to.
 * - If overId is a group droppable zone (e.g. "group-1-droppable") or a child task within a group: returns the groupId.
 * - If overId is a group itself: returns the groupId if task is already in that group, or 'root' if hovering over header/root.
 * - If overId is a root task: returns 'root'.
 */
export function getContainerIdForOverId(
  overId: UniqueIdentifier,
  items: RootItem[],
  activeContainerId?: string
): string {
  const overIdStr = String(overId);

  // Check if it's a group droppable zone like "group-1-droppable"
  if (overIdStr.endsWith('-droppable')) {
    const groupId = overIdStr.replace('-droppable', '');
    const group = items.find((item) => String(item.id) === groupId && isGroupItem(item));
    if (group) return String(group.id);
  }

  // Check if overId is a child task inside a group
  for (const item of items) {
    if (isGroupItem(item)) {
      if (item.children.some((c) => c.id === overId)) {
        return String(item.id);
      }
    }
  }

  // Check if overId is a group item at root level
  const isGroup = items.some((item) => item.id === overId && isGroupItem(item));
  if (isGroup) {
    if (activeContainerId && activeContainerId === overIdStr) {
      return overIdStr;
    }
    return 'root';
  }

  // Otherwise, overId is a root-level item (root task)
  return 'root';
}

