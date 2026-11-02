import React, { ReactNode } from "react";
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a unique QueryClient for each test to avoid interference.
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Turn off retries for tests
      },
    },
  });

/**
 * Custom wrapper for components that need QueryClientProvider
 */
export function AllTheProviders({ children }: { children: ReactNode }) {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render function that includes AllTheProviders
 */
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Custom renderHook function that includes AllTheProviders
 */
export function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options = {},
) {
  return rtlRenderHook(render, {
    wrapper: AllTheProviders as React.ComponentType<any>,
    ...options,
  });
}

// Re-export everything from testing-library/react
export * from "@testing-library/react";
