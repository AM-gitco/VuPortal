import { ReactNode } from 'react';
import { AppLayout } from './AppLayout';
import { AuthLayout } from './AuthLayout';

type LayoutProviderProps = {
  children: ReactNode;
  layout?: string;
};

export function LayoutProvider({ children, layout }: LayoutProviderProps) {
  // Select the appropriate layout based on the route configuration
  switch (layout) {
    case 'auth':
      return <AuthLayout>{children}</AuthLayout>;
    case 'app':
      return <AppLayout>{children}</AppLayout>;
    default:
      // If no layout is specified, render without a layout
      return <>{children}</>;
  }
}