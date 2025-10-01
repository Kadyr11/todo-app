import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App";
import "./i18n";
import "./theme.css";
import { SettingsProvider } from './contexts/SettingsContext';

// Создаем QueryClient с настройками для предотвращения кэш-загрязнения
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Отключаем персистентность кэша
      staleTime: 0,
      gcTime: 0, // заменили cacheTime на gcTime
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SettingsProvider>
  </QueryClientProvider>
);