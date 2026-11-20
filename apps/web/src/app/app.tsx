import { Analytics } from '@vercel/analytics/react';
import { AppProvider } from './provider';
import { AppRouter } from './router';

export function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Analytics />
    </AppProvider>
  );
}
