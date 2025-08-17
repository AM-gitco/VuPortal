import { ReactNode } from 'react';
import { Request } from 'express';

// Define route types
export type AppRoute = {
  path: string;
  component: (props: any) => ReactNode; // Updated to accept props
  layout?: string;
  exact?: boolean;
  routes?: AppRoute[];
};

// Import page components
import { DashboardHome } from '@/components/dashboard/pages/DashboardHome';
import { MySubjects } from '@/components/dashboard/pages/MySubjects';
import { UploadArea } from '@/components/dashboard/pages/UploadArea';
import { Discussions } from '@/components/dashboard/pages/Discussions';
import { Announcements } from '@/components/dashboard/pages/Announcements';
import { Solutions } from '@/components/dashboard/pages/Solutions';
import AiChat from '@/components/dashboard/pages/AiChat';
import { Badges } from '@/components/dashboard/pages/Badges';
import About from '@/components/dashboard/pages/About';
import { SetupProfile } from '@/components/dashboard/SetupProfile';
import AuthPage from '@/pages/auth';
import NotFound from '@/pages/not-found';

// Define routes configuration
export const routes: AppRoute[] = [
  {
    path: '/auth',
    component: AuthPage,
    layout: 'auth',
    exact: true,
  },
  {
    path: '/dashboard',
    component: () => null,
    layout: 'app',
    routes: [
      {
        path: '/',
        component: (props) => <DashboardHome {...props} />,
        exact: true,
      },
      {
        path: '/setup-profile',
        component: (props) => <SetupProfile {...props} />,
        exact: true,
      },
      {
        path: '/subjects',
        component: MySubjects,
        exact: true,
      },
      {
        path: '/upload',
        component: UploadArea,
        exact: true,
      },
      {
        path: '/discussions',
        component: Discussions,
        exact: true,
      },
      {
        path: '/announcements',
        component: Announcements,
        exact: true,
      },
      {
        path: '/solutions',
        component: Solutions,
        exact: true,
      },
      {
        path: '/ai-chat',
        component: AiChat,
        exact: true,
      },
      {
        path: '/badges',
        component: Badges,
        exact: true,
      },
      {
        path: '/about',
        component: About,
        exact: true,
      },
      {
        path: '*',
        component: NotFound,
      },
    ],
  },
  {
    path: '/',
    component: () => null,
    layout: 'app',
    exact: true,
  },
  {
    path: '*',
    component: NotFound,
    layout: 'app',
  },
];

// Helper function to get all routes flattened
export const getAllRoutes = (): AppRoute[] => {
  const flattenRoutes = (routeList: AppRoute[], parent?: AppRoute): AppRoute[] => {
    return routeList.reduce((acc: AppRoute[], route: AppRoute) => {
      const newRoute = { ...route };
      if (parent) {
        newRoute.path = `${parent.path}${route.path}`;
      }
      const result = [newRoute];
      if (route.routes) {
        result.push(...flattenRoutes(route.routes, route));
      }
      return [...acc, ...result];
    }, []);
  };

  return flattenRoutes(routes);
};