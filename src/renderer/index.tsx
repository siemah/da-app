import React from 'react';
import { Toaster } from '@/renderer/components/ui/sonner';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 3600000, // 1 hour
      staleTime: 900000, // 15 minutes
    },
  },
});
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log('yep args exmp', arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['azul']);
