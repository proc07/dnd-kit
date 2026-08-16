import type { UniqueIdentifier } from '@dnd-kit/core';

export type ItemType = 'task' | 'group';

export interface TaskItem {
  id: UniqueIdentifier;
  title: string;
  type: 'task';
}

export interface GroupItem {
  id: UniqueIdentifier;
  title: string;
  type: 'group';
  children: TaskItem[];
}

export type RootItem = TaskItem | GroupItem;

// Data attached to useSortable's data prop
export interface DragItemData {
  type: ItemType;
  // Which container this item belongs to: 'root' for root-level items, or group ID for items inside a group
  containerId: string;
  // The actual item data
  item: RootItem | TaskItem;
}

export function isGroupItem(item: RootItem): item is GroupItem {
  return item.type === 'group';
}

export function isTaskItem(item: RootItem): item is TaskItem {
  return item.type === 'task';
}
