import type { RootItem } from '../types';

export const initialData: RootItem[] = [
  {
    id: 'task-1',
    title: '设计首页原型',
    type: 'task',
  },
  {
    id: 'task-2',
    title: '编写技术文档',
    type: 'task',
  },
  {
    id: 'group-1',
    title: '前端开发',
    type: 'group',
    children: [
      {
        id: 'task-3',
        title: '实现登录页面',
        type: 'task',
      },
      {
        id: 'task-4',
        title: '集成 API 接口',
        type: 'task',
      },
      {
        id: 'task-5',
        title: '编写单元测试',
        type: 'task',
      },
    ],
  },
  {
    id: 'task-6',
    title: '代码审查',
    type: 'task',
  },
  {
    id: 'group-2',
    title: '后端开发',
    type: 'group',
    children: [
      {
        id: 'task-7',
        title: '设计数据库表结构',
        type: 'task',
      },
      {
        id: 'task-8',
        title: '实现 REST API',
        type: 'task',
      },
    ],
  },
  {
    id: 'task-9',
    title: '部署到生产环境',
    type: 'task',
  },
];
