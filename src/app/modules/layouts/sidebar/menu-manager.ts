import { MenuItem } from './menu.model';

export const MENUMANAGER: MenuItem[] = [
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
    link: '/jobs',
    subItems: [
      {
        id: 4,
        label: 'Jobs',
        icon: 'ri-computer-line',
        link: '/jobs/manager-jobs',
        parentId: 2
      },
      {
        id: 5,
        label: 'Create Job',
        icon: 'ri-computer-line',
        link: '/jobs/create-jobs',
        parentId: 2
      },
      {
        id: 6,
        label: 'Search Job',
        icon: 'ri-computer-line',
        link: '/jobs/search',
        parentId: 2
      },
    ]
  },
  // {
  //   id: 7,
  //   label: 'Approve Equipments',
  //   icon: 'ri-dashboard-2-line',
  //   link: '/test',
  // },
  {
    id: 9,
    label: 'Customers',
    icon: 'ri-team-line',
    link: '/customers',
  },
  {
    id: 10,
    label: 'Equipment',
    icon: 'ri-door-lock-box-line',
    link: '/equipment',
    subItems: [
      {
        id: 1,
        label: 'Equipment',
        icon: 'ri-door-lock-box-line',
        link: '/equipment/',
        parentId: 10
      },
      {
        id: 2,
        label: 'Approve Equipments',
        icon: 'ri-dashboard-2-line',
        link: '/equipment/approve-equipment',
        parentId: 10
      },
      {
        id: 3,
        label: 'Equipment Types',
        icon: 'ri-computer-line',
        link: '/equipment/equipment-types',
        parentId: 10
      },
      // {
      //   id: 4,
      //   label: 'Condition Scale History',
      //   icon: 'ri-computer-line',
      //   link: '/equipment/condition-scale-history',
      //   parentId: 10
      // },
    ]
  },
  // {
  //   id: 11,
  //   label: 'Equipment Types',
  //   icon: 'ri-fridge-line',
  //   link: '/test',
  // },
  {
    id: 12,
    label: 'My Engineers',
    icon: 'ri-building-line',
    link: '/my-engineers/engineers',
    subItems: [
      {
        id: 1,
        label: 'Engineers',
        icon: 'ri-computer-line',
        link: '/my-engineers/engineers',
        parentId: 12
      },
      {
        id: 2,
        label: 'Test Equipment',
        icon: 'ri-computer-line',
        link: '/my-engineers/test-equipments',
        parentId: 12
      },
    ]
  },
  {
    id: 13,
    label: 'Scheduled Job Assignment',
    icon: 'ri-calendar-check-line',
    link: '/test',
  },
  {
    id: 14,
    label: 'Scheduler',
    icon: 'ri-calendar-line',
    link: '/test',
  },
  {
    id: 16,
    label: 'Reports',
    icon: 'ri-table-2',
    link: '/reports',
    subItems: [
      {
        id: 1,
        label: 'Operational',
        icon: 'ri-computer-line',
        link: '/reports/operational',
        parentId: 16
      },
      {
        id: 1,
        label: 'Not Presented',
        icon: 'ri-computer-line',
        link: '/reports/not-presented',
        parentId: 16
      },
    ]
  },
  {
    id: 15,
    label: 'Settings',
    icon: 'ri-settings-2-line',
    link: '/settings',
    subItems: [
      {
        id: 17,
        label: 'User Settings',
        icon: 'ri-computer-line',
        link: '/settings/user-settings',
        parentId: 15
      },
      {
        id: 18,
        label: 'Survey Settings',
        icon: 'ri-article-line',
        link: '/settings/survey-settings',
        parentId: 15
      },
      {
        id: 18,
        label: 'Excel Templates',
        icon: 'ri-computer-line',
        link: '/settings/excel-templates',
        parentId: 15
      },
    ]
  },
  {
    id: 19,
    label: 'Sites',
    icon: 'ri-building-4-line',
    link: '/sites',
  },
];
