import type {TreeItems} from './types';

export interface CustomTreeItemData {
  title?: string;
  tag?: string;
  tagColor?: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
  icon?: string;
}

export const initialTreeItems: TreeItems<CustomTreeItemData> = [
  {
    id: 'Home',
    title: '首页导航 (Home)',
    icon: '🏠',
    children: [],
  },
  {
    id: 'Collections',
    title: '商品分类合集 (Collections)',
    icon: '📁',
    tag: '分类组',
    tagColor: 'blue',
    children: [
      {id: 'Spring', title: '春季新品发布 (Spring)', icon: '🌸', tag: '热销中', tagColor: 'green', children: []},
      {id: 'Summer', title: '夏季精选热卖 (Summer)', icon: '☀️', tag: '推广期', tagColor: 'orange', children: []},
      {id: 'Fall', title: '秋季限定主题 (Fall)', icon: '🍁', children: []},
      {id: 'Winter', title: '冬季特惠专区 (Winter)', icon: '❄️', children: []},
    ],
  },
  {
    id: 'About Us',
    title: '关于品牌故事 (About Us)',
    icon: '📖',
    children: [],
  },
  {
    id: 'My Account',
    title: '会员中心 (My Account)',
    icon: '👤',
    tag: '核心模块',
    tagColor: 'purple',
    children: [
      {id: 'Addresses', title: '收件地址与地理定位', icon: '📍', children: []},
      {id: 'Order History', title: '全渠道订单履约明细', icon: '📦', children: []},
    ],
  },
];
