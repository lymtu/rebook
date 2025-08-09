import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ContextProvider from "@/context";
import Layout from "@/layout";

export const Route = createRootRoute({
  component: () => (
    <>
      <ContextProvider>
        <Layout>
          <Outlet />
        </Layout>
      </ContextProvider>
      <TanStackRouterDevtools />
    </>
  ),
});
