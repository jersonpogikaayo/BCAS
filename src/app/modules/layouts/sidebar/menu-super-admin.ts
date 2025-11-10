import { MenuItem } from './menu.model';

export const MENUSUPERADMIN: MenuItem[] = [
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
    link: '/pages/jobs',
    subItems: [
      {
        id: 4,
        label: 'Jobs',
        icon: 'ri-computer-line',
        link: '/pages/jobs',
        parentId: 2
      },
      {
        id: 5,
        label: 'Create Job',
        icon: 'ri-computer-line',
        link: '/pages/create-job',
        parentId: 2
      },
      {
        id: 6,
        label: 'Raise Job',
        icon: 'ri-computer-line',
        link: '/pages/raise-job',
        parentId: 2
      },
      {
        id: 19,
        label: 'Search Job',
        icon: 'ri-computer-line',
        link: '/pages/jobs/search',
        parentId: 2
      },
    ]
  },
  // {
  //   id: 7,
  //   label: 'Approve Equipments',
  //   icon: 'ri-dashboard-2-line',
  //   link: '/pages/test',
  // },
  {
    id: 9,
    label: 'Customers',
    icon: 'ri-team-line',
    link: '/pages/customers',
  },
  {
    id: 10,
    label: 'Equipment',
    icon: 'ri-door-lock-box-line',
    link: '/pages/equipment',
    subItems: [
      {
        id: 1,
        label: 'Equipment',
        icon: 'ri-door-lock-box-line',
        link: '/pages/equipment/',
        parentId: 10
      },
      {
        id: 2,
        label: 'Approve Equipments',
        icon: 'ri-dashboard-2-line',
        link: '/pages/equipment/approve-equipment',
        parentId: 10
      },
      {
        id: 3,
        label: 'Equipment Types',
        icon: 'ri-computer-line',
        link: '/pages/equipment/equipment-types',
        parentId: 10
      },
      // {
      //   id: 4,
      //   label: 'Equipment History',
      //   icon: 'ri-computer-line',
      //   link: '/pages/equipment/equipment-detail-history',
      //   parentId: 10
      // },
      // {
      //   id: 5,
      //   label: 'Equipment Location History',
      //   icon: 'ri-computer-line',
      //   link: '/pages/equipment/equipment-types',
      //   parentId: 10
      // },
    ]
  },
  // {
  //   id: 11,
  //   label: 'Equipment Types',
  //   icon: 'ri-fridge-line',
  //   link: '/pages/test',
  // },
  {
    id: 12,
    label: 'My Engineers',
    icon: 'ri-building-line',
    link: '/pages/test',
    subItems: [
      {
        id: 1,
        label: 'Engineers',
        icon: 'ri-computer-line',
        link: '/pages/my-engineers/engineers',
        parentId: 12
      },
      {
        id: 2,
        label: 'Test Equipment',
        icon: 'ri-computer-line',
        link: '/pages/my-engineers/test-equipments',
        parentId: 12
      },
    ]
  },
  {
    id: 13,
    label: 'Scheduled Job Assignment',
    icon: 'ri-calendar-check-line',
    link: '/pages/test',
  },
  {
    id: 14,
    label: 'Scheduler',
    icon: 'ri-calendar-line',
    link: '/pages/test',
  },
  {
    id: 14,
    label: 'Users',
    icon: 'ri-calendar-line',
    link: '/pages/users',
  },
  {
    id: 16,
    label: 'Reports',
    icon: 'ri-table-2',
    link: '/pages/reports',
    subItems: [
      {
        id: 1,
        label: 'Operational',
        icon: 'ri-computer-line',
        link: '/pages/reports/operational',
        parentId: 16
      },
      {
        id: 1,
        label: 'Not Presented',
        icon: 'ri-computer-line',
        link: '/pages/reports/not-presented',
        parentId: 16
      },
    ]
  },
  {
    id: 15,
    label: 'Settings',
    icon: 'ri-settings-2-line',
    link: '/pages/settings',
    subItems: [
      {
        id: 17,
        label: 'User Settings',
        icon: 'ri-computer-line',
        link: '/pages/settings/user-settings',
        parentId: 15
      },
      {
        id: 18,
        label: 'Survey Settings',
        icon: 'ri-article-line',
        link: '/pages/settings/survey-settings',
        parentId: 15
      },
      {
        id: 18,
        label: 'Excel Templates',
        icon: 'ri-computer-line',
        link: '/pages/settings/excel-templates',
        parentId: 15
      },
    ]
  },
];
