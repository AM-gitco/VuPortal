import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routes, getAllRoutes } from "./routes";
import { LayoutProvider } from "./layouts/LayoutProvider";

const renderRoutes = (routeList: Route[]) => (
  routeList.map((route) => {
    if (route.routes) {
      return (
        <Route key={route.path} path={route.path}>
          <LayoutProvider layout={route.layout}>
            {renderRoutes(route.routes)}
          </LayoutProvider>
        </Route>
      );
    }
    return (
      <Route
        key={route.path}
        path={route.path}
        component={() => (
          <LayoutProvider layout={route.layout}>
            <route.component />
          </LayoutProvider>
        )}
      />
    );
  })
);

function Router() {
  return <Switch>{renderRoutes(routes)}</Switch>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
