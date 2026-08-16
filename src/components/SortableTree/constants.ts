import type {TreeItems} from './types';

export const initialTreeItems: TreeItems = [
  {
    id: 'Home',
    children: [],
  },
  {
    id: 'Collections',
    children: [
      {id: 'Spring', children: []},
      {id: 'Summer', children: []},
      {id: 'Fall', children: []},
      {id: 'Winter', children: []},
    ],
  },
  {
    id: 'About Us',
    children: [],
  },
  {
    id: 'My Account',
    children: [
      {id: 'Addresses', children: []},
      {id: 'Order History', children: []},
    ],
  },
];
