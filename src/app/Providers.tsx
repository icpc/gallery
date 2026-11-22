import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { FC, ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { queryClient, queryPersister } from "@/app/queryClient";
import { GalleryProvider } from "@/features/gallery/state/GalleryContext";
import { PhotoInfoProvider } from "@/features/viewer/state/PhotoInfoContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { NotificationProvider } from "@/shared/components/NotificationProvider";

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister }}
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
