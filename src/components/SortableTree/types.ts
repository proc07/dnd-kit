import type {ComponentType} from 'react';

/**
 * 通用树形节点数据结构 (支持泛型自定义业务字段)
 */
export type TreeItem<T = Record<string, any>> = T & {
  id: UniqueIdentifier;
  children?: TreeItem<T>[];
  collapsed?: boolean;
};

export type TreeItems<T = Record<string, any>> = TreeItem<T>[];

/**
 * 扁平化后的一维节点 (附带层级深度与归属父级信息)
 */
export type FlattenedItem<T = Record<string, any>> = TreeItem<T> & {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  children: TreeItem<T>[];
};

/**
 * 自定义节点渲染函数参数定义
 */
export interface RenderItemParams<T = Record<string, any>> {
  item: FlattenedItem<T>;              // 当前节点数据对象 (包含您自定义的所有字段)
  depth: number;                        // 当前项的层级深度 (0 为根层，1 为第 1 级子项)
  indentationWidth: number;             // 每一级缩进的基准像素
  isDragging?: boolean;                 // 当前项是否正处于被拖拽状态
  isGhost?: boolean;                    // 是否为原列表中的占位占位虚影
  isClone?: boolean;                    // 是否为鼠标指针跟随的 DragOverlay 悬浮镜像
  childCount?: number;                  // 携带的子项数量
  collapsed?: boolean;                  // 是否已折叠
  handleProps: any;                     // 必须绑定到拖拽手柄上的事件与无障碍属性
  onCollapse?: () => void;              // 折叠/展开回调
  onRemove?: () => void;                // 删除项回调
  Handle: ComponentType<any>;           // 官方默认拖拽手柄组件 (可选直接使用)
  Action: ComponentType<any>;           // 官方基础动作按钮组件 (可选直接使用)
  Remove: ComponentType<any>;           // 官方默认删除按钮组件 (可选直接使用)
}
