import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from 'react-router';
import type { ReactNode } from 'react';
import stylesheet from './global.css?inline';
import logo from '../assets/logo.svg';

export const links = () => [
  { rel: "icon", type: "image/svg+xml", href: logo }
];

export const meta = () => [
  { title: "Knowledge Arena" }
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong';

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-gray-900">
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Application error</p>
        <h1 className="mt-2 text-2xl font-semibold">Unable to render this page</h1>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      </div>
    </main>
  );
}

import { AuthProvider } from '@/features/auth/AuthContext';
import { RoadmapDataProvider } from '@/features/hooks/useRoadmapData';

export default function App() {
  return (
    <AuthProvider>
      <RoadmapDataProvider>
        <Outlet />
      </RoadmapDataProvider>
    </AuthProvider>
  );
}
