import { MenuItem } from './menu.model';

export const MENUENGINEER: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.MENU.TEXT',
    isTitle: true
  },
  {
    id: 2,
    label: 'MENUITEMS.DASHBOARD.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/pages/dashboard',
  },
  {
    id: 3,
    label: 'Jobs',
    icon: 'ri-suitcase-line',
    link: '/jobs/',
    subItems: [
      {
        id: 6,
        label: 'My Jobs',
        icon: 'ri-computer-line',
        link: '/jobs/my-jobs',
        parentId: 2
      },
      {
        id: 5,
        label: 'Raise Job',
        icon: 'ri-suitcase-2-line',
        link: '/jobs/raise-jobs',
        parentId: 2
      },
      // {
      //   id: 4,
      //   label: 'Search',
      //   icon: 'ri-find-replace-line',
      //   link: '/pages/jobs/search',
      //   parentId: 2
      // },
    ]
  },
  {
    id: 7,
    label: 'Settings',
    icon: 'ri-settings-2-line',
    link: '/pages/settings/debug',
  },
  // {
  //   id: 8,
  //   label: 'Queue Lists',
  //   icon: 'ri-file-list-line',
  //   link: '/pages/queue-lists',
  // },
  {
    id: 8,
    label: 'Calendar',
    icon: 'ri-calendar-2-fill',
    link: '/pages/calendar',
  },
];
