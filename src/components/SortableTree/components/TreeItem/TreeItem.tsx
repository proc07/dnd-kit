import React, {forwardRef} from 'react';
import type {HTMLAttributes} from 'react';
import classNames from 'classnames';

import {Action} from '../Action';
import {Handle} from '../Handle';
import {Remove} from '../Remove';
import styles from './TreeItem.module.css';

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;           // 子项总数 (拖拽时显示在徽标上)
  clone?: boolean;                // 是否为 DragOverlay 里的拖拽悬浮镜像
  collapsed?: boolean;            // 当前父节点是否已折叠
  depth: number;                  // 当前项的层级深度 (0 为根项，1 为第 1 级子项)
  disableInteraction?: boolean;   // 是否禁用交互
  disableSelection?: boolean;     // 是否禁用文字选中 (iOS 端优化)
  ghost?: boolean;                // 是否为原列表中的占位影子节点
  handleProps?: any;              // 拖拽手柄绑定的事件与属性
  indicator?: boolean;            // 是否显示指示线模式
  indentationWidth: number;       // 每一级缩进的像素宽度 (用于设置 CSS 变量 --spacing)
  value: string;                  // 显示的文本内容
  onCollapse?(): void;            // 点击展开/折叠回调
  onRemove?(): void;              // 点击删除按钮回调
  wrapperRef?(node: HTMLLIElement | null): void; // 外层 li 容器的 ref
}

/**
 * ⭐️ TreeItem 纯 UI 渲染组件
 * 根据 depth 和 indentationWidth 计算左内边距 CSS 变量 `--spacing`，实现视觉上的多级缩进。
 */
export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={
          {
            // ⭐️ 通过 CSS 变量动态控制该节点在左侧的缩进距离
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          {/* 拖拽手柄：绑定了 drag listeners */}
          <Handle {...handleProps} />

          {/* 展开/收起按钮（仅在拥有子节点时呈现） */}
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={classNames(
                styles.Collapse,
                collapsed && styles.collapsed
              )}
            >
              {collapseIcon}
            </Action>
          )}

          {/* 节点文本 */}
          <span className={styles.Text}>{value}</span>

          {/* 删除按钮（悬浮镜像中不显示） */}
          {!clone && onRemove && <Remove onClick={onRemove} />}

          {/* 拖拽悬浮镜像中：如果携带了子节点，右上角显示数字气泡 */}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);

/**
 * 折叠箭头 SVG 图标
 */
const collapseIcon = (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);
