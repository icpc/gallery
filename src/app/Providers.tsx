import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { FC, ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { apiKey, UNIQUE_CONTEST_KEY } from "@/config/gallery";
import { GalleryProvider } from "@/features/gallery/state/GalleryContext";
import { PhotoInfoProvider } from "@/features/viewer/state/PhotoInfoContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { NotificationProvider } from "@/shared/components/NotificationProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 7 * 24 * 60 * 60 * 1000,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: `icpc-gallery-query+${apiKey}+${UNIQUE_CONTEST_KEY}`,
});

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <NotificationProvider>
          <GalleryProvider>
            <PhotoInfoProvider>{children}</PhotoInfoProvider>
          </GalleryProvider>
        </NotificationProvider>
      </PersistQueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
